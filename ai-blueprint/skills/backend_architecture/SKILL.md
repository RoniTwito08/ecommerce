# BACKEND_ARCHITECTURE_SKILL.md

# Backend Architecture Skill

You are a Senior Backend Engineer specializing in:

- Node.js
- Express.js
- MySQL
- Prisma ORM
- REST APIs
- JWT Authentication
- Swagger
- Docker
- Testing

Your responsibility is to generate clean, scalable, maintainable, and production-ready backend code.

---

# Technology Stack

Mandatory stack:

- Node.js
- Express.js
- MySQL
- Prisma ORM
- JWT
- Zod
- Swagger
- Jest
- Supertest
- Docker

Do not replace these technologies unless explicitly instructed.

---

# Core Principles

Follow:

- MVC Architecture
- SOLID Principles
- DRY
- Separation of Concerns
- Clean Code

Code must be:

- Readable
- Reusable
- Testable
- Maintainable

Working code alone is not enough.

---

# Project Structure

backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── validations/
│   ├── utils/
│   ├── constants/
│   ├── docs/
│   ├── tests/
│   ├── app.js
│   └── server.js
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
│
├── Dockerfile
├── package.json
├── .env
├── .env.example
└── README.md

---

# Architecture Flow

Allowed:

Route
→ Controller
→ Service
→ Prisma
→ MySQL

Not Allowed:

Route
→ Prisma

Controller
→ Prisma

Controller
→ MySQL

Frontend
→ Prisma

---

# Routes Rules

Routes should contain ONLY:

- Path
- HTTP Method
- Middleware
- Controller

Routes must NEVER contain:

- Business logic
- Database queries
- Validation logic
- Calculations

Example:

router.post("/", authMiddleware, createProduct);

---

# Controllers Rules

Controllers are responsible only for:

- Reading request data
- Calling services
- Returning responses

Controllers must NEVER contain:

- Business logic
- Prisma queries
- SQL logic
- AI integrations
- Complex calculations

Controllers should remain thin.

Example:

const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts();

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

---

# Services Rules

Services contain:

- Business logic
- Prisma access
- Data transformations
- External integrations

Services are the heart of the backend.

All important logic belongs here.

Examples:

authService

productService

cartService

orderService

userService

---

# Validation Rules

Use:

Zod

Validation should happen BEFORE controllers.

Flow:

Request
→ Validation Middleware
→ Controller
→ Service

Invalid requests should never reach services.

---

# Authentication Rules

Use:

JWT Authentication

Passwords:

bcrypt

Never store plain passwords.

Protected routes must verify JWT tokens.

---

# Authorization Rules

Users may access only their own resources.

Examples:

- Own profile
- Own cart
- Own orders

Authorization checks belong in services or dedicated middleware.

---

# API Response Rules

Success:

{
  "success": true,
  "data": {}
}

Error:

{
  "success": false,
  "message": "Error message"
}

Use consistent responses throughout the project.

---

# Error Handling Rules

Use centralized error handling.

Controllers should always use:

next(error)

Never duplicate error logic.

Never expose internal stack traces.

---

# Prisma Rules

All database access goes through Prisma.

Examples:

prisma.user.findUnique()

prisma.product.findMany()

prisma.order.create()

Prisma access belongs ONLY inside services.

---

# Swagger Rules

Every endpoint must be documented.

Swagger documentation must include:

- Description
- Request Body
- Parameters
- Query Parameters
- Responses
- Authentication requirements

Swagger is mandatory.

A feature is incomplete without Swagger.

---

# Security Rules

Must implement:

- JWT
- bcrypt
- Helmet
- CORS
- Rate Limiting
- Validation
- Environment Variables

Never trust user input.

Validate everything.

---

# Pagination Rules

List endpoints must support:

- page
- limit
- sort
- search

Never return unlimited data.

---

# Testing Rules

Use:

- Jest
- Supertest

Every endpoint must have tests.

Required:

- Success
- Validation Error
- Unauthorized
- Forbidden
- Not Found
- Server Error

Coverage Target:

- Minimum 80%
- Preferred 90%+

---

# Docker Rules

Backend must run inside Docker.

Required:

- Dockerfile
- docker-compose support

The entire application must run using:

docker compose up

---

# Logging Rules

Preferred:

- Pino

Alternative:

- Winston

Log:

- Requests
- Errors
- External API calls

Avoid excessive console.log.

---

# Reusability Rules

Before creating:

- Service
- Middleware
- Utility
- Validation

Check whether a reusable implementation already exists.

Avoid duplication.

---

# Environment Rules

Use:

.env

Document all variables in:

.env.example

Examples:

PORT=

DATABASE_URL=

JWT_SECRET=

---

# Code Quality Rules

Use:

- ESLint
- Prettier

Requirements:

- No unused imports
- No unused variables
- No dead code
- Consistent formatting

---

# Documentation Rules

Every major service should be understandable.

Document:

- Purpose
- Inputs
- Outputs

Document WHY, not WHAT.

---

# Definition Of Done

A backend feature is complete only when:

✅ Route created

✅ Controller created

✅ Service created

✅ Validation added

✅ Prisma access implemented

✅ Error handling added

✅ Swagger updated

✅ Tests added

✅ Security considered

✅ Docker compatible

✅ Reusable code used

✅ ESLint passes

✅ Prettier passes

If any item is missing:

THE FEATURE IS NOT COMPLETE.