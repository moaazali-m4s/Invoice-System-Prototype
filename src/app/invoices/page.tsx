import React from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/db';
import { formatCurrency } from '@/utils/formatters';

export const dynamic = 'force-dynamic';

export default function InvoicesListPage() {
  const invoices = dbService.getInvoices();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-xs text-slate-500 mt-1">Manage, preview, and generate high-fidelity vector PDF invoices</p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <span>+ Create New Invoice</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Invoice #</th>
                <th className="pb-3 px-3">Client</th>
                <th className="pb-3 px-3">Lead Consultant</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3 text-right">Amount</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No invoices created yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-3 font-bold text-slate-900 font-mono">{inv.invoice_number}</td>
                    <td className="py-4 px-3">
                      <div className="font-semibold text-slate-800">{inv.bill_to?.name || 'Unnamed Client'}</div>
                      <div className="text-[11px] text-slate-400">{inv.bill_to?.city || ''}</div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {inv.consultant || 'Jordan Smith'}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 font-medium">{inv.invoice_date}</td>
                    <td className="py-4 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right space-x-2">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs"
                      >
                        Edit / PDF
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
