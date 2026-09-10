import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { PaymentProfile } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId') || undefined;
    const profiles = dbService.getPaymentProfiles(companyId);
    return NextResponse.json(profiles);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PaymentProfile;
    if (!body.profile_name || !body.bank_name || !body.account_number) {
      return NextResponse.json({ error: 'Profile name, bank name and account number are required' }, { status: 400 });
    }
    const saved = dbService.savePaymentProfile(body);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
