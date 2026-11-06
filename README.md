# ATS Resume Studio — Full-Stack ATS Resume Builder & Analyzer

[![CI Pipeline](https://github.com/Atharva-cell-ops/AI-Resume-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/Atharva-cell-ops/AI-Resume-analyzer/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-grade, full-stack web application that empowers job seekers to **build ATS-safe resumes** and **maximize their ATS match score** with an explainable, 100% deterministic NLP scoring engine.

---

## 🌟 Key Features

### 1. ATS-Safe Resume Builder
- **8-Step Guided Wizard**: Personal Info, Professional Summary, Work Experience, Education, Technical Projects, Skills, Certifications, and Honors/Achievements.
- **Drag-and-Drop Reordering**: Effortlessly reorder roles, degrees, projects, and accomplishments.
- **Debounced Cloud Autosave**: Seamlessly persists drafts into PostgreSQL with JSONB schema validation.
- **Per-Bullet Real-Time Helper**: Evaluates every accomplishment bullet as you type:
  - Detects strong action verbs from a curated technical lexicon.
  - Flags passive/weak phrases (*"helped with"*, *"responsible for"*).
  - Verifies quantifiable metrics (*%*, *$*, *3x*, *team size*, *scale*).
  - Flags bullets exceeding 2 printed lines (>24 words).
  - Offers 1-click deterministic active verb replacements.
- **3 ATS-Safe Single-Column Templates**:
  - `ats-classic`: Traditional serif/sans hybrid with standard dividing rules.
  - `ats-modern`: Clean geometric sans-serif typography with high-contrast section dividers.
  - `ats-minimal`: Maximum text density and whitespace efficiency optimized for a 1-page fit.
  - *All templates strictly follow ATS rules: zero multi-column table scrambles, 100% selectable text, web-safe typography, and standard semantic headers.*

### 2. Deterministic ATS Scoring & Match Analyzer
- **Dual Evaluation Inputs**: Upload any existing **PDF or DOCX** resume file or analyze your active builder draft.
- **Explainable 0–100 Scoring Breakdown**:
  - 🎯 **Keyword Match (40%)**: N-grams (1-gram, 2-gram, 3-gram), stopword filtering, Porter stemming, and curated tech taxonomy with bidirectional synonym resolution (`JS` ↔ `JavaScript`, `K8s` ↔ `Kubernetes`, `Node` ↔ `Node.js`, `Postgres` ↔ `PostgreSQL`).
  - 📋 **Section Completeness (15%)**: Contact (email, phone, location/links), Summary, Experience, Education, and Skills.
  - 📐 **Formatting & Parsability (15%)**: Single-column adherence, chronological date patterns, page count estimation (<5 yrs = 1 page), and table border detection.
  - 📊 **Impact & Quantification (10%)**: Ratio of bullets containing measurable numbers, percentages, or financial metrics.
  - ⚡ **Action Verbs & Tone (10%)**: Strong verb diversity, passive voice penalties, and verb repetition penalties (>3x).
  - 📖 **Readability & Length (10%)**: Flesch Reading Ease algorithm, optimal sentence length (10–24 words), and buzzword/cliché detection (*"hard worker"*, *"team player"*, *"synergy"*).
- **Ranked Actionable Suggestions**: Simulates exact score gains (e.g. *"+8 pts: Inject Critical Target Keywords"*, *"+6 pts: Quantify Accomplishments with Metrics"*).

### 3. High-Fidelity PDF & DOCX Export Engine
- **Server-Side Puppeteer HTML-to-PDF**: Headless Chromium generates pixel-accurate, single-column A4 PDFs with selectable text.
- **Native DOCX Export**: Built with `docx` package for ATS parsers that prefer Word documents.
- **Client-Side One-Click Triggers**: Instant downloads directly in your browser with automated candidate name formatting.

### 4. Accounts, Versioning & Job Tailoring Dashboard
- **Session Management**: JWT access & refresh token rotation in secure `httpOnly` cookies with bcrypt password hashing.
- **Immutable Version Snapshots**: Automatic version increments with custom change summaries.
- **Side-by-Side Version Diff**: Interactive comparison modal highlighting differences in Summary, Experience bullets, and Skills between any two snapshots with 1-click restore.
- **Tailor for Job**: Clone any existing resume into a targeted branch, input target company & JD, and instantly evaluate tailored score.

---

## 🏗️ System Architecture & Monorepo Structure

```text
AI_resume_analyzer/
├── client/                       # Frontend: React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Sign In & Registration Modals
│   │   │   ├── builder/         # Wizard steps, Live Preview, Per-Bullet Helper
│   │   │   └── templates/       # 3 ATS-safe Single-Column Templates
│   │   ├── context/             # AuthContext & ResumeContext (autosave & draft sync)
│   │   ├── pages/               # Builder, ATS Analyzer, and Dashboard pages
│   │   └── services/            # Typed apiFetch client with credential cookies
├── server/                       # Backend: Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   └── schema.prisma        # PostgreSQL models & relations
│   ├── src/
│   │   ├── config/              # Env config, Prisma client, rate limiting
│   │   ├── controllers/         # Auth, Resumes, Versions, ATS, Export
│   │   ├── middleware/          # JWT auth, error handler, multer, Zod validation
│   │   ├── routes/              # REST routes (/auth, /resumes, /ats, /export)
│   │   └── services/
│   │       ├── ats/             # Pure deterministic scoring engine & NLP utilities
│   │       ├── export/          # Puppeteer HTML-to-PDF & DOCX generators
│   │       └── parser/          # pdf-parse and mammoth text extractors
│   └── tests/                   # 52 Vitest unit & integration tests
├── shared/                       # Shared contracts across client and server
│   ├── src/
│   │   ├── constants/           # Action verbs, tech skills with synonyms, cliches, stopwords
│   │   ├── schemas/             # Zod validation schemas for all entities
│   │   └── types/               # TypeScript interfaces (ResumeData, AtsAnalysisResult)
├── e2e/                          # Playwright end-to-end integration test flows
├── Dockerfile.server             # Multi-stage production container for Express + Chromium
├── Dockerfile.client             # Multi-stage production container for React + Nginx
├── docker-compose.yml            # Container orchestration (Postgres, Server, Client)
└── .github/workflows/ci.yml      # GitHub Actions CI workflow
```

---

## 📊 Database Schema (Prisma)

```mermaid
erDiagram
    User ||--o{ Resume : "owns"
    User ||--o{ JobDescription : "creates"
    User ||--o{ RefreshToken : "has"
    Resume ||--o{ ResumeVersion : "has"
    Resume ||--o{ AtsReport : "evaluated_in"
    JobDescription ||--o{ AtsReport : "targeted_in"

    User {
        String id PK
        String email UK
        String passwordHash
        String name
        DateTime createdAt
        DateTime updatedAt
    }

    RefreshToken {
        String id PK
        String token UK
        String userId FK
        DateTime expiresAt
        DateTime createdAt
    }

    Resume {
        String id PK
        String userId FK
        String title
        String templateId
        Int currentVersion
        Json content
        DateTime createdAt
        DateTime updatedAt
    }

    ResumeVersion {
        String id PK
        String resumeId FK
        Int versionNumber
        String changeSummary
        Json content
        DateTime createdAt
    }

    JobDescription {
        String id PK
        String userId FK
        String title
        String company
        String rawText
        Json extractedKeywords
        DateTime createdAt
    }

    AtsReport {
        String id PK
        String resumeId FK
        String jobDescriptionId FK
        Int overallScore
        Json breakdown
        Json matchedKeywords
        Json missingKeywords
        Json actionableTips
        DateTime createdAt
    }
```

---

## 🔬 Deterministic Scoring Engine Architecture

The scoring engine is implemented behind an explicit TypeScript interface:

```typescript
export interface IAtsScoringEngine {
  scoreResume(
    resumeText: string,
    jobDescription: string,
    options?: { pageCount?: number; fileType?: 'pdf' | 'docx' | 'txt' | 'json' }
  ): AtsAnalysisResult;
}
```

### Weighting Matrix
| Criterion | Weight | Evaluation Method |
|---|---|---|
| **Keyword Match** | **40%** | N-grams, Porter stemming, synonym dictionary, critical frequency weighting |
| **Section Completeness** | **15%** | Verifies Contact, Summary, Experience, Education, and Skills (3 pts each) |
| **Formatting & Parsability**| **15%** | Single-column verification, chronological dates, standard headers, page count fit |
| **Impact & Quantification**| **10%** | Metric ratio (% of bullets with numbers, percentages, currency, or scale) |
| **Action Verbs & Tone** | **10%** | Strong verb diversity, passive phrasing penalty, verb repetition penalty (>3x) |
| **Readability & Length** | **10%** | Flesch Reading Ease index, 10–24 word sentence target, cliché/buzzword penalty |

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** (v16+ running locally or via Docker)

### 1. Clone & Install Dependencies
```powershell
git clone https://github.com/Atharva-cell-ops/AI-Resume-analyzer.git
cd AI-Resume-analyzer
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
Copy-Item .env.example server\.env
```
Ensure your `DATABASE_URL` is set to your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/resume_analyzer?schema=public"
JWT_ACCESS_SECRET="your_super_secret_access_jwt_key_at_least_32_chars"
JWT_REFRESH_SECRET="your_super_secret_refresh_jwt_key_at_least_32_chars"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### 3. Provision Database Schema
```powershell
npm run db:push --workspace=server
```

### 4. Run Development Servers
```powershell
# Start Express Backend on http://localhost:5000
npm run dev:server

# In a second terminal, start Vite Frontend on http://localhost:5173
npm run dev:client
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing Suite

Run the full suite of **52 unit and integration tests**:
```powershell
npm run test
```

### Test Coverage Highlights:
- **Authentication & Validation (`server/tests/auth.test.ts`)**: 10 tests verifying Zod rejection, duplicate registration, password hashing, and cookie issuance.
- **Bullet Helper Engine (`server/tests/bulletHelper.test.ts`)**: 4 tests verifying active verbs, weak phrase detection, metrics parsing, and line length checks.
- **ATS Scoring Engine (`server/tests/atsScoringEngine.test.ts`)**: 32 unit tests verifying synonym matching, n-grams, Flesch Reading Ease, section detection, formatting, and suggestion ranking.
- **PDF & DOCX Export (`server/tests/export.test.ts`)**: 6 tests verifying HTML generation, DOCX byte stream generation, and export endpoint headers.

To run Playwright End-to-End tests:
```powershell
npx playwright test
```

---

## 🐳 Docker Deployment

To spin up the complete containerized stack (Postgres + Express Server + Nginx Client) with a single command:

```powershell
docker-compose up --build -d
```
Access the application at `http://localhost`.

---

## ☁️ Production Cloud Deployment

### 1. Database (Neon or Supabase)
1. Create a PostgreSQL project on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the pooled connection string into your environment variables as `DATABASE_URL`.
3. Push schema: `npx prisma db push`.

### 2. Backend (Render)
1. Create a Web Service connected to your repository.
2. Select runtime `Node`.
3. Set **Build Command**: `npm ci && npm run db:generate --workspace=server && npm run build --workspace=shared && npm run build --workspace=server`
4. Set **Start Command**: `npm run db:push --workspace=server && node server/dist/index.js`
5. Configure environment variables (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`).
*(Alternatively, deploy via the included `render.yaml` blueprint).*

### 3. Frontend (Vercel)
1. Import repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `./` (or `client`).
3. Set **Build Command**: `npm run build --workspace=shared && npm run build --workspace=client`
4. Set **Output Directory**: `client/dist`
5. Vercel automatically respects the included `vercel.json` for SPA rewrites and API proxies.

---

## 💡 Technical Decisions

1. **Why Pure Deterministic NLP Over Paid AI APIs?**
   - **Zero API costs & Latency**: LLMs introduce rate limits, token fees, and unpredictable latencies (2–5 seconds). Rule-based scoring computes in under **50ms**.
   - **Explainability**: Hiring managers and candidates need to know *exactly* why a resume received a 72 vs. an 88. Deterministic math allows us to prove points mathematically (e.g. *"+8 pts for adding Docker & K8s"*).
   - **Pluggable Architecture**: The engine is wrapped behind `IAtsScoringEngine`, allowing an LLM enhancement layer to be added later without refactoring.

2. **Why PostgreSQL with JSONB for Resume Content?**
   - Resumes have heterogeneous and evolving sub-sections (projects with variable tags, certifications, custom achievements). Storing the structured resume payload in a validated JSONB column combines the flexibility of document stores with PostgreSQL's relational integrity for users, versions, and audit trails.

3. **Why Server-Side Puppeteer Over Client-Side PDF Generators?**
   - Client-side Canvas-to-PDF tools (like html2canvas) convert text into rasterized images, rendering the PDF completely unreadable to ATS OCR parsers.
   - Puppeteer renders true vector fonts, selectable text streams, and precise CSS `@page` media margins matching ATS standards.

4. **Why Single-Column Templates Only?**
   - Multi-column resumes, floating text boxes, and complex HTML tables cause ATS scanners to read across columns horizontally, scrambling work history and skills. All 3 ATS Resume Studio templates enforce strict single-column layouts.

---

## 🚀 What I'd Improve Next

1. **Optional LLM Enhancer Plugin**:
   - Leverage the decoupled `IResumeEnhancerService` interface to provide an optional AI rewrite assistant for users who bring their own API keys (e.g. Gemini 1.5 Flash or Claude 3.5 Sonnet).
2. **Semantic Vector Embeddings (Hybrid Scoring)**:
   - Combine deterministic keyword matching with local vector embeddings (using ONNX Runtime / `transformers.js`) for semantic relevance scoring between job descriptions and accomplishment bullets.
3. **Google OAuth & SSO**:
   - Complement the existing JWT/bcrypt cookie authentication with Passport.js Google OAuth 2.0 social login.
4. **Interactive ATS Simulation View**:
   - Provide a "Recruiter ATS View" that shows candidates the exact raw text stream that an enterprise ATS (Workday, Greenhouse, Taleo) parses from their PDF.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
