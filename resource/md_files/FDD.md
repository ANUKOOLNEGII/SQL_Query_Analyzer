FRONTEND FLOW DOCUMENT (FFD)

AI-Powered Natural Language to SQL Query Generator & Data Analytics Platform

Version: 2.0

Frontend Stack:

React.js

TypeScript

Tailwind CSS

React Router

Axios

Context API / Redux Toolkit

React Query

Recharts

---

# 1. Frontend Overview

## Purpose

The frontend provides a user-friendly interface that allows users to:

* Register/Login
* Verify Email using OTP
* Upload CSV Files
* Manage Datasets
* Connect Databases
* Generate SQL Queries
* View Query Suggestions
* View Schema Detection
* Validate Generated SQL
* View Query Explanations
* Execute Queries
* View Results
* Manage Query History
* Export Results
* Manage Profile
* Manage Settings

---

# 2. Application Navigation Flow

```text
Landing Page
      |
      v
Authentication
(Register/Login)
      |
      v
OTP Verification
      |
      v
Dashboard
      |
      +---------------------+
      |                     |
      v                     v
CSV Upload       Database Connection
      |                     |
      +----------+----------+
                 |
                 v
         Dataset Manager
                 |
                 v
      Query Generator Workspace
                 |
                 v
      SQL Suggestions
                 |
                 v
      Schema Detection
                 |
                 v
      SQL Validation
                 |
                 v
      SQL + Explanation
                 |
                 v
         Execute Query
                 |
                 v
          Results Table
                 |
      +----------+-----------+
      |                      |
      v                      v
 Export Results      Query History
                 |
                 v
               Profile
                 |
                 v
              Settings
```

---

# 3. Route Structure

## Public Routes

```text
/
/login
/register
/verify-otp
/forgot-password
/reset-password
```

## Protected Routes

```text
/dashboard
/upload-csv
/datasets
/database-connection
/query-generator
/query-execution
/query-history
/query-history/:id
/profile
/settings
```

---

# 4. Screen Flow

## 4.1 Landing Page

### Purpose

Introduce the platform and encourage user registration.

### Components

Navbar

Contains:

* Logo
* Home
* Features
* Pricing (Optional)
* Login
* Register

Hero Section

Contains:

* Product Name
* Tagline
* Call-To-Action Button

Example:

Generate SQL Queries Using Plain English

Buttons:

* Get Started
* Login

Features Section

Cards:

* AI Query Generation
* CSV Upload
* Database Integration
* Query Explanation
* Query Validation
* Result Export

Footer

Contains:

* Contact
* Privacy Policy
* Terms

### Landing Page Flow

```text
User
 |
 v
Landing Page
 |
 +---- Login
 |
 +---- Register
 |
 +---- Get Started
```

---

## 4.2 Registration Page

### Components

Registration Form

Fields:

* Full Name
* Email
* Password
* Confirm Password

### Validation

Frontend Checks:

* Required Fields
* Valid Email
* Password Length
* Password Match

### Actions

```text
Submit
↓
API Call
↓
OTP Verification Page
```

### Registration Flow

```text
Register Form
      |
      v
Frontend Validation
      |
      v
Register API
      |
      v
OTP Verification
```

---

## 4.3 OTP Verification Page

### Components

OTP Input

6 Digit OTP Field

Buttons:

* Verify OTP
* Resend OTP

### Flow

```text
User enters OTP
↓
Verify API
↓
Success
↓
Redirect to Login
```

---

## 4.4 Login Page

### Components

Login Form

Fields:

* Email
* Password

Buttons:

* Login
* Forgot Password

### Login Flow

```text
Login Form
      |
      v
Login API
      |
      v
JWT Generated
      |
      v
Dashboard
```

---

# 5. Dashboard

## Purpose

Central hub after login.

## Layout

```text
+------------------------------------+
| Sidebar | Main Content             |
+------------------------------------+
```

## Sidebar Menu

* Dashboard
* Upload CSV
* Dataset Manager
* Connect Database
* Query Generator
* Query History
* Profile
* Settings
* Logout

## Dashboard Cards

* Total Queries
* Uploaded Datasets
* Connected Databases
* Recent Activity
* Saved Queries

### Dashboard Flow

```text
Dashboard
 |
 +--- Upload CSV
 |
 +--- Dataset Manager
 |
 +--- Connect Database
 |
 +--- Query Generator
 |
 +--- History
```

---

# 6. CSV Upload Page

## Purpose

Allow users to upload datasets.

## Components

Drag & Drop Area

Supported:

* CSV

Upload Button

Dataset Preview

Display:

* Column Names
* Sample Rows

Validation

Check:

* File Type
* File Size
* Empty File

### CSV Upload Flow

```text
Upload CSV
      |
      v
Validate File
      |
      v
Upload API
      |
      v
Schema Created
      |
      v
Dataset Preview
```

---

# 7. Dataset Manager Page

## Purpose

Manage uploaded datasets.

## Components

Dataset Table

Columns:

* Dataset Name
* Rows
* Columns
* Created Date

Actions:

* View
* Delete
* Select Dataset

### Flow

```text
Dataset Manager
 |
 +--- View
 |
 +--- Delete
 |
 +--- Select Dataset
```

---

# 8. Database Connection Page

## Purpose

Connect external databases.

## Form Fields

* Database Type
* Host
* Port
* Username
* Password
* Database Name

## Actions

* Test Connection
* Save Connection

### Flow

```text
Connection Form
      |
      v
Test Connection
      |
      v
Success
      |
      v
Save Connection
```

---

# 9. Query Generator Workspace

## Purpose

Main AI Interaction Screen

## Layout

```text
+-----------------------------------------+
| Dataset Selector                        |
+-----------------------------------------+

+-----------------------------------------+
| Query Input Box                         |
+-----------------------------------------+

+-----------------------------------------+
| Generated SQL                           |
+-----------------------------------------+

+-----------------------------------------+
| Query Suggestions                       |
+-----------------------------------------+

+-----------------------------------------+
| Schema Detection                        |
+-----------------------------------------+

+-----------------------------------------+
| SQL Validation                          |
+-----------------------------------------+

+-----------------------------------------+
| AI Explanation                          |
+-----------------------------------------+

+-----------------------------------------+
| Execute Query Button                    |
+-----------------------------------------+
```

### Query Input Component

Placeholder:

Ask anything about your data...

Example:

Show top 10 employees by salary

### Flow

```text
User Query
      |
      v
Generate SQL
      |
      v
Loading Spinner
      |
      v
Generated SQL
      |
      v
Suggestions
      |
      v
Schema Detection
      |
      v
Validation
      |
      v
Explanation
```

---

# 10. SQL Preview Component

## Components

Code Editor

Displays SQL

Features:

* Syntax Highlighting
* Copy Button
* Edit SQL
* Download SQL

### Actions

* Copy Query
* Edit Query
* Execute Query

---

# 11. Query Execution Screen

## Purpose

Execute SQL against database.

## Components

* Query Preview
* Execute Button
* Loading Indicator

### Flow

```text
Execute Query
      |
      v
Execution API
      |
      v
Results Received
```

---

# 12. Results Page

## Components

Data Table

Supports:

* Pagination
* Search
* Sorting
* Filtering

Statistics Section

Displays:

* Total Records
* Execution Time

Export Options

* CSV
* Excel
* PDF

### Results Flow

```text
Results
 |
 +--- Search
 |
 +--- Sort
 |
 +--- Filter
 |
 +--- Export
```

---

# 13. Query History Page

## Purpose

View previously generated queries.

## Components

History Table

Columns:

* Date
* Natural Query
* SQL Query
* Status

Actions:

* View
* Reuse
* Delete

---

# 14. Profile Page

## Components

Profile Information

* Name
* Email

Security Settings

* Change Password
* Logout

Statistics

* Queries Generated
* Datasets Uploaded

---

# 15. Settings Page

## Components

* Theme
* Language
* Notification Preferences
* AI Preferences
* Default Export Format

---

# 16. Global UI States

## Loading State

Show Spinner

Examples:

* Login
* Upload
* Query Generation
* Query Execution

## Empty State

Examples:

* No Queries Generated Yet
* No Dataset Uploaded

## Error State

Examples:

* Invalid CSV File
* Database Connection Failed
* AI Service Unavailable

---

# 17. Frontend State Management

## Authentication State

* User
* Token
* isAuthenticated

## Dataset State

* Dataset
* Columns
* Row Count

## Database State

* Connection
* Schema

## Query State

* Natural Query
* Generated SQL
* Suggestions
* Validation
* Explanation
* Results

## History State

* Query History
* Selected Query

---

# 18. Security Flow

```text
Login
      |
      v
JWT Token
      |
      v
Store Token
      |
      v
Protected Routes
      |
      v
Dashboard
```

---

# 19. Complete Frontend User Journey

```text
Landing Page
      |
      v
Register
      |
      v
OTP Verification
      |
      v
Login
      |
      v
Dashboard
      |
      +---------------------+
      |                     |
      v                     v
Upload CSV      Connect Database
      |                     |
      +----------+----------+
                 |
                 v
         Dataset Manager
                 |
                 v
         Query Generator
                 |
                 v
       Generate SQL
                 |
                 v
      Query Suggestions
                 |
                 v
      Schema Detection
                 |
                 v
      SQL Validation
                 |
                 v
      SQL Explanation
                 |
                 v
       Execute Query
                 |
                 v
        Results Table
                 |
       +---------+---------+
       |                   |
       v                   v
 Export Results    Query History
                 |
                 v
               Profile
                 |
                 v
              Settings
```
