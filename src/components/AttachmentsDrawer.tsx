'use client';

import React, { useState, useRef } from 'react';
import { DocumentItem, DocumentAttachment } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { Paperclip, X, Upload, Trash2, Download, File, FileText, Image as ImageIcon } from 'lucide-react';

interface AttachmentsDrawerProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: DocumentItem) => void;
  canEdit: boolean;
}

export default function AttachmentsDrawer({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
  canEdit,
}: AttachmentsDrawerProps) {
  const { fetchWithAuth } = useUser();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const attachments = document.attachments || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Max 10MB limit for demo
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetchWithAuth(`/api/documents/${document.id}/attachments`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to attach file');

      onDocumentUpdated(data.document);
      showToast(`Attached "${file.name}"`, 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, name: string) => {
    if (!confirm(`Remove attachment "${name}"?`)) return;

    try {
      const res = await fetchWithAuth(`/api/documents/${document.id}/attachments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove attachment');

      onDocumentUpdated(data.document);
      showToast('Attachment removed', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            <Paperclip size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              Document Attachments ({attachments.length})
            </h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {canEdit && (
            <div style={{ marginBottom: '20px' }}>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px', borderStyle: 'dashed' }}
              >
                <Upload size={16} />
                {isUploading ? 'Uploading file...' : 'Attach a file to document'}
              </button>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                PDFs, specs, images, or assets associated with this doc
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attachments.map((att) => (
              <div
                key={att.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  {att.type.startsWith('image/') ? (
                    <ImageIcon size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  ) : (
                    <FileText size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {att.name}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {formatFileSize(att.size)} • {new Date(att.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {att.dataUrl && (
                    <a
                      href={att.dataUrl}
                      download={att.name}
                      title="Download file"
                      className="btn-ghost"
                      style={{ padding: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                    >
                      <Download size={15} />
                    </a>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => handleDeleteAttachment(att.id, att.name)}
                      title="Remove attachment"
                      className="btn-ghost"
                      style={{ padding: '6px', color: 'var(--danger)', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {attachments.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
                No attachments uploaded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
