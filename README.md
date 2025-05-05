## Traffic Delay Notification App  
**Technical Case – Full Stack Developer – Levity AI**

---

### 📑 Overview

This TypeScript monorepo implements a “Freight Delay Notification” system. It:

1. **Fetches real-time traffic delays** using the Mapbox Directions API.  
2. **Generates a friendly delay message** via OpenAI’s gpt-4o-mini model.  
3. **Sends an email notification** through SendGrid if the delay exceeds a threshold.  
4. **Orchestrates** all steps in a **Temporal** workflow for fault-tolerance and retries.  
5. Exposes an **Express** API endpoint (`/api/get-traffic-email`) for on-demand triggers.  
6. Provides a **Next.js** frontend page to collect user input (start/end/email).  
7. Centralizes all shared **TypeScript types** in a `packages/types` workspace.  
8. Uses **Zod** for runtime request validation and **Tailwind CSS** for clean UI.  
9. Includes **integration tests** using `@temporalio/testing` + Mocha.  
10. Runs the full stack in parallel via a single `npm run dev` command at the repo root.

---

### 📁 Repository Structure

```
/
├── apps
│   ├── backend             # Express API
│   │   └── src
│   │       ├── ai
│   │       │   └── generateDelayMessage.ts
│   │       ├── traffic
│   │       │   ├── mapboxClient.ts
│   │       │   └── index.ts
│   │       └── routes
│   │           ├── getTrafficEmail.ts
│   │           └── testIntegrations.ts
│   ├── frontend            # Next.js UI
│   │   └── app/(home)
│   │       ├── global.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   └── temporal-worker     # Long-running Temporal Worker
│       └── src/workflows
│           ├── worker.ts
│           └── index.ts
├── packages
│   ├── types               # Shared TS interfaces
│   │   └── src/index.ts
│   └── workflows           # Pure Temporal logic
│       ├── src/activities
│       │   ├── ai.ts
│       │   ├── email.ts
│       │   └── traffic.ts
│       └── src/workflows
│           └── index.ts
├── .gitignore
├── package.json            # root: workspaces, dev & build scripts
└── tsconfig.json           # root: path aliases for @traffic/types + @traffic/workflows
```

### ⚙️ Key Implementation Details

1. **Monorepo Workspaces**  
   We use npm v7+ workspaces to link `@traffic/types` and `@traffic/workflows` locally.  
   Path aliases in `tsconfig.json` let all apps import shared code cleanly.

2. **Activities**  
   - **traffic.ts**  
     - Calls Mapbox Directions API with proper coordinate encoding.  
     - Validates and sums leg durations.  
     - Throws `ApplicationFailure.nonRetryable` on 4xx client errors, allowing retries only on transient failures.  
   - **ai.ts**  
     - Posts a chat-completion request to OpenAI (model `gpt-4o-mini`).  
     - Returns a trimmed, fallback-safe message.  
   - **email.ts**  
     - Uses `@sendgrid/mail` to send plain-text emails.  
     - Reads API key and sender address from environment variables.

3. **Workflow**  
   - **monitorRouteWorkflow**  
     - Proxies the three activities with a retry policy (3 attempts, exponential backoff).  
     - Logs each step:  
       ```
       ⏱ Delay: 45 minutes  
       🤖 AI Message: …  
       📨 Notification sent to user@example.com  
       ```  
     - Skips email when delay ≤ 30 minutes, logging a no-op.

4. **Worker**  
   - Hosted in `apps/temporal-worker/src/index.ts`.  
   - Registers the compiled workflows (`dist/workflows`) and activities (`dist/activities`) on task queue `monitor-route`.  
   - Uses a single long-running process.

5. **API Endpoint**  
   - **`POST /api/get-traffic-email`** in `apps/backend/src/routes/getTrafficEmail.ts`.  
   - Validates request with **Zod**.  
   - Starts the Temporal workflow via `@temporalio/client`.  
   - Returns `{ message: 'Workflow triggered successfully' }` on success.

6. **Frontend**  
   - A Next.js page at `/get-traffic-email` collects `start,end,email`.  
   - Submits to the backend endpoint and displays a Tailwind-styled status banner.

7. **Dev Workflow**  
   - **`npm run dev`** at the repo root (uses `concurrently` + `dotenv-cli`):  
     - Builds `@traffic/workflows` in watch mode.  
     - Starts the Temporal worker.  
     - Starts the Express API.  
     - Starts the Next.js frontend.  
   - One-stop command for full stack development.

8. **Testing**  
   - Integration tests in `packages/workflows/src/__tests__` use `@temporalio/testing` to spin up an in-memory TestWorkflowEnvironment.  
   - Mocks activities to verify both delay/no-delay paths.

---

### 🚀 Running Locally

1. **Environment**  
   Create a `.env` in the repo root with:
   ```bash
   MAPBOX_TOKEN=…
   OPENAI_API_KEY=…
   SENDGRID_API_KEY=…
   FROM_EMAIL=verified@you.com

2. Install & Build

```
npm install
npm run build
Run Everything
```

3. Run Everything

```
npm run dev
```

4. Test

```
npm test --workspace=@traffic/workflows
```

### 🔐 Security & Cleanup
Removed all committed secrets from Git history (using BFG).

Added .env to .gitignore.

Rotated exposed API keys.

I’m excited for your feedback—thank you for reviewing my submission!