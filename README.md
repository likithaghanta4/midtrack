# MID TRACK – SRKR Engineering College Mid Marks Management System

> **Official Mid Marks and Sessional Computation System for S.R.K.R. Engineering College, Bhimavaram**

---

## 📌 Project Overview
**MID TRACK** is built to manage Mid-1 and Mid-2 internal assessment marks for S.R.K.R. Engineering College. The system enables faculty to enter question-wise marks, automatically calculates mid examination totals (/30), applies university-standard sessional calculations (**80% Higher Mid + 20% Lower Mid**), and generates official academic grade sheets and PDF reports.

Students have dedicated access to inspect their own marks securely with zero cross-access vulnerabilities.

---

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js, TypeScript, Zod, JWT, Bcrypt
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Role Access**: `FACULTY`, `STUDENT` (Strictly No Super Admin / No Admin Role)

---

## 📁 Repository Structure

```
Midtrack/
├── backend/                # Express + TypeScript + Prisma REST API
│   ├── prisma/             # Database schema & migrations
│   ├── src/                # Modular Controllers, Routes, Middleware, Validators
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/               # React 18 + Vite + Tailwind CSS App
│   ├── src/                # Components, Pages, Hooks, Services, Types
│   ├── .env.example        # Frontend environment variables template
│   └── package.json
├── data/                   # Real Data import staging directory
│   ├── students/           # Real student records
│   ├── faculty/            # Real faculty records
│   └── subjects/           # Real subject records
├── docs/                   # System design & architecture documents
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm (v9+)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env     # Configure your PostgreSQL DATABASE_URL
npx prisma generate
npm run dev              # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # Starts on http://localhost:5173
```

---

## 📊 Marks & Sessional Calculation Rules

1. **Mid Examination (Max 30 Marks)**:
   - **Descriptive (15 Marks)**: Choice of 3 pairs (Q1/Q2, Q3/Q4, Q5/Q6) @ 5 marks each.
   - **Objective (10 Marks)**: 5 questions @ 2 marks each.
   - **Assignment (5 Marks)**: Continuous assessment (Max 5).
   - **Mid Total** = Descriptive (15) + Objective (10) + Assignment (5) = **30 Marks**.

2. **Final Sessional Calculation**:
   $$\text{Final Sessional} = (\text{Higher Mid} \times 80\%) + (\text{Lower Mid} \times 20\%)$$
   *Calculated automatically out of 30 once both mids are entered.*

---

## 🔒 Security
- Bcrypt password hashing for all user accounts.
- Stateless JWT-based authentication.
- Strict role-based endpoint isolation (Students can ONLY view their own records).
- Backend server-side validation on all marks calculations before persistence.
