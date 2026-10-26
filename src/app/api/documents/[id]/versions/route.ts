import { NextRequest, NextResponse } from 'next/server';
import { restoreVersion } from '@/lib/storage';

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
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
    }

    const document = restoreVersion(id, userId, versionId);
    return NextResponse.json({
      document,
      message: 'Version restored successfully',
    });
  } catch (error: any) {
    console.error('Error restoring version:', error);
    const status = error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to restore version' },
      { status }
    );
  }
}
