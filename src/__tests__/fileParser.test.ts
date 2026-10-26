import { describe, it, expect } from 'vitest';
import { parseUploadedFile, cleanTitleFromFileName } from '@/lib/fileParser';

describe('File Upload & Document Import Parser', () => {
  it('cleans and formats titles from filenames properly', () => {
    expect(cleanTitleFromFileName('q4_product_roadmap_2026.docx')).toBe('Q4 Product Roadmap 2026');
    expect(cleanTitleFromFileName('engineering-spec-rfc.md')).toBe('Engineering Spec Rfc');
    expect(cleanTitleFromFileName('meeting_notes.txt')).toBe('Meeting Notes');
    expect(cleanTitleFromFileName('.txt')).toBe('Untitled Document');
  });

  it('parses markdown files into rich semantic HTML', async () => {
    const markdownContent = `# Product Launch Plan

This is a **critical** initiative.

- Milestone 1: Core editor
- Milestone 2: File upload
- Milestone 3: Access sharing

> Speed and simplicity wins.
`;

    const buffer = Buffer.from(markdownContent, 'utf-8');
    const result = await parseUploadedFile(buffer, 'launch_plan.md');

    expect(result.fileType).toBe('md');
    expect(result.title).toBe('Launch Plan');
    expect(result.content).toContain('<h1>Product Launch Plan</h1>');
    expect(result.content).toContain('<strong>critical</strong>');
    expect(result.content).toContain('<li>Milestone 1: Core editor</li>');
    expect(result.content).toContain('<blockquote>');
  });

  it('parses plain text files into clean paragraphs', async () => {
    const textContent = `First paragraph of plain text.

Second paragraph with details.`;

    const buffer = Buffer.from(textContent, 'utf-8');
    const result = await parseUploadedFile(buffer, 'simple_draft.txt');

    expect(result.fileType).toBe('txt');
    expect(result.title).toBe('Simple Draft');
    expect(result.content).toContain('<p>First paragraph of plain text.</p>');
    expect(result.content).toContain('<p>Second paragraph with details.</p>');
  });

  it('rejects unsupported file formats with descriptive error message', async () => {
    const buffer = Buffer.from('binary data', 'utf-8');
    await expect(parseUploadedFile(buffer, 'archive.zip')).rejects.toThrow(
      /Unsupported file format: .zip/
    );
  });
});
