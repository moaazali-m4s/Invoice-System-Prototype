import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { BackupData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backupData = body.data as BackupData;
    const mode = (body.mode || 'replace') as 'replace' | 'merge';

    if (!backupData || backupData.version !== 1) {
      return NextResponse.json({ error: 'Invalid backup format or version' }, { status: 400 });
    }

    const result = dbService.importBackup(backupData, mode);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
