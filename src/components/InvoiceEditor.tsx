'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, Company, Client, PaymentProfile, InvoiceItem } from '@/types';
import GenericInvoiceTemplate from '@/templates/invoice/GenericInvoiceTemplate';

interface InvoiceEditorProps {
  initialInvoice?: Invoice;
  companies: Company[];
  clients: Client[];
  paymentProfiles: PaymentProfile[];
  isNew?: boolean;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  initialInvoice,
  companies,
  clients,
  paymentProfiles,
  isNew = false,
}) => {
  const router = useRouter();
  const defaultCompany = companies[0] || null;

  // Form state
  const [invoice, setInvoice] = useState<Invoice>(() => {
    if (initialInvoice) return initialInvoice;

    const defaultPayment = paymentProfiles[0] || null;

    return {
      id: `inv-${Date.now()}`,
      company_id: defaultCompany?.id || 'xyz-company',
      client_id: clients[0]?.id || '',
      invoice_number: `XYZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      service_period_start: '',
      service_period_end: '',
      service_period_label: '',
      currency: 'USD',
      service_description: 'Enterprise Cloud Architecture & Technology Consulting',
      role: 'Senior Solutions Architect',
      consultant: 'Jordan Smith',
      bill_to: clients[0]
        ? {
            name: clients[0].name,
            contact_person: clients[0].contact_person || '',
            address_line1: clients[0].address_line1 || '',
            city: clients[0].city || '',
            state: clients[0].state || '',
            zip: clients[0].zip || '',
            country: clients[0].country || 'United States',
            email: clients[0].email || '',
          }
        : {
            name: 'Acme Solutions Inc.',
            contact_person: 'Sarah Jenkins',
            address_line1: '100 Corporate Parkway, Suite 400',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'United States',
            email: 'billing@acmesolutions.com',
          },
      line_items: [
        {
          id: 'item-1',
          description: 'Cloud Infrastructure Architecture & Modernization',
          sub_description: 'Multi-region enterprise cluster setup and continuous delivery configuration',
          quantity: 160,
          unit: 'Hours',
          rate: 150,
          amount: 24000,
        },
      ],
      subtotal: 24000,
      tax_rate: 0,
      tax_amount: 0,
      discount_amount: 0,
      total: 24000,
      notes: [
        'Payment is requested within 14 calendar days of issuance.',
        'Please cite invoice reference on all electronic remittances.',
        'Thank you for your partnership with XYZ Company LLC.',
      ],
      payment_profile_id: defaultPayment?.id || '',
      payment_details: defaultPayment
        ? {
            bank_name: defaultPayment.bank_name,
            bank_location: defaultPayment.bank_location || '',
            account_name: defaultPayment.account_name,
            account_number: defaultPayment.account_number,
            routing_number: defaultPayment.routing_number || '',
            swift_code: defaultPayment.swift_code || '',
            reference_instructions: defaultPayment.reference_instructions || '',
          }
        : {
            bank_name: 'Example Commercial Bank, N.A.',
            bank_location: 'New York, NY, United States',
            account_name: 'XYZ Company LLC',
            account_number: '1029384756',
            routing_number: '021000021',
            swift_code: 'EXMPUS33XXX',
            reference_instructions: 'Invoice {INVOICE_NUMBER}',
          },
      signatory: {
        name: defaultCompany?.default_signatory_name || 'Alex Morgan',
        title: defaultCompany?.default_signatory_title || 'CEO & Founder',
        company: defaultCompany?.legal_name || 'XYZ Company LLC',
        signature_url: defaultCompany?.signature_url || '/assets/signatures/alex_morgan.png',
      },
      document_name: '',
      status: 'draft',
      is_sample: 0,
    };
  });

  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [zoom, setZoom] = useState<number>(0.9);

  // Recalculate totals whenever line_items, tax_rate, or discount_amount changes
  const recalculateTotals = (items: InvoiceItem[], taxRate: number, discount: number) => {
    const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
    const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
    const total = Math.max(0, subtotal + taxAmount - (Number(discount) || 0));
    return { subtotal, taxAmount, total };
  };

  const handleLineItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...invoice.line_items];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      current.amount = (Number(current.quantity) || 0) * (Number(current.rate) || 0);
    }
    updated[index] = current;

    const { subtotal, taxAmount, total } = recalculateTotals(updated, invoice.tax_rate || 0, invoice.discount_amount || 0);
    setInvoice((prev) => ({
      ...prev,
      line_items: updated,
      subtotal,
      tax_amount: taxAmount,
      total,
    }));
  };

  const handleAddLineItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: 'Consulting Services',
      sub_description: '',
      quantity: 1,
      unit: 'Hours',
      rate: 150,
      amount: 150,
    };
    const updated = [...invoice.line_items, newItem];
    const { subtotal, taxAmount, total } = recalculateTotals(updated, invoice.tax_rate || 0, invoice.discount_amount || 0);
    setInvoice((prev) => ({
      ...prev,
      line_items: updated,
      subtotal,
      tax_amount: taxAmount,
      total,
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    if (invoice.line_items.length <= 1) return;
    const updated = invoice.line_items.filter((_, i) => i !== index);
    const { subtotal, taxAmount, total } = recalculateTotals(updated, invoice.tax_rate || 0, invoice.discount_amount || 0);
    setInvoice((prev) => ({
      ...prev,
      line_items: updated,
      subtotal,
      tax_amount: taxAmount,
      total,
    }));
  };

  const handleClientSelect = (clientId: string) => {
    const selected = clients.find((c) => c.id === clientId);
    if (!selected) return;

    setInvoice((prev) => ({
      ...prev,
      client_id: selected.id,
      bill_to: {
        name: selected.name,
        contact_person: selected.contact_person || '',
        address_line1: selected.address_line1 || '',
        city: selected.city || '',
        state: selected.state || '',
        zip: selected.zip || '',
        country: selected.country || 'United States',
        email: selected.email || '',
      },
    }));
  };

  const handlePaymentProfileSelect = (profileId: string) => {
    const selected = paymentProfiles.find((p) => p.id === profileId);
    if (!selected) return;

    setInvoice((prev) => ({
      ...prev,
      payment_profile_id: selected.id,
      payment_details: {
        bank_name: selected.bank_name,
        bank_location: selected.bank_location || '',
        account_name: selected.account_name,
        account_number: selected.account_number,
        routing_number: selected.routing_number || '',
        swift_code: selected.swift_code || '',
        reference_instructions: selected.reference_instructions || `Invoice ${prev.invoice_number}`,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const url = isNew ? '/api/invoices' : `/api/invoices/${invoice.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });

      if (!res.ok) throw new Error('Failed to save invoice');
      const data = await res.json();
      setMessage({ type: 'success', text: 'Invoice saved successfully!' });
      if (isNew) {
        router.push(`/invoices/${data.id}`);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving invoice' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, company: defaultCompany }),
      });

      if (!res.ok) throw new Error('PDF Generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number || 'invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-16 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/invoices')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to Invoices"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {isNew ? 'New Invoice' : `Edit ${invoice.invoice_number}`}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {invoice.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Live preview & vector PDF generation</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {message && (
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </span>
          )}

          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 mr-2">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900"
              title="Zoom Out"
            >
              -
            </button>
            <span className="text-[11px] font-mono font-medium text-slate-600 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900"
              title="Zoom In"
            >
              +
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
          >
            Print
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 transition-all disabled:opacity-50"
          >
            {downloading ? (
              <span>Generating PDF...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1700px] mx-auto w-full">
        {/* Left Form Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
          {/* Card 1: Key Metadata */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoice_number}
                  onChange={(e) => setInvoice({ ...invoice, invoice_number: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={invoice.status}
                  onChange={(e) => setInvoice({ ...invoice, status: e.target.value as any })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="saved">Saved</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoice.invoice_date}
                  onChange={(e) => setInvoice({ ...invoice, invoice_date: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoice.due_date}
                  onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Client Selector & Bill To */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client & Billing</h3>
              <select
                onChange={(e) => handleClientSelect(e.target.value)}
                value={invoice.client_id || ''}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="">-- Load Client Preset --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Company Name</label>
                <input
                  type="text"
                  value={invoice.bill_to?.name || ''}
                  onChange={(e) => setInvoice({ ...invoice, bill_to: { ...invoice.bill_to, name: e.target.value } })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={invoice.bill_to?.contact_person || ''}
                    onChange={(e) => setInvoice({ ...invoice, bill_to: { ...invoice.bill_to, contact_person: e.target.value } })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={invoice.bill_to?.email || ''}
                    onChange={(e) => setInvoice({ ...invoice, bill_to: { ...invoice.bill_to, email: e.target.value } })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line</label>
                <input
                  type="text"
                  value={invoice.bill_to?.address_line1 || ''}
                  onChange={(e) => setInvoice({ ...invoice, bill_to: { ...invoice.bill_to, address_line1: e.target.value } })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={invoice.bill_to?.city || ''}
                    onChange={(e) => setInvoice({ ...invoice, bill_to: { ...invoice.bill_to, city: e.target.value } })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={invoice.bill_to?.state || ''}
                    onChange={(e) => setInvoice({ ...invoice, bill_to: { ...invoice.bill_to, state: e.target.value } })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    value={invoice.bill_to?.zip || ''}
                    onChange={(e) => setInvoice({ ...invoice, bill_to: { ...invoice.bill_to, zip: e.target.value } })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Engagement & Consultant (Crucial User Requirement) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Engagement & Consultant</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service / Project Description</label>
                <input
                  type="text"
                  value={invoice.service_description || ''}
                  onChange={(e) => setInvoice({ ...invoice, service_description: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Role</label>
                  <input
                    type="text"
                    value={invoice.role || ''}
                    onChange={(e) => setInvoice({ ...invoice, role: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Consultant Field */}
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1 flex items-center justify-between">
                    <span>Consultant / Specialist</span>
                    <button
                      type="button"
                      onClick={() => setInvoice({ ...invoice, consultant: 'Jordan Smith' })}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Set "Jordan Smith"
                    </button>
                  </label>
                  <input
                    type="text"
                    value={invoice.consultant || ''}
                    onChange={(e) => setInvoice({ ...invoice, consultant: e.target.value })}
                    placeholder="e.g. Jordan Smith"
                    className="w-full text-xs font-bold text-blue-900 bg-blue-50/50 px-3 py-2 rounded-xl border border-blue-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Period Start</label>
                  <input
                    type="date"
                    value={invoice.service_period_start || ''}
                    onChange={(e) => setInvoice({ ...invoice, service_period_start: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Period End</label>
                  <input
                    type="date"
                    value={invoice.service_period_end || ''}
                    onChange={(e) => setInvoice({ ...invoice, service_period_end: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Line Items */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Items</h3>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                <span>+ Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {invoice.line_items.map((item, idx) => (
                <div key={item.id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Item #{idx + 1}</span>
                    {invoice.line_items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Service / Deliverable description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                      className="w-full text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Sub-description / details (optional)"
                      value={item.sub_description || ''}
                      onChange={(e) => handleLineItemChange(idx, 'sub_description', e.target.value)}
                      className="w-full text-xs text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Qty</label>
                      <input
                        type="number"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Unit</label>
                      <input
                        type="text"
                        value={item.unit || 'Hours'}
                        onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)}
                        className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Rate ($)</label>
                      <input
                        type="number"
                        step="any"
                        value={item.rate}
                        onChange={(e) => handleLineItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Amount</label>
                      <div className="text-xs font-mono font-bold text-slate-900 py-1.5 px-2 bg-slate-100 rounded-lg text-right">
                        ${(Number(item.amount) || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Row */}
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="any"
                  value={invoice.tax_rate || 0}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    const { subtotal, taxAmount, total } = recalculateTotals(invoice.line_items, rate, invoice.discount_amount || 0);
                    setInvoice({ ...invoice, tax_rate: rate, tax_amount: taxAmount, total });
                  }}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount ($)</label>
                <input
                  type="number"
                  step="any"
                  value={invoice.discount_amount || 0}
                  onChange={(e) => {
                    const disc = parseFloat(e.target.value) || 0;
                    const { subtotal, taxAmount, total } = recalculateTotals(invoice.line_items, invoice.tax_rate || 0, disc);
                    setInvoice({ ...invoice, discount_amount: disc, total });
                  }}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Payment Profile & Bank Details */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</h3>
              <select
                onChange={(e) => handlePaymentProfileSelect(e.target.value)}
                value={invoice.payment_profile_id || ''}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="">-- Select Bank Profile --</option>
                {paymentProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profile_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={invoice.payment_details?.bank_name || ''}
                  onChange={(e) => setInvoice({ ...invoice, payment_details: { ...invoice.payment_details, bank_name: e.target.value } })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={invoice.payment_details?.account_number || ''}
                    onChange={(e) => setInvoice({ ...invoice, payment_details: { ...invoice.payment_details, account_number: e.target.value } })}
                    className="w-full text-xs font-mono font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Routing / ABA</label>
                  <input
                    type="text"
                    value={invoice.payment_details?.routing_number || ''}
                    onChange={(e) => setInvoice({ ...invoice, payment_details: { ...invoice.payment_details, routing_number: e.target.value } })}
                    className="w-full text-xs font-mono font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Panel (7 cols) */}
        <div className="lg:col-span-7 bg-slate-200/60 rounded-3xl p-6 border border-slate-300/60 flex flex-col items-center justify-start overflow-auto">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex justify-center"
          >
            <GenericInvoiceTemplate invoice={invoice} company={defaultCompany} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default InvoiceEditor;
