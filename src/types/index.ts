export type PermissionRole = 'owner' | 'edit' | 'view';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  color: string;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  userId: string;
  user?: User;
  permission: 'edit' | 'view';
  sharedAt: string;
  sharedBy: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  dataUrl?: string;
}

export interface DocumentVersion {
  id: string;
  savedAt: string;
  savedById: string;
  savedByName: string;
  title: string;
  content: string;
  summary: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  lastEditedById: string;
  lastEditedBy?: User;
  shares: DocumentShare[];
  attachments: DocumentAttachment[];
  versions: DocumentVersion[];
  userPermission?: PermissionRole;
}

export interface StorageData {
  users: User[];
  documents: DocumentItem[];
}
