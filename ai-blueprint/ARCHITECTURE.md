# ARCHITECTURE.md

# System Architecture

This document defines the architectural decisions for the AI-generated eCommerce platform.

The goal is to maintain a clean, scalable, maintainable, production-ready architecture while allowing AI agents to safely generate and modify code.

---

# Architecture Philosophy

The project must follow:

- Separation of Concerns
- Single Responsibility Principle
- Clean Architecture principles
- Modular Design
- Reusability
- Scalability
- Maintainability

Every layer should have a clear responsibility.

No layer should bypass another layer.

---

# High Level Architecture

```txt
┌─────────────────────┐
│      Frontend       │
│       React         │
└──────────┬──────────┘
           │
           │ HTTP / HTTPS
           │
┌──────────▼──────────┐
│       Backend       │
│   Node + Express    │
└──────────┬──────────┘
           │
           │ Prisma
           │
┌──────────▼──────────┐
│       MySQL         │
└─────────────────────┘
```

---

# Project Structure

```txt
project-root/
│
├── client/
│
├── backend/
│
├── ai-blueprint/
│
├── docker-compose.yml
│
├── .env.example
│
└── README.md
```

---

# Frontend Architecture

The frontend is responsible for:

- User interface
- User experience
- Form handling
- Client-side validation
- API consumption
- State management
- Navigation

The frontend must never:

- Access the database directly
- Handle business logic
- Store secrets
- Perform authentication verification internally

---

# Backend Architecture

The backend is responsible for:

- Authentication
- Authorization
- Business logic
- Database access
- Validation
- API documentation
- Security
- Integrations

The backend owns all business rules.

The frontend should only consume backend APIs.

---

# Database Architecture

The database is responsible for:

- Persistent storage
- Data integrity
- Relationships
- Query performance

The database must never contain business logic.

Business logic belongs inside backend services.

---

# Layer Communication Rules

Allowed:

Frontend → Backend

Backend → Database

Backend → External Services

Backend → AI Services

Not Allowed:

Frontend → Database

Frontend → AI Provider

Frontend → MySQL

Database → External Services

---

# Backend Layer Architecture

```txt
Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Prisma
   │
   ▼
MySQL
```

---

# Route Layer

Responsibilities:

- Define endpoints
- Attach middleware
- Connect controllers

Routes must not contain:

- Business logic
- Database queries
- Validation logic

---

# Controller Layer

Responsibilities:

- Read requests
- Call services
- Return responses

Controllers must remain thin.

Controllers must not:

- Query the database
- Perform calculations
- Call external APIs
- Call AI providers directly

---

# Service Layer

Responsibilities:

- Business logic
- Database communication
- External integrations
- AI integrations

Services are the heart of the backend.

All important logic belongs here.

---

# Database Layer

Responsibilities:

- Data storage
- Data retrieval

The database should never contain application logic.

---

# API Design

Use REST architecture.

Examples:

GET /api/products

GET /api/products/:id

POST /api/auth/login

POST /api/auth/register

POST /api/cart

POST /api/orders

PUT /api/profile

DELETE /api/cart/:id

---

# Authentication Architecture

Authentication Flow:

```txt
User
  │
  ▼
Login Request
  │
  ▼
Backend
  │
  ▼
JWT Token
  │
  ▼
Frontend Storage
  │
  ▼
Authenticated Requests
```

Protected routes must require valid authentication.

Passwords must always be hashed.

---

# Authorization Architecture

Protected resources must verify:

- Authentication
- Ownership
- Permissions

Users must never access resources belonging to other users.

---

# Frontend Structure

```txt
client/src/
│
├── assets/
├── components/
├── pages/
├── hooks/
├── api/
├── services/
├── routes/
├── context/
├── validations/
├── styles/
├── utils/
└── constants/
```

---

# Backend Structure

```txt
backend/src/
│
├── config/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── validations/
├── prisma/
├── utils/
├── docs/
├── tests/
├── app.js
└── server.js
```

---

# Database Access Rule

All database communication must go through Prisma.

Allowed:

Controller
→ Service
→ Prisma
→ MySQL

Not Allowed:

Controller
→ Prisma

Route
→ Prisma

Frontend
→ Prisma

---

# Validation Architecture

Validation Flow:

```txt
Request
   │
   ▼
Validation Middleware
   │
   ▼
Controller
   │
   ▼
Service
```

Invalid requests should never reach services.

---

# Error Handling Architecture

Use centralized error handling.

Flow:

```txt
Route
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Error Middleware
```

All errors should return a consistent format.

---

# Docker Architecture

The application must run using:

docker compose up

Services:

```txt
frontend
backend
mysql
```

All services must communicate through Docker networking.

No manual setup should be required.

---

# Testing Architecture

Backend:

- Jest
- Supertest

Frontend:

- Jest
- React Testing Library

Tests should validate:

- Core flows
- Authentication
- Cart
- Orders
- Product management

---

# Security Architecture

Must include:

- JWT Authentication
- Password Hashing
- Input Validation
- CORS
- Helmet
- Rate Limiting
- Environment Variables

Security is mandatory.

Not optional.

---

# Documentation Architecture

The project must include:

- Swagger
- README
- AI Blueprint
- AI Interaction Log
- Manual Fix Documentation

The documentation is part of the final deliverable.

---

# Scalability Rules

Architecture should support:

- More products
- More users
- More orders
- Additional features

Avoid architecture decisions that only work for small projects.

Think production-first.

---

# Definition Of Done

The architecture is complete only when:

✅ Frontend structure is defined

✅ Backend structure is defined

✅ Database structure is defined

✅ Layer responsibilities are clear

✅ API communication is defined

✅ Docker architecture is defined

✅ Validation flow is defined

✅ Error handling flow is defined

✅ Security architecture is defined

✅ Testing architecture is defined

✅ Scalability considerations exist

If any item is missing:

THE ARCHITECTURE IS NOT COMPLETE.