# PROJECT FOLDER STRUCTURE

AI-Powered Natural Language to SQL Query Generator

Version 2.0

```text
ai-sql-generator/
│
├── resource/
│   │
│   ├── SRS.md
│   ├── TDD.md
│   ├── Frontend-Flow.md
│   ├── Backend-Flow.md
│   ├── UIUX-Design.md
│   ├── API-Documentation.md
│   ├── Database-Design.md
│   ├── Deployment-Guide.md
│   │
│   ├── diagrams/
│   │   ├── use-case-diagram.png
│   │   ├── class-diagram.png
│   │   ├── sequence-diagram.png
│   │   ├── activity-diagram.png
│   │   ├── er-diagram.png
│   │   ├── deployment-diagram.png
│   │   ├── architecture-diagram.png
│   │   │
│   │   └── dfd/
│   │       ├── level-0.png
│   │       ├── level-1.png
│   │       └── level-2.png
│
├── frontend/
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── images/
│   │
│   ├── src/
│   │   │
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── routes.tsx
│   │   │   ├── providers.tsx
│   │   │   └── store.ts
│   │   │
│   │   ├── pages/
│   │   │   │
│   │   │   ├── Landing/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── VerifyOTP/
│   │   │   ├── ForgotPassword/
│   │   │   ├── ResetPassword/
│   │   │   │
│   │   │   ├── Dashboard/
│   │   │   ├── DatasetManager/
│   │   │   ├── UploadDataset/
│   │   │   ├── DatabaseConnection/
│   │   │   ├── QueryGenerator/
│   │   │   ├── QueryExecution/
│   │   │   ├── QueryHistory/
│   │   │   ├── QueryDetails/
│   │   │   ├── Results/
│   │   │   ├── Profile/
│   │   │   └── Settings/
│   │   │
│   │   ├── components/
│   │   │
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── TextArea.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Loader.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── OTPForm.tsx
│   │   │   │
│   │   │   ├── dataset/
│   │   │   │   ├── DatasetTable.tsx
│   │   │   │   ├── DatasetPreview.tsx
│   │   │   │   ├── DatasetCard.tsx
│   │   │   │   └── UploadZone.tsx
│   │   │   │
│   │   │   ├── database/
│   │   │   │   ├── ConnectionForm.tsx
│   │   │   │   ├── SchemaViewer.tsx
│   │   │   │   └── ConnectionCard.tsx
│   │   │   │
│   │   │   ├── query/
│   │   │   │   ├── QueryInput.tsx
│   │   │   │   ├── SQLViewer.tsx
│   │   │   │   ├── QuerySuggestions.tsx
│   │   │   │   ├── ValidationPanel.tsx
│   │   │   │   ├── QueryExplanation.tsx
│   │   │   │   ├── ExecuteButton.tsx
│   │   │   │   └── SchemaPanel.tsx
│   │   │   │
│   │   │   ├── results/
│   │   │   │   ├── ResultsTable.tsx
│   │   │   │   ├── ExportMenu.tsx
│   │   │   │   ├── StatisticsCard.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   │
│   │   │   └── charts/
│   │   │       ├── QueryTrendChart.tsx
│   │   │       ├── UsageChart.tsx
│   │   │       └── ExecutionChart.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── dataset.service.ts
│   │   │   ├── database.service.ts
│   │   │   ├── query.service.ts
│   │   │   ├── history.service.ts
│   │   │   ├── export.service.ts
│   │   │   └── analytics.service.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDataset.ts
│   │   │   ├── useDatabase.ts
│   │   │   ├── useQuery.ts
│   │   │   └── useHistory.ts
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── QueryContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── DatasetContext.tsx
│   │   │
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │   ├── querySlice.ts
│   │   │   ├── datasetSlice.ts
│   │   │   └── historySlice.ts
│   │   │
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── assets/
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── src/
│   │   │
│   │   ├── server.ts
│   │   ├── app.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── jwt.ts
│   │   │   ├── openai.ts
│   │   │   ├── gemini.ts
│   │   │   ├── mail.ts
│   │   │   ├── logger.ts
│   │   │   └── env.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── dataset.routes.ts
│   │   │   ├── database.routes.ts
│   │   │   ├── query.routes.ts
│   │   │   ├── history.routes.ts
│   │   │   ├── export.routes.ts
│   │   │   └── user.routes.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── otp.controller.ts
│   │   │   ├── dataset.controller.ts
│   │   │   ├── database.controller.ts
│   │   │   ├── query.controller.ts
│   │   │   ├── history.controller.ts
│   │   │   ├── export.controller.ts
│   │   │   └── user.controller.ts
│   │   │
│   │   ├── services/
│   │   │
│   │   │   ├── auth/
│   │   │   ├── dataset/
│   │   │   ├── database/
│   │   │   ├── ai/
│   │   │   ├── query/
│   │   │   ├── history/
│   │   │   ├── export/
│   │   │   └── analytics/
│   │   │
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── repositories/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── logs/
│   │   └── uploads/
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── deployment/
│   ├── docker/
│   ├── nginx/
│   ├── render/
│   └── vercel/
│
├── scripts/
│   ├── setup.sh
│   ├── seed.sh
│   └── deploy.sh
│
├── .gitignore
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

## Database Tables

```text
users
otp_verifications
datasets
dataset_columns
database_connections
query_history
query_suggestions
audit_logs
export_history
```

## Architecture Alignment

Frontend:
React + TypeScript + Tailwind + React Query

Backend:
Node.js + Express + Prisma + PostgreSQL

AI Layer:
OpenAI + Gemini

Deployment:
Vercel + Render + Neon PostgreSQL

```
```
