# Ajaia Docs — Collaborative Document Workspace

> A lightweight, modern collaborative document editor inspired by Google Docs and built for team productivity. Combines rich text formatting, file ingestion (`.docx`, `.md`, `.txt`), atomic persistence, granular sharing permissions (`owner`, `edit`, `view`), and simulated multi-user switching.

---

## 🚀 Live Demo & Quickstart

- **Live URL**: Deployed to Vercel / accessible at `http://localhost:3000`
- **Stack**: Next.js 16 (App Router), TypeScript, TipTap (ProseMirror engine), Mammoth (.docx parser), Marked (.md parser), Lucide Icons, Vitest

### 1. Prerequisites
- **Node.js**: `v18+` (Tested on `v22.14.0`)
- **npm**: `v9+`

### 2. Local Setup
```bash
# Clone the repository
git clone https://github.com/Namansingh3264/ajaja.git
cd ajaja

# Install dependencies
npm install

# Run automated tests
npm test

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The workspace automatically initializes with sample data.

---

## 👥 Seeded Reviewer Accounts & User Switcher

To make reviewing painless without requiring external email signups or OTP friction, the application includes an **instant User Switcher** in the top navigation bar.

| User | Email | Role | Document Permissions in Seed Data |
| :--- | :--- | :--- | :--- |
| **Alice Chen** *(Default)* | `alice@ajaia.internal` | Product Lead | **Owner** of *Q4 Product Strategy RFC*<br>• Editor on *Distributed Sync RFC*<br>• Viewer on *Design System* |
| **Bob Martin** | `bob@ajaia.internal` | Staff Engineer | **Owner** of *Distributed Document Sync RFC*<br>• Editor on *Q4 Product Strategy RFC*<br>• Viewer on *Design System* |
| **Charlie Patel** | `charlie@ajaia.internal` | Lead Designer | **Owner** of *Ajaia Design System Guidelines*<br>• **View-Only** on *Q4 Product Strategy RFC*<br>• Viewer on *Distributed Sync RFC* |

> 💡 **Try this 30-second review test:**
> 1. Start as **Alice Chen**: Open *Q4 Product Strategy RFC*. Notice you have full edit controls and an "Owner" badge.
> 2. Click the User Switcher in the top right and select **Charlie Patel**.
> 3. Observe the dashboard badge for *Q4 Product Strategy RFC* instantly change to **Can view**.
> 4. Open the document: An amber **"View only"** banner appears, toolbar editing is disabled, and any attempted edits return `403 Forbidden` from the server.
> 5. Switch to **Bob Martin**: He has **Can edit** access and can edit and save changes.

---

## ✨ Core Capabilities

### 1. Document Creation and Rich-Text Editing
- **Creation & Templates**: Create blank documents or start from pre-built templates (*Product Feature Spec*, *Meeting Notes*).
- **Inline Renaming**: Click the document title in the header to rename with instant keyboard confirmation (`Enter` or click outside).
- **Rich-Text Formatting**:
  - Headings (H1, H2, H3, Paragraph)
  - Bold, Italic, Underline, Strikethrough, Inline Code
  - Bulleted and Numbered lists
  - Blockquotes, Code blocks, Horizontal divider lines
  - Text alignment (Left, Center, Right)
  - Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`)
- **Persistence & Auto-Save**:
  - Debounced auto-save (1,000ms after user pauses typing)
  - Visual status pill: `Saving...` (spinner) ➔ `Saved to cloud` (green checkmark)
  - Keyboard shortcut `Ctrl+S` / `Cmd+S` for manual instant save
- **Document Metrics**: Real-time word count, character count, and estimated reading time.

### 2. File Ingestion & Upload
- **Supported Formats**:
  - **Microsoft Word (`.docx`)**: Parsed via `mammoth` into clean semantic HTML headings, paragraphs, and formatting.
  - **Markdown (`.md`)**: Parsed via `marked` with GitHub Flavored Markdown (GFM) support.
  - **Plain Text (`.txt`)**: Converted into formatted paragraphs.
- **Import Workflows**:
  - **Dashboard Import**: Drag & drop or pick any `.docx`, `.md`, or `.txt` file to instantly create a new editable document.
  - **Draft Import**: Inside the editor, click "Import File" to insert content from external files directly into the active document.
- **Document Attachments**: Dedicated drawer allowing users to attach supporting assets (PDFs, diagrams, specs) with file size formatting, preview, and download.

### 3. Sharing & Access Control Model
- **Roles**:
  - `owner`: Full privileges (edit, rename, share, delete document, restore versions).
  - `edit`: Collaborator with full editing and attachment privileges. Cannot delete the document.
  - `view`: Read-only collaborator. Cannot edit, rename, save, or delete.
- **Dashboard Separation**: Dedicated filter tabs for **All Documents**, **Owned by me**, and **Shared with me** with distinctive visual badges.
- **Collaborator Management**: Open the **Share** modal to invite team members with specific roles, change existing permissions, copy shareable links, or revoke access.

### 4. Persistence & Reliability
- **Atomic File Store**: Server-side transactional JSON storage with atomic rename semantics (`.tmp` write followed by `renameSync`) to eliminate partial write corruption.
- **Version Checkpoints**: Automatic snapshots captured during editing milestones, with a **Version History** drawer enabling one-click restoration of previous states.
- **Workspace Reset**: "Reset Demo" button in the navbar instantly restores clean initial seed data for test repeatability.

---

## 🧪 Automated Testing

A comprehensive test suite powered by **Vitest** validates both core business logic and file parsing:

```bash
npm test
```

### Test Coverage Highlights:
- `src/__tests__/storage.test.ts`:
  - Seed user verification
  - Document creation and initial version checkpointing
  - Owned vs shared document partitioning
  - View-only permission enforcement (asserting `403 Forbidden` on unauthorized edits)
  - Authorized editor update execution
  - Sharing lifecycle (invite collaborator, verify access, revoke access)
  - Ownership protection against unauthorized document deletion
  - Historical version snapshot restoration
- `src/__tests__/fileParser.test.ts`:
  - Title extraction and capitalization from filenames
  - Markdown AST to HTML parsing (headings, lists, blockquotes, bold/italic)
  - Plain text paragraph conversion
  - Rejection of invalid/unsupported file formats

---

## 📁 Repository Structure

```
├── data/
│   └── storage.json               # Persistent document & sharing database
├── src/
│   ├── __tests__/                 # Vitest test suite
│   │   ├── fileParser.test.ts
│   │   └── storage.test.ts
│   ├── app/
│   │   ├── api/                   # REST API routes
│   │   │   ├── documents/         # List & create documents
│   │   │   │   ├── [id]/          # Get, update, delete document
│   │   │   │   │   ├── attachments/
│   │   │   │   │   ├── share/
│   │   │   │   │   └── versions/
│   │   │   │   └── import/        # File ingestion (.docx, .md, .txt)
│   │   │   ├── seed/              # Reset demo data endpoint
│   │   │   └── users/             # User list endpoint
│   │   ├── documents/[id]/        # Document editor dynamic route
│   │   ├── globals.css            # Modern design system & typography tokens
│   │   ├── layout.tsx             # Root layout with user & toast providers
│   │   └── page.tsx               # Main dashboard route
│   ├── components/
│   │   ├── AttachmentsDrawer.tsx  # Document attachments panel
│   │   ├── DocumentDashboard.tsx  # Dashboard, filters, templates, search
│   │   ├── DocumentEditor.tsx     # TipTap editor integration & auto-save
│   │   ├── EditorToolbar.tsx      # Google Docs-style rich formatting bar
│   │   ├── FileUploadModal.tsx    # Drag-and-drop file upload dialog
│   │   ├── Navbar.tsx             # Breadcrumbs, save status, user switcher
│   │   ├── ShareModal.tsx         # Role management & invite modal
│   │   └── VersionHistoryDrawer.tsx # Revision timeline & restoration
│   ├── context/
│   │   ├── ToastContext.tsx       # Toast notifications
│   │   └── UserContext.tsx        # Active user state & authenticated fetch
│   ├── lib/
│   │   ├── constants.ts           # Client-safe seed definitions
│   │   ├── fileParser.ts          # .docx, .md, and .txt parsing engine
│   │   └── storage.ts             # Atomic filesystem storage & ACL engine
│   └── types/
│       └── index.ts               # Core TypeScript definitions
├── ARCHITECTURE.md                # System design, trade-offs, and scaling roadmap
├── AI_WORKFLOW.md                 # AI tooling documentation and verification
└── SUBMISSION.md                  # Comprehensive deliverables checklist
```

---

## 🚢 Deployment

The project is configured for one-click deployment on **Vercel**:
```bash
# Build the project locally to verify production readiness
npm run build

# Deploy via Vercel CLI
npx vercel
```
*Environment variables*: None required. Runs out-of-the-box with zero third-party service dependencies.
