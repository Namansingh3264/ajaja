import fs from 'fs';
import path from 'path';
import { User, DocumentItem, StorageData, PermissionRole, DocumentShare, DocumentAttachment, DocumentVersion } from '@/types';
import { SEED_USERS } from '@/lib/constants';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'storage.json');

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_product_strategy',
    title: 'Q4 Product Strategy & Collaborative Workspace RFC',
    content: `<h1>Q4 Product Strategy: Next-Generation Collaborative Docs</h1>
<p>Welcome to the <strong>Ajaia Collaborative Editor</strong> specification document. This document outlines our product vision, core customer pain points, and engineering execution roadmap for Q4.</p>
<h2>1. Executive Summary</h2>
<p>Modern knowledge workers switch between too many fragmented tools. Our mission is to build a <em>blazing-fast, distraction-free document editor</em> that combines the real-time fluidity of Google Docs with the modern aesthetic and modularity of Notion.</p>
<h2>2. Key Pillars</h2>
<ul>
<li><strong>Frictionless Creation:</strong> Zero loading delay, instant local-first debounced auto-save, and markdown/docx file ingestion.</li>
<li><strong>Granular Collaboration:</strong> Transparent document sharing with distinct <code>owner</code>, <code>edit</code>, and <code>view</code> permission boundaries.</li>
<li><strong>Rich Formatting Engine:</strong> Headings, rich lists, quotes, inline code styling, and clean document export (Markdown, HTML, PDF).</li>
</ul>
<h2>3. Immediate Milestones</h2>
<ol>
<li>Finalize cross-organization permission matrix (Alice & Bob).</li>
<li>Support drag-and-drop file imports for legacy document archives.</li>
<li>Implement version snapshot recovery for asynchronous audit trails.</li>
</ol>
<blockquote><p>"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra</p></blockquote>
<p>Feel free to leave edits or review the permissions in the top right menu.</p>`,
    ownerId: 'usr_alice',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastEditedById: 'usr_alice',
    shares: [
      {
        id: 'share_1',
        documentId: 'doc_product_strategy',
        userId: 'usr_bob',
        permission: 'edit',
        sharedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        sharedBy: 'usr_alice',
      },
      {
        id: 'share_2',
        documentId: 'doc_product_strategy',
        userId: 'usr_charlie',
        permission: 'view',
        sharedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        sharedBy: 'usr_alice',
      },
    ],
    attachments: [
      {
        id: 'att_1',
        name: 'q4_roadmap_architecture.pdf',
        size: 245100,
        type: 'application/pdf',
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        uploadedBy: 'usr_alice',
      },
    ],
    versions: [
      {
        id: 'ver_init_1',
        savedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        savedById: 'usr_alice',
        savedByName: 'Alice Chen',
        title: 'Q4 Product Strategy Draft',
        content: `<h1>Q4 Product Strategy Draft</h1><p>Initial draft created for internal review.</p>`,
        summary: 'Initial document draft',
      },
    ],
  },
  {
    id: 'doc_sync_rfc',
    title: 'Distributed Document Sync & Conflict Resolution RFC',
    content: `<h1>Distributed Document Sync & CRDT Strategy</h1>
<p><strong>Author:</strong> Bob Martin (Staff Engineer)</p>
<p>This technical RFC analyzes our state persistence model and outlines the convergence guarantees required for multi-client editing.</p>
<h2>1. Problem Statement</h2>
<p>When multiple users edit a document concurrently, naive last-write-wins (LWW) strategies can cause keystroke clobbering. We are evaluating structured state synchronization:</p>
<ul>
<li><strong>Operational Transformation (OT):</strong> Traditional centralized server model used by Google Docs.</li>
<li><strong>Conflict-free Replicated Data Types (CRDTs):</strong> Peer-to-peer mergeable data types (e.g. Yjs / Automerge).</li>
</ul>
<h2>2. Technical Architecture</h2>
<p>For this product slice, we utilize atomic filesystem transactions with millisecond revision watermarks, paired with client-side optimistic updates and debounced synchronization.</p>
<pre><code>// Example State Snapshot Verification
interface DocumentState {
  revisionId: number;
  contentHash: string;
  lastEditor: string;
}</code></pre>
<h2>3. Recommendations</h2>
<p>Implement atomic write-ahead logs (WAL) to guarantee document integrity even during unexpected server restarts.</p>`,
    ownerId: 'usr_bob',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastEditedById: 'usr_bob',
    shares: [
      {
        id: 'share_3',
        documentId: 'doc_sync_rfc',
        userId: 'usr_alice',
        permission: 'edit',
        sharedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        sharedBy: 'usr_bob',
      },
    ],
    attachments: [],
    versions: [],
  },
  {
    id: 'doc_design_system',
    title: 'Ajaia Design System & Brand Guidelines',
    content: `<h1>Ajaia Design System & Visual Tokens</h1>
<p><strong>Author:</strong> Charlie Patel (Lead Designer)</p>
<p>These design specifications ensure visual consistency, readability, and accessibility across all productivity tools in the Ajaia workspace.</p>
<h2>1. Core Typography</h2>
<p>We use <strong>Inter</strong> for UI and body text, and <strong>JetBrains Mono</strong> for code blocks and monospace tokens.</p>
<h2>2. Color Palette</h2>
<ul>
<li><strong>Primary Indigo:</strong> <code>#4F46E5</code> — Primary interactions, focus rings, callouts.</li>
<li><strong>Neutral Slate:</strong> <code>#0F172A</code> to <code>#F8FAFC</code> — High contrast text and warm canvas backdrops.</li>
<li><strong>Emerald Success:</strong> <code>#10B981</code> — Confirmed auto-save and sync checkmarks.</li>
<li><strong>Amber Warning:</strong> <code>#F59E0B</code> — Unsaved changes or view-only mode notices.</li>
</ul>
<h2>3. Surface Elevation & Shadows</h2>
<p>Documents sit on an elevated page card (816px standard width) with a subtle multi-layered diffuse shadow to evoke physical paper while maintaining modern digital lightness.</p>`,
    ownerId: 'usr_charlie',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    lastEditedById: 'usr_charlie',
    shares: [
      {
        id: 'share_4',
        documentId: 'doc_design_system',
        userId: 'usr_alice',
        permission: 'view',
        sharedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        sharedBy: 'usr_charlie',
      },
      {
        id: 'share_5',
        documentId: 'doc_design_system',
        userId: 'usr_bob',
        permission: 'view',
        sharedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        sharedBy: 'usr_charlie',
      },
    ],
    attachments: [],
    versions: [],
  },
];

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStorage(): StorageData {
  ensureDataDir();
  if (!fs.existsSync(STORAGE_FILE)) {
    const initialData: StorageData = {
      users: SEED_USERS,
      documents: INITIAL_DOCUMENTS,
    };
    writeStorage(initialData);
    return initialData;
  }

  try {
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as StorageData;
    // Guarantee users list includes seeded users
    const userMap = new Map<string, User>();
    SEED_USERS.forEach((u) => userMap.set(u.id, u));
    (parsed.users || []).forEach((u) => userMap.set(u.id, u));
    parsed.users = Array.from(userMap.values());
    if (!parsed.documents) parsed.documents = [];
    return parsed;
  } catch (err) {
    console.error('Failed reading storage, resetting to seed data:', err);
    const initialData: StorageData = {
      users: SEED_USERS,
      documents: INITIAL_DOCUMENTS,
    };
    writeStorage(initialData);
    return initialData;
  }
}

function writeStorage(data: StorageData): void {
  ensureDataDir();
  // Atomic write using temp file to prevent partial file corruption
  const tempPath = `${STORAGE_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, STORAGE_FILE);
}

// User operations
export function getUsers(): User[] {
  const data = readStorage();
  return data.users;
}

export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.id === id);
}

// Permission checking helper
export function getDocumentPermission(doc: DocumentItem, userId: string): PermissionRole | null {
  if (!userId) return null;
  if (doc.ownerId === userId) return 'owner';
  const share = (doc.shares || []).find((s) => s.userId === userId);
  if (share) return share.permission;
  return null;
}

// Enrich document with user objects and current user's permission
function enrichDocument(doc: DocumentItem, currentUserId?: string): DocumentItem {
  const users = getUsers();
  const userMap = new Map(users.map((u) => [u.id, u]));

  const enriched: DocumentItem = {
    ...doc,
    owner: userMap.get(doc.ownerId),
    lastEditedBy: doc.lastEditedById ? userMap.get(doc.lastEditedById) : undefined,
    shares: (doc.shares || []).map((s) => ({
      ...s,
      user: userMap.get(s.userId),
    })),
    attachments: doc.attachments || [],
    versions: doc.versions || [],
  };

  if (currentUserId) {
    enriched.userPermission = getDocumentPermission(doc, currentUserId) || undefined;
  }

  return enriched;
}

// Document operations
export function getDocumentsForUser(userId: string): { owned: DocumentItem[]; shared: DocumentItem[]; all: DocumentItem[] } {
  const data = readStorage();
  const userDocs = data.documents.filter((doc) => {
    if (doc.ownerId === userId) return true;
    return (doc.shares || []).some((s) => s.userId === userId);
  });

  const enriched = userDocs.map((d) => enrichDocument(d, userId));
  const owned = enriched.filter((d) => d.ownerId === userId);
  const shared = enriched.filter((d) => d.ownerId !== userId);

  return { owned, shared, all: enriched };
}

export function getDocumentById(id: string, currentUserId?: string): DocumentItem | null {
  const data = readStorage();
  const doc = data.documents.find((d) => d.id === id);
  if (!doc) return null;

  // Check access if userId provided
  if (currentUserId) {
    const permission = getDocumentPermission(doc, currentUserId);
    if (!permission) return null; // Unauthorized to view
  }

  return enrichDocument(doc, currentUserId);
}

export function createDocument({
  title,
  content,
  ownerId,
}: {
  title: string;
  content: string;
  ownerId: string;
}): DocumentItem {
  const data = readStorage();
  const user = getUserById(ownerId);
  const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newDoc: DocumentItem = {
    id,
    title: title.trim() || 'Untitled document',
    content: content || '<p></p>',
    ownerId,
    createdAt: now,
    updatedAt: now,
    lastEditedById: ownerId,
    shares: [],
    attachments: [],
    versions: [
      {
        id: `ver_${Date.now()}`,
        savedAt: now,
        savedById: ownerId,
        savedByName: user ? user.name : 'Unknown User',
        title: title.trim() || 'Untitled document',
        content: content || '<p></p>',
        summary: 'Document created',
      },
    ],
  };

  data.documents.unshift(newDoc);
  writeStorage(data);
  return enrichDocument(newDoc, ownerId);
}

export function updateDocument(
  id: string,
  userId: string,
  updates: { title?: string; content?: string }
): DocumentItem | null {
  const data = readStorage();
  const docIndex = data.documents.findIndex((d) => d.id === id);
  if (docIndex === -1) return null;

  const doc = data.documents[docIndex];
  const permission = getDocumentPermission(doc, userId);
  if (!permission || permission === 'view') {
    throw new Error('Forbidden: User has view-only access');
  }

  const user = getUserById(userId);
  const now = new Date().toISOString();
  let hasContentChanged = false;

  if (updates.title !== undefined && updates.title !== doc.title) {
    doc.title = updates.title.trim() || 'Untitled document';
  }

  if (updates.content !== undefined && updates.content !== doc.content) {
    doc.content = updates.content;
    hasContentChanged = true;
  }

  doc.updatedAt = now;
  doc.lastEditedById = userId;

  // Add version snapshot periodically or if content changed significantly
  if (hasContentChanged) {
    if (!doc.versions) doc.versions = [];
    const lastVersion = doc.versions[doc.versions.length - 1];
    // Create new version if no previous version or at least 5 minutes since last version
    const fiveMinutes = 5 * 60 * 1000;
    const shouldAddVersion =
      !lastVersion ||
      Date.now() - new Date(lastVersion.savedAt).getTime() > fiveMinutes;

    if (shouldAddVersion) {
      doc.versions.push({
        id: `ver_${Date.now()}`,
        savedAt: now,
        savedById: userId,
        savedByName: user ? user.name : 'Collaborator',
        title: doc.title,
        content: doc.content,
        summary: `Edit by ${user ? user.name : 'collaborator'}`,
      });
      // Keep maximum 25 recent versions
      if (doc.versions.length > 25) {
        doc.versions = doc.versions.slice(-25);
      }
    }
  }

  data.documents[docIndex] = doc;
  writeStorage(data);
  return enrichDocument(doc, userId);
}

export function deleteDocument(id: string, userId: string): boolean {
  const data = readStorage();
  const doc = data.documents.find((d) => d.id === id);
  if (!doc) return false;

  // Only the document owner can delete the document
  if (doc.ownerId !== userId) {
    throw new Error('Forbidden: Only the document owner can delete this document');
  }

  data.documents = data.documents.filter((d) => d.id !== id);
  writeStorage(data);
  return true;
}

export function shareDocument(
  id: string,
  userId: string,
  targetUserId: string,
  permission: 'edit' | 'view'
): DocumentItem | null {
  const data = readStorage();
  const docIndex = data.documents.findIndex((d) => d.id === id);
  if (docIndex === -1) return null;

  const doc = data.documents[docIndex];
  const userPerm = getDocumentPermission(doc, userId);
  // Only owner or existing editor can share
  if (!userPerm || userPerm === 'view') {
    throw new Error('Forbidden: You need edit or owner permissions to share this document');
  }

  if (targetUserId === doc.ownerId) {
    throw new Error('Target user is already the owner of this document');
  }

  if (!doc.shares) doc.shares = [];
  const existingShareIndex = doc.shares.findIndex((s) => s.userId === targetUserId);

  if (existingShareIndex >= 0) {
    doc.shares[existingShareIndex].permission = permission;
  } else {
    const newShare: DocumentShare = {
      id: `share_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      documentId: id,
      userId: targetUserId,
      permission,
      sharedAt: new Date().toISOString(),
      sharedBy: userId,
    };
    doc.shares.push(newShare);
  }

  data.documents[docIndex] = doc;
  writeStorage(data);
  return enrichDocument(doc, userId);
}

export function removeShare(id: string, userId: string, targetUserId: string): DocumentItem | null {
  const data = readStorage();
  const docIndex = data.documents.findIndex((d) => d.id === id);
  if (docIndex === -1) return null;

  const doc = data.documents[docIndex];
  // Only owner can remove collaborators
  if (doc.ownerId !== userId) {
    throw new Error('Forbidden: Only the document owner can remove collaborators');
  }

  doc.shares = (doc.shares || []).filter((s) => s.userId !== targetUserId);
  data.documents[docIndex] = doc;
  writeStorage(data);
  return enrichDocument(doc, userId);
}

export function addAttachment(
  id: string,
  userId: string,
  attachment: Omit<DocumentAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>
): DocumentItem | null {
  const data = readStorage();
  const docIndex = data.documents.findIndex((d) => d.id === id);
  if (docIndex === -1) return null;

  const doc = data.documents[docIndex];
  const perm = getDocumentPermission(doc, userId);
  if (!perm || perm === 'view') {
    throw new Error('Forbidden: You need edit or owner permissions to attach files');
  }

  if (!doc.attachments) doc.attachments = [];
  const newAttachment: DocumentAttachment = {
    ...attachment,
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId,
  };

  doc.attachments.push(newAttachment);
  data.documents[docIndex] = doc;
  writeStorage(data);
  return enrichDocument(doc, userId);
}

export function removeAttachment(
  id: string,
  userId: string,
  attachmentId: string
): DocumentItem | null {
  const data = readStorage();
  const docIndex = data.documents.findIndex((d) => d.id === id);
  if (docIndex === -1) return null;

  const doc = data.documents[docIndex];
  const perm = getDocumentPermission(doc, userId);
  if (!perm || perm === 'view') {
    throw new Error('Forbidden: You need edit or owner permissions to remove attachments');
  }

  doc.attachments = (doc.attachments || []).filter((a) => a.id !== attachmentId);
  data.documents[docIndex] = doc;
  writeStorage(data);
  return enrichDocument(doc, userId);
}

export function restoreVersion(id: string, userId: string, versionId: string): DocumentItem | null {
  const data = readStorage();
  const docIndex = data.documents.findIndex((d) => d.id === id);
  if (docIndex === -1) return null;

  const doc = data.documents[docIndex];
  const perm = getDocumentPermission(doc, userId);
  if (!perm || perm === 'view') {
    throw new Error('Forbidden: You need edit or owner permissions to restore versions');
  }

  const version = (doc.versions || []).find((v) => v.id === versionId);
  if (!version) {
    throw new Error('Version not found');
  }

  const user = getUserById(userId);
  const now = new Date().toISOString();

  // Create a backup snapshot of current before restoring
  doc.versions.push({
    id: `ver_${Date.now()}`,
    savedAt: now,
    savedById: userId,
    savedByName: user ? user.name : 'Collaborator',
    title: doc.title,
    content: doc.content,
    summary: `Prior state before restoring "${version.title}" (${new Date(version.savedAt).toLocaleTimeString()})`,
  });

  doc.title = version.title;
  doc.content = version.content;
  doc.updatedAt = now;
  doc.lastEditedById = userId;

  data.documents[docIndex] = doc;
  writeStorage(data);
  return enrichDocument(doc, userId);
}

export function resetToSeedData(): StorageData {
  const initialData: StorageData = {
    users: SEED_USERS,
    documents: INITIAL_DOCUMENTS,
  };
  writeStorage(initialData);
  return initialData;
}
