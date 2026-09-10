import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { Invoice } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId') || undefined;
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const search = req.nextUrl.searchParams.get('search') || undefined;

    const invoices = dbService.getInvoices({ companyId, status, search });
    return NextResponse.json(invoices);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Invoice;
    if (!body.invoice_number) {
      return NextResponse.json({ error: 'Invoice number is required' }, { status: 400 });
    }
    const saved = dbService.saveInvoice(body);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
