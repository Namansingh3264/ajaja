# Architecture & Technical Decision Record

**Project:** Ajaia Docs — Lightweight Collaborative Document Workspace  
**Author:** Full Stack Product Engineer  
**Date:** October 2026  

---

## 1. Executive Summary & Product Prioritization

When building a productivity tool inspired by Google Docs within a strict 4–6 hour delivery window, the biggest trap is attempting to build a shallow, fragile real-time synchronization engine at the expense of core usability, persistence reliability, and clear permission boundaries.

### What Was Prioritized:
1. **Editing Quality Over Naive Real-time Sync:** Real-time collaboration without proper conflict resolution (OT or CRDTs) leads to keystroke loss and jarring cursor jumps. Instead, we prioritized a **rock-solid, polished rich-text editing experience** powered by TipTap (ProseMirror engine), featuring intuitive headings, lists, formatting, word counts, and debounced auto-save with instant `Ctrl+S` confirmation.
2. **Transparent, Demonstrable Sharing Model:** Built a strict role-based access control (RBAC) model with `owner`, `edit`, and `view` permissions. To ensure reviewers can verify cross-user permissions without registration barriers, we built an **instant User Switcher** seeded with Alice (Product Lead), Bob (Staff Engineer), and Charlie (Designer).
3. **Versatile File Ingestion:** Supported real-world document ingestion (`.docx` via `mammoth`, `.md` via `marked`, and `.txt`) with dual workflows: creating a new document from a file or inserting content into an active draft, plus document file attachments.
4. **Resilient, Zero-Dependency Persistence:** Used an atomic file-backed transactional store that writes through a temporary file and atomically renames. This guarantees zero write corruption, zero external database setup for reviewers, and seamless persistence across server restarts.

### What Was Intentionally Deprioritized (With Rationale):
- **Live Peer-to-Peer Cursor Indicators:** Implementing real-time cursors with naive WebSockets without CRDT convergence leads to corrupted documents. This was deprioritized in favor of version history snapshots and deterministic permissions.
- **Complex OAuth / Third-Party Auth:** Implementing Auth0 or Google OAuth adds credential setup friction for reviewers. Seeded simulated users provide 100% testability with zero configuration.
- **Complex Nested Folder Hierarchies:** Single-level categorized tagging (All, Owned, Shared) with full-text search provides superior clarity for the initial product slice.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js App Router                            │
│                                                                        │
│  ┌────────────────────────┐              ┌──────────────────────────┐  │
│  │   Document Dashboard   │              │     Document Editor      │  │
│  │  - Template Cards      │              │  - TipTap Canvas         │  │
│  │  - Filter Pills        │              │  - Sticky Toolbar        │  │
│  │  - Search Query        │              │  - Auto-save Pill        │  │
│  │  - Quick Share Modal   │              │  - Metrics & Status      │  │
│  └───────────┬────────────┘              └────────────┬─────────────┘  │
│              │                                        │                │
│              ▼                                        ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │     Client Providers: UserContext (Active User) & ToastContext   │  │
│  │     - Attaches 'x-user-id' header to all outgoing requests       │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   REST API Routes (/api/...)                     │  │
│  │  - GET/POST /api/documents                                       │  │
│  │  - GET/PUT/DELETE /api/documents/[id]                            │  │
│  │  - POST/DELETE /api/documents/[id]/share                         │  │
│  │  - POST/DELETE /api/documents/[id]/attachments                   │  │
│  │  - POST /api/documents/[id]/versions                             │  │
│  │  - POST /api/documents/import                                    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 Storage & Access Control Engine                  │  │
│  │  - Permission Enforcement (Owner vs Editor vs Viewer)            │  │
│  │  - Atomic File Transactions (.tmp + renameSync)                  │  │
│  │  - Automatic Seed Initializer (Alice, Bob, Charlie)              │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│                           data/storage.json                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model

### `User`
```typescript
interface User {
  id: string;        // 'usr_alice' | 'usr_bob' | 'usr_charlie'
  name: string;      // 'Alice Chen'
  email: string;     // 'alice@ajaia.internal'
  avatar: string;    // 'AC'
  role: string;      // 'Product Lead'
  color: string;     // Hex color token
}
```

### `DocumentItem`
```typescript
interface DocumentItem {
  id: string;
  title: string;
  content: string;             // Semantic HTML generated by ProseMirror/TipTap
  ownerId: string;             // References User.id
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
  lastEditedById: string;      // References User.id
  shares: DocumentShare[];     // List of collaborator permissions
  attachments: DocumentAttachment[];
  versions: DocumentVersion[]; // Snapshot history
  userPermission?: 'owner' | 'edit' | 'view'; // Evaluated at request time
}
```

### `DocumentShare`
```typescript
interface DocumentShare {
  id: string;
  documentId: string;
  userId: string;
  permission: 'edit' | 'view';
  sharedAt: string;
  sharedBy: string;
}
```

---

## 4. Access Control & Permission Enforcement

Access control is enforced on both frontend and backend layers:

| Action | Owner | Editor (`permission: 'edit'`) | Viewer (`permission: 'view'`) | Unauthorized User |
| :--- | :---: | :---: | :---: | :---: |
| **View Document** | ✅ | ✅ | ✅ | ❌ `404 / 403` |
| **Edit Content & Title** | ✅ | ✅ | ❌ `403 Forbidden` | ❌ `403 Forbidden` |
| **Invite Collaborator** | ✅ | ✅ | ❌ `403 Forbidden` | ❌ `403 Forbidden` |
| **Revoke Access** | ✅ | ❌ `403 Forbidden` | ❌ `403 Forbidden` | ❌ `403 Forbidden` |
| **Upload Attachments** | ✅ | ✅ | ❌ `403 Forbidden` | ❌ `403 Forbidden` |
| **Restore Version** | ✅ | ✅ | ❌ `403 Forbidden` | ❌ `403 Forbidden` |
| **Delete Document** | ✅ | ❌ `403 Forbidden` | ❌ `403 Forbidden` | ❌ `403 Forbidden` |

### Frontend Enforcement:
- When a document is loaded in `view` mode:
  - TipTap editor is set to `editable: false`.
  - The top toolbar displays a prominent **"View only"** banner with an eye icon.
  - Title editing is disabled.
  - Auto-save listeners are deactivated.

---

## 5. Persistence Strategy & Write Safety

Rather than using an unbuffered in-memory state or an external cloud database that could fail if credentials expire, the application implements an **atomic file persistence pattern**:

1. When a document is created or updated, the new state is serialized to a temporary file (`storage.json.tmp.<timestamp>`).
2. `fs.renameSync` is invoked to atomically replace the existing `storage.json`.
3. In POSIX and modern Windows NTFS environments, rename is an atomic filesystem operation. This prevents partial writes if the server is interrupted mid-write.

---

## 6. What We Would Build Next (Next 2–4 Hours)

If allocated an additional 2–4 hours of development time, the following high-impact additions would be built next:

1. **CRDT Real-Time Collaborative Editing via Yjs & WebSockets:**
   - Integrate `y-prosemirror` with a lightweight `y-websocket` server.
   - Display active user carets with custom name labels and avatar cursor flags.
2. **Inline Comments & Threading:**
   - Allow users to highlight arbitrary text ranges and attach discussion threads with `@mentions` and resolve checkmarks.
3. **Cloud Asset Storage for Attachments:**
   - Replace base64 data URLs with signed S3 / Cloudflare R2 upload URLs for large attachment scaling.
4. **Diff Highlighting in Version History:**
   - Render green (additions) and red (deletions) text diffs when scrubbing through historical checkpoints.
