import { NextResponse } from 'next/server';
import { resetToSeedData } from '@/lib/storage';

export async function POST() {
  try {
    const data = resetToSeedData();
    return NextResponse.json({
      message: 'Workspace data successfully reset to seed demo state',
      data,
    });
  } catch (error) {
    console.error('Error resetting seed data:', error);
    return NextResponse.json({ error: 'Failed to reset seed data' }, { status: 500 });
  }
}
