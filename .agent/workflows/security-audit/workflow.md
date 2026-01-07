---
name: security-audit
description: Step‑by‑step workflow to audit the codebase for security vulnerabilities (SQL injection, XSS, auth bypass), unused/duplicate code, and overall code quality without changing existing functionality.
---

# Security Audit Workflow

## Goal
Perform a comprehensive, non‑intrusive security review of the **docterbee_units** project while preserving all existing behavior.

## Prerequisites
1. **Node.js** (v18+ recommended) installed and available in `PATH`.
2. Internet access for downloading npm audit tools.
3. Optional but recommended: Docker (for isolated runtime scanning).

## Steps Overview
| Step | Description | Tool / Command |
|------|-------------|----------------|
| 1 | **Static Dependency Scan** – Identify vulnerable npm packages. | `npm audit --audit-level=high` |
| 2 | **License & Outdated Packages** – List outdated / risky licenses. | `npm outdated` & `npx license-checker --summary` |
| 3 | **Static Code Security Analysis** – Detect SQLi, XSS, unsafe eval, etc. | `npx semgrep --config p/owasp-top-ten` |
| 4 | **ESLint Security Rules** – Enforce best‑practice linting. | `npx eslint . --rule "no-eval: error" --rule "no-implied-eval: error"` |
| 5 | **Dead‑Code Detection** – Find unused functions / variables. | `npx depcheck` (for unused deps) and `npx ts-prune` (if TypeScript) or custom grep for `function` definitions not referenced. |
| 6 | **Duplicate Code Detection** – Locate copy‑pasted blocks. | `npx jscpd --min-lines 5 --min-tokens 70 .` |
| 7 | **Runtime OWASP ZAP Scan** – Dynamic analysis of the running server. | Run the backend (`npm run dev`), then `zap.sh -quickurl http://localhost:3000 -quickout zap-report.html` |
| 8 | **Authentication & Authorization Review** – Manual checklist of protected routes. | Review `backend/routes/*.mjs` for auth middleware usage. |
| 9 | **Content‑Security‑Policy (CSP) Review** – Ensure headers are set. | Search for `helmet` usage or manual header setting. |
|10 | **Report Generation** – Collate findings into `security-audit-report.md`. | Manual copy‑paste of tool outputs, then summarise. |

## Detailed Instructions

### 1️⃣ Dependency Vulnerability Scan
```bash
# Ensure you are in the project root
cd c:\Projek\docterbee_units
npm install   # install any missing deps
npm audit --audit-level=high > audits/high-vulns.txt
```
- Review `high-vulns.txt`. If any high‑severity issues appear, note the package name and version. **Do not upgrade yet**; just record.

### 2️⃣ License & Outdated Packages
```bash
npm outdated > audits/outdated.txt
npx license-checker --summary > audits/licenses.txt
```
- Outdated packages can hide security fixes. Record them for later upgrade.

### 3️⃣ Static Code Security (Semgrep)
```bash
npx semgrep --config p/owasp-top-ten --error > audits/semgrep.txt
```
- This scans for common OWASP Top‑10 patterns (SQLi, XSS, insecure deserialization, etc.).

### 4️⃣ ESLint Security Rules
If an ESLint config exists, extend it with `eslint-plugin-security`:
```bash
npm install --save-dev eslint-plugin-security
# Add to .eslintrc.json
#   "plugins": ["security"],
#   "extends": ["plugin:security/recommended"]
```
Then run:
```bash
npx eslint . --ext .js,.mjs > audits/eslint.txt
```
- Look for `no-eval`, `no-implied-eval`, `detect-non-literal-require`, etc.

### 5️⃣ Dead‑Code Detection
```bash
npx depcheck --skip-missing --ignore-dirs=node_modules > audits/depcheck.txt
```
- For JavaScript functions, you can grep for definitions and cross‑reference call sites:
```bash
grep -R "function " -n . > audits/functions.txt
# later compare with grep -R "functionName" -n .
```

### 6️⃣ Duplicate Code Detection (JSCPD)
```bash
npx jscpd --min-lines 5 --min-tokens 70 --output audits/jscpd-report.html .
```
- Open the HTML report to see duplicated blocks.

### 7️⃣ Dynamic OWASP ZAP Scan
1. Start the server (development mode):
```bash
npm run dev   # or the script defined in package.json
```
2. In another terminal, run ZAP (Docker example):
```bash
docker run -t owasp/zap2docker-stable zap.sh -quickurl http://host.docker.internal:3000 -quickout /zap/report.html
```
- Retrieve `report.html` from the container and place it in `audits/`.

### 8️⃣ Auth / Authorization Manual Review
- Open each route file (`backend/routes/*.mjs`). Verify that:
  - Sensitive endpoints (`/admin/*`, `/api/users/*`) include a middleware like `auth.verifyToken`.
  - Role checks (`if (req.user.role !== 'admin')`) are present where needed.
- Document any missing checks.

### 9️⃣ CSP & Helmet
Search for security‑related HTTP headers:
```bash
grep -R "helmet" -n backend
grep -R "Content-Security-Policy" -n .
```
- If missing, note that adding `helmet` is a best practice but **do not modify code** now.

### 🔟 Report Consolidation
Create `security-audit-report.md` at the project root with sections:
1. Summary of findings
2. High‑severity dependency issues
3. Code‑level vulnerabilities (SQLi, XSS, eval, etc.)
4. Unused code list
5. Duplicate code list
6. Auth/Authorization gaps
7. Recommendations (upgrade, add sanitization, add CSP, etc.)

---
**Important:** All commands above are **read‑only**; they do not modify source files. Run them in a terminal and capture the output files under `audits/` for later review.

---
*End of workflow.*
