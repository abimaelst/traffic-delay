'use client';

import { useState, useEffect } from 'react';
import {
  TrafficData,
  Shipment,
  Customer,
  DelayNotification
} from '@traffic/types';

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<DelayNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch shipments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // In a real app, we would fetch this data from the backend
        // For demo purposes, we'll use mock data
        setShipments([
          {
            id: 'ship-001',
            customerId: 'cust-001',
            route: {
              origin: 'Seattle, WA',
              destination: 'Portland, OR',
              transportType: 'truck'
            },
            estimatedDeliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            delayThreshold: 30
          },
          {
            id: 'ship-002',
            customerId: 'cust-002',
            route: {
              origin: 'Chicago, IL',
              destination: 'Detroit, MI',
              transportType: 'truck'
            },
            estimatedDeliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            delayThreshold: 15
          }
        ]);

        setCustomers([
          {
            id: 'cust-001',
            name: 'Acme Corporation',
            email: 'shipping@acme.com',
            phone: '+1234567890',
            preferredContactMethod: 'email'
          },
          {
            id: 'cust-002',
            name: 'Global Logistics Inc',
            email: 'ops@globallogistics.com',
            phone: '+0987654321',
            preferredContactMethod: 'sms'
          }
        ]);

        setNotifications([]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Run traffic check for a shipment
  const checkTrafficForShipment = async (shipmentId: string) => {
    try {
      const response = await fetch(`${API_URL}/shipments/${shipmentId}/check-traffic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to initiate traffic check');
      }

      const result = await response.json();
      alert(`Traffic check initiated: ${result.workflowId}`);
    } catch (err) {
      console.error('Error running traffic check:', err);
      setError('Failed to run traffic check');
    }
  };

  // Run a test traffic check
  const runTestTrafficCheck = async () => {
    try {
      setTestResult(null);
      const response = await fetch(`${API_URL}/test/check-traffic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to run test traffic check');
      }

      const result = await response.json();
      setTestResult(result);
    } catch (err) {
      console.error('Error running test:', err);
      setError('Failed to run test');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Traffic Monitor Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <button
          onClick={runTestTrafficCheck}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Run Test Traffic Check
        </button>

        {testResult && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold">Test Result:</h3>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-64">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Shipments</h2>
          {loading ? (
            <p>Loading shipments...</p>
          ) : shipments.length === 0 ? (
            <p>No active shipments</p>
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => {
                const customer = customers.find(c => c.id === shipment.customerId);
                return (
                  <div key={shipment.id} className="border rounded p-4">
                    <h3 className="font-semibold">Shipment ID: {shipment.id}</h3>
                    <p><span className="font-medium">Customer:</span> {customer?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Route:</span> {shipment.route.origin} to {shipment.route.destination}</p>
                    <p><span className="font-medium">Estimated Delivery:</span> {formatDate(shipment.estimatedDeliveryTime)}</p>
                    <p><span className="font-medium">Delay Threshold:</span> {shipment.delayThreshold} minutes</p>

                    <button
                      onClick={() => checkTrafficForShipment(shipment.id)}
                      className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Check Traffic
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p>No recent notifications</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const customer = customers.find(c => c.id === notification.customerId);
                return (
                  <div key={`${notification.shipmentId}-${notification.sentTimestamp}`} className="border rounded p-4">
                    <h3 className="font-semibold">Shipment ID: {notification.shipmentId}</h3>
                    <p><span className="font-medium">Customer:</span> {customer?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Delay:</span> {notification.delayTime} minutes</p>
                    <p><span className="font-medium">Original ETA:</span> {formatDate(notification.originalEta)}</p>
                    <p><span className="font-medium">New ETA:</span> {formatDate(notification.newEta)}</p>
                    <p><span className="font-medium">Sent:</span> {notification.sent ? 'Yes' : 'No'}</p>

                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="font-medium">Message:</p>
                      <p className="mt-1">{notification.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}