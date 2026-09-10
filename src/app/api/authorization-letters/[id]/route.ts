import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { AuthorizationLetter } from '@/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const letter = dbService.getAuthorizationLetter(params.id);
    if (!letter) return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    return NextResponse.json(letter);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as AuthorizationLetter;
    body.id = params.id;
    const updated = dbService.saveAuthorizationLetter(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    dbService.deleteAuthorizationLetter(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
