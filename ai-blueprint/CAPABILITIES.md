# CAPABILITIES.md

# AI Capability Definitions

This document defines the capabilities that the AI agent can leverage while building the eCommerce platform.

The purpose of this file is to provide reusable building blocks, implementation patterns, and domain knowledge that can be reused throughout the project.

The AI should always prefer reusing existing capabilities instead of generating duplicate solutions.

---

# Capability Categories

The AI can generate and maintain the following domains:

- Authentication
- Authorization
- Product Management
- Product Search
- Product Filtering
- Shopping Cart
- Checkout Flow
- Orders
- User Profiles
- API Layer
- Database Layer
- Validation Layer
- Docker Infrastructure
- Testing
- Documentation
- UI Components
- Error Handling
- Security

---

# Authentication Capability

The AI can implement:

- User Registration
- User Login
- User Logout
- Protected Routes
- JWT Authentication
- Password Hashing
- Authentication Middleware

Requirements:

- bcrypt
- JWT
- Protected endpoints
- Password hashing
- Authentication middleware

---

# Authorization Capability

The AI can implement:

- User ownership validation
- Access restrictions
- Protected resources

Examples:

- User can view only their orders
- User can update only their profile
- User cannot access another user's resources

---

# Product Catalog Capability

The AI can implement:

- Product listing
- Product details
- Product categories
- Product images
- Product descriptions
- Product pricing

Required fields:

- Name
- Description
- Price
- Image
- Category
- Stock quantity

---

# Search Capability

The AI can implement:

- Product search
- Keyword filtering
- Search by product name
- Search by category

Search should support:

- Partial matches
- Pagination
- Sorting

---

# Filtering Capability

The AI can implement:

- Category filtering
- Price filtering
- Availability filtering
- Sorting

Examples:

- Price low to high
- Price high to low
- Newest products

---

# Shopping Cart Capability

The AI can implement:

- Add to cart
- Remove from cart
- Update quantity
- View cart
- Cart totals

Requirements:

- Persistent cart
- User-specific cart
- Quantity validation

---

# Checkout Capability

The AI can implement:

Multi-step checkout process:

Step 1:

Customer information

Step 2:

Shipping information

Step 3:

Order review

Step 4:

Order confirmation

Checkout must validate all required information before order creation.

---

# Orders Capability

The AI can implement:

- Order creation
- Order history
- Order details
- Order status tracking

Order statuses:

- Pending
- Processing
- Completed
- Cancelled

---

# User Profile Capability

The AI can implement:

- Profile page
- Profile update
- Change password
- Order history access

Users should only access their own data.

---

# API Capability

The AI can implement:

REST APIs using Express.

Examples:

GET /products

GET /products/:id

POST /auth/register

POST /auth/login

POST /cart

POST /orders

PUT /profile

DELETE /cart/:id

---

# Validation Capability

The AI can implement:

- Request validation
- Form validation
- Input sanitization

Use:

- Zod

Validation should happen before business logic execution.

---

# Database Capability

The AI can implement:

- MySQL schema design
- Prisma models
- Relationships
- Indexes
- Migrations

Supported relationships:

- One-to-One
- One-to-Many
- Many-to-One

---

# Error Handling Capability

The AI can implement:

- Global error handling
- Validation errors
- Authentication errors
- Not found errors
- Internal server errors

Response format:

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

---

# Security Capability

The AI can implement:

- JWT authentication
- Password hashing
- Helmet
- CORS
- Rate limiting
- Input validation

Security rules are mandatory.

---

# Docker Capability

The AI can implement:

- Dockerfile
- docker-compose.yml
- Container networking
- Environment configuration

Required services:

- frontend
- backend
- mysql

The entire application must run using:

docker compose up

---

# Swagger Capability

The AI can implement:

- Swagger setup
- Endpoint documentation
- Request schemas
- Response schemas

Every endpoint should be documented.

---

# Testing Capability

Backend:

- Jest
- Supertest

Frontend:

- React Testing Library
- Jest

Tests should cover:

- Authentication
- Products
- Cart
- Checkout
- Orders

---

# UI Capability

The AI can implement:

- Responsive layouts
- Product cards
- Navigation
- Forms
- Modals
- Buttons
- Loaders
- Error states
- Empty states

UI requirements:

- Modern
- Premium
- Responsive
- User-friendly

---

# Reusable Components Capability

The AI can generate reusable:

- Button
- Input
- Modal
- Card
- Loader
- Pagination
- Search Bar
- Navbar
- Footer

Reusable components should be preferred over duplicated UI.

---

# State Management Capability

The AI can implement:

- React Context
- Local component state

Global state should be used only when necessary.

Examples:

- Auth user
- Cart
- Theme

---

# Documentation Capability

The AI can generate:

- README
- Swagger
- Architecture documentation
- Setup instructions
- AI interaction logs

Documentation is considered part of the final product.

---

# Capability Reuse Rule

Before generating any new solution:

1. Check whether an existing capability already solves the problem.
2. Reuse existing services.
3. Reuse existing components.
4. Reuse existing hooks.
5. Reuse existing utilities.

Avoid duplicate implementations.

---

# Capability Priority

The AI should prioritize:

1. Reuse
2. Maintainability
3. Readability
4. Security
5. Performance
6. Scalability

Never prioritize speed of implementation over architecture quality.

---

# Definition Of Done

A capability is complete only when:

✅ Architecture respected

✅ Validation exists

✅ Error handling exists

✅ Security considered

✅ Documentation exists

✅ Tests exist

✅ Reusable code used

✅ No duplicated logic

If any item is missing:

THE CAPABILITY IS NOT COMPLETE.