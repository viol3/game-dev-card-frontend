# 🎮 Game Dev Card — Frontend (game-dev-cardapp)

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

## 🔗 Sponsored transaction integration (Enoki)

This project uses a small backend service (in `../SponsoredTransaction`) to create and execute Enoki-sponsored transactions. The frontend's Create Profile flow demonstrates the integration:

- Create a TransactionBlock client-side and build only the transaction-kind bytes.
- Send those bytes to the backend `/sponsor` endpoint — backend calls Enoki to create the sponsored transaction and returns the sponsor response (including bytes/digest).
- The frontend collects the user's signature (wallet) for the sponsored bytes, then posts `digest` + `signature` to backend `/execute` to finalize the transaction.

Where the code lives
- `src/components/CreateProfilePage.jsx` — the profile creation flow; this file builds a TransactionBlock and calls the local sponsor endpoint.
- `../SponsoredTransaction` — the small Express backend that calls Enoki (not part of this repo; run separately).

Important notes
- The frontend sends a `transactionKindBytes` base64 string to the backend. The backend maps that to `transactionBlockKindBytes` for Enoki.
- If your Enoki project requires zkLogin, the frontend must provide a valid zkLogin JWT. The Create Profile page will look for a token stored in `localStorage` or `sessionStorage` under `zklogin_jwt` and forward it as both a request header (`zklogin-jwt`) and body field (`jwt`).

Security recommendation
- Do NOT store long-lived secrets in localStorage in production. Prefer an httpOnly cookie or server-side session. See the `SponsoredTransaction` README for backend guidance.

---

## 🧩 Create Profile flow (implementation details)

Relevant code (high-level):

- Build transaction-kind bytes using Sui Transaction API:

```ts
const tx = new Transaction();
tx.moveCall({ target: `${PACKAGE.PACKAGEID}::...::create_profile`, arguments: [...] });
const transactionBlockKindBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
const txB64 = toBase64(transactionBlockKindBytes);
```

- Call sponsor endpoint (CreateProfilePage now forwards zkLogin JWT when present):

```js
const headers = { 'Content-Type': 'application/json' };
if (zkJwt) headers['zklogin-jwt'] = zkJwt;
fetch('http://localhost:3002/sponsor', { method: 'POST', headers, body: JSON.stringify({ transactionKindBytes: txB64, network: 'testnet', jwt: zkJwt }) });
```

- Wallet signs sponsored bytes (client-side) and posts `digest` + `signature` for execution.

---

## ⚙️ Environment & Config

- No frontend-sensitive env variables are required by default. The backend requires `ENOKI_SECRET_KEY`.
- If you use zkLogin, configure your Enoki app redirect and obtain the JWT via the chosen flow (server-side exchange or client-side SDK).

---

## 🧪 Testing & debugging tips

- Use the browser DevTools Network tab to inspect `/sponsor` and `/execute` requests and responses.
- If you see `Invalid JWT`, either remove the zkLogin requirement in Enoki portal (for testing) or ensure you forward a valid `zklogin-jwt` token.
- Backend logs helpful info; run the SponsoredTransaction backend locally and check its console output.

---

## 🛠️ Contributing

1. Create a feature branch
2. Add unit tests where applicable
3. Open a PR explaining the change

---

If you want, I can also:
- add a small `ZkAuthContext` to keep a JWT in-memory (safer than localStorage), or
- add example server-side auth/callback endpoints for httpOnly cookie flow.

Tell me which option you prefer and I'll scaffold it.

---

Made with ❤️ by the Game Dev Card team

