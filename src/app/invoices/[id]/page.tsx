import React from 'react';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import InvoiceEditor from '@/components/InvoiceEditor';

export const dynamic = 'force-dynamic';

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const invoice = dbService.getInvoice(params.id);
  if (!invoice) notFound();

  const companies = dbService.getCompanies();
  const clients = dbService.getClients();
  const paymentProfiles = dbService.getPaymentProfiles();

  return (
    <InvoiceEditor
      initialInvoice={invoice}
      companies={companies}
      clients={clients}
      paymentProfiles={paymentProfiles}
      isNew={false}
    />
  );
}
