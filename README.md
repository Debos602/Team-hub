# 🚀 Team Hub

A full-stack team collaboration platform built with Node.js, TypeScript, Prisma, and Next.js. Team Hub enables organizations to manage workspaces, members, channels, and real-time communication — all in one place.

> **Live API:** [https://web-production-cab62.up.railway.app](https://web-production-cab62.up.railway.app)

---

## 📋 Table of Contents

- [Features](#features)
- [Advanced Features](#advanced-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Known Limitations](#known-limitations)

---

## ✨ Features

- **Authentication** — JWT-based register, login, and session management
- **Workspaces** — Create and manage multiple team workspaces
- **Members & Roles** — Invite members, assign roles (admin, member, guest)
- **Channels** — Organized category-based channels within a workspace
- **Messaging** — Send and receive messages within channels
- **File Uploads** — Attach and share files across conversations
- **Notifications** — In-app notification system for team activity
- **Payments** — Subscription plan management with payment gateway integration
- **Analytics** — Charts and usage statistics powered by Recharts
- **API Docs** — Auto-generated Swagger/OpenAPI documentation

---

## ⭐ Advanced Features

### 1. 💳 Payment Flow with Subscription Management

Team Hub implements a full subscription lifecycle — from plan selection to payment confirmation and access gating. Key highlights:

- Multiple pricing tiers (Free, Pro, Enterprise)
- Payment intent creation and webhook handling
- Post-payment workspace feature unlocking
- Subscription status tracked per workspace in the database
- Graceful degradation — features remain accessible during payment processing, locked only after confirmed failure

> See [`PAYMENT_FLOW_ENHANCEMENTS.md`](./PAYMENT_FLOW_ENHANCEMENTS.md) for full technical details.

---

### 2. 🗂️ Dynamic Category & Channel Module

A flexible category system that allows workspace admins to create hierarchical channel structures:

- Categories act as logical groupings for channels
- Channels can be text, voice (future), or announcement type
- Category-level permission overrides for fine-grained access control
- Soft-delete support — categories and channels are archived, not permanently removed
- Ordering support — drag-and-drop ordering persisted to DB

> See [`CATEGORY_MODULE.md`](./CATEGORY_MODULE.md) for full technical details.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 |
| Language | TypeScript |
| Backend Framework | Express.js |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Frontend | Next.js (React) |
| Build System | Turborepo |
| Package Manager | Yarn 1.22 |
| API Docs | Swagger / swagger-jsdoc |
| Charts | Recharts, Chart.js |
| Notifications (UI) | Sonner |
| Deployment | Railway |

---

## 📁 Project Structure

```
team-hub/
├── apps/
│   ├── api/                  # Express backend
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules (auth, workspace, channel, etc.)
│   │   │   ├── middlewares/  # Auth, error handling
│   │   │   ├── utils/        # Helpers
│   │   │   └── server.ts     # Entry point
│   │   └── dist/             # Compiled output (after build)
│   └── web/                  # Next.js frontend
│       ├── app/              # App router pages
│       ├── components/       # UI components
│       └── lib/              # API client, hooks
├── packages/                 # Shared packages (types, config)
├── prisma/
│   └── schema.prisma         # Database schema
├── uploads/                  # Uploaded files (local dev)
├── .env.example              # Environment variable reference
└── turbo.json                # Turborepo config
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22
- Yarn 1.22
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/Debos602/Team-hub.git
cd Team-hub

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see below)

# Run database migrations
yarn workspace api prisma migrate dev

# Generate Prisma client
yarn workspace api prisma generate
```

### Running Locally

```bash
# Run both API and web in development mode
yarn dev

# Run only the API
yarn workspace api dev

# Run only the web
yarn workspace web dev
```

### Building for Production

```bash
yarn build
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# ─── Database ────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/team_hub"

# ─── Authentication ──────────────────────────────────
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# ─── Server ──────────────────────────────────────────
PORT=5000
NODE_ENV="development"

# ─── Client URL (CORS) ───────────────────────────────
CLIENT_URL="http://localhost:3000"

# ─── File Upload ─────────────────────────────────────
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=10

# ─── Payment Gateway ─────────────────────────────────
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# ─── Email (optional) ────────────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@email.com"
SMTP_PASS="your-app-password"
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 📖 API Documentation

Once the API is running, Swagger UI is available at:

```
http://localhost:5000/api-docs
```

All endpoints are grouped by module: `auth`, `workspace`, `member`, `channel`, `message`, `notification`, `payment`.

---

## ⚠️ Known Limitations

1. **No real-time messaging** — Messages currently require a page refresh to appear. WebSocket / Socket.io integration is planned but not yet implemented.

2. **Local file storage only** — Uploaded files are stored on the server filesystem (`/uploads`). On Railway, these are lost on each redeploy. A cloud storage solution (AWS S3 / Cloudinary) is needed for production.

3. **No email verification** — User registration does not require email confirmation. Anyone with a valid email format can register.

4. **Single-region deployment** — The app is deployed on a single Railway instance with no horizontal scaling or CDN in place.

5. **package-lock.json conflict** — The repo currently contains both `yarn.lock` and `package-lock.json`. The `package-lock.json` should be removed to avoid resolution inconsistencies (Yarn warns about this on every install).

6. **Workspace privacy** — The root `package.json` monorepo requires `"private": true` for Yarn workspaces to function correctly in all environments.

---

## 📄 License

MIT © [Debos602](https://github.com/Debos602)
