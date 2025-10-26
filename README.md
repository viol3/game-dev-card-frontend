# 🎮 Cosgame.fun - Game Dev Card-App

Modern, pixel-art themed frontend for the Game Dev Card project. This app provides onboarding, profile creation, a space explorer, and inventory management — and it integrates with a Sponsored Transaction backend (Enoki) for gasless transactions.

This README highlights how to run the app locally and how the Enoki sponsored-transaction flow is wired into the Create Profile flow.

---

## 🎯 Highlights

- Pixel-art UI powered by Tailwind CSS
- React + TypeScript (Vite) application
- Integrates with a Sponsored Transaction backend for gasless UX
- Clean service layer and reusable UI primitives

---

## 📦 Prerequisites

- Node.js 18+
- npm (or pnpm)

## 🚀 Local development

1. Install dependencies

```bash
cd game-dev-cardapp
npm install
# or pnpm install
```

2. Start dev server

```bash
npm run dev
# or pnpm dev
```

Open the app at the localhost URL printed by Vite (default: http://localhost:5173).

3. Build for production

```bash
npm run build
# or pnpm build
```

---

## � ZKLogin integration (passwordless / privacy-preserving auth)

This app supports zkLogin-style authentication to let users sign in without revealing extra personal data. We provide two common integration patterns and a recommended secure approach:

- Server-side exchange + httpOnly cookie (recommended for production):
	- User completes the zkLogin flow (redirect/callback). The backend exchanges the proof for a JWT and sets an httpOnly cookie so the frontend doesn't need to persist the token.
	- Frontend requests that require authentication (e.g., profile-sensitive calls) include credentials: 'include' so the cookie is sent automatically.

- Client-side short-lived token (development / prototyping):
	- The client obtains a JWT via the client SDK and keeps it in-memory (React Context). This avoids localStorage persistence but does not survive page reloads.

Implementation notes
- `CreateProfilePage.jsx` has helper logic to forward a zkLogin token when available. It will look for a token stored in memory (you may wire this into a `ZkAuthContext`) or optionally in `sessionStorage`/`localStorage` during development.
- For production, prefer the server-side cookie approach to reduce XSS risk.

---

## ⚙️ Dynamic profile fields

The app supports dynamic profile fields so you can extend user profiles without changing the UI codebase:

- Fields are defined in `src/constants` and served by the `profileService` to the UI.
- Administrators (or devs) can add new field definitions (label, type, validation rules) and the UI will render corresponding inputs automatically in the Create / Edit Profile screens.
- Supported field types: text, textarea, select, boolean, number, and file (image URL). Validation rules are pluggable.

How to add a new dynamic field
1. Add the field definition to `src/constants` or the profile schema provider.
2. Update `profileService` if the field requires server-side processing.
3. The Create/Edit profile components will render the new field automatically.

---

## 🚀 Deployment — Walrus (trwal.app)

This site is deployed on Walrus and is available at:

```
https://trwal.app
```

Notes about Walrus deployment
- The Vite build output is deployed to Walrus static hosting. Ensure the `homepage` (or base path) settings in your Vite config match the deployment domain if you serve from a subpath.
- For API calls to local backends during development, ensure CORS and correct origins are configured. In production, point the frontend to the production backend URL or use a proxy.


## ⚙️ Environment & Config

- No frontend-sensitive env variables are required by default. The backend requires `ENOKI_SECRET_KEY`.
- If you use zkLogin, configure your Enoki app redirect and obtain the JWT via the chosen flow (server-side exchange or client-side SDK).

---

## 🛠️ Contributing

1. Create a feature branch
2. Add unit tests where applicable
3. Open a PR explaining the change

---

