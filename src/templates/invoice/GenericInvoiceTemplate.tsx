import React from 'react';
import { Invoice, Company } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface GenericInvoiceTemplateProps {
  invoice: Invoice;
  company?: Company | null;
}

export const GenericInvoiceTemplate: React.FC<GenericInvoiceTemplateProps> = ({ invoice, company }) => {
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
  const sigUrl = signatory.signature_url || comp.signature_url || '/assets/signatures/alex_morgan.png';

  const servicePeriod =
    invoice.service_period_start && invoice.service_period_end
      ? `${invoice.service_period_start} to ${invoice.service_period_end}`
      : invoice.service_period_label || '';

  return (
    <div
      id="invoice-sheet"
      className="w-full max-w-[816px] min-h-[1056px] mx-auto bg-white text-slate-900 shadow-xl border border-slate-200/80 rounded-2xl p-10 flex flex-col justify-between font-sans relative overflow-hidden print:shadow-none print:border-0 print:p-8 print:rounded-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Decorative top border accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600"></div>

      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-8 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <img
              src={comp.logo_url || '/assets/company/logo.png'}
              alt={comp.name}
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{comp.legal_name || comp.name}</h1>
              {comp.tagline && <p className="text-xs text-slate-500 font-medium tracking-wide">{comp.tagline}</p>}
              <div className="text-xs text-slate-500 mt-1 space-x-2">
                <span>{comp.address_line1}, {comp.city}, {comp.state} {comp.zip}</span>
                <span>•</span>
                <span>{comp.email}</span>
                <span>•</span>
                <span>{comp.phone}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-semibold tracking-wider rounded-full uppercase shadow-xs mb-2">
              Invoice
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{invoice.invoice_number}</div>
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              <div><span className="font-medium text-slate-700">Date:</span> {invoice.invoice_date}</div>
              <div><span className="font-medium text-slate-700">Due Date:</span> {invoice.due_date}</div>
            </div>
          </div>
        </div>

        {/* Client & Service Details Grid */}
        <div className="grid grid-cols-2 gap-8 my-7">
          {/* Bill To */}
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Billed To</span>
            <div className="text-base font-bold text-slate-900">{billTo.name || 'Client Name'}</div>
            {billTo.contact_person && (
              <div className="text-xs font-medium text-slate-700 mt-0.5">Attn: {billTo.contact_person}</div>
            )}
            <div className="text-xs text-slate-600 mt-2 leading-relaxed">
              {billTo.address_line1 && <div>{billTo.address_line1}</div>}
              {(billTo.city || billTo.state || billTo.zip) && (
                <div>{[billTo.city, billTo.state, billTo.zip].filter(Boolean).join(', ')}</div>
              )}
              {billTo.country && <div>{billTo.country}</div>}
              {billTo.email && <div className="text-blue-600 mt-1 font-medium">{billTo.email}</div>}
            </div>
          </div>

          {/* Project & Consultant Meta */}
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Engagement Details</span>
              {invoice.service_description && (
                <div className="text-sm font-semibold text-slate-900 leading-snug mb-2">
                  {invoice.service_description}
                </div>
              )}
              {invoice.role && (
                <div className="text-xs text-slate-600 mb-2">
                  <span className="font-medium text-slate-700">Role:</span> {invoice.role}
                </div>
              )}
              {servicePeriod && (
                <div className="text-xs text-slate-600">
                  <span className="font-medium text-slate-700">Service Period:</span> {servicePeriod}
                </div>
              )}
            </div>

            {/* Consultant Badge */}
            {invoice.consultant && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Lead Consultant / Specialist:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
                  {invoice.consultant}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-center w-24">Qty</th>
                <th className="py-3.5 px-4 text-center w-20">Unit</th>
                <th className="py-3.5 px-4 text-right w-28">Rate</th>
                <th className="py-3.5 px-4 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {invoice.line_items?.map((item, idx) => (
                <tr key={item.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.description}</div>
                    {item.sub_description && (
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.sub_description}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700 font-medium">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-center text-slate-500 text-xs">{item.unit || 'Hours'}</td>
                  <td className="py-3.5 px-4 text-right text-slate-700 font-mono text-xs">
                    {formatCurrency(item.rate, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-900 font-bold font-mono">
                    {formatCurrency(item.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Calculations Row */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium text-slate-800">{formatCurrency(invoice.subtotal, currency)}</span>
            </div>
            {Boolean(invoice.tax_amount && invoice.tax_amount > 0) && (
              <div className="flex justify-between py-1 text-slate-600">
                <span>Tax ({invoice.tax_rate || 0}%)</span>
                <span className="font-mono font-medium text-slate-800">{formatCurrency(invoice.tax_amount, currency)}</span>
              </div>
            )}
            {Boolean(invoice.discount_amount && invoice.discount_amount > 0) && (
              <div className="flex justify-between py-1 text-emerald-600">
                <span>Discount</span>
                <span className="font-mono font-medium">-{formatCurrency(invoice.discount_amount, currency)}</span>
              </div>
            )}
            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center">
              <span className="text-base font-bold text-slate-900">Total Due</span>
              <span className="text-xl font-extrabold font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                {formatCurrency(invoice.total, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Payment Details, Notes, Signatory */}
      <div className="pt-6 border-t border-slate-200 text-xs text-slate-600">
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Bank Wire / Payment Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="font-bold text-slate-900 block mb-1.5 uppercase text-[10px] tracking-wider">Payment Method</span>
            <div className="space-y-0.5 text-slate-700">
              <div className="font-medium text-slate-900">{payment.bank_name || 'Commercial Bank'}</div>
              <div>Account Name: <span className="font-medium text-slate-800">{payment.account_name || comp.name}</span></div>
              <div>Account No: <span className="font-mono font-semibold text-slate-900">{payment.account_number}</span></div>
              {payment.routing_number && <div>Routing / ABA: <span className="font-mono text-slate-800">{payment.routing_number}</span></div>}
              {payment.swift_code && <div>SWIFT / BIC: <span className="font-mono text-slate-800">{payment.swift_code}</span></div>}
              {payment.reference_instructions && (
                <div className="text-[11px] text-blue-700 font-medium mt-1.5">Ref: {payment.reference_instructions}</div>
              )}
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="col-span-1">
            <span className="font-bold text-slate-900 block mb-1.5 uppercase text-[10px] tracking-wider">Notes & Terms</span>
            <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px] leading-relaxed">
              {invoice.notes?.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>

          {/* Executive Signature Block */}
          <div className="flex flex-col items-end justify-end text-right">
            <div className="w-48 text-center">
              {sigUrl ? (
                <img
                  src={sigUrl}
                  alt={signatory.name || 'Authorized Signatory'}
                  className="h-12 w-auto mx-auto object-contain mb-1"
                />
              ) : (
                <div className="h-12"></div>
              )}
              <div className="w-full border-t border-slate-400 mt-1 mb-1"></div>
              <div className="font-bold text-slate-900 text-xs">{signatory.name || 'Alex Morgan'}</div>
              <div className="text-[11px] text-slate-500">{signatory.title || 'CEO & Founder'}</div>
              <div className="text-[10px] text-slate-400 font-medium">{signatory.company || comp.legal_name || comp.name}</div>
            </div>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="text-center text-[11px] text-slate-400 pt-3 border-t border-slate-100">
          {comp.legal_name || comp.name} • Registered Office: {comp.address_line1}, {comp.city}, {comp.state} {comp.zip} • {comp.website}
        </div>
      </div>
    </div>
  );
};
export default GenericInvoiceTemplate;
