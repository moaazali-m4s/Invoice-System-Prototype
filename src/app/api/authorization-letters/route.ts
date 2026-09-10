import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { AuthorizationLetter } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId') || undefined;
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const search = req.nextUrl.searchParams.get('search') || undefined;

    const letters = dbService.getAuthorizationLetters({ companyId, status, search });
    return NextResponse.json(letters);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AuthorizationLetter;
    if (!body.representative_name) {
      return NextResponse.json({ error: 'Representative name is required' }, { status: 400 });
    }
    const saved = dbService.saveAuthorizationLetter(body);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
