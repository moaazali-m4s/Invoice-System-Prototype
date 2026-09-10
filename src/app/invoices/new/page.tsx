import React from 'react';
import { dbService } from '@/lib/db';
import InvoiceEditor from '@/components/InvoiceEditor';

export const dynamic = 'force-dynamic';

export default function NewInvoicePage() {
  const companies = dbService.getCompanies();
  const clients = dbService.getClients();
  const paymentProfiles = dbService.getPaymentProfiles();

  return (
    <InvoiceEditor
      companies={companies}
      clients={clients}
      paymentProfiles={paymentProfiles}
      isNew={true}
    />
  );
}
