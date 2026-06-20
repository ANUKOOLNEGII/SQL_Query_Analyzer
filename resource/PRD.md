Software Requirements Specification (SRS)
AI-Powered Natural Language to SQL Query Generator
Version: 1.0

1. Introduction
1.1 Purpose
The purpose of this project is to develop an intelligent AI-powered system that converts natural language user requirements into SQL queries. The system enables users with little or no database knowledge to interact with databases using simple English sentences and automatically generate valid SQL statements.
The application reduces the complexity of writing SQL queries and assists users in understanding database operations through AI-generated explanations and query recommendations.

1.2 Scope
The Natural Language to SQL Query Generator is designed to:
Accept user requirements in natural language.
Analyze user intent using Artificial Intelligence and Natural Language Processing (NLP).
Generate one or more SQL queries corresponding to the user's request.
Explain generated SQL queries in simple language.
Display tables, attributes, and relationships used in the query.
Validate generated queries before execution.
Execute queries on connected databases.
Display query results in tabular format.
Help non-technical users interact with databases without learning SQL syntax.
The system is intended for students, analysts, researchers, business users, and database beginners.

1.3 Definitions, Acronyms, and Abbreviations


1.4 References
SQL Standard Documentation
PostgreSQL Documentation
MySQL Documentation
OpenAI API Documentation
IEEE SRS Documentation Standard

2. Overall Description
2.1 Product Perspective
The system acts as an intelligent layer between users and databases.
Instead of writing SQL manually, users describe their requirements in plain English. The AI engine interprets the request and generates appropriate SQL statements.
Example:
User Input:
"Show all students whose marks are greater than 80."
Generated SQL:
SELECT * FROM students
WHERE marks > 80;

2.2 Product Functions
The system shall:
Accept natural language input.
Analyze user intent.
Identify database entities and attributes.
Generate SQL queries.
Provide multiple query alternatives when applicable.
Explain generated queries.
Execute generated queries.
Display results.
Save query history.
Provide schema visualization.
Validate SQL syntax.
Suggest query improvements.

2.3 User Classes and Characteristics
Database Beginner
No SQL knowledge
Uses natural language only
Student
Learning SQL
Uses explanations to understand queries
Data Analyst
Uses generated SQL for faster reporting
Database Administrator
Verifies generated SQL before execution

2.4 Operating Environment
Client Side
Web Browser
Chrome
Firefox
Edge
Server Side
Python
Django Framework
PostgreSQL/MySQL
AI Layer
OpenAI API
NLP Processing Engine

2.5 Assumptions and Dependencies
Assumptions
Database schema is available.
Internet connection is available for AI processing.
Users provide meaningful natural language inputs.
Dependencies
Database Server
AI Service API
Django Backend
Frontend Framework

2.6 Constraints
AI-generated queries may require validation.
Query accuracy depends on schema availability.
Internet dependency for AI features.

3. Specific Requirements
3.1 Functional Requirements
FR-1 User Authentication
Description
The system shall allow users to register and log in.
Inputs
Username
Email
Password
Outputs
Successful login
Error message

FR-2 Natural Language Input
Description
The system shall allow users to enter database requests in natural language.
Example
"Show employees working in the HR department."

FR-3 Intent Recognition
Description
The system shall identify:
Tables
Attributes
Conditions
Aggregations
from the user input.

FR-4 SQL Query Generation
Description
The system shall generate valid SQL queries from natural language inputs.
Example
Input:
"Find students older than 20."
Output:
SELECT *
FROM students
WHERE age > 20;

FR-5 Multiple Query Suggestions
Description
The system shall generate alternative SQL queries when multiple interpretations exist.

FR-6 Query Explanation
Description
The system shall explain generated SQL queries in simple language.
Example:
"This query retrieves all students whose age is greater than 20."

FR-7 Schema Detection
Description
The system shall identify database tables and attributes relevant to the user query.

FR-8 Query Validation
Description
The system shall validate SQL syntax before execution.

FR-9 Query Execution
Description
The system shall execute validated SQL queries on the connected database.

FR-10 Result Visualization
Description
The system shall display query results in tabular format.

FR-11 Query History
Description
The system shall store previously generated queries.

FR-12 Export Functionality
Description
The system shall allow exporting results as:
CSV
Excel
PDF

3.2 Non-Functional Requirements
NFR-1 Performance
Query generation time shall be less than 5 seconds.
Result retrieval shall be completed within 10 seconds for normal datasets.

NFR-2 Security
Passwords shall be encrypted.
Database credentials shall not be exposed.
SQL injection protection shall be implemented.
HTTPS shall be used.

NFR-3 Reliability
System uptime shall exceed 95%.
Failed query executions shall generate meaningful error messages.

NFR-4 Usability
Interface shall be simple and beginner-friendly.
Users shall be able to generate queries without SQL knowledge.

NFR-5 Scalability
System shall support multiple concurrent users.
System shall support large databases.

NFR-6 Maintainability
Modular architecture shall be followed.
APIs shall be documented.

NFR-7 Compatibility
The system shall support:
Windows
Linux
macOS
and modern browsers.

4. External Interface Requirements
4.1 User Interface
The interface shall include:
Login Page
Dashboard
Query Input Box
Generated SQL Section
Query Explanation Section
Results Table
Query History Page

4.2 Hardware Interfaces
Minimum Requirements:
4 GB RAM
Dual Core Processor
Internet Connectivity

4.3 Software Interfaces
Database
PostgreSQL
MySQL
AI Services
OpenAI API
Backend
Django REST Framework

5. System Features
Feature 1: Natural Language Processing
Convert English text into structured query requirements.

Feature 2: SQL Generation Engine
Generate optimized SQL statements.

Feature 3: Query Explanation Engine
Explain SQL queries in human-readable language.

Feature 4: Query Execution Module
Execute SQL against connected databases.

Feature 5: Result Visualization
Display results in structured tables.

6. Security Requirements
Authentication required.
Role-based access control.
Encrypted passwords.
Secure database connection.
Input validation.
SQL Injection prevention.

7. Future Enhancements
Voice-to-SQL generation.
Multi-language support.
NoSQL query generation.
Query optimization recommendations.
Database schema auto-discovery.
AI chatbot assistant.

8. Acceptance Criteria
The system shall be considered successful if:
Natural language inputs are converted into valid SQL queries.
Generated SQL executes successfully.
Query explanations are understandable by beginners.
Results are displayed correctly.
Users can interact without SQL knowledge.

9. Conclusion
The AI-Powered Natural Language to SQL Query Generator aims to bridge the gap between non-technical users and database systems. By leveraging Artificial Intelligence and Natural Language Processing, the system enables users to generate, understand, and execute SQL queries through natural language, improving accessibility, productivity, and learning.
