'use client';

import React, { useState } from 'react';
import { DocumentItem, User } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { X, UserPlus, Check, Trash2, Copy, Shield, ShieldCheck, Eye, Edit3 } from 'lucide-react';

interface ShareModalProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: DocumentItem) => void;
}

export default function ShareModal({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
}: ShareModalProps) {
  const { users, currentUser, fetchWithAuth } = useUser();
  const { showToast } = useToast();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<'edit' | 'view'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Filter out users who are already owner or already shared
  const availableUsers = users.filter((u) => {
    if (u.id === document.ownerId) return false;
    return !(document.shares || []).some((s) => s.userId === u.id);
  });

  const isOwner = document.ownerId === currentUser.id;
  const canManageSharing = isOwner || document.userPermission === 'edit';

  const handleAddShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      showToast('Please select a team member to share with', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetchWithAuth(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUserId,
          permission: selectedPermission,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to share document');

      onDocumentUpdated(data.document);
      setSelectedUserId('');
      const targetUser = users.find((u) => u.id === selectedUserId);
      showToast(`Shared "${document.title}" with ${targetUser?.name || 'user'}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermission = async (targetUserId: string, newPermission: 'edit' | 'view') => {
    try {
      const res = await fetchWithAuth(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          permission: newPermission,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update permission');

      onDocumentUpdated(data.document);
      showToast('Updated collaborator permission', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveShare = async (targetUserId: string) => {
    try {
      const res = await fetchWithAuth(`/api/documents/${document.id}/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove collaborator');

      onDocumentUpdated(data.document);
      showToast('Removed collaborator access', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Document link copied to clipboard', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            <h3 className="modal-title">Share "{document.title}"</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Add collaborator form */}
          {canManageSharing ? (
            <form onSubmit={handleAddShare} style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Add team members
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '14px',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                >
                  <option value="">Select a team member...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role} - {user.email})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value as 'edit' | 'view')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '14px',
                    background: '#ffffff',
                    outline: 'none',
                    width: '120px',
                  }}
                >
                  <option value="edit">Can edit</option>
                  <option value="view">Can view</option>
                </select>

                <button
                  type="submit"
                  disabled={!selectedUserId || isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px' }}
                >
                  <UserPlus size={16} />
                  Add
                </button>
              </div>
            </form>
          ) : (
            <div style={{ padding: '10px 14px', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px', color: '#92400e' }}>
              You have view-only access to this document. Only the owner or editors can invite collaborators.
            </div>
          )}

          {/* Collaborators list */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              People with access
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Owner */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar-badge" style={{ width: '32px', height: '32px', background: document.owner?.color || '#4f46e5' }}>
                    {document.owner?.avatar || 'OW'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {document.owner?.name || 'Owner'} {document.ownerId === currentUser.id && '(you)'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {document.owner?.email}
                    </div>
                  </div>
                </div>
                <span className="permission-badge badge-owner">Owner</span>
              </div>

              {/* Shared Collaborators */}
              {(document.shares || []).map((share) => (
                <div key={share.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar-badge" style={{ width: '32px', height: '32px', background: share.user?.color || '#059669' }}>
                      {share.user?.avatar || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {share.user?.name || share.userId} {share.userId === currentUser.id && '(you)'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {share.user?.email || 'collaborator'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isOwner ? (
                      <select
                        value={share.permission}
                        onChange={(e) => handleUpdatePermission(share.userId, e.target.value as 'edit' | 'view')}
                        style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-strong)',
                          outline: 'none',
                        }}
                      >
                        <option value="edit">Can edit</option>
                        <option value="view">Can view</option>
                      </select>
                    ) : (
                      <span className={`permission-badge ${share.permission === 'edit' ? 'badge-edit' : 'badge-view'}`}>
                        {share.permission === 'edit' ? 'Can edit' : 'Can view'}
                      </span>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => handleRemoveShare(share.userId)}
                        title="Remove access"
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {(!document.shares || document.shares.length === 0) && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                  No additional collaborators yet. Invite someone above!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary"
            style={{ fontSize: '13px' }}
          >
            {copiedLink ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            {copiedLink ? 'Link copied' : 'Copy link'}
          </button>

          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
