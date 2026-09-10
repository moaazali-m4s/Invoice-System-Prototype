import fs from 'fs';
import path from 'path';
import { Invoice, Company, AuthorizationLetter } from '@/types';
import { formatCurrency } from '@/utils/formatters';

function getBase64(filePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath.startsWith('/') ? filePath.slice(1) : filePath);
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(fullPath).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream';
      const data = fs.readFileSync(fullPath);
      return `data:${mime};base64,${data.toString('base64')}`;
    }
  } catch (e) {
    console.error('Error reading asset:', filePath, e);
  }
  return filePath;
}

export function renderInvoiceToHtml(invoice: Invoice, company?: Company | null): string {
  const comp = company || {
    name: 'XYZ Company',
    legal_name: 'XYZ Company LLC',
    tagline: 'Enterprise Solutions & Technology Consulting',
    address_line1: '100 Enterprise Way, Suite 400',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    phone: '+1 (212) 555-0190',
    email: 'billing@xyzcompany.com',
    website: 'www.xyzcompany.com',
    logo_url: '/assets/company/logo.png',
    signature_url: '/assets/signatures/alex_morgan.png',
  };

  const currency = invoice.currency || 'USD';
  const billTo = invoice.bill_to || {};
  const payment = invoice.payment_details || {};
  const signatory = invoice.signatory || {};

  const logoBase64 = getBase64(comp.logo_url || '/assets/company/logo.png');
  const sigUrl = signatory.signature_url || comp.signature_url || '/assets/signatures/alex_morgan.png';
  const sigBase64 = sigUrl.startsWith('data:') ? sigUrl : getBase64(sigUrl);

  const servicePeriod =
    invoice.service_period_start && invoice.service_period_end
      ? `${invoice.service_period_start} to ${invoice.service_period_end}`
      : invoice.service_period_label || '';

  const lineItemsHtml = (invoice.line_items || [])
    .map((item, idx) => `
      <tr style="background: ${idx % 2 === 1 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0; font-size: 9.5pt;">
        <td style="padding: 10px 12px; vertical-align: top;">
          <div style="font-weight: 600; color: #0f172a;">${item.description}</div>
          ${item.sub_description ? `<div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">${item.sub_description}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; text-align: center; vertical-align: top; color: #334155; font-weight: 500;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 12px; text-align: center; vertical-align: top; color: #64748b; font-size: 8.5pt;">
          ${item.unit || 'Hours'}
        </td>
        <td style="padding: 10px 12px; text-align: right; vertical-align: top; color: #334155; font-family: monospace;">
          ${formatCurrency(item.rate, currency)}
        </td>
        <td style="padding: 10px 14px; text-align: right; vertical-align: top; color: #0f172a; font-weight: 700; font-family: monospace;">
          ${formatCurrency(item.amount, currency)}
        </td>
      </tr>
    `)
    .join('');

  const notesHtml = (invoice.notes || [])
    .map(n => `<li style="margin-bottom: 3px;">${n}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${invoice.invoice_number}</title>
      <style>
        @page {
          size: Letter;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          width: 816px;
          height: 1056px;
          margin: 0 auto;
          background-color: white;
          color: #0f172a;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          position: relative;
        }
        .page {
          width: 816px;
          height: 1056px;
          padding: 44px 44px 36px 44px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .top-stripe {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 7px;
          background: linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #4f46e5 100%);
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="top-stripe"></div>

        <div>
          <!-- Header -->
          <table style="width: 100%; border-collapse: collapse; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0;">
            <tr>
              <td style="vertical-align: top;">
                <table style="border-collapse: collapse;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 14px;">
                      <img src="${logoBase64}" alt="${comp.name}" style="height: 52px; width: auto; object-fit: contain;" />
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 16pt; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">${comp.legal_name || comp.name}</div>
                      ${comp.tagline ? `<div style="font-size: 8pt; color: #64748b; font-weight: 500; margin-top: 1px;">${comp.tagline}</div>` : ''}
                      <div style="font-size: 7.5pt; color: #64748b; margin-top: 4px;">
                        ${comp.address_line1}, ${comp.city}, ${comp.state} ${comp.zip} &bull; ${comp.email} &bull; ${comp.phone}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div style="display: inline-block; padding: 4px 12px; background-color: #0f172a; color: white; font-size: 8pt; font-weight: 700; text-transform: uppercase; border-radius: 9999px; letter-spacing: 0.5px;">
                  INVOICE
                </div>
                <div style="font-size: 18pt; font-weight: 800; color: #0f172a; margin-top: 6px;">${invoice.invoice_number}</div>
                <div style="font-size: 8.5pt; color: #64748b; margin-top: 3px;">
                  <div><strong style="color: #334155;">Date:</strong> ${invoice.invoice_date}</div>
                  <div><strong style="color: #334155;">Due Date:</strong> ${invoice.due_date}</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Meta / Bill To Grid -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 12px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
                  <div style="font-size: 7.5pt; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                    Billed To
                  </div>
                  <div style="font-size: 11pt; font-weight: 700; color: #0f172a;">${billTo.name || 'Client Name'}</div>
                  ${billTo.contact_person ? `<div style="font-size: 8.5pt; color: #334155; font-weight: 500; margin-top: 2px;">Attn: ${billTo.contact_person}</div>` : ''}
                  <div style="font-size: 8.5pt; color: #64748b; margin-top: 6px; line-height: 1.4;">
                    ${billTo.address_line1 ? `<div>${billTo.address_line1}</div>` : ''}
                    ${(billTo.city || billTo.state || billTo.zip) ? `<div>${[billTo.city, billTo.state, billTo.zip].filter(Boolean).join(', ')}</div>` : ''}
                    ${billTo.country ? `<div>${billTo.country}</div>` : ''}
                    ${billTo.email ? `<div style="color: #2563eb; font-weight: 500; margin-top: 3px;">${billTo.email}</div>` : ''}
                  </div>
                </div>
              </td>

              <td style="width: 50%; vertical-align: top; padding-left: 12px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; min-height: 108px;">
                  <div style="font-size: 7.5pt; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                    Engagement Details
                  </div>
                  ${invoice.service_description ? `<div style="font-size: 9pt; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${invoice.service_description}</div>` : ''}
                  ${invoice.role ? `<div style="font-size: 8.5pt; color: #475569; margin-bottom: 4px;"><strong style="color: #334155;">Role:</strong> ${invoice.role}</div>` : ''}
                  ${servicePeriod ? `<div style="font-size: 8.5pt; color: #475569;"><strong style="color: #334155;">Service Period:</strong> ${servicePeriod}</div>` : ''}
                  
                  ${invoice.consultant ? `
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 8pt; color: #475569; font-weight: 500;">Lead Consultant / Specialist:</span>
                      <span style="display: inline-block; padding: 2px 10px; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 8pt; font-weight: 700; border-radius: 9999px;">
                        ${invoice.consultant}
                      </span>
                    </div>
                  ` : ''}
                </div>
              </td>
            </tr>
          </table>

          <!-- Line Items Table -->
          <div style="border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background-color: #0f172a; color: white; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px;">
                  <th style="padding: 10px 12px; font-weight: 700;">Description</th>
                  <th style="padding: 10px 12px; text-align: center; width: 70px; font-weight: 700;">Qty</th>
                  <th style="padding: 10px 12px; text-align: center; width: 60px; font-weight: 700;">Unit</th>
                  <th style="padding: 10px 12px; text-align: right; width: 90px; font-weight: 700;">Rate</th>
                  <th style="padding: 10px 14px; text-align: right; width: 110px; font-weight: 700;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Totals Calculation -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="width: 60%;"></td>
              <td style="width: 40%; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse; font-size: 9pt; color: #334155;">
                  <tr>
                    <td style="padding: 4px 0;">Subtotal</td>
                    <td style="padding: 4px 0; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">${formatCurrency(invoice.subtotal, currency)}</td>
                  </tr>
                  ${invoice.tax_amount && invoice.tax_amount > 0 ? `
                    <tr>
                      <td style="padding: 4px 0;">Tax (${invoice.tax_rate || 0}%)</td>
                      <td style="padding: 4px 0; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">${formatCurrency(invoice.tax_amount, currency)}</td>
                    </tr>
                  ` : ''}
                  ${invoice.discount_amount && invoice.discount_amount > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #059669;">Discount</td>
                      <td style="padding: 4px 0; text-align: right; font-family: monospace; font-weight: 600; color: #059669;">-${formatCurrency(invoice.discount_amount, currency)}</td>
                    </tr>
                  ` : ''}
                  <tr style="border-top: 2px solid #0f172a;">
                    <td style="padding: 8px 0; font-size: 11pt; font-weight: 800; color: #0f172a;">Total Due</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 13pt; font-weight: 800; font-family: monospace; color: #0f172a;">${formatCurrency(invoice.total, currency)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer: Payment Info, Notes, Signature -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 8pt; color: #475569;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <!-- Payment Method -->
              <td style="width: 36%; vertical-align: top; padding-right: 12px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
                  <div style="font-size: 7.5pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                    Payment Method
                  </div>
                  <div style="color: #334155; line-height: 1.35;">
                    <div style="font-weight: 600; color: #0f172a;">${payment.bank_name || 'Commercial Bank'}</div>
                    <div>Account Name: <strong style="color: #0f172a;">${payment.account_name || comp.name}</strong></div>
                    <div>Account No: <strong style="font-family: monospace; color: #0f172a;">${payment.account_number}</strong></div>
                    ${payment.routing_number ? `<div>Routing / ABA: <span style="font-family: monospace;">${payment.routing_number}</span></div>` : ''}
                    ${payment.swift_code ? `<div>SWIFT / BIC: <span style="font-family: monospace;">${payment.swift_code}</span></div>` : ''}
                    ${payment.reference_instructions ? `<div style="color: #1d4ed8; font-weight: 600; margin-top: 2px;">Ref: ${payment.reference_instructions}</div>` : ''}
                  </div>
                </div>
              </td>

              <!-- Notes -->
              <td style="width: 36%; vertical-align: top; padding-right: 12px;">
                <div style="font-size: 7.5pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                  Notes & Terms
                </div>
                <ul style="list-style-type: disc; padding-left: 14px; font-size: 7.5pt; color: #64748b; line-height: 1.35;">
                  ${notesHtml}
                </ul>
              </td>

              <!-- Signatory -->
              <td style="width: 28%; vertical-align: bottom; text-align: center;">
                <div style="width: 170px; margin-left: auto;">
                  ${sigBase64 ? `
                    <img src="${sigBase64}" alt="Signature" style="height: 44px; width: auto; object-fit: contain; margin-bottom: 2px; display: block; margin-left: auto; margin-right: auto;" />
                  ` : '<div style="height: 44px;"></div>'}
                  <div style="border-top: 1px solid #475569; margin: 2px 0;"></div>
                  <div style="font-weight: 700; color: #0f172a; font-size: 8.5pt;">${signatory.name || 'Alex Morgan'}</div>
                  <div style="color: #64748b; font-size: 7.5pt;">${signatory.title || 'CEO & Founder'}</div>
                  <div style="color: #94a3b8; font-size: 7pt;">${signatory.company || comp.legal_name || comp.name}</div>
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align: center; font-size: 7.5pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 10px;">
            ${comp.legal_name || comp.name} &bull; Registered Office: ${comp.address_line1}, ${comp.city}, ${comp.state} ${comp.zip} &bull; ${comp.website}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function renderAuthorizationLetterToHtml(letter: AuthorizationLetter, company?: Company | null): string {
  const comp = company || {
    name: 'XYZ Company',
    legal_name: 'XYZ Company LLC',
    tagline: 'Enterprise Solutions & Technology Consulting',
    address_line1: '100 Enterprise Way, Suite 400',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    phone: '+1 (212) 555-0190',
    email: 'billing@xyzcompany.com',
    website: 'www.xyzcompany.com',
    logo_url: '/assets/company/logo.png',
    signature_url: '/assets/signatures/alex_morgan.png',
    stamp_url: '/assets/seals/xyz_seal.png',
  };

  const logoBase64 = getBase64(comp.logo_url || '/assets/company/logo.png');
  const isTruthy = (val: any) => val === true || val === 1 || val === '1';
  const showSig = letter.show_signature === undefined ? true : isTruthy(letter.show_signature);
  const showStamp = letter.show_stamp === undefined ? true : isTruthy(letter.show_stamp);
  const rawSigUrl = letter.signatory_signature_url || comp.signature_url || '/assets/signatures/alex_morgan.png';
  const rawStampUrl = letter.stamp_url || comp.stamp_url || '/assets/seals/xyz_seal.png';

  const sigBase64 = rawSigUrl.startsWith('data:') ? rawSigUrl : getBase64(rawSigUrl);
  const stampBase64 = rawStampUrl.startsWith('data:') ? rawStampUrl : getBase64(rawStampUrl);

  const defaultPurpose = 'for commercial contract execution, technical representations, and billing-related activities on behalf of the company.';
  const defaultDuties = `${letter.company_name || comp.legal_name || comp.name} confirms that the above-named representative is authorized to perform assigned technical duties, execute statements of work, and communicate with commercial clients on behalf of the company in connection with legitimate business operations.`;
  const defaultValidity = `This authorization shall remain in effect until revoked in writing by ${letter.company_name || comp.legal_name || comp.name}.`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Authorization Letter - ${letter.representative_name}</title>
      <style>
        @page {
          size: Letter;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          width: 816px;
          height: 1056px;
          margin: 0 auto;
          background-color: white;
          color: #0f172a;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          position: relative;
        }
        .page {
          width: 816px;
          height: 1056px;
          padding: 48px 52px 40px 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .top-stripe {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 7px;
          background: linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #4f46e5 100%);
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="top-stripe"></div>

        <div>
          <!-- Header -->
          <table style="width: 100%; border-collapse: collapse; padding-bottom: 22px; border-bottom: 2px solid #0f172a;">
            <tr>
              <td style="vertical-align: middle;">
                <table style="border-collapse: collapse;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 14px;">
                      <img src="${logoBase64}" alt="${comp.name}" style="height: 60px; width: auto; object-fit: contain;" />
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 18pt; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">${comp.legal_name || comp.name}</div>
                      ${comp.tagline ? `<div style="font-size: 8.5pt; color: #64748b; font-weight: 500; margin-top: 1px;">${comp.tagline}</div>` : ''}
                    </td>
                  </tr>
                </table>
              </td>
              <td style="text-align: right; vertical-align: middle; font-size: 8pt; color: #64748b; line-height: 1.4;">
                <div style="font-weight: 700; color: #0f172a;">${comp.address_line1}</div>
                <div>${comp.city}, ${comp.state} ${comp.zip}, ${comp.country}</div>
                <div>Email: <strong style="color: #334155;">${comp.email}</strong></div>
                <div>Phone: <strong style="color: #334155;">${comp.phone}</strong></div>
                <div>Web: <strong style="color: #2563eb;">${comp.website}</strong></div>
              </td>
            </tr>
          </table>

          <!-- Reference & Date -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 20px; font-size: 9pt;">
            <tr>
              <td>
                ${letter.letter_number ? `
                  <span style="display: inline-block; padding: 3px 10px; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 9999px; font-weight: 700; font-size: 8pt;">
                    Ref: ${letter.letter_number}
                  </span>
                ` : ''}
              </td>
              <td style="text-align: right; color: #475569; font-weight: 500;">
                Date: <strong style="color: #0f172a;">${letter.letter_date}</strong>
              </td>
            </tr>
          </table>

          <!-- Salutation -->
          <div style="font-size: 11pt; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
            ${letter.salutation || 'To Whom It May Concern,'}
          </div>

          <!-- Subject Banner -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 18px;">
            <div style="font-size: 7.5pt; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
              Subject
            </div>
            <div style="font-size: 10.5pt; font-weight: 700; color: #0f172a; text-transform: uppercase;">
              Letter of Authorization &mdash; ${letter.representative_name}
            </div>
          </div>

          <!-- Body Paragraph 1 -->
          <div style="font-size: 9.5pt; line-height: 1.6; color: #334155; margin-bottom: 18px; text-align: justify;">
            ${letter.opening_text || `This letter serves as official confirmation that <strong style="color: #0f172a; text-decoration: underline; text-decoration-color: #3b82f6;">${letter.representative_name}</strong> is an authorized representative of ${letter.company_name || comp.legal_name || comp.name} and is duly authorized to act on behalf of the company ${letter.purpose || defaultPurpose}`}
          </div>

          <!-- Info Cards -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 8px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;">
                  <div style="font-size: 7.5pt; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Company Information</div>
                  <div style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">${letter.company_name || comp.legal_name || comp.name}</div>
                  <div style="font-size: 8pt; color: #475569; margin-top: 2px;">${comp.address_line1}, ${comp.city}</div>
                  <div style="font-size: 7.5pt; color: #64748b; margin-top: 1px;">Jurisdiction: ${comp.country}</div>
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;">
                  <div style="font-size: 7.5pt; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Representative Details</div>
                  <div style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">${letter.representative_name}</div>
                  <div style="font-size: 8pt; color: #334155; margin-top: 2px; font-weight: 500;">Role: <span style="color: #1d4ed8;">${letter.relationship || 'Authorized Representative'}</span></div>
                  <div style="font-size: 7.5pt; color: #64748b; margin-top: 1px;">Status: Active &amp; Authorized</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Duties Text -->
          <div style="font-size: 9.5pt; line-height: 1.6; color: #334155; margin-bottom: 18px; text-align: justify;">
            ${letter.duties_text || defaultDuties}
          </div>

          <!-- Validity Statement -->
          <div style="font-size: 9.5pt; line-height: 1.6; color: #334155; margin-bottom: 24px; text-align: justify;">
            ${letter.validity_statement || defaultValidity}
          </div>
        </div>

        <!-- Sign-off & Signatures -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <div style="font-size: 9.5pt; font-weight: 500; color: #334155; margin-bottom: 8px;">Sincerely,</div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: bottom; width: 60%;">
                <div style="width: 220px;">
                  <div style="height: 54px; display: flex; align-items: flex-end;">
                    ${showSig && sigBase64 ? `
                      <img src="${sigBase64}" alt="Executive Signature" style="height: 48px; width: auto; object-fit: contain; margin-bottom: 2px;" />
                    ` : '<div style="height: 48px; display: flex; align-items: center; font-size: 8pt; color: #cbd5e1; font-style: italic;">[Physical Signature Required]</div>'}
                  </div>
                  <div style="border-top: 1px solid #475569; width: 190px; margin-bottom: 4px;"></div>
                  <div style="font-size: 10pt; font-weight: 800; color: #0f172a;">${letter.signatory_name || 'Alex Morgan'}</div>
                  <div style="font-size: 8.5pt; color: #475569;">${letter.signatory_title || 'CEO & Founder'}</div>
                  <div style="font-size: 8pt; color: #64748b;">${letter.company_name || comp.legal_name || comp.name}</div>
                </div>
              </td>
              <td style="vertical-align: bottom; width: 40%; text-align: right;">
                <div style="width: 120px; height: 120px; margin-left: auto; display: flex; align-items: center; justify-content: center;">
                  ${showStamp && stampBase64 ? `
                    <img src="${stampBase64}" alt="Corporate Seal" style="width: 110px; height: 110px; object-fit: contain; opacity: 0.95;" />
                  ` : `
                    <div style="width: 100px; height: 100px; border: 1px dashed #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 7.5pt; color: #cbd5e1; text-align: center; padding: 4px;">
                      Physical Corporate Seal
                    </div>
                  `}
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align: center; font-size: 7.5pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 16px;">
            This document is generated by ${comp.legal_name || comp.name} &bull; Official Business Authorization Record
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
