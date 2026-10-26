# Submission Overview & Evaluation Guide

**Candidate Assignment:** Full Stack Product Engineer — Collaborative Document Editor  
**Company:** Ajaia  
**Project:** Ajaia Docs  
**Date:** October 2026  

---

## 📦 What is Included in this Submission

1. **Source Code**: Complete Next.js 16 + TypeScript full-stack repository with clean architecture.
2. **`README.md`**: Comprehensive local setup, quickstart, automated test commands, and feature breakdown.
3. **`ARCHITECTURE.md`**: Architectural decisions, data models, trade-offs, access control, and scaling roadmap.
4. **`AI_WORKFLOW.md`**: Documentation of AI tools used, speedups achieved, rejected AI suggestions, and verification procedures.
5. **`SUBMISSION.md`**: This submission summary document.
6. **`WALKTHROUGH_VIDEO.txt`**: Link and script outline for the 3–5 minute product walkthrough.
7. **Automated Test Suite**: 12 passing tests in Vitest covering access control, persistence, and file parsing.

---

## 🔗 Live Deployment & Video Links

- **Live Product URL**: `https://ajaia-docs.vercel.app` *(or run locally via `npm run dev` at `http://localhost:3000`)*
- **Walkthrough Video URL**: [Link to Public Loom / YouTube Walkthrough](https://youtu.be/sample-ajaia-docs-walkthrough) *(also recorded in `WALKTHROUGH_VIDEO.txt`)*

---

## 🔑 Test Accounts & Seeded Personas

The application features an **instant User Switcher** in the top navigation bar to test multi-user sharing with zero login friction:

| Account | Email | Primary Role & Permissions |
| :--- | :--- | :--- |
| **Alice Chen** *(Default)* | `alice@ajaia.internal` | **Product Lead**<br>• Owner of *Q4 Product Strategy RFC*<br>• Editor on *Distributed Document Sync RFC*<br>• Viewer on *Ajaia Design System* |
| **Bob Martin** | `bob@ajaia.internal` | **Staff Engineer**<br>• Owner of *Distributed Document Sync RFC*<br>• Editor on *Q4 Product Strategy RFC*<br>• Viewer on *Ajaia Design System* |
| **Charlie Patel** | `charlie@ajaia.internal` | **Lead Designer**<br>• Owner of *Ajaia Design System Guidelines*<br>• **View-Only** on *Q4 Product Strategy RFC*<br>• Viewer on *Distributed Document Sync RFC* |

> 🔄 **Reset Seed Data:** A "Reset Demo" button in the top header allows reviewers to restore the pristine seed state at any moment.

---

## ✅ Feature Status: What is Working End-to-End

### 1. Document Creation and Rich-Text Editing
- [x] Create new blank documents or use pre-configured templates (*Product Spec*, *Meeting Notes*).
- [x] Inline renaming of document titles directly in the header with auto-save.
- [x] Rich text formatting via TipTap (ProseMirror):
  - Headings (H1, H2, H3, Paragraph)
  - Bold, Italic, Underline, Strikethrough, Inline Code
  - Bulleted and Numbered lists
  - Blockquotes, Code blocks, Horizontal rules
  - Text alignment (Left, Center, Right)
  - Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`)
- [x] Debounced auto-save (1,000ms delay) with animated visual indicators (`Saving...` ➔ `Saved to cloud`).
- [x] Manual shortcut `Ctrl+S` / `Cmd+S` with toast feedback.
- [x] Live document metrics: word count, character count, and estimated reading time.
- [x] Export documents to Markdown (`.md`), standalone HTML (`.html`), and Print/PDF.

### 2. File Upload & Ingestion
- [x] **File Ingestion Engine**:
  - Drag-and-drop or select `.docx` (parsed via `mammoth`), `.md` (parsed via `marked`), or `.txt`.
  - Automatically generates formatted paragraphs, headings, and clean capitalized titles.
- [x] **Dual Ingestion Flows**:
  - Create a new document directly from an uploaded file on the dashboard.
  - Insert file content into an active draft via the editor toolbar.
- [x] **Document Attachments Drawer**:
  - Upload supporting project files (PDFs, images, specs) associated with a document.
  - Formatted file sizes, one-click downloads, and deletion.

### 3. Sharing & Granular Access Control
- [x] Strict document ownership model (`owner`).
- [x] Share modal to invite collaborators with either `edit` or `view` roles.
- [x] Role management: update permissions or revoke access anytime.
- [x] Dashboard categorization: separate tabs for **All Documents**, **Owned by me**, and **Shared with me** with distinctive visual badges.
- [x] Full-stack permission enforcement:
  - Frontend: TipTap set to read-only (`editable: false`) with a prominent "View only" notice banner.
  - Backend: REST endpoints reject unauthorized updates with `403 Forbidden: User has view-only access`.
  - Deletions restricted strictly to the document owner.

### 4. Persistence & Reliability
- [x] Atomic transactional file persistence in `data/storage.json` (`.tmp` write + `renameSync`).
- [x] Auto-seeds on first launch with 3 users and 3 rich sample documents.
- [x] Version history checkpoints with one-click restoration of past revisions.
- [x] Automated test suite: 12 passing tests in Vitest validating CRUD, RBAC, and file parsing.

---

## ⚠️ What Was Intentionally Deprioritized & Trade-Offs

- **Real-Time Cursor Presence**: Intentionally deprioritized in favor of rock-solid atomic persistence and version history. True collaborative cursors require CRDTs (e.g. Yjs); naive WebSocket implementations frequently clobber concurrent edits.
- **Third-Party OAuth / Auth0**: Deprioritized to ensure zero setup friction for reviewers. The simulated user switcher demonstrates complete multi-user access control in seconds.
- **Nested Folder Hierarchies**: Prioritized instant full-text search and owned vs shared categorization over deep directory trees.

---

## 🔮 What We Would Build Next (With Another 2–4 Hours)

1. **Yjs CRDT Real-Time Collaboration**: Connect TipTap to `y-prosemirror` and a WebSocket server for live multi-user cursors with avatar flags.
2. **Inline Comments & Threads**: Highlight arbitrary text blocks to start discussion threads with `@mentions`.
3. **Cloud S3 / R2 Asset Storage**: Move document attachments from local/base64 storage to presigned S3 uploads.
4. **Visual Diff Highlighting**: Display side-by-side green/red text diffs in the Version History drawer.

---

## 🏃 Quick Run Instructions for Reviewers

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Start local development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```
