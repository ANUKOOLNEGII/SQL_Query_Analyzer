TECHNICAL DESIGN DOCUMENT (TDD)
AI-Powered Natural Language to SQL Query Generator
Version: 1.0
Document Type: Technical Design Document (TDD)
Prepared For: Software Engineering Project

1. Executive Summary
1.1 Project Overview
The AI-Powered Natural Language to SQL Query Generator is a web-based application that enables users to generate SQL queries using plain English instructions.
The platform acts as an intelligent middleware between users and relational databases by translating natural language requirements into syntactically correct SQL statements using Large Language Models (LLMs).
The system aims to reduce the dependency on SQL expertise and improve accessibility to database systems for students, analysts, business users, and non-technical stakeholders.

2. Business Goals
Primary Goals
Eliminate the need for SQL expertise.
Reduce query development time.
Improve database accessibility.
Provide educational support for learning SQL.
Enable AI-assisted data exploration.
Success Metrics


3. Technology Stack
Frontend
React.js
TypeScript
Tailwind CSS
Axios
React Router
Backend
Node.js
Express.js
TypeScript
Database
PostgreSQL
ORM
Prisma ORM
Authentication
JWT
bcrypt
AI Layer
OpenAI GPT Models
Gemini API (Fallback)
Deployment
Frontend: Vercel
Backend: Render / Railway
Database: Neon PostgreSQL
Monitoring
Winston Logger
Morgan
Sentry

4. High-Level Architecture
+------------------------------------------------+
|                React Frontend                  |
+---------------------+--------------------------+
                      |
                      |
                 HTTPS API
                      |
                      v
+------------------------------------------------+
|            Node.js / Express Backend           |
+---------------------+--------------------------+
                      |
        +-------------+-------------+
        |                           |
        v                           v
+---------------+        +------------------------+
| PostgreSQL DB |        | OpenAI / Gemini APIs   |
+---------------+        +------------------------+

5. System Components
5.1 Frontend Layer
Responsibilities
User Authentication
Query Submission
SQL Visualization
Query Explanation Display
Query History Display
Result Visualization
Components
src/
|
|-- pages/
|-- components/
|-- services/
|-- hooks/
|-- contexts/
|-- utils/
Key Pages
Login Page
Register Page
Dashboard
Query Generator
Query History
User Profile

5.2 Backend Layer
Responsibilities
Authentication
Authorization
AI Communication
Query Validation
Query Execution
History Management
Folder Structure
src/
|
|-- controllers/
|-- routes/
|-- services/
|-- middleware/
|-- prisma/
|-- config/
|-- utils/
|-- validations/

5.3 AI Processing Layer
Responsibilities
Intent Extraction
Schema Understanding
SQL Generation
Query Explanation
Prompt Workflow
User Query
↓
Schema Injection
↓
Prompt Construction
↓
LLM Processing
↓
SQL Generation
↓
Validation
↓
Response

6. Functional Design
Module 1: User Authentication
Description
Provides secure user registration and login.
Features
Register
Login
Logout
Refresh Token
Password Reset
Validation Rules
Email must be unique.
Password length ≥ 8 characters.
Password must be encrypted.

Module 2: Natural Language Processing
Description
Accepts English instructions from users.
Example
Input:
Show all employees earning more than 50000.
Output Intent:
{
 "table":"employees",
 "condition":"salary > 50000"
}

Module 3: SQL Generation Engine
Description
Converts extracted intent into SQL.
Supported Queries
SELECT
WHERE
ORDER BY
GROUP BY
HAVING
LIMIT
JOIN
Aggregate Functions
Example
Input:
List top 10 students by marks.
Output:
SELECT *
FROM students
ORDER BY marks DESC
LIMIT 10;

Module 4: Query Validation Engine
Purpose
Prevent invalid or dangerous queries.
Validation Rules
SQL Syntax Validation
Table Validation
Column Validation
Query Length Validation
Restricted Operations
DROP DATABASE
DROP TABLE
TRUNCATE
ALTER SYSTEM

Module 5: Query Execution Engine
Workflow
Generated SQL
      |
      v
Validation
      |
      v
Database Execution
      |
      v
Result Formatter
      |
      v
Response

Module 6: Query Explanation Engine
Example
Generated SQL:
SELECT *
FROM employees
WHERE salary > 50000;
Explanation:
This query retrieves all employees whose salary exceeds ₹50,000.

Module 7: Query History Module
Features
Save User Queries
Save SQL Statements
Save Generated Explanations
Save Execution Time

7. Database Design
Entity Relationship Diagram
Users
 |
 | 1
 |
 | N
QueryHistory

Users Table
CREATE TABLE users (
 id UUID PRIMARY KEY,
 name VARCHAR(100),
 email VARCHAR(255) UNIQUE,
 password_hash TEXT,
 created_at TIMESTAMP
);

Query_History Table
CREATE TABLE query_history (
 id UUID PRIMARY KEY,
 user_id UUID,
 natural_query TEXT,
 generated_sql TEXT,
 explanation TEXT,
 execution_time INTEGER,
 created_at TIMESTAMP
);

Audit_Log Table
CREATE TABLE audit_logs (
 id UUID PRIMARY KEY,
 action TEXT,
 user_id UUID,
 created_at TIMESTAMP
);

8. REST API Design
Authentication APIs
Register
POST /api/v1/auth/register
Login
POST /api/v1/auth/login
Logout
POST /api/v1/auth/logout

Query APIs
Generate SQL
POST /api/v1/query/generate
Request:
{
 "query":"Show all students with marks above 80"
}
Response:
{
 "sql":"SELECT * FROM students WHERE marks > 80;",
 "explanation":"Returns students scoring above 80."
}

Execute Query
POST /api/v1/query/execute

Query History
GET /api/v1/query/history

9. Security Design
Authentication Security
JWT Authentication
Access Token
Refresh Token
Password Security
bcrypt hashing
Salt Rounds = 12
API Security
Helmet.js
CORS
Rate Limiting
Database Security
Prepared Statements
Parameterized Queries
Transport Security
HTTPS
TLS 1.3

10. Performance Design
Response Targets


Optimization Strategies
Database Indexing
Query Caching
Connection Pooling
API Compression

11. Logging and Monitoring
Logging
Request Logs
Authentication Logs
Database Logs
AI Request Logs
Monitoring
Sentry
Prometheus
Grafana

12. Error Handling Strategy
Error Categories
Validation Errors
{
 "success": false,
 "message": "Invalid input."
}
Authentication Errors
{
 "success": false,
 "message": "Unauthorized access."
}
AI Service Errors
{
 "success": false,
 "message": "AI service unavailable."
}
Database Errors
{
 "success": false,
 "message": "Database execution failed."
}

13. Deployment Architecture
Production Environment
User
 |
 v
Vercel (React Frontend)
 |
 v
Render (Node.js Backend)
 |
 +-----> OpenAI API
 |
 +-----> Neon PostgreSQL

14. Testing Strategy
Unit Testing
Tools:
Jest
Supertest
Coverage Target:
80%+
Integration Testing
Modules:
API ↔ Database
API ↔ OpenAI
System Testing
Complete User Workflow
User Acceptance Testing
Student Testing
Analyst Testing
Faculty Testing

15. Scalability Considerations
Future improvements include:
Microservice Architecture
Redis Caching
Multi-Database Support
Multi-Tenant Support
Kubernetes Deployment

16. Future Enhancements
Voice-to-SQL
Multi-Language Query Input
Database Schema Visualization
AI Chat Assistant
Query Optimization Suggestions
Support for MongoDB Query Generation

17. Conclusion
The proposed architecture provides a scalable, secure, and maintainable solution for converting natural language into SQL queries. By leveraging React, Node.js, PostgreSQL, and modern Large Language Models, the system enables users without SQL expertise to interact efficiently with relational databases while maintaining enterprise-grade security, performance, and reliability.
