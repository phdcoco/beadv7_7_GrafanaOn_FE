# Dear Frontend

Frontend web app for the GrafanaOn commerce project.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-compatible structure
- React Router
- TanStack Query

## Local Setup

Install Node.js LTS first. Then run:

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

The frontend should call the API Gateway, not each backend service directly.

```env
VITE_API_BASE_URL=http://localhost:8080
```
