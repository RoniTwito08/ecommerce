# Helfy — AI-Driven Full Stack eCommerce Platform

Helfy is a production-grade eCommerce platform built end-to-end using AI-driven development. The project demonstrates how structured prompting, architectural blueprints, and iterative AI-assisted engineering can produce a fully functional, maintainable, and deployable application.

The platform is branded as **Terra** — a curated home and lifestyle goods store — and covers the complete customer purchasing journey from browsing to order confirmation.

---

## Features

- **Authentication** — Register, login, and session persistence via short-lived JWT access tokens and long-lived refresh tokens. Automatic silent refresh. Protected routes.
- **Product Catalog** — Browsable product grid with category chips, price band filtering, keyword search, and multiple sort options.
- **Product Details** — Full product page with image gallery, quantity selector, stock status, and add-to-cart.
- **Shopping Cart** — Persistent server-side cart. Add, update quantity, and remove items. Order summary with free-shipping progress indicator.
- **Multi-Step Checkout** — Four-step flow: contact and address → shipping method → order review and payment → confirmation. Order placed against live backend with real stock decrement.
- **Account Section** — User profile display and editing.
- **Order History** — Full order list with expandable detail rows showing line items, prices, and status.

---

## Tech Stack

### Frontend

| Technology | Role |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing and protected routes |
| Axios | HTTP client with JWT interceptor and silent refresh |
| Vite | Build tool and dev server |

### Backend

| Technology | Role |
|---|---|
| Node.js + Express | HTTP server and API layer |
| MySQL 8 | Relational database |
| Prisma ORM | Schema management, migrations, and type-safe queries |
| JWT | Access token (15 min) and refresh token (7 days) auth |
| Zod | Request validation at every API boundary |
| Swagger (OpenAPI 3.0) | Auto-generated API documentation |
| Jest + Supertest | Integration tests against real database |

### Infrastructure

| Technology | Role |
|---|---|
| Docker | Containerisation for all three services |
| Docker Compose | Orchestration: MySQL → backend → frontend |
| nginx | Serves the production frontend build and proxies `/api` |

### AI Tools Used

| Tool | Role |
|---|---|
| Claude Code | Primary development assistant — architecture, implementation, code review |
| Claude Design | Initial UI/UX visual system and component design |
| ChatGPT | Early planning, requirement analysis, and cross-validation |

---

## Project Structure

```
helfy/
├── ai-Boilerplate/             # AI blueprint files guiding development
│   ├── PROJECT_RULES.md        # Coding standards and conventions
│   ├── ARCHITECTURE.md         # System architecture decisions
│   ├── CAPABILITIES.md         # Feature scope definition
│   ├── initial.md              # Initial project brief
│   └── skills/                 # Specialised AI skill files
│       ├── backend_architecture/SKILL.md
│       ├── frontend_architecture/SKILL.md
│       ├── DB_architecture/SKILL.md
│       └── code-reviewer/SKILL.md
│
├── backend/                    # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (9 models)
│   │   └── seed.js             # Development seed data
│   ├── src/
│   │   ├── config/             # Environment validation, DB client, Swagger
│   │   ├── constants/          # Shared constants (SORT, ORDER_STATUS, parseMs)
│   │   ├── controllers/        # Request/response handlers
│   │   ├── middlewares/        # Auth, validation, error, rate limiter
│   │   ├── routes/             # Express router definitions
│   │   ├── services/           # Business logic layer
│   │   ├── tests/              # Jest + Supertest integration tests
│   │   ├── utils/              # ApiError, ApiResponse, logger
│   │   ├── validations/        # Zod schemas per feature
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # HTTP server entry point
│   ├── Dockerfile
│   └── package.json
│
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios API modules per feature
│   │   ├── components/
│   │   │   ├── common/         # Icon, Placeholder, Stars, QtyStepper, etc.
│   │   │   ├── layout/         # Navbar, Footer, ProtectedRoute
│   │   │   └── products/       # ProductCard
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── pages/              # One file per screen
│   │   ├── styles/             # globals.css, layout.css (design system)
│   │   └── utils/              # format.js (money, date)
│   ├── nginx.conf              # Production nginx config with /api proxy
│   ├── Dockerfile              # Multi-stage: build → nginx
│   └── package.json
│
├── AI-Driven Ecommerce/        # Original Claude Design visual source files
│   └── src/                    # Reference UI — not part of the production build
│
├── AI_INTERACTIONS_LOG.md      # Full log of AI prompts, decisions, and reviews
├── docker-compose.yml          # Full stack orchestration
├── .env.example                # All required environment variables with comments
└── README.md
```

---

## Running with Docker

This is the recommended way to run the complete stack.

```bash
 Build and start all services
docker compose up --build
```

The first run will:
1. Start MySQL and wait for it to be healthy
2. Build and start the backend, run Prisma migrations, and seed the database
3. Build the frontend and serve it via nginx

**Service URLs:**

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Swagger Docs | http://localhost:5000/api/docs |

> Docker configuration is included and intended to run the full stack with `docker compose up --build`.

---

## Running Locally Without Docker

Two terminals are required.

### Backend

```bash
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations (requires a running MySQL instance)
npx prisma migrate dev

# Seed the database with categories, products, and images
npx prisma db seed

# Start the development server
npm run dev
```

The backend starts on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend starts on `http://localhost:3000`.

The `client/.env.development` file is pre-configured to point to `http://localhost:5000/api`.

---

## Environment Variables

Copy `.env.example` to `.env` and update the values. The most important variables are:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string. Uses `mysql` as the host inside Docker; change to `localhost` for local dev. |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens. Must be at least 32 characters. Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Separate secret for refresh tokens. Same generation method. |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime. Default: `15m`. |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime. Default: `7d`. |
| `CLIENT_URL` | The frontend origin used for CORS. Default: `http://localhost:3000`. |
| `VITE_API_URL` | The backend API base URL consumed by the frontend. Default: `http://localhost:5000/api`. In Docker production builds this is `/api` (proxied by nginx). |

---

## API Documentation

Interactive Swagger documentation is available at:

```
http://localhost:5000/api/docs
```

All endpoints are documented with request schemas, response shapes, authentication requirements, and example values.

---

## AI Blueprint

The `ai-Boilerplate/` directory contains the structured blueprints used to guide the AI throughout development:

| File | Purpose |
|---|---|
| `initial.md` | Original project brief and assignment requirements |
| `PROJECT_RULES.md` | Enforced coding standards: naming conventions, error handling, security rules |
| `ARCHITECTURE.md` | System architecture: layer separation, database design, auth model |
| `CAPABILITIES.md` | Feature scope: what is in and out of scope for the assignment |
| `skills/` | Specialised skill files for backend architecture, frontend architecture, database design, and code review |

These files were provided as context to the AI at each development phase, ensuring consistency across all generated code.

---

## AI Interactions Documentation

All AI interactions are documented in `AI_INTERACTIONS_LOG.md`, including:

- Initial planning prompts and the AI-generated project plan
- Architecture decisions and the reasoning behind each
- Phase-by-phase implementation prompts
- Code review sessions with identified issues and applied fixes
- Manual intervention points where human judgment overrode or corrected the AI output
- The tools and models used at each stage

---

## Manual Interventions

The following changes were made through human-guided prompting or direct correction of AI-generated output. Each represents a point where the initial AI output required improvement.

### 1. Refresh Token Architecture
**What:** Added a full refresh token system with token rotation, a `refresh_tokens` database table, and httpOnly cookie delivery.  
**Why:** The initial plan used only short-lived access tokens with no silent refresh. This would require users to log in repeatedly and does not meet production authentication standards.  
**AI gap:** The AI-generated plan defaulted to a simpler single-token approach without prompting.

### 2. ProductImage Relation
**What:** Replaced a single `imageUrl` string field on `Product` with a separate `ProductImage` model supporting multiple images, a primary flag, and sort order.  
**Why:** A single image field cannot support product galleries, which are a baseline expectation of any real eCommerce product page.  
**AI gap:** The initial schema used a flat `imageUrl` field. The relation model was explicitly requested as a user improvement.

### 3. Backend `.dockerignore`
**What:** Created `backend/.dockerignore` to exclude `.env`, `node_modules`, and coverage files from Docker image layers.  
**Why:** Without it, `COPY . .` in the Dockerfile would include `.env` in the image, exposing secrets in Docker layer history.  
**AI gap:** Identified in the Phase 1+2 code review. The AI did not generate this file initially.

### 4. Seed Image URL Encoding Bug
**What:** Fixed the `img()` helper in `seed.js` to call `.replace(/\+/g, ' ')` before `encodeURIComponent`.  
**Why:** Product names containing `+` (e.g. `BT+Speaker`) caused `encodeURIComponent` to encode `+` as `%2B`, which placehold.co rendered as a literal `+` in the image label rather than a space.  
**AI gap:** The bug was identified during code review. The AI-generated helper did not account for the `+` character edge case.

### 5. Registration Atomicity
**What:** Wrapped `user.create`, `cart.create`, and `refreshToken.create` in a single Prisma interactive transaction in `auth.service.js`.  
**Why:** Without the transaction, a failure during `refreshToken.create` would leave an orphaned user record in the database — a ghost account that blocks re-registration with the same email.  
**AI gap:** Identified in the Phase 3 auth review. The initial implementation made three sequential non-transactional writes.

### 6. Refresh Token Expiration Synchronisation
**What:** Extracted a `parseMs()` utility and used it as the single source of truth for both the JWT cookie `maxAge` and the database `expiresAt` field.  
**Why:** The original code computed the two expiry values independently, creating a risk of them drifting apart.  
**AI gap:** Identified as a duplication issue during code review.

### 7. Malformed DUMMY_HASH
**What:** Replaced a hardcoded 63-character fake bcrypt hash string with `bcrypt.hashSync('helfy-dummy-timing-guard', BCRYPT_ROUNDS)`.  
**Why:** A valid bcrypt hash is exactly 60 characters. The 63-character hardcoded string could cause bcrypt to short-circuit its computation, undermining the timing-attack protection it was meant to provide.  
**AI gap:** The AI generated a plausible-looking but invalid hash string. Identified during the Phase 3 review.

### 8. Cart DELETE TOCTOU Race
**What:** Replaced a `findUnique` + `delete` sequence with a single `deleteMany({ where: { id, cart: { userId } } })` call.  
**Why:** The original two-step approach had a race window between the ownership check and the delete. A concurrent request could delete the item in between, causing a spurious P2025 (not found) error instead of the expected idempotent 200.  
**AI gap:** Identified in the Phase 5 cart review. The single-operation fix eliminates the window entirely.

### 9. Integer-Cent Arithmetic for Order Totals
**What:** Replaced `parseFloat().toFixed(2)` reduction with a `toCents()` helper that accumulates in integer cents and divides once at the end.  
**Why:** Floating-point accumulation over multiple line items can produce results like `$99.999999999` instead of `$100.00`. Monetary values must be exact.  
**AI gap:** Identified in the Phase 6 order review. The AI-generated version used standard float arithmetic.

### 10. Atomic Stock Decrement Guard
**What:** Replaced `product.update({ decrement })` with `product.updateMany({ where: { stockQuantity: { gte: quantity } }, data: { decrement } })` and checked `result.count === 0`.  
**Why:** Under concurrent orders, two requests could both pass the pre-validation stock check and both decrement, driving stock below zero.  
**AI gap:** Identified in the Phase 6 order review. The AI-generated version did not account for concurrent writes within the same transaction window.

### 11. Frontend Cart Remove Runtime Bug
**What:** Fixed `CartContext.removeItem` to call `fetchCart()` after the delete instead of attempting `setCart(data.data.cart)`.  
**Why:** The `DELETE /cart/items/:id` endpoint returns `{ message: '...' }`, not a cart object. The original code set the cart to `undefined`, crashing the CartPage on next render.  
**AI gap:** The AI-generated CartContext assumed the remove endpoint returned the full cart, matching the pattern of `addItem` and `updateItem`. The backend contract differs for delete.

### 12. Checkout Optional Phone Field
**What:** Changed `shippingPhone: form.phone || null` to a conditional spread `...(form.phone.trim() ? { shippingPhone: form.phone.trim() } : {})`.  
**Why:** Sending `null` for an optional Zod `z.string().optional()` field causes a 400 validation error. Zod's `.optional()` accepts `undefined` (absent key) but not `null`.  
**AI gap:** The AI-generated checkout used `null` as the empty-field sentinel, which is correct in some validation libraries but not Zod without `.nullable()`.

---

## Testing

Backend tests use **Jest** and **Supertest** running against a real MySQL database, not mocks. Each test suite manages its own state with `beforeEach` resets.

```bash
cd backend
npm test
```

Areas covered:

| Module | What is tested |
|---|---|
| Auth | Register, login, refresh, logout, getMe, edge cases (duplicate email, invalid credentials, missing tokens) |
| Products | List with pagination, filtering by category, product detail, invalid IDs |
| Cart | Add item, update quantity, remove item, stock validation, ownership enforcement |
| Orders | Create order, stock decrement, inactive product rejection, order history, ownership on detail |

---

## Main User Flow

```
Register → Login → Browse Products → Filter / Search → Product Detail
        → Add to Cart → View Cart → Checkout (4 steps) → Order Confirmation
        → Account → Order History
```

---

## Known Limitations

- **Payment is demo-only.** The checkout flow collects card details for UI completeness, but no payment provider is integrated. No real charge is made.
- **Product images are placeholder images.** All product images are seeded from placehold.co. The image gallery infrastructure is fully implemented and production-ready; only the image content is placeholder.
- **Admin product management is out of scope.** There is no admin dashboard. Products, categories, and stock levels are managed through the seed script and Prisma Studio.
- **Frontend architecture is time-constrained.** The frontend uses a global CSS design system migrated from the Claude Design visual source files. A full CSS Modules and React Hook Form refactor was identified but deferred in favour of shipping a working end-to-end flow.
- **No real-world shipping integration.** Shipping method selection is UI-only. The selected method is written to the order `notes` field.

---

## Final Notes

The primary goal of this project was to demonstrate **AI-driven software engineering** — not simply AI-assisted code generation. Every phase followed a structured process: blueprint review → planning → implementation → code review → targeted fixes. The AI was treated as a capable but fallible collaborator, with human judgment applied at each review gate to catch security risks, logical errors, and API contract mismatches.

The result is a codebase where the AI contributed the majority of implementation work, but where critical correctness decisions — transaction atomicity, timing attack prevention, float arithmetic safety, and race condition handling — were validated and corrected through deliberate review.
