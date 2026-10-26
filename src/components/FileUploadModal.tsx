'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, FileCode, File } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent?: (content: string, title?: string) => void;
  mode?: 'create' | 'insert';
}

export default function FileUploadModal({
  isOpen,
  onClose,
  onInsertContent,
  mode = 'create',
}: FileUploadModalProps) {
  const router = useRouter();
  const { fetchWithAuth } = useUser();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['docx', 'md', 'markdown', 'txt'].includes(ext || '')) {
      showToast('Unsupported file type. Please upload a .docx, .md, or .txt file.', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('createNewDoc', mode === 'create' ? 'true' : 'false');

      const res = await fetchWithAuth('/api/documents/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import file');

      showToast(`Successfully processed "${selectedFile.name}"!`, 'success');

      if (mode === 'create' && data.document) {
        onClose();
        router.push(`/documents/${data.document.id}`);
      } else if (mode === 'insert' && onInsertContent && data.parsed) {
        onInsertContent(data.parsed.content, data.parsed.title);
        onClose();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} style={{ color: 'var(--primary)' }} />
            <h3 className="modal-title">
              {mode === 'create' ? 'Import Document' : 'Insert Content from File'}
            </h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Supported Format Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: 600 }}>
              <FileText size={12} /> Word (.docx)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 600 }}>
              <FileCode size={12} /> Markdown (.md)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 600 }}>
              <File size={12} /> Plain Text (.txt)
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-strong)'}`,
              background: dragActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.md,.markdown,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: 'var(--primary)',
            }}>
              <UploadCloud size={24} />
            </div>

            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Click to select or drag and drop a file here
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Supports Word documents (.docx), Markdown (.md), and plain text (.txt)
            </p>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                style={{ color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={isUploading}>
            Cancel
          </button>
          <button
            onClick={handleUploadSubmit}
            disabled={!selectedFile || isUploading}
            className="btn btn-primary"
          >
            {isUploading ? 'Parsing & Importing...' : mode === 'create' ? 'Create Document' : 'Insert Content'}
          </button>
        </div>
      </div>
    </div>
  );
}
