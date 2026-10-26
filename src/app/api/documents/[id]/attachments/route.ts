import { NextRequest, NextResponse } from 'next/server';
import { addAttachment, removeAttachment } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId =
      request.headers.get('x-user-id') ||
      request.nextUrl.searchParams.get('userId') ||
      'usr_alice';

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No attachment file provided' }, { status: 400 });
    }

    // Convert file to base64 dataUrl for client-side download/preview
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const document = addAttachment(id, userId, {
      name: file.name,
      size: file.size,
      type: mimeType,
      dataUrl,
    });

    return NextResponse.json({
      document,
      message: `Attachment "${file.name}" added successfully`,
    });
  } catch (error: any) {
    console.error('Error adding attachment:', error);
    const status = error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to add attachment' },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId =
      request.headers.get('x-user-id') ||
      request.nextUrl.searchParams.get('userId') ||
      'usr_alice';

    const body = await request.json().catch(() => ({}));
    const { attachmentId } = body;

    if (!attachmentId) {
      return NextResponse.json({ error: 'attachmentId is required' }, { status: 400 });
    }

    const document = removeAttachment(id, userId, attachmentId);
    return NextResponse.json({
      document,
      message: 'Attachment removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing attachment:', error);
    const status = error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to remove attachment' },
      { status }
    );
  }
}
