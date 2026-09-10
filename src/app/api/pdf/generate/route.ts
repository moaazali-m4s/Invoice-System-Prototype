import { NextRequest, NextResponse } from 'next/server';
import { generateInvoicePdf } from '@/services/pdfGenerator';
import { dbService } from '@/lib/db';
import { sanitizeFilename } from '@/utils/formatters';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let invoice = body.invoice;
    let company = body.company;

    if (!invoice && body.invoiceId) {
      invoice = dbService.getInvoice(body.invoiceId);
    }
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice data required' }, { status: 400 });
    }
    if (!company) {
      company = dbService.getCompany(invoice.company_id);
    }

    const pdfBuffer = await generateInvoicePdf(invoice, company);
    const docName = invoice.document_name || `Invoice_${invoice.invoice_number}`;
    const cleanFilename = `${sanitizeFilename(docName)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cleanFilename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('Invoice PDF generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
