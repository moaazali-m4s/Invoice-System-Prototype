import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { Client } from '@/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = dbService.getClient(params.id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    return NextResponse.json(client);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as Client;
    body.id = params.id;
    const updated = dbService.saveClient(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    dbService.deleteClient(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
