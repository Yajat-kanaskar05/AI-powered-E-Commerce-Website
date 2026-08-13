# ShopAI — AI-Powered E-Commerce Platform

A full-stack e-commerce application built with the MERN stack, featuring two AI-driven capabilities: **semantic product search** (embeddings + vector search) and a **RAG-powered customer support chatbot**. Built as an end-to-end resume project covering authentication, cart/checkout with Stripe, and a deployed, working production environment.

**Live demo:** [https://ai-powered-e-commerce-website-swart.vercel.app](https://ai-powered-e-commerce-website-swart.vercel.app)

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request may take 30–60 seconds to respond while it wakes up — this is expected, not a bug.
>
> Checkout uses **Stripe test mode**. Use card `4242 4242 4242 4242`, any future expiry date, and any CVC to complete a purchase.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [AI Features in Detail](#ai-features-in-detail)
- [Screenshots](#screenshots)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Technical Decisions & Challenges](#technical-decisions--challenges)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

---

## Overview

ShopAI is a functioning e-commerce platform — think a small-scale Amazon clone — with real user authentication, a product catalog, a persistent server-side cart, and Stripe-powered checkout with webhook-confirmed payment status. On top of that core commerce flow, it adds two genuinely useful AI features rather than a bolted-on chatbot gimmick:

1. **Semantic ("AI") product search** — understands the *meaning* of a search query, not just literal keyword matches
2. **RAG customer support assistant** — answers policy questions (shipping, returns, payments, etc.) grounded in the store's actual documented policies, with source attribution, rather than hallucinating answers

## Features

**Core commerce**
- JWT-based authentication with bcrypt password hashing and role-based access (user / admin)
- Product catalog with pagination and category/keyword filtering
- Persistent, per-user server-side cart (not localStorage) — survives across devices and sessions
- Order snapshotting — orders store the price/name at time of purchase, so later product edits never retroactively change past orders
- Stripe Checkout integration with webhook-confirmed payment status (pending → paid)

**AI features**
- Semantic product search using Gemini embeddings + MongoDB Atlas Vector Search, with empirically-tuned relevance filtering (see [Technical Decisions](#technical-decisions--challenges))
- Toggleable AI vs. keyword search on the same search bar, for a direct side-by-side comparison
- RAG-based support chatbot: retrieves relevant policy chunks via vector search, then generates a grounded answer with an explicit guardrail against answering outside its knowledge base
- Multi-turn conversation support and visible source attribution in the chat UI
- Rate-limited chat endpoint to protect API quota

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Context API |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (including Atlas Vector Search) |
| Auth | JWT, bcrypt |
| Payments | Stripe (Checkout + Webhooks) |
| AI / Embeddings | Google Gemini (`gemini-embedding-001`, `gemini-flash-latest`) |
| Hosting | Vercel (frontend), Render (backend) |

## Architecture

```
client/              React frontend (Vite)
  src/
    api/             Axios instance with auto-attached JWT
    context/          Auth & Cart global state (Context API)
    pages/            Home, Login, Register, ProductDetail, Cart, Orders, OrderSuccess
    components/        Navbar, ProductCard, SearchBar, ChatWidget

server/              Express backend
  models/             User, Product, Cart, Order, KnowledgeChunk
  controllers/        auth, product, cart, order, chat, webhook
  services/           ai.js (Gemini embeddings + chat), rag.js (retrieval)
  middleware/          JWT auth, admin check, chat rate limiter
  scripts/             One-off embedding backfill / knowledge base seeding scripts
```

**Request flow example — semantic search:**
1. User submits a query with "AI Search" mode selected
2. Frontend calls `GET /api/products/search-ai?q=...`
3. Backend embeds the query text via Gemini (`gemini-embedding-001`)
4. MongoDB Atlas `$vectorSearch` compares the query vector against pre-computed product embeddings using cosine similarity
5. Results are filtered using a relative-score threshold (see below) and returned ranked by relevance

**Request flow example — RAG chat:**
1. User asks a question in the chat widget
2. Backend embeds the question, runs `$vectorSearch` against a separate `KnowledgeChunk` collection
3. Top matching policy chunks are retrieved and inserted into a prompt with an explicit "answer only from this context" instruction
4. Gemini (`gemini-flash-latest`) generates a grounded response
5. Response + source chunk names are returned to the frontend and displayed

## AI Features in Detail

### Semantic Product Search
Every product's name, description, and category are combined into one string and embedded at creation/update time. A search query is embedded the same way, and MongoDB Atlas Vector Search returns the closest matches by cosine similarity — meaning a query like *"something for exercise at home"* correctly surfaces a yoga mat and dumbbells even though neither word appears in those product names.

**Relevance filtering:** raw vector search always returns *some* result for every query, even irrelevant ones, since cosine similarity never hits exactly zero for short text. Rather than a fixed similarity cutoff (which doesn't generalize well across different queries), results are filtered relative to the top match's score, with an absolute floor as a safety net — see [Technical Decisions](#technical-decisions--challenges) for how this was tuned.

### RAG Customer Support Chatbot
A small hand-written knowledge base (shipping, returns, payments, account help, order tracking, cancellations) is chunked and embedded into a separate vector index. On each chat message, the most relevant chunks are retrieved and given to the LLM as grounding context, with an explicit instruction to decline rather than guess if the answer isn't in the provided context. This was verified by testing genuinely out-of-scope questions (e.g., "What's the capital of France?") to confirm the model correctly declines instead of falling back on its general training knowledge.

## Screenshots

*(Add screenshots/GIFs here before publishing — recommended: AI search vs. keyword search side-by-side, the match-score UI, and the chat widget mid-conversation with sources visible.)*

## Local Setup

### Prerequisites
- Node.js
- A MongoDB Atlas account (free tier, with Vector Search enabled)
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))
- A Stripe account (test mode)
- Stripe CLI (for local webhook testing)

### 1. Clone and install
```bash
git clone <your-repo-url>
cd EC-AI

cd server
npm install

cd ../client
npm install
```

### 2. Environment variables
See [Environment Variables](#environment-variables) below. Create `server/.env` and `client/.env` accordingly.

### 3. Set up MongoDB Atlas Vector Search indexes
Two indexes are required — see the schema below. Create both under Atlas → Search Indexes → Create Vector Search Index → "Bring your own embeddings":

**`product_vector_index`** on the `products` collection:
```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 3072, "similarity": "cosine" }
  ]
}
```

**`knowledge_vector_index`** on the `knowledgechunks` collection:
```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 3072, "similarity": "cosine" }
  ]
}
```

### 4. Seed the knowledge base
```bash
cd server
node scripts/embedKnowledgeBase.js
```

### 5. Run the app
```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev

# Terminal 3 — Stripe webhook forwarding (local only)
stripe listen --forward-to localhost:5000/api/webhook
```

Visit `http://localhost:5173`.

## Environment Variables

**`server/.env`**
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

**`client/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

## Technical Decisions & Challenges

A few things worth calling out — these came up as real problems while building this, not hypothetical trade-offs:

- **Relevance filtering for vector search:** initial testing showed that with a small catalog, cosine similarity scores for genuinely unrelated products still landed above 70%, so a fixed threshold wasn't reliable. Switched to filtering results relative to the top-scoring match (`score >= topScore - gap`), with an absolute floor as a backstop, tuned empirically against real query results.
- **Model deprecation handling:** both `text-embedding-004` and `gemini-1.5-flash` were deprecated mid-build. Switched to `gemini-embedding-001` and the rolling `gemini-flash-latest` alias to reduce future breakage, and moved all Gemini/Stripe client instantiation *inside* request handlers rather than at module load time, since `dotenv.config()` timing relative to ES module import resolution otherwise caused `undefined` API keys on startup.
- **Stripe webhook raw-body requirement:** Stripe's signature verification needs the unparsed request body, which conflicts with Express's global `express.json()` middleware. Solved by registering the webhook route with `express.raw()` *before* the global JSON parser is applied.
- **Order price snapshotting:** order line items store `name`/`price` directly at time of purchase rather than referencing the live product document, so that later price or catalog changes never alter historical order records.
- **SPA routing on Vercel:** Stripe's redirect after payment is a full page load to `/order-success`, which Vercel's static hosting doesn't resolve by default (only `index.html` is a real file; all other routes are handled client-side by React Router). Fixed with a `vercel.json` rewrite rule routing all paths to `index.html`.
- **CORS origin exact-matching:** a trailing slash mismatch between the deployed frontend's actual origin and the `CLIENT_URL` environment variable caused every cross-origin request to fail silently as a CORS error — a reminder that CORS origin matching is exact, character-for-character.

## Known Limitations

- Backend free-tier hosting means a cold-start delay (30–60s) after periods of inactivity
- No guest checkout — cart and orders require an authenticated account
- Semantic search relevance thresholds were tuned against a small catalog and may need re-tuning at larger scale
- No automated test suite yet

## Future Improvements

- Add automated tests (Jest/Supertest for API, RTL for components)
- Input validation via Zod/Joi on both client and server
- Product recommendations based on browsing/purchase history
- Admin dashboard for order/inventory management
- Guest cart support
