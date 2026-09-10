import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const backup = dbService.exportBackup();
    return NextResponse.json(backup);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
