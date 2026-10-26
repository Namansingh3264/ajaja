'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
  Minus,
  RemoveFormatting,
  Paperclip,
  History,
  Download,
  FileUp,
  Printer,
  ChevronDown,
  Check,
  FileText,
  FileCode,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  canEdit: boolean;
  onOpenAttachments: () => void;
  onOpenVersions: () => void;
  onOpenFileImport: () => void;
  attachmentsCount: number;
  documentTitle: string;
}

export default function EditorToolbar({
  editor,
  canEdit,
  onOpenAttachments,
  onOpenVersions,
  onOpenFileImport,
  attachmentsCount,
  documentTitle,
}: EditorToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);

  if (!editor) return null;

  const handleExportMarkdown = () => {
    setExportOpen(false);
    const html = editor.getHTML();
    // Simple HTML to markdown converter for download
    let md = html
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/gi, '> $1\n\n')
      .replace(/<li><p>(.*?)<\/p><\/li>/gi, '- $1\n')
      .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<[^>]+>/g, '');

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    setExportOpen(false);
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #1e293b; padding: 0 20px; }
    h1 { font-size: 2.2em; margin-bottom: 0.4em; }
    h2 { font-size: 1.6em; margin-top: 1.2em; }
    h3 { font-size: 1.3em; margin-top: 1em; }
    blockquote { border-left: 4px solid #4f46e5; margin: 1em 0; padding: 8px 16px; background: #eef2ff; color: #4338ca; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
    code { background: #f1f5f9; color: #e11d48; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  </style>
</head>
<body>
  ${editor.getHTML()}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    setExportOpen(false);
    window.print();
  };

  return (
    <div className="editor-sticky-toolbar">
      {/* Editing Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
        {/* History Group */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!canEdit || !editor.can().undo()}
            className="toolbar-btn"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!canEdit || !editor.can().redo()}
            className="toolbar-btn"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={15} />
          </button>
        </div>

        {/* Heading / Style dropdown */}
        <div className="toolbar-group">
          <select
            disabled={!canEdit}
            value={
              editor.isActive('heading', { level: 1 })
                ? 'h1'
                : editor.isActive('heading', { level: 2 })
                ? 'h2'
                : editor.isActive('heading', { level: 3 })
                ? 'h3'
                : 'p'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'p') editor.chain().focus().setParagraph().run();
              if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
              if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
              if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className="toolbar-select"
          >
            <option value="p">Normal Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        {/* Inline Formatting */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
            title="Inline Code"
          >
            <Code size={15} />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            title="Bulleted List"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            title="Numbered List"
          >
            <ListOrdered size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            title="Blockquote"
          >
            <Quote size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={!canEdit}
            className="toolbar-btn"
            title="Divider Line"
          >
            <Minus size={15} />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
            title="Align Left"
          >
            <AlignLeft size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            title="Align Center"
          >
            <AlignCenter size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            disabled={!canEdit}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            title="Align Right"
          >
            <AlignRight size={15} />
          </button>
        </div>

        {/* Clear formatting */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            disabled={!canEdit}
            className="toolbar-btn"
            title="Clear Formatting"
          >
            <RemoveFormatting size={15} />
          </button>
        </div>
      </div>

      {/* Right Utility Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Import file content into draft */}
        {canEdit && (
          <button
            onClick={onOpenFileImport}
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            title="Insert text from .docx, .md, or .txt file"
          >
            <FileUp size={14} />
            Import File
          </button>
        )}

        {/* Attachments drawer trigger */}
        <button
          onClick={onOpenAttachments}
          className="btn btn-secondary"
          style={{ padding: '5px 10px', fontSize: '12px' }}
          title="Document Attachments"
        >
          <Paperclip size={14} />
          Attachments
          {attachmentsCount > 0 && (
            <span style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-full)',
              padding: '1px 6px',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              {attachmentsCount}
            </span>
          )}
        </button>

        {/* Version history trigger */}
        <button
          onClick={onOpenVersions}
          className="btn btn-secondary"
          style={{ padding: '5px 10px', fontSize: '12px' }}
          title="Version History Checkpoints"
        >
          <History size={14} />
          Versions
        </button>

        {/* Export dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            <Download size={14} />
            Export
            <ChevronDown size={12} />
          </button>

          {exportOpen && (
            <>
              <div onClick={() => setExportOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '4px',
                  width: '200px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px',
                  zIndex: 70,
                }}
              >
                <button
                  onClick={handleExportMarkdown}
                  className="btn-ghost"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                >
                  <FileCode size={16} style={{ color: 'var(--primary)' }} />
                  Markdown (.md)
                </button>
                <button
                  onClick={handleExportHTML}
                  className="btn-ghost"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                >
                  <FileText size={16} style={{ color: 'var(--success)' }} />
                  Web Page (.html)
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="btn-ghost"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                >
                  <Printer size={16} style={{ color: 'var(--text-secondary)' }} />
                  Print / Save as PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
