# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Siladocs Frontend** is a Next.js 15 (App Router) application for academic document management. It connects to a Spring Boot backend (`ISW-SilaTech/siladocs-backend`) and provides features for managing careers, curricula, courses, syllabi, and blockchain-based document verification via Hyperledger Fabric.

**Key Domains:**
- Authentication & institutional roles (Rector, Academic Admin, etc.)
- Academic structure management (Carreras → Mallas → Cursos)
- Syllabus upload with blockchain registration
- Bulk data import from Excel
- Dashboard with emission credits and certificate history
- Contact form with reCAPTCHA
- User profiles and institution management

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Production build
npm build

# Start production server
npm start

# Lint with ESLint
npm run lint

# Generate CSS from SCSS
npm run sass
npm run sass-min  # compressed output

# PostCSS processing
npm run postcss
```

**Testing:** No automated tests configured. Frontend validation relies on TypeScript strict mode, Next.js pre-rendering checks, and manual testing.

## Architecture & Code Structure

### Next.js App Router Organization

```
app/
├── (components)/           # Route group: wraps all main content
│   ├── (admin-layout)/    # Admin pages (dashboards, management)
│   ├── (content-layout)/  # Main authenticated pages
│   ├── (landing-layout)/  # Public landing/marketing pages
│   └── (authentication-layout)/  # Auth pages (sign-in, register)
├── (auth-required)/       # Middleware protection (if implemented)
└── api/
    └── contact-form/      # Backend webhook for contact submissions
shared/
├── services/              # Axios-based API service layer
├── contextapi.tsx         # React Context: user/institution/auth state
├── config/
│   └── axios.ts           # Axios instance with JWT interceptor
├── types/                 # Global TypeScript interfaces
├── utils/                 # Reusable utility functions
├── hooks/                 # Custom React hooks
├── data/                  # Mock data & sample datasets
├── layouts-components/    # Shared layout wrappers (navbar, sidebar)
└── @spk-reusable-components/  # Reusable UI component library (Bootstrap-based)
```

### Key Architectural Patterns

#### 1. SSR Window Guards
Next.js 15 App Router defaults to Server Components. Client-side code must guard `window` access:

```typescript
useEffect(() => {
  if (typeof window === 'undefined') return;
  // window-dependent code here
}, []);
```

#### 2. Authentication Context (React Context API)
- Stored in `shared/contextapi.tsx`
- Manages: user, institution, accessToken, login/logout/register
- Persists token to localStorage on login
- Axios interceptor auto-injects `Authorization: Bearer <token>` header
- Auto-redirects to `/authentication/sign-in/cover` on 401/403

#### 3. Service Layer Pattern
All API calls go through typed service files in `shared/services/`:

```typescript
// Example: auth.service.ts
export const AuthService = {
  login: async (creds) => api.post('/auth/login', creds),
  register: async (data) => api.post('/auth/register', data),
};
```

Services return promises and type-safe DTOs. Pages import and call them in `useEffect`.

#### 4. Axios Request/Response Interceptors
- **Request:** Adds JWT from localStorage to all requests
- **Response:** Catches 401/403, clears auth state, redirects to sign-in

#### 5. Demo User Support
- `demo-user.service.ts` provides test credentials (Rector, Academic Admin)
- `AuthService.login()` checks demo credentials first before API call
- Returns mock auth response without calling backend

### Component Patterns

**Modal Forms (CRUD Operations)**
- useState for form data, modal visibility, loading states
- Modal from react-bootstrap for layout
- Form.Group/Form.Control for inputs
- Validation inline (required checks, number/date parsing)
- Toast notifications (react-toastify) on success/error
- `isSaving` state disables inputs during request

**Tables & Lists**
- SpkTables component wrapper around Bootstrap table
- Map over data arrays, render rows conditionally
- Loading spinner while fetching
- Error alert on request failure
- Action buttons (edit, delete) with dropdown menus

**Data Fetching Pattern**
```typescript
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetch = async () => {
    try {
      const result = await SomeService.getAll();
      setData(result);
    } catch (err) {
      setError("Error message");
    } finally {
      setIsLoading(false);
    }
  };
  fetch();
}, []);
```

## Backend Integration

### API Base URL
- Dev: `http://localhost:8080/api` (local Spring Boot)
- Prod: Azure-hosted URL from `NEXT_PUBLIC_API_URL` env var

### Core Endpoints

**Authentication:**
- `POST /auth/login` → returns `{ accessToken, user, institution }`
- `POST /auth/register`
- `GET /users/profile`

**Academic Management:**
- `GET/POST/PUT/DELETE /careers`
- `GET/POST/PUT/DELETE /curriculums`
- `GET/POST/PUT/DELETE /courses`

**Syllabi:**
- `POST /syllabi/upload` → uploads PDF, returns `{ fabricTxId, currentHash }`
- `GET /syllabi/{courseId}` → retrieve stored syllabi

**Bulk Operations:**
- `POST /bulk-upload/courses` → nested DTO with Carrera/Malla/Curso data

**Frontend:**
- `GET /emission-credits`
- `GET /certificates`
- `POST /contact/send`

## Important Notes for Development

### 1. Bulk Upload Wizard Flow
- Phase 1: Upload Excel → parse → preview → send nested DTO to `/bulk-upload/courses`
- Phase 2: Drag-drop PDFs → auto-map to courses by code regex → upload each to `/syllabi/upload` → blockchain registration
- Frontend uses `ExcelJS` to parse files; backend uses Spring + JPA

### 2. Blockchain (Hyperledger Fabric)
- **Syllabi only:** Register at upload time, NOT on course CRUD
- Returns `{ fabricTxId, currentHash }` for verification links
- Backend supports mock mode (`blockchain.mock.enabled`) for testing without Fabric middleware
- **Do not add blockchain calls to CourseService, CareerService, or CurriculumService** — causes request timeouts and modal locks

### 3. Excel Template Generation
- Use `ExcelJS` library for programmatic template creation
- Frontend `ExcelJS` is available in dependencies; no separate library needed
- Demo at: `app/(components)/(content-layout)/core/carga-masiva/page.tsx`

### 4. Date/Time Handling
- Database: `LocalDate`, `LocalDateTime`, `Instant`
- Frontend: parse with `new Date()`, format with `.toLocaleDateString()` or `.toISOString().split('T')[0]`
- Always guard `new Date()` in useEffect with SSR check

### 5. SCSS/CSS
- SCSS source: `public/assets/scss/style.scss`
- Compiled to: `public/assets/css/style.css`
- Run `npm run sass-min` after changes
- PostCSS processes vendor prefixes automatically

## Testing Strategy

**Pre-render checks:** Next.js build logs any SSR errors (`window is not defined`). Fix by adding `if (typeof window === 'undefined') return;` guards.

**Backend integration:** Manual testing in browser. Check Network tab in DevTools for API calls and JWT headers.

**Component behavior:** Run `npm run dev`, navigate to page, open browser DevTools for console errors.

## Environment Configuration

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=<backend-url>/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<key>
```

**Backend (application.yml):**
- `blockchain.fabric.api.url`: Fabric middleware endpoint
- `blockchain.mock.enabled`: Use mock blockchain (true for testing)
- `spring.datasource.url`: PostgreSQL connection
- `siladocs.storage.endpoint`: MinIO/Azure connection

## Deployment Notes

- **Vercel:** Auto-detects Next.js, builds via `npm run build`, serves via `npm start`
- **Azure:** Container or App Service; ensure `NEXT_PUBLIC_API_URL` points to backend
- **Pre-build check:** `npm run lint` must pass; `next build` catches SSR/hydration errors
- **Post-deploy:** Test login, bulk upload, PDF download, and blockchain links in production

## Git Branch Workflow

- **Main branch:** `main` (production-ready)
- **Feature branches:** Checked out by Claude Code for specific tasks
- **Rebase conflicts:** Most common in `application.yml` (backend config); resolve by manually merging both branches' sections
- **Token-based push:** Use GitHub personal access token for CI/CD integration

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Modal stuck on save | Backend blockchain call timing out | Ensure blockchain.mock.enabled=true or Fabric middleware running |
| `window is not defined` build error | SSR code trying to access browser API | Add `if (typeof window === 'undefined') return;` guard in useEffect |
| 401 redirects | JWT expired or missing from localStorage | Check AuthContext initialization; re-login |
| PDF not uploading | Large file or network timeout | Check `max-request-size` in backend config |
| Excel parsing errors | Mismatched column headers | Verify template structure matches `BulkCourseRequestDto` |
