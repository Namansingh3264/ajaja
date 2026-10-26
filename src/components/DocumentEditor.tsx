'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { DocumentItem } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import Navbar from './Navbar';
import EditorToolbar from './EditorToolbar';
import ShareModal from './ShareModal';
import FileUploadModal from './FileUploadModal';
import VersionHistoryDrawer from './VersionHistoryDrawer';
import AttachmentsDrawer from './AttachmentsDrawer';
import { Lock, Eye, AlertCircle, Clock, BookOpen } from 'lucide-react';

interface DocumentEditorProps {
  initialDocument: DocumentItem;
}

export default function DocumentEditor({ initialDocument }: DocumentEditorProps) {
  const { currentUser, fetchWithAuth } = useUser();
  const { showToast } = useToast();

  const [document, setDocument] = useState<DocumentItem>(initialDocument);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);

  // Compute permission for current active user
  const isOwner = document.ownerId === currentUser.id;
  const userShare = (document.shares || []).find((s) => s.userId === currentUser.id);
  const canEdit = isOwner || userShare?.permission === 'edit';
  const isViewOnly = !canEdit;

  // Stats
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save function
  const saveDocumentContent = useCallback(
    async (content: string, title?: string) => {
      if (isViewOnly) return;

      try {
        setSaveStatus('saving');
        const res = await fetchWithAuth(`/api/documents/${document.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || document.title,
            content,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save document');

        setDocument(data.document);
        setSaveStatus('saved');
      } catch (err: any) {
        setSaveStatus('unsaved');
        showToast(err.message || 'Auto-save failed', 'error');
      }
    },
    [document.id, document.title, isViewOnly, fetchWithAuth, showToast]
  );

  // TipTap Editor instance
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Write your thoughts, paste text, or use the toolbar above...',
      }),
    ],
    content: document.content || '<p></p>',
    editable: canEdit,
    onUpdate: ({ editor }) => {
      if (isViewOnly) return;
      setSaveStatus('unsaved');

      // Update metrics
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);

      // Debounce auto-save by 1000ms
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveDocumentContent(editor.getHTML());
      }, 1000);
    },
  });

  // Keep editor editability in sync with active user permission
  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit);
    }
  }, [editor, canEdit]);

  // Sync document state when user switches or doc reloads
  useEffect(() => {
    const fetchLatestDoc = async () => {
      try {
        const res = await fetchWithAuth(`/api/documents/${document.id}`);
        if (res.ok) {
          const data = await res.json();
          setDocument(data.document);
          if (editor && editor.getHTML() !== data.document.content) {
            editor.commands.setContent(data.document.content);
          }
        }
      } catch (err) {
        console.error('Error fetching latest document state:', err);
      }
    };

    fetchLatestDoc();
  }, [currentUser.id]);

  // Calculate initial metrics
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.length);
    }
  }, [editor]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editor && canEdit) {
          saveDocumentContent(editor.getHTML());
          showToast('Document saved to cloud', 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, canEdit, saveDocumentContent, showToast]);

  const handleTitleChange = async (newTitle: string) => {
    if (isViewOnly) return;
    setDocument((prev) => ({ ...prev, title: newTitle }));
    await saveDocumentContent(editor ? editor.getHTML() : document.content, newTitle);
    showToast('Document renamed', 'success');
  };

  const handleInsertImportedContent = (importedContent: string, importedTitle?: string) => {
    if (editor && canEdit) {
      editor.commands.insertContent(importedContent);
      saveDocumentContent(editor.getHTML());
      showToast('Imported content inserted into draft', 'success');
    }
  };

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="editor-container">
      {/* Top Navigation */}
      <Navbar
        documentTitle={document.title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        onShareClick={() => setIsShareOpen(true)}
        canEdit={canEdit}
        sharesCount={(document.shares || []).length}
      />

      {/* View Only Alert Banner */}
      {isViewOnly && (
        <div className="view-only-banner animate-fade-in">
          <Eye size={16} />
          <span>
            <strong>View only:</strong> You do not have edit permissions for this document. You can read, export, or print.
          </span>
        </div>
      )}

      {/* Formatting & Controls Toolbar */}
      <EditorToolbar
        editor={editor}
        canEdit={canEdit}
        onOpenAttachments={() => setIsAttachmentsOpen(true)}
        onOpenVersions={() => setIsVersionsOpen(true)}
        onOpenFileImport={() => setIsImportOpen(true)}
        attachmentsCount={(document.attachments || []).length}
        documentTitle={document.title}
      />

      {/* Google Docs-Style Paper Sheet Canvas */}
      <main className="editor-canvas-wrapper" onClick={() => canEdit && editor?.commands.focus()}>
        <div className="document-sheet">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="editor-status-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>{wordCount.toLocaleString()} words</span>
          <span>{charCount.toLocaleString()} characters</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> ~{readingTimeMinutes} min read
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            Created by <strong>{document.owner?.name || 'Owner'}</strong>
          </span>
          {document.lastEditedBy && (
            <span>
              • Last edit by <strong>{document.lastEditedBy.name}</strong>
            </span>
          )}
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ShareModal
        document={document}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onDocumentUpdated={(updatedDoc) => setDocument(updatedDoc)}
      />

      <FileUploadModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onInsertContent={handleInsertImportedContent}
        mode="insert"
      />

      <VersionHistoryDrawer
        document={document}
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        onVersionRestored={(restoredDoc) => {
          setDocument(restoredDoc);
          if (editor) editor.commands.setContent(restoredDoc.content);
        }}
        canEdit={canEdit}
      />

      <AttachmentsDrawer
        document={document}
        isOpen={isAttachmentsOpen}
        onClose={() => setIsAttachmentsOpen(false)}
        onDocumentUpdated={(updatedDoc) => setDocument(updatedDoc)}
        canEdit={canEdit}
      />
    </div>
  );
}
