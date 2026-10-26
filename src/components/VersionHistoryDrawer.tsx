'use client';

import React, { useState } from 'react';
import { DocumentItem, DocumentVersion } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { History, X, RotateCcw, Clock, Check, User } from 'lucide-react';

interface VersionHistoryDrawerProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onVersionRestored: (doc: DocumentItem) => void;
  canEdit: boolean;
}

export default function VersionHistoryDrawer({
  document,
  isOpen,
  onClose,
  onVersionRestored,
  canEdit,
}: VersionHistoryDrawerProps) {
  const { fetchWithAuth } = useUser();
  const { showToast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  if (!isOpen) return null;

  const versions = [...(document.versions || [])].reverse();

  const handleRestore = async (version: DocumentVersion) => {
    if (!confirm(`Restore document to version from ${new Date(version.savedAt).toLocaleString()}? A backup of the current state will be created.`)) {
      return;
    }

    try {
      setIsRestoring(true);
      const res = await fetchWithAuth(`/api/documents/${document.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: version.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restore version');

      onVersionRestored(data.document);
      showToast(`Document restored to version saved by ${version.savedByName}`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(2px)',
          zIndex: 90,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '380px',
          background: '#ffffff',
          boxShadow: 'var(--shadow-xl)',
          borderLeft: '1px solid var(--border-subtle)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              Version History
            </h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Automatic checkpoints created during major editing milestones.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Current Live State */}
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-border)',
              background: 'var(--primary-light)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                  Current Version (Live)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(document.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Last edited by {document.lastEditedBy?.name || 'collaborator'}
              </p>
            </div>

            {/* Historical Revisions */}
            {versions.map((ver) => (
              <div
                key={ver.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: '#ffffff',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {ver.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(ver.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                    {new Date(ver.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <User size={13} style={{ color: 'var(--text-muted)' }} />
                  {ver.savedByName}
                </div>

                {ver.summary && (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
                    "{ver.summary}"
                  </p>
                )}

                {canEdit && (
                  <button
                    onClick={() => handleRestore(ver)}
                    disabled={isRestoring}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '12px',
                      marginTop: '4px',
                    }}
                  >
                    <RotateCcw size={12} />
                    Restore this version
                  </button>
                )}
              </div>
            ))}

            {versions.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No past version checkpoints saved yet. Checkpoints are automatically generated as you work.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
