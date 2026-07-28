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

## Deployment

Recommended build settings:

```text
Build command: pnpm build
Output directory: dist
```

Set the production API Gateway URL in the deployment platform.

```env
VITE_API_BASE_URL=https://api.example.com
```

## iOS

The web app is wrapped with Capacitor.

- App name: `D:EAR`
- Bundle ID: `com.grafanaon.dear`
- Web build directory: `dist`

Install the full Xcode application before opening or running the iOS target.

```bash
pnpm ios:sync
pnpm ios:open
```

After changing the React application, run `pnpm ios:sync` again before
building in Xcode.
