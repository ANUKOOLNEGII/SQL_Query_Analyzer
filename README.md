# SQL_Query_Analyzer

AI-Powered Natural Language to SQL Query Generator.

## Backend

See [backend/README.md](./backend/README.md) for API documentation.

Primary query history endpoint:

```http
GET /api/v1/query/history?page=1&limit=10
```

Legacy endpoint (deprecated):

```http
GET /api/v1/history?page=1&limit=10
```
