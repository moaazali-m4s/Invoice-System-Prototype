import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { Invoice } from '@/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoice = dbService.getInvoice(params.id);
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    return NextResponse.json(invoice);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as Invoice;
    body.id = params.id;
    const updated = dbService.saveInvoice(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    dbService.deleteInvoice(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
