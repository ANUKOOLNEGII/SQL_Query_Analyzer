# COMPLETE SYSTEM FLOW DOCUMENT

AI-Powered Natural Language to SQL Query Generator & Data Analytics Platform

Version: 2.0

---

# FLOW 1: USER AUTHENTICATION

## Step 1: User Registration

User enters:

* Full Name
* Email
* Password

↓

Frontend Validation

↓

Backend Validation

↓

Check Duplicate Email

↓

Password Encryption (bcrypt)

↓

Generate OTP

↓

Store OTP

↓

Send OTP via Email

↓

User Receives OTP

↓

Enter OTP

↓

Verify OTP

↓

Account Activated

↓

User Registered Successfully

### Registration Flow

```text
User
 |
 | Register
 v
Frontend
 |
 v
Backend
 |
 | Validate
 | Hash Password
 | Generate OTP
 v
OTP Service
 |
 v
Email Service
 |
 v
User
 |
 | Verify OTP
 v
Backend
 |
 v
Database
```

---

## Step 2: User Login

User enters:

* Email
* Password

↓

Validate Credentials

↓

Compare Password Hash

↓

Generate JWT Access Token

↓

Generate Refresh Token

↓

Create Session

↓

Redirect To Dashboard

### Login Flow

```text
User
 |
 | Login
 v
Frontend
 |
 v
Backend
 |
 | Verify Password
 | Generate JWT
 v
Dashboard
```

---

# FLOW 2: DATA SOURCE CONFIGURATION

After Login User Must Configure Data Source.

Supported Sources:

### Option A

Dataset Upload

### Option B

Database Connection

---

# FLOW 2A: DATASET UPLOAD WORKFLOW

## Step 1: Upload Dataset

User Uploads:

employees.csv

Example

```csv
id,name,department,salary
1,John,HR,50000
2,Alice,IT,70000
```

↓

Frontend Upload

↓

Backend Receives File

↓

Validate

* File Type
* File Size
* Empty File

↓

Extract Headers

↓

Generate Dataset Metadata

↓

Generate Schema

↓

Store Dataset

↓

Store Column Information

↓

Dataset Available

### Dataset Upload Flow

```text
User
 |
 | Upload CSV
 v
Frontend
 |
 v
Backend
 |
 | Validate File
 | Extract Headers
 | Generate Schema
 |
 v
Dataset Service
 |
 v
Database
 |
 v
Dataset Registry
```

---

# FLOW 2B: DATABASE CONNECTION WORKFLOW

User Provides

* Database Type
* Host
* Port
* Username
* Password
* Database Name

↓

Connection Test

↓

Create Temporary Connection

↓

Execute Test Query

↓

Success

↓

Encrypt Credentials

↓

Store Connection

↓

Available For Querying

### Database Connection Flow

```text
User
 |
 | Database Credentials
 v
Frontend
 |
 v
Backend
 |
 | Test Connection
 |
 v
Database Service
 |
 v
External Database
 |
 v
Connection Registry
```

---

# FLOW 3: SCHEMA DETECTION ENGINE

Purpose:

Provide AI Readable Database Context

System Extracts:

* Tables
* Columns
* Data Types
* Primary Keys
* Foreign Keys
* Relationships

↓

Create Schema Snapshot

↓

Store Schema Metadata

↓

Ready For AI Processing

### Schema Flow

```text
Dataset / Database
          |
          v
Schema Detection
          |
          v
Table Extraction
          |
          v
Column Extraction
          |
          v
Relationship Detection
          |
          v
Schema Registry
```

---

# FLOW 4: NATURAL LANGUAGE TO SQL GENERATION

## User Query

Example:

Show top 10 employees by salary

↓

Frontend Sends Request

↓

Backend Validation

↓

Load Schema

↓

Prompt Builder

↓

Create Prompt

Example:

```text
Schema:

employees(id,name,salary)

User Query:

Show top 10 employees by salary.
```

↓

Send To OpenAI / Gemini

↓

Intent Recognition

↓

SQL Generation

↓

Generate Suggestions

↓

Generate Explanation

↓

Return Response

### AI Flow

```text
User Query
      |
      v
Prompt Builder
      |
      v
Schema Injection
      |
      v
OpenAI / Gemini
      |
      +---- SQL
      |
      +---- Suggestions
      |
      +---- Explanation
      |
      v
Frontend
```

---

# FLOW 5: QUERY SUGGESTION ENGINE

Purpose:

Provide Alternative SQL Queries

↓

AI Generates Multiple Interpretations

↓

Suggestion 1

↓

Suggestion 2

↓

Suggestion 3

↓

Display To User

### Suggestion Flow

```text
Natural Query
      |
      v
AI Service
      |
      +---- Suggestion 1
      +---- Suggestion 2
      +---- Suggestion 3
```

---

# FLOW 6: SQL VALIDATION ENGINE

Purpose:

Prevent Invalid And Dangerous Queries

Validation Checks:

### Syntax Validation

```sql
SELECT * FROM employees;
```

Valid

### Schema Validation

Verify:

* Table Exists
* Column Exists

### Security Validation

Block:

```sql
DROP DATABASE
DROP TABLE
TRUNCATE
ALTER SYSTEM
DELETE *
```

### SQL Injection Detection

```sql
'; DROP TABLE users;
```

↓

Validation Success

↓

Ready For Execution

### Validation Flow

```text
Generated SQL
      |
      v
Syntax Check
      |
      v
Schema Check
      |
      v
Security Check
      |
      v
Approved Query
```

---

# FLOW 7: QUERY EXPLANATION ENGINE

Purpose:

Explain SQL In Human Language

Generated SQL

```sql
SELECT *
FROM employees
WHERE salary > 50000;
```

↓

AI Explanation

```text
Retrieve employees whose salary is greater than ₹50,000.
```

↓

Display To User

---

# FLOW 8: QUERY EXECUTION ENGINE

User Clicks Execute

↓

JWT Verification

↓

Validate SQL Again

↓

Open Database Connection

↓

Execute Query

↓

Fetch Results

Example

```json
[
 {
   "id":2,
   "name":"Alice",
   "salary":70000
 }
]
```

↓

Format Response

↓

Send To Frontend

↓

Display Results Table

### Query Execution Flow

```text
SQL Query
      |
      v
Validation Engine
      |
      v
Database Engine
      |
      v
Result Formatter
      |
      v
Frontend
```

---

# FLOW 9: RESULTS VISUALIZATION

Results Displayed

↓

Table Rendering

Features

* Search
* Sort
* Filter
* Pagination

↓

Analytics Cards

↓

Ready For Export

---

# FLOW 10: EXPORT SYSTEM

Supported Formats

* CSV
* Excel
* PDF

↓

User Selects Format

↓

Generate File

↓

Temporary Storage

↓

Download Link

↓

User Download

### Export Flow

```text
Results
   |
   v
Export Service
   |
   +---- CSV
   +---- Excel
   +---- PDF
   |
   v
Download
```

---

# FLOW 11: QUERY HISTORY MANAGEMENT

After Successful Query Generation

Store:

* User ID
* Natural Query
* Generated SQL
* Explanation
* Execution Time
* Timestamp

↓

Save History Record

↓

Display In History Page

### History Flow

```text
Generated Query
       |
       v
History Service
       |
       v
Database
       |
       v
History Dashboard
```

---

# FLOW 12: PROFILE & SETTINGS

User Can Manage:

Profile

* Name
* Email

Settings

* Theme
* Notifications
* AI Preferences
* Export Preferences

↓

Update Profile

↓

Save Preferences

↓

Apply Globally

---

# FLOW 13: LOGGING & AUDIT SYSTEM

Track Every Action

Events

* Registration
* Login
* OTP Verification
* Dataset Upload
* Database Connection
* SQL Generation
* SQL Execution
* Export
* Errors

↓

Audit Log Creation

↓

Store Audit Record

↓

Monitoring Dashboard

---

# FLOW 14: ERROR HANDLING

## AI Failure

OpenAI Failure

↓

Retry

↓

Gemini Fallback

↓

Return Error If Both Fail

---

## Dataset Error

Invalid CSV

↓

Reject Upload

↓

Show Error

---

## Database Error

Connection Failure

↓

Retry

↓

Log Error

↓

Notify User

---

# COMPLETE END-TO-END SYSTEM FLOW

```text
User
 |
 | Register/Login
 v
Authentication Module
 |
 | JWT Authentication
 v
Dashboard
 |
 +----------------------+
 |                      |
 v                      v
Upload Dataset   Connect Database
 |                      |
 +----------+-----------+
            |
            v
     Schema Detection
            |
            v
      Schema Registry
            |
            v
     Natural Language Query
            |
            v
       Prompt Builder
            |
            v
      OpenAI / Gemini
            |
 +----------+----------+
 |          |          |
 v          v          v
SQL    Suggestions  Explanation
 |
 v
Validation Engine
 |
 v
Query Execution
 |
 v
Database
 |
 v
Results Table
 |
 +-----------+-----------+
 |                       |
 v                       v
Export Results     Query History
 |
 v
Audit Logs
 |
 v
User
```

---

# SYSTEM MODULES SUMMARY

1. Authentication Module
2. OTP Verification Module
3. Dataset Upload Module
4. Dataset Management Module
5. Database Connection Module
6. Schema Detection Module
7. AI Query Generation Module
8. Query Suggestion Module
9. SQL Validation Module
10. Query Explanation Module
11. Query Execution Module
12. Results Visualization Module
13. Export Module
14. Query History Module
15. Profile & Settings Module
16. Logging & Audit Module
17. Error Handling Module

---