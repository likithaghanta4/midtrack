# MID TRACK - Architecture & Design Document
**S.R.K.R. Engineering College (Autonomous), Bhimavaram**
*Mid Marks Management & Sessional Calculation System*

---

## 1. System Overview
MID TRACK is a specialized academic web application designed specifically for S.R.K.R. Engineering College to streamline faculty entry of Mid-1 and Mid-2 internal marks, automatically compute individual component totals, calculate final sessionals using the standard **80% Higher Mid + 20% Lower Mid** formula, and generate official university-compliant print sheets.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom SRKR branding theme
- **Icons**: Lucide React
- **API Client**: Axios with JWT request interceptors

### Backend
- **Platform**: Node.js & Express.js
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: JSON Web Tokens (JWT) + Bcrypt password hashing
- **Validation**: Zod schema validators
- **Reporting / Export**: University format print-ready HTML & PDF generation

---

## 3. Directory Layout

```
mid-track/
│
├── frontend/                     # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Faculty, Student & Auth page views
│   │   ├── layouts/              # Main layout, Navbars, Headers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # Axios API calls
│   │   ├── types/                # TypeScript interfaces & types
│   │   └── utils/                # Calculations, formatters, helpers
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/               # Environment & Prisma client setup
│   │   ├── controllers/          # Request handling logic
│   │   ├── middleware/           # Auth, Role guards, Error handling
│   │   ├── routes/               # Express REST routes
│   │   ├── services/             # Business & calculation logic
│   │   ├── validators/           # Zod input validation schemas
│   │   ├── utils/                # Password hashing, JWT utils
│   │   ├── app.ts                # Express app configuration
│   │   └── server.ts             # Server entrypoint
│   ├── prisma/
│   │   └── schema.prisma         # Prisma PostgreSQL schema
│   ├── package.json
│   └── tsconfig.json
│
├── data/                         # Data import staging directories
│   ├── students/                 # Real student records (CSV/Excel)
│   ├── faculty/                  # Real faculty records (CSV/Excel)
│   └── subjects/                 # Real subject records (CSV/Excel)
│
├── docs/                         # Project documentation
│   └── architecture.md
│
└── README.md                     # Setup, running, and migration guide
```

---

## 4. Marks & Sessional Calculation Rules

### A. Mid Examination Structure (Max 30 Marks)
1. **Descriptive (15 Marks Max)**:
   - 3 choices out of 6 questions:
     - Q1 OR Q2: Max 5 marks
     - Q3 OR Q4: Max 5 marks
     - Q5 OR Q6: Max 5 marks
   - Total Descriptive = Q1/Q2 + Q3/Q4 + Q5/Q6 (Max 15)
2. **Objective (10 Marks Max)**:
   - 5 questions carrying 2 marks each:
     - Q1 (Max 2), Q2 (Max 2), Q3 (Max 2), Q4 (Max 2), Q5 (Max 2)
   - Total Objective = Q1 + Q2 + Q3 + Q4 + Q5 (Max 10)
3. **Assignment (5 Marks Max)**:
   - Continuous evaluation assignment: Max 5 marks

**Total Mid Mark = Descriptive (15) + Objective (10) + Assignment (5) = Max 30**

### B. Final Sessional Calculation Formula
$$\text{Final Sessional (out of 30)} = (\text{Higher Mid} \times 0.80) + (\text{Lower Mid} \times 0.20)$$

*Calculation only executes when both Mid-1 and Mid-2 are saved.*
