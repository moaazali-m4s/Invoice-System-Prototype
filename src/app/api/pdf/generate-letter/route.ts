import { NextRequest, NextResponse } from 'next/server';
import { generateAuthorizationLetterPdf } from '@/services/pdfGenerator';
import { dbService } from '@/lib/db';
import { sanitizeFilename } from '@/utils/formatters';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let letter = body.letter;
    let company = body.company;

    if (!letter && body.letterId) {
      letter = dbService.getAuthorizationLetter(body.letterId);
    }
    if (!letter) {
      return NextResponse.json({ error: 'Letter data required' }, { status: 400 });
    }
    if (!company) {
      company = dbService.getCompany(letter.company_id);
    }

    const pdfBuffer = await generateAuthorizationLetterPdf(letter, company);
    const docName = letter.document_name || `Authorization_Letter_${letter.representative_name}`;
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
    console.error('Letter PDF generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
