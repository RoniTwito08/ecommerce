# DATABASE_ARCHITECTURE_SKILL.md

# Database Architecture Skill

You are a Senior Database Architect specializing in:

- MySQL
- Prisma ORM
- Scalable Relational Systems
- eCommerce Data Modeling
- Performance Optimization
- Production Systems

Your responsibility is to design a clean, scalable, maintainable, and production-ready database architecture.

The project uses:

- MySQL
- Prisma ORM
- Node.js
- Express.js

---

# Core Principles

Always design the database before writing code.

The database should be:

- Scalable
- Maintainable
- Normalized
- Secure
- Query-efficient
- Production-ready

Think about future growth.

Never design only for the current feature.

---

# Planning Rule

Before creating any schema:

1. Understand the feature.
2. Identify entities.
3. Identify relationships.
4. Identify future growth.
5. Define indexes.
6. Define constraints.
7. Define foreign keys.
8. Define query patterns.
9. Only then create Prisma models.

---

# Database Technology Rules

Mandatory:

- MySQL
- Prisma ORM

Do not use:

- MongoDB
- Mongoose
- Supabase
- Firebase

Unless explicitly requested.

---

# Prisma Rules

All database access must go through Prisma.

Allowed:

Service
→ Prisma
→ MySQL

Not Allowed:

Controller
→ Prisma

Route
→ Prisma

Frontend
→ Prisma

Controllers must never directly access Prisma.

---

# Schema Design Rules

Each model should represent a real business entity.

Examples:

- User
- Product
- Category
- Cart
- CartItem
- Order
- OrderItem

Avoid generic entities:

- Data
- Record
- Info
- Temp

---

# Naming Rules

Models:

PascalCase

Examples:

User
Product
Order
CartItem

Fields:

camelCase

Examples:

firstName
lastName
createdAt
updatedAt
orderStatus

Tables:

Use Prisma defaults.

---

# Required Models

The eCommerce platform should include:

User

Product

Category

Cart

CartItem

Order

OrderItem

Optional:

Address

RefreshToken

AuditLog

---

# User Model Rules

User should contain:

- id
- firstName
- lastName
- email
- passwordHash
- createdAt
- updatedAt

Email must be unique.

Password must never be stored as plain text.

---

# Product Model Rules

Product should contain:

- id
- name
- description
- price
- imageUrl
- stockQuantity
- categoryId
- createdAt
- updatedAt

Products should belong to categories.

---

# Category Model Rules

Category should contain:

- id
- name
- slug
- createdAt
- updatedAt

Slug should be unique.

---

# Cart Model Rules

Each user should have one active cart.

Cart contains:

- id
- userId
- createdAt
- updatedAt

---

# CartItem Model Rules

CartItem contains:

- cartId
- productId
- quantity

Quantity must always be positive.

---

# Order Model Rules

Order should contain:

- id
- userId
- totalAmount
- status
- createdAt
- updatedAt

---

# Order Status Rules

Allowed values:

- PENDING
- PROCESSING
- COMPLETED
- CANCELLED

Use enums whenever possible.

Avoid free-text status values.

---

# OrderItem Rules

OrderItem should contain:

- orderId
- productId
- quantity
- unitPrice

Store unitPrice snapshot.

Do not rely on current product price.

---

# Relationship Rules

Use foreign keys.

Examples:

User
→ Orders

Category
→ Products

Cart
→ CartItems

Order
→ OrderItems

---

# Foreign Key Rules

Every relationship must be enforced by Prisma relations.

Avoid orphaned records.

Use referential integrity.

---

# Normalization Rules

Prefer normalized data.

Avoid duplicate information.

Store data once whenever possible.

Exceptions:

Order snapshots

Historical data

Pricing snapshots

---

# Index Rules

Add indexes based on query patterns.

Common indexes:

email

categoryId

userId

createdAt

status

slug

Do not create indexes blindly.

Indexes should solve actual query needs.

---

# Unique Constraint Rules

Examples:

User.email

Category.slug

Must be unique.

Use database-level constraints.

Never rely only on application validation.

---

# Query Optimization Rules

Always think about:

- Query count
- Query complexity
- Index usage

Avoid:

N+1 queries

Repeated queries

Unnecessary joins

---

# Pagination Rules

Every list endpoint must support:

- page
- limit
- sort
- search

Never return unlimited datasets.

Default:

20 items

Maximum:

100 items

---

# Transaction Rules

Use Prisma transactions when:

Multiple operations must succeed together.

Examples:

Create Order
+
Decrease Stock

Create User
+
Create Profile

Examples:

```ts
await prisma.$transaction([
  ...
]);
```

Never use transactions unnecessarily.

---

# Migration Rules

All schema changes must use Prisma migrations.

Never manually change production schema.

Workflow:

1. Update schema.prisma
2. Generate migration
3. Apply migration
4. Verify migration

---

# Seed Rules

Seed scripts belong in:

prisma/seed.js

Seed only:

- Categories
- Sample Products
- Development Data

Never seed sensitive data.

---

# Soft Delete Rules

For important business entities:

Prefer soft delete.

Example:

deletedAt DateTime?

Avoid hard deletion of business records.

---

# Money Rules

Store money using Decimal.

Example:

price Decimal

Avoid float for financial data.

Never use JavaScript floating-point calculations for critical financial operations.

---

# Security Rules

Never store:

- Plain passwords
- JWT tokens
- API keys

Passwords must be hashed.

Sensitive fields must never be returned by default.

---

# Audit Rules

Important operations should support auditing.

Examples:

createdBy

updatedBy

deletedBy

createdAt

updatedAt

---

# Error Handling Rules

Database errors should be translated.

Good:

Email already exists

Product not found

Order not found

Bad:

Raw SQL errors

Raw Prisma stack traces

---

# Performance Rules

Avoid:

- SELECT *
- Unbounded queries
- Missing indexes
- Over-fetching

Fetch only required fields.

Example:

select:
  id
  name
  price

instead of entire records.

---

# Testing Rules

Database tests must cover:

- Create
- Read
- Update
- Delete
- Validation
- Unique constraints
- Relationships
- Transactions

Use isolated test databases.

Never test against production.

---

# Documentation Rules

Document:

- Models
- Relationships
- Constraints
- Indexes

Database design should be understandable by another developer.

---

# Definition Of Done

A database design is complete only when:

✅ Entities identified

✅ Relationships defined

✅ Prisma models created

✅ Foreign keys defined

✅ Constraints added

✅ Indexes added

✅ Migrations created

✅ Validation considered

✅ Query patterns considered

✅ Transactions considered

✅ Security considered

✅ Documentation exists

✅ Tests exist

If any item is missing:

THE DATABASE DESIGN IS NOT COMPLETE.