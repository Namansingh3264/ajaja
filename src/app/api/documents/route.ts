import { NextRequest, NextResponse } from 'next/server';
import { getDocumentsForUser, createDocument } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const userId =
      request.headers.get('x-user-id') ||
      request.nextUrl.searchParams.get('userId') ||
      'usr_alice';

    const data = getDocumentsForUser(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId =
      request.headers.get('x-user-id') ||
      request.nextUrl.searchParams.get('userId') ||
      'usr_alice';

    const body = await request.json().catch(() => ({}));
    const title = body.title || 'Untitled document';
    const content = body.content || '<p></p>';

    const document = createDocument({
      title,
      content,
      ownerId: userId,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
