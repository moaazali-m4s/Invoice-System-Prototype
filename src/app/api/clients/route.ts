import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { Client } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') || undefined;
    const clients = dbService.getClients(search);
    return NextResponse.json(clients);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Client;
    if (!body.name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }
    const saved = dbService.saveClient(body);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
