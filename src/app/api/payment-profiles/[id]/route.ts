import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { PaymentProfile } from '@/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = dbService.getPaymentProfile(params.id);
    if (!profile) return NextResponse.json({ error: 'Payment profile not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as PaymentProfile;
    body.id = params.id;
    const updated = dbService.savePaymentProfile(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    dbService.deletePaymentProfile(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
