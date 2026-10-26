# AI-Native Workflow & Engineering Methodology

**Role:** Full Stack Product Engineer  
**Project:** Ajaia Docs  
**Date:** October 2026  

---

## 1. Overview of AI Tooling Used

In this project, AI was utilized as an **accelerator for high-velocity scaffolding, boilerplate elimination, and test generation**, while engineering judgment was strictly retained for architecture, data modeling, security boundaries, and UX cohesion.

- **Primary AI Assistant:** Antigravity AI (powered by Gemini / Claude models for pair programming)
- **Use Cases:**
  - Fast TypeScript data model drafting
  - TipTap extension integration and custom CSS design system synthesis
  - Comprehensive automated unit test generation in Vitest
  - File parser AST translation (`mammoth` and `marked` configuration)

---

## 2. Where AI Materially Sped Up the Work

1. **Rich Text Formatting & TipTap Configuration (Saved ~60 minutes):**
   - Configuring headless TipTap extensions (StarterKit, Underline, TextAlign, Placeholder) with React 19 typically involves navigating API changes across major library versions. AI generated the initial wrapper and keyboard event listeners (`Ctrl+S`, `Ctrl+Z`, `Ctrl+Y`) in minutes.
2. **Multi-Format File Parser (Saved ~45 minutes):**
   - Writing the unified ingestion logic for `.docx` (via `mammoth`), `.md` (via `marked`), and `.txt` with automatic title extraction, capitalized formatting, and error handling was completed in a single pass.
3. **Comprehensive Vitest Test Suite (Saved ~45 minutes):**
   - Rapidly scaffolded 12 comprehensive test assertions covering access control boundaries, unauthorized write rejections (`403 Forbidden`), file ingestion, and version rollback.
4. **CSS Token & Layout System (Saved ~40 minutes):**
   - Produced modern, bespoke CSS tokens without Tailwind, featuring subtle paper shadows, responsive canvas padding, and glassmorphic toolbars.

---

## 3. What AI-Generated Output Was Changed or Rejected

True engineering judgment requires knowing when AI suggestions are sub-optimal, fragile, or architecturally flawed. Key decisions to reject or modify AI outputs included:

### 1. Rejecting Naive In-Memory Database
- **Initial AI Output:** Proposed keeping documents in a simple module-level JavaScript array (`let docs = []`).
- **Engineering Rejection:** An in-memory array loses all changes whenever Next.js restarts or hot-reloads during review.
- **Correction:** Implemented an **atomic filesystem persistence engine** using temporary files (`.tmp`) and `fs.renameSync` to guarantee ACID-like atomic writes that persist across browser refreshes and server reboots.

### 2. Fixing Server-Side Node.js `fs` Leak into Client Components
- **Initial AI Output:** Imported `SEED_USERS` directly from `src/lib/storage.ts` into the client-side `UserContext.tsx`.
- **Engineering Rejection:** Turbopack immediately flagged a build error (`Module not found: Can't resolve 'fs'`), because `storage.ts` imports Node.js `fs` which cannot be bundled into client browser components.
- **Correction:** Separated client-safe constants into `src/lib/constants.ts`, ensuring strict separation between Node.js server persistence and React client state.

### 3. Rejecting Flaky WebSocket Real-Time Mock
- **Initial AI Output:** Suggested adding a naive WebSocket broadcast for real-time cursor tracking.
- **Engineering Rejection:** Without a proper CRDT (Yjs/Automerge) or Operational Transformation engine, naive WebSocket broadcasts cause keystroke desynchronization and data loss during concurrent edits.
- **Correction:** Prioritized high-fidelity debounced auto-save, atomic snapshots, and version history checkpoints over a buggy live-cursor prototype.

### 4. Overriding Next.js 16 Experimental Cache Config
- **Initial AI Output:** `create-next-app 16` enabled experimental `cacheComponents` and `partialPrefetching` flags that conflicted with dynamic route segment configs (`export const dynamic = 'force-dynamic'`).
- **Engineering Rejection:** Build worker failed when prerendering dynamic `/documents/[id]`.
- **Correction:** Cleaned up `next.config.ts` to standard production configuration and wrapped the client route with `<Suspense>`, achieving a clean 0-error build.

---

## 4. Verification Methodology: Ensuring Correctness & Reliability

To ensure that the shipped software met rigorous engineering standards:

1. **Automated Vitest Suite:**
   - 12 unit and integration tests passing in under 600ms (`npm test`).
   - Specifically verified that unauthorized users cannot edit (`403 Forbidden`) or delete documents owned by others.
2. **Production Build Validation:**
   - Verified with `npm run build` using Turbopack to ensure all TypeScript types, route handlers, and server/client boundaries compile cleanly.
3. **End-to-End API Verification:**
   - Scripted HTTP verification across `/api/users`, `/api/documents`, `/api/documents/[id]`, `/api/documents/import`, and `/api/seed`.
   - Verified that uploading a real `.md` file parses headers, lists, and returns a newly created document.
4. **UX & State Polish:**
   - Tested debounced auto-saving, toast alerts, collaborator badges, and instant user switching between Alice, Bob, and Charlie.
