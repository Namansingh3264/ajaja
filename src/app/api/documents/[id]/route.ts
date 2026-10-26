import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, updateDocument, deleteDocument } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId =
      request.headers.get('x-user-id') ||
      request.nextUrl.searchParams.get('userId') ||
      'usr_alice';

    const document = getDocumentById(id, userId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or you do not have permission to view it' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(
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
    const { title, content } = body;

    const document = updateDocument(id, userId, { title, content });
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error('Error updating document:', error);
    const status = error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
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

    const success = deleteDocument(id, userId);
    if (!success) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    const status = error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status }
    );
  }
}
