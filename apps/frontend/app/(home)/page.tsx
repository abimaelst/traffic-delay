'use client';

import { useState, FormEvent } from 'react';
import Head from 'next/head';
import './global.css'

export default function GetTrafficEmailPage() {
  const [form, setForm] = useState({ start: '', end: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg(undefined);

    try {
      const res = await fetch('http://localhost:3001/api/get-traffic-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: form.start,
          end: form.end,
          email: form.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Get Traffic Delay Email</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 space-y-6">
          <h1 className="text-3xl font-extrabold text-center text-gray-800">
            Traffic Delay Notification
          </h1>
          <p className="text-center text-gray-500">
            Enter your route and email to get notified about any significant delays.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Coordinates
                </label>
                <input
                  id="start"
                  name="start"
                  type="text"
                  value={form.start}
                  onChange={handleChange}
                  placeholder="e.g. 37.78,-122.42"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
                  End Coordinates
                </label>
                <input
                  id="end"
                  name="end"
                  type="text"
                  value={form.end}
                  onChange={handleChange}
                  placeholder="e.g. 37.33,-121.89"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending…' : 'Notify Me'}
            </button>
          </form>

          {status === 'success' && (
            <div className="mt-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              ✅ Your request was received! Check your inbox shortly.
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              ❌ {errorMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}