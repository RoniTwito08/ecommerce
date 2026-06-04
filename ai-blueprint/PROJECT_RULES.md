# PROJECT_RULES.md

# Project Rules

This project is an AI-driven full stack eCommerce platform.

The main goal is not only to build a working application, but to demonstrate how AI can be guided with clear engineering rules, architecture definitions, reusable capabilities, and review workflows.

The AI must act like a senior full stack engineer and follow these rules throughout the entire project.

---

# Assignment Goal

Build a fully functional, production-ready eCommerce platform using AI-driven development.

The final project must include:

- Working frontend
- Working backend
- Working MySQL database
- Docker Compose setup
- AI blueprint files
- Documentation of prompts and AI interactions
- README with manual interventions

---

# Mandatory Technology Stack

## Frontend

- React.js
- React Router
- Axios
- React Hook Form
- Zod
- Modern premium UI
- CSS Modules or a modern styling library

## Backend

- Node.js
- Express.js
- MySQL
- Prisma ORM
- JWT Authentication
- Zod Validation
- Swagger
- Jest
- Supertest

## Infrastructure

- Docker
- Docker Compose

---

# Important Stack Rule

The database must be MySQL.

Do not use MongoDB.

Do not use Supabase.

Do not replace MySQL unless explicitly instructed.

---

# Runtime Requirement

The entire project must run with one command:

docker compose up

After cloning the repository, another developer should be able to run the full system without manual setup.

No manual installation.

No manual database setup.

No manual migrations.

No manual seeding.

No manual environment configuration beyond using the provided .env.example.

---

# Required eCommerce Features

The application must include:

- Authentication
- Login
- Sign up
- JWT or session-based authentication
- Product catalog
- Product search
- Product filtering
- Product details page
- Persistent cart
- Multi-step checkout
- Account section
- Order history
- Profile management

---

# AI Development Principles

Before generating code, the AI must:

1. Understand the requirement.
2. Create an implementation plan.
3. Identify which files will be created or modified.
4. Follow the architecture files inside ai-blueprint.
5. Reuse existing code when possible.
6. Avoid creating duplicate files or duplicate logic.
7. Generate code only after the plan is clear.

---

# Code Quality Rules

The code must be:

- Clean
- Modular
- Reusable
- Secure
- Testable
- Maintainable
- Production-oriented

Working code is not enough.

The code must also follow good engineering standards.

---

# Architecture Rules

The project must be separated into:

- client/
- backend/
- ai-blueprint/

The frontend and backend must be independent but connected through clear API contracts.

The backend owns:

- Authentication
- Business logic
- Database access
- API validation
- Swagger documentation

The frontend owns:

- UI
- User experience
- Client-side state
- Form handling
- API consumption

---

# AI Blueprint Rule

All AI guidance files must remain inside:

ai-blueprint/

These files explain how the AI was guided and how the project was generated.

The AI blueprint is part of the final submission and must be treated as important as the code itself.

---

# Documentation Rule

The project must document:

- AI prompts used
- AI tools used
- Models used
- Planning decisions
- Architecture decisions
- Manual fixes
- Why manual fixes were needed

This is required because the assignment evaluates how the developer leads the AI, not only the final code.

---

# Definition Of Done

The project is complete only when:

- Frontend works
- Backend works
- MySQL works
- Docker Compose runs everything
- Authentication works
- Products can be viewed and searched
- Cart works
- Checkout works
- Orders are saved
- Account section works
- Swagger exists
- Tests exist
- README exists
- AI blueprint exists
- AI interaction log exists
- Manual interventions are documented

If any item is missing, the project is not complete.