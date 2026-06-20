BACKEND FLOW DOCUMENT (BFD)

AI-Powered Natural Language to SQL Query Generator & Data Analytics Platform

Version: 2.0

Backend Stack:

Node.js

Express.js

TypeScript

PostgreSQL

Prisma ORM

JWT Authentication

bcrypt

OpenAI GPT Models

Gemini API (Fallback)

Winston Logger

Morgan

Sentry

Redis (Future Enhancement)

---

# 1. Backend Architecture Overview

The backend follows a scalable layered architecture.

```text
Frontend Request
       |
       v
Express Routes
       |
       v
Middleware Layer
       |
       v
Controller Layer
       |
       v
Service Layer
       |
  +----+------+------+
  |           |      |
  v           v      v
Database    AI      Cache
(Postgres) Service (Future Redis)
```

Responsibilities:

* Authentication
* Authorization
* Dataset Management
* Database Connections
* Schema Detection
* AI Query Generation
* Query Validation
* Query Execution
* Query History
* Export Management
* Logging & Monitoring

---

# 2. Project Structure

```text
backend/
|
├── src/
│
├── config/
│   ├── database.ts
│   ├── jwt.ts
│   ├── ai.ts
│   ├── logger.ts
│
├── controllers/
│   ├── auth.controller.ts
│   ├── otp.controller.ts
│   ├── dataset.controller.ts
│   ├── database.controller.ts
│   ├── query.controller.ts
│   ├── history.controller.ts
│   ├── export.controller.ts
│
├── services/
│   ├── auth.service.ts
│   ├── otp.service.ts
│   ├── dataset.service.ts
│   ├── schema.service.ts
│   ├── database.service.ts
│   ├── ai.service.ts
│   ├── query.service.ts
│   ├── validation.service.ts
│   ├── history.service.ts
│   ├── export.service.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── upload.middleware.ts
│   ├── rate-limit.middleware.ts
│
├── routes/
│
├── validations/
│
├── prisma/
│
├── utils/
│
└── app.ts
```

---

# 3. Authentication Module

Purpose:

Secure user registration and login.

---

## Registration Flow

```text
User Registration
       |
       v
POST /api/v1/auth/register
       |
       v
Validation Middleware
       |
       v
Check Duplicate Email
       |
       v
Hash Password
       |
       v
Generate OTP
       |
       v
Store OTP
       |
       v
Send Email
       |
       v
Success Response
```

---

## OTP Verification Flow

```text
User Enters OTP
       |
       v
POST /api/v1/auth/verify-otp
       |
       v
Verify OTP
       |
       v
Create User
       |
       v
Generate JWT
       |
       v
Return Token
```

---

## Login Flow

```text
Login Request
       |
       v
POST /api/v1/auth/login
       |
       v
Validate Credentials
       |
       v
Compare Password Hash
       |
       v
Generate Access Token
       |
       v
Generate Refresh Token
       |
       v
Store Session
       |
       v
Success Response
```

---

# 4. Dataset Management Module

Purpose:

Manage uploaded datasets.

---

## Dataset Upload Flow

```text
Upload CSV
      |
      v
POST /api/v1/dataset/upload
      |
      v
Multer Upload
      |
      v
Validate CSV
      |
      v
Extract Headers
      |
      v
Generate Schema
      |
      v
Create Dataset Record
      |
      v
Store Metadata
      |
      v
Success Response
```

Dataset Metadata:

```json
{
  "datasetId":"ds_123",
  "name":"employees",
  "rows":1000,
  "columns":12
}
```

---

## Dataset Selection Flow

```text
Dataset List
      |
      v
Select Dataset
      |
      v
Store Active Dataset
      |
      v
Use In Query Generation
```

---

# 5. Database Connection Module

Purpose:

Allow external database connectivity.

Supported:

* PostgreSQL
* MySQL
* SQL Server
* SQLite

---

## Connection Flow

```text
Connection Form
      |
      v
POST /api/v1/database/test
      |
      v
Create Temporary Connection
      |
      v
Test Query
      |
      v
Success
```

---

## Save Connection

```text
Valid Connection
      |
      v
Encrypt Credentials
      |
      v
Store Connection
      |
      v
Connection Available
```

---

# 6. Schema Detection Module

Purpose:

Provide AI-readable schema.

---

## Schema Discovery

```text
Database Selected
      |
      v
Read Information Schema
      |
      v
Extract Tables
      |
      v
Extract Columns
      |
      v
Extract Relationships
      |
      v
Store Schema Snapshot
```

Output:

```json
{
 "tables":["employees"],
 "columns":["id","name","salary"],
 "relationships":[]
}
```

---

# 7. AI Query Generation Module

Core System Module

---

## Generation Flow

```text
User Query
      |
      v
POST /api/v1/query/generate
      |
      v
Load Dataset Schema
      |
      v
Prompt Builder
      |
      v
OpenAI Service
      |
      v
Generate SQL
      |
      v
Generate Suggestions
      |
      v
Generate Explanation
      |
      v
Return Response
```

---

## Prompt Structure

```text
Schema:

employees(id,name,salary)

User Query:

Show top 10 employees by salary.

Generate SQL.
```

---

# 8. Query Suggestion Module

Purpose:

Generate alternative SQL statements.

Flow:

```text
User Query
      |
      v
AI Processing
      |
      v
Suggestion 1
Suggestion 2
Suggestion 3
```

---

# 9. SQL Validation Engine

Purpose:

Protect database from unsafe queries.

---

## Validation Flow

```text
Generated SQL
      |
      v
Syntax Check
      |
      v
Table Validation
      |
      v
Column Validation
      |
      v
Security Validation
      |
      v
Approved Query
```

---

## Restricted Operations

Blocked:

```sql
DROP DATABASE
DROP TABLE
TRUNCATE
ALTER SYSTEM
DELETE *
```

---

# 10. Query Explanation Engine

Purpose:

Explain generated SQL.

Example:

```sql
SELECT *
FROM employees
WHERE salary > 50000;
```

Explanation:

```text
This query retrieves all employees whose salary is greater than ₹50,000.
```

---

# 11. Query Execution Module

Purpose:

Execute validated SQL.

---

## Execution Flow

```text
Execute Request
      |
      v
POST /api/v1/query/execute
      |
      v
JWT Validation
      |
      v
Query Validation
      |
      v
Database Connection
      |
      v
Execute SQL
      |
      v
Fetch Results
      |
      v
Format JSON
      |
      v
Return Response
```

---

# 12. Query History Module

Purpose:

Store user activity.

---

## History Flow

```text
SQL Generated
      |
      v
Create History Record
      |
      v
Store:
User ID
Query
SQL
Explanation
Execution Time
Timestamp
      |
      v
Save Database
```

---

# 13. Export Module

Supported:

* CSV
* Excel
* PDF

---

## Export Flow

```text
Results Retrieved
      |
      v
Export Type Selected
      |
      v
Generate File
      |
      v
Temporary Storage
      |
      v
Download URL
```

---

# 14. Logging Module

Purpose:

Track backend activity.

Logged Events:

* Registration
* Login
* OTP Verification
* Dataset Upload
* Database Connection
* Query Generation
* Query Execution
* Export
* Errors

---

# 15. Error Handling Module

Validation Error

```json
{
 "success": false,
 "message": "Invalid Request"
}
```

Authentication Error

```json
{
 "success": false,
 "message": "Unauthorized"
}
```

AI Error

```json
{
 "success": false,
 "message": "AI Service Unavailable"
}
```

Database Error

```json
{
 "success": false,
 "message": "Database Operation Failed"
}
```

---

# 16. Security Architecture

Layer 1

JWT Authentication

Layer 2

Refresh Tokens

Layer 3

Role-Based Access

Layer 4

Input Validation (Zod)

Layer 5

SQL Validation

Layer 6

Rate Limiting

100 Requests / 15 Minutes

Layer 7

HTTPS + TLS

---

# 17. Database Design

```text
Users
     |
     +---- OTP Verification

Datasets
     |
     +---- Dataset Columns

Database Connections

Query History

Query Suggestions

Audit Logs

Export History
```

---

# 18. REST API Design

Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/verify-otp
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
```

Datasets

```http
POST /api/v1/dataset/upload
GET /api/v1/dataset
DELETE /api/v1/dataset/:id
```

Database

```http
POST /api/v1/database/test
POST /api/v1/database/connect
GET /api/v1/database/schema
```

Query

```http
POST /api/v1/query/generate
POST /api/v1/query/validate
POST /api/v1/query/execute
GET /api/v1/query/history
```

Export

```http
POST /api/v1/export/csv
POST /api/v1/export/excel
POST /api/v1/export/pdf
```

---

# 19. Deployment Flow

```text
React Frontend (Vercel)
          |
          v
Node.js Backend (Render)
          |
     +----+----+
     |         |
     v         v
PostgreSQL   OpenAI
 (Neon)      API
```

---

# 20. Complete Backend Request Lifecycle

```text
Frontend Request
        |
        v
Express Route
        |
        v
Authentication Middleware
        |
        v
Validation Middleware
        |
        v
Controller
        |
        v
Service Layer
        |
   +----+----+
   |         |
   v         v
Database    AI Service
   |         |
   +----+----+
        |
        v
Response Formatter
        |
        v
JSON Response
```

---

# 21. Future Enhancements

* Redis Caching
* BullMQ Background Jobs
* WebSocket Notifications
* AI Query Optimization
* Multi-Tenant Architecture
* Kubernetes Deployment
* Microservices Architecture

---

# 22. Conclusion

The backend follows a layered, scalable, and secure architecture that separates authentication, dataset management, database connectivity, schema detection, AI query generation, validation, execution, history tracking, exports, logging, and monitoring into independent modules. This design improves maintainability, security, performance, and future scalability while supporting production-grade workloads.
