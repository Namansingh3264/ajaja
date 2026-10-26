import { marked } from 'marked';
import mammoth from 'mammoth';

export interface ParsedDocumentResult {
  title: string;
  content: string;
  fileType: 'txt' | 'md' | 'docx' | 'unknown';
  originalFileName: string;
}

export function cleanTitleFromFileName(fileName: string): string {
  // Strip extension and replace underscores/dashes with spaces
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const clean = nameWithoutExt.replace(/[-_]+/g, ' ').trim();
  if (!clean) return 'Untitled Document';
  // Capitalize first letter of each word
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function parseUploadedFile(
  fileBuffer: Buffer | ArrayBuffer,
  fileName: string
): Promise<ParsedDocumentResult> {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const title = cleanTitleFromFileName(fileName);
  const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

  if (ext === 'md' || ext === 'markdown') {
    const rawText = buffer.toString('utf-8');
    // Parse markdown to HTML
    const html = await marked.parse(rawText, { gfm: true, breaks: true });
    return {
      title,
      content: html,
      fileType: 'md',
      originalFileName: fileName,
    };
  }

  if (ext === 'txt') {
    const rawText = buffer.toString('utf-8');
    // Convert plain text lines into paragraphs
    const paragraphs = rawText
      .split(/\r?\n\r?\n/)
      .map((para) => para.trim())
      .filter(Boolean)
      .map((para) => {
        const escaped = para
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\r?\n/g, '<br />');
        return `<p>${escaped}</p>`;
      })
      .join('');

    return {
      title,
      content: paragraphs || '<p></p>',
      fileType: 'txt',
      originalFileName: fileName,
    };
  }

  if (ext === 'docx') {
    const result = await mammoth.convertToHtml({ buffer });
    return {
      title,
      content: result.value || '<p></p>',
      fileType: 'docx',
      originalFileName: fileName,
    };
  }

  throw new Error(
    `Unsupported file format: .${ext || 'unknown'}. Supported formats: .docx, .md, .txt`
  );
}
