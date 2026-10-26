import { NextRequest, NextResponse } from 'next/server';
import { parseUploadedFile } from '@/lib/fileParser';
import { createDocument } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const userId =
      request.headers.get('x-user-id') ||
      request.nextUrl.searchParams.get('userId') ||
      'usr_alice';

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const createNewDoc = formData.get('createNewDoc') !== 'false'; // default true

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parseUploadedFile(buffer, file.name);

    if (createNewDoc) {
      const document = createDocument({
        title: parsed.title,
        content: parsed.content,
        ownerId: userId,
      });

      return NextResponse.json({
        document,
        parsed,
        message: `Successfully imported "${file.name}" as new document.`,
      });
    }

    return NextResponse.json({
      parsed,
      message: `Successfully parsed "${file.name}".`,
    });
  } catch (error: any) {
    console.error('Error importing file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse and import file' },
      { status: 400 }
    );
  }
}
