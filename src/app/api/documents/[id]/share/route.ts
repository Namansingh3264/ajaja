import { NextRequest, NextResponse } from 'next/server';
import { shareDocument, removeShare } from '@/lib/storage';

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

    const body = await request.json().catch(() => ({}));
    const { targetUserId, permission } = body;

    if (!targetUserId || !permission) {
      return NextResponse.json(
        { error: 'targetUserId and permission ("edit" | "view") are required' },
        { status: 400 }
      );
    }

    if (permission !== 'edit' && permission !== 'view') {
      return NextResponse.json(
        { error: 'Permission must be either "edit" or "view"' },
        { status: 400 }
      );
    }

    const document = shareDocument(id, userId, targetUserId, permission);
    return NextResponse.json({
      document,
      message: `Document shared with user successfully`,
    });
  } catch (error: any) {
    console.error('Error sharing document:', error);
    const status = error.message?.includes('Forbidden') ? 403 : 400;
    return NextResponse.json(
      { error: error.message || 'Failed to share document' },
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
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    const document = removeShare(id, userId, targetUserId);
    return NextResponse.json({
      document,
      message: `Collaborator access removed successfully`,
    });
  } catch (error: any) {
    console.error('Error removing share:', error);
    const status = error.message?.includes('Forbidden') ? 403 : 400;
    return NextResponse.json(
      { error: error.message || 'Failed to remove collaborator' },
      { status }
    );
  }
}
