import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const companies = dbService.getCompanies();
    return NextResponse.json(companies);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
