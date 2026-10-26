import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUsers,
  getUserById,
  getDocumentsForUser,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  removeShare,
  restoreVersion,
  resetToSeedData,
} from '@/lib/storage';

describe('Document Persistence & Access Control Engine', () => {
  beforeEach(() => {
    // Reset to clean seed data before each test
    resetToSeedData();
  });

  it('initializes with default seeded users (Alice, Bob, Charlie)', () => {
    const users = getUsers();
    expect(users.length).toBeGreaterThanOrEqual(3);
    expect(users.some((u) => u.id === 'usr_alice')).toBe(true);
    expect(users.some((u) => u.id === 'usr_bob')).toBe(true);
    expect(users.some((u) => u.id === 'usr_charlie')).toBe(true);
  });

  it('creates a new document with an owner and initial version checkpoint', () => {
    const newDoc = createDocument({
      title: 'Q1 Vision Note',
      content: '<p>Initial planning ideas</p>',
      ownerId: 'usr_alice',
    });

    expect(newDoc.id).toBeDefined();
    expect(newDoc.title).toBe('Q1 Vision Note');
    expect(newDoc.ownerId).toBe('usr_alice');
    expect(newDoc.userPermission).toBe('owner');
    expect(newDoc.versions.length).toBe(1);
    expect(newDoc.versions[0].title).toBe('Q1 Vision Note');
  });

  it('correctly partitions documents into owned vs shared for a given user', () => {
    const aliceData = getDocumentsForUser('usr_alice');
    expect(aliceData.owned.some((d) => d.ownerId === 'usr_alice')).toBe(true);

    const bobData = getDocumentsForUser('usr_bob');
    // Bob should have Alice's product strategy doc in his shared list
    const sharedStrategyDoc = bobData.shared.find((d) => d.id === 'doc_product_strategy');
    expect(sharedStrategyDoc).toBeDefined();
    expect(sharedStrategyDoc?.userPermission).toBe('edit');
  });

  it('enforces view-only access restrictions preventing unauthorized edits', () => {
    // Charlie Patel has 'view' access to 'doc_product_strategy'
    const docForCharlie = getDocumentById('doc_product_strategy', 'usr_charlie');
    expect(docForCharlie).toBeDefined();
    expect(docForCharlie?.userPermission).toBe('view');

    // Attempting to update as Charlie should throw a 403 Forbidden error
    expect(() => {
      updateDocument('doc_product_strategy', 'usr_charlie', {
        title: 'Charlie Unauthorized Hack',
      });
    }).toThrow(/Forbidden: User has view-only access/);
  });

  it('allows authorized editors to update document content and title', () => {
    // Bob has 'edit' access to 'doc_product_strategy'
    const updated = updateDocument('doc_product_strategy', 'usr_bob', {
      title: 'Q4 Strategy — Bob Review',
      content: '<p>Updated strategy points by Bob</p>',
    });

    expect(updated).not.toBeNull();
    expect(updated?.title).toBe('Q4 Strategy — Bob Review');
    expect(updated?.lastEditedById).toBe('usr_bob');
  });

  it('allows owner to share document with a new collaborator and revoke access', () => {
    // Bob creates a document
    const doc = createDocument({
      title: 'Architecture RFC',
      content: '<p>RFC body</p>',
      ownerId: 'usr_bob',
    });

    // Bob shares with Charlie with 'edit' permission
    const sharedDoc = shareDocument(doc.id, 'usr_bob', 'usr_charlie', 'edit');
    expect(sharedDoc?.shares.some((s) => s.userId === 'usr_charlie' && s.permission === 'edit')).toBe(true);

    // Charlie can now access
    const charlieDoc = getDocumentById(doc.id, 'usr_charlie');
    expect(charlieDoc?.userPermission).toBe('edit');

    // Bob revokes Charlie's access
    const unsharedDoc = removeShare(doc.id, 'usr_bob', 'usr_charlie');
    expect(unsharedDoc?.shares.some((s) => s.userId === 'usr_charlie')).toBe(false);

    // Charlie is now denied access
    const charlieDocAfterRevocation = getDocumentById(doc.id, 'usr_charlie');
    expect(charlieDocAfterRevocation).toBeNull();
  });

  it('prevents non-owners from deleting documents', () => {
    // Charlie is not owner of 'doc_product_strategy'
    expect(() => {
      deleteDocument('doc_product_strategy', 'usr_charlie');
    }).toThrow(/Forbidden: Only the document owner can delete this document/);
  });

  it('supports version snapshot restoration', () => {
    // Alice's doc_product_strategy has initial version 'ver_init_1'
    const restored = restoreVersion('doc_product_strategy', 'usr_alice', 'ver_init_1');
    expect(restored).not.toBeNull();
    expect(restored?.title).toBe('Q4 Product Strategy Draft');
  });
});
