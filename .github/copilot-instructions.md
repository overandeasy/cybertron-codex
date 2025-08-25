## Quick context for AI coding agents

- Project name: Cybertron Codex (monorepo-like layout: `client/` React app and `server/` Express API).
- Client: React Router (SSR-ready) + TypeScript + Vite. Entry: `client/` (scripts in `client/package.json`).
- Server: Express + Mongoose (MongoDB) + JWT auth. Entry: `server/index.ts` (scripts in `server/package.json`).
- API contract: REST under `/api/*` served by the Express server. Client uses `client/app/lib/baseUrl.ts` which points to `http://localhost:5001/api` in development.

## Big-picture architecture and data flow

- Request flow (server): `server/index.ts` -> router files in `server/routes/` -> optional middleware (e.g. `validateToken`) -> controller functions in `server/controllers/` -> mongoose models in `server/db_models/` -> responses use `utils/handleServerApiResponse`.
- Client routing: `client/app/routes.ts` defines the React Router routes. Root UI and SSR behavior are defined in `client/react-router.config.ts` and `client/app/root.tsx`.
- Authentication: JWT tokens generated in `server/utils/generateToken.ts` and expected by `server/middlewares/validateToken.ts`. Protected server routes are mounted with `validateToken` in `server/index.ts` (e.g. `/api/user`, `/api/collection`). Client stores token in localStorage and loaders call API endpoints (see `client/app/root.tsx` and `client/app/routes/home.tsx`).

## Developer workflows & key commands

- Install deps (from each folder):
  - client: `npm install` (run in `client/`)
  - server: `npm install` (run in `server/`)
- Development servers:
  - client dev (HMR + SSR): run in `client/`: `npm run dev` (uses `react-router dev --host 127.0.0.1`).
  - server dev: run in `server/`: `npm run dev` (nodemon runs `index.ts`).
  - Typical local setup: start the server on port 5001, then run the client dev server which will reach `http://localhost:5001/api`.
- Build / production:
  - client build: `npm run build` (in `client/`)
  - serve build: `npm run start` (in `client/`, runs `react-router-serve ./build/server/index.js`).

## Environment & external integrations

- Required env vars (checked or used in code):
  - `DB_URI` — MongoDB connection string (server throws if missing in `server/index.ts`).
  - `JWT_SECRET` — used to sign tokens (see `utils/generateToken.ts`, `middlewares/validateToken.ts`).
  - Cloudinary credentials — used in `server/utils/cloudinaryOperations.ts` for uploads; check `server/uploads/` and controller upload handling.
- Uploads: server uses `multer` and Cloudinary helper utilities; controllers parse FormData and accept stringified arrays (e.g. `media_images`, `toy_images`) and file fields like `media_images` (see `server/controllers/collection.ts` and `server/controllers/user.ts`).

- Context7 / MCP: If a task mentions Context7 or MCP integration, fetch Context7's official docs before making changes. Use the Context7 docs to guide API/SDK usage and include the source link in your response. If a Context7 library or config isn't present in the repo, note that and propose how to add it.

## Automatic Context7 lookup

Agents should automatically resolve and fetch Context7 documentation for any user request that involves code examples, setup or configuration steps, or library/API documentation. Use the Context7 resolver before calling the docs API and include the source link in the response. Example rule the agent should honor:

[[calls]]
match = "when the user requests code examples, setup or configuration steps, or library/API documentation"
tool = "context7"

Notes:

- Resolve the Context7-compatible library ID first (e.g. via the MCP resolver) and include the chosen library ID in the response.
- If multiple relevant libraries exist, pick the best match and state the reason for the choice.
- If Context7 lookup fails or the repo explicitly forbids external lookups, fall back to local codebase search and clearly note the limitation.

## Project-specific conventions and patterns

- Error / success responses: controllers use `handleError` and `handleSuccess` from `server/utils/handleServerApiResponse` and the client expects the ApiResponse shape; client-side code throws an Error with server payload attached (see `project-note.md` and `client/app/root.tsx`).
- FormData handling: many server endpoints accept multipart/form-data. The controllers often receive arrays that are stringified in FormData and explicitly JSON.parse them (see `server/controllers/collection.ts` and `server/controllers/user.ts`).
- Auth & profiles: Auth model (`server/db_models/auth.ts`) stores a `profile_id` which is created/updated through sequential controller operations in `server/controllers/user.ts`.
- Styling & theming: Tailwind + custom CSS tokens live in `client/app/app.css`. Many UI primitives are local copies or thin wrappers (see `client/app/components/ui/*`). Prefer using existing UI components (e.g. `Sidebar`, `Button`, `Sheet`) to keep consistent behavior.
- TypeScript / paths: project uses TS path aliases with `vite-tsconfig-paths` — imports like `~/components/...` are present across the client codebase.

## Files to inspect for common tasks (examples)

- Start / debug auth flow: `server/routes/auth.ts`, `server/controllers/user.ts`, `server/middlewares/validateToken.ts`, `client/app/routes/auth/*`.
- Collection upload flow: `client/api/collection.ts` (client calls), `server/controllers/collection.ts`, `server/utils/cloudinaryOperations.ts`, and `server/middlewares/handleFormDataFile.ts`.
- Server entry & middleware wiring: `server/index.ts` (shows routes and `validateToken` guard usage).
- Client SSR and route config: `client/react-router.config.ts`, `client/app/root.tsx`, `client/app/routes.ts`.

## Examples of patterns the agent should follow

- When adding or modifying endpoints, mirror the ApiResponse shape used by `handleSuccess` / `handleError`.
- When handling uploads, preserve the FormData-to-JSON parsing pattern used in existing controllers (check for string inputs that are JSON arrays, parse defensively).
- Use existing UI components in `client/app/components/*` rather than creating ad-hoc markup; these components expose consistent props (e.g. `Sidebar`, `Button`, `Sheet`).

## Quick troubleshooting hints

- If server logs "DB_URI is not defined" ensure `DB_URI` is set before starting the server.
- Client dev server is bound to 127.0.0.1 by default. If you need external access, adjust `client/package.json` dev script or use an alternative host.
- SSR-related build errors sometimes stem from package externals; `client/vite.config.ts` sets `ssr.noExternal` for `class-variance-authority` — follow that pattern for similar issues.

---

If anything here is unclear or you want deeper instructions for testing, CI, or contribution rules, tell me which area to expand and I will iterate.
