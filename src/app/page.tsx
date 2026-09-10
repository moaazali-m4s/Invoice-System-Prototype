import React from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/db';
import { formatCurrency } from '@/utils/formatters';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const company = dbService.getCompany('xyz-company');
  const invoices = dbService.getInvoices();
  const clients = dbService.getClients();
  const letters = dbService.getAuthorizationLetters();

  const totalVolume = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-10 shadow-xl shadow-slate-900/10">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>COMMERCIAL OPERATIONS & BILLING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            {company?.legal_name || 'XYZ Company LLC'} — Document Studio
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Production-grade utility for enterprise invoicing, high-fidelity PDF vector rendering, dual-mode authorization letter issuance with physical print toggles, and client relationship management.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <span>+ Create New Invoice</span>
            </Link>
            <Link
              href="/authorization-letters/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95"
            >
              <span>+ Issue Authorization Letter</span>
            </Link>
            <Link
              href="/pdf-editor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95"
            >
              <span>Launch PDF Canvas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Invoiced Volume</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {formatCurrency(totalVolume)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{invoices.length} active invoices recorded</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Corporate Clients</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{clients.length}</div>
          <div className="text-xs text-slate-500 mt-1">Enterprise accounts registered</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Auth Letters</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{letters.length}</div>
          <div className="text-xs text-slate-500 mt-1">Dual-mode credentials created</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">PDF Fidelity</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">100% Vector</div>
          <div className="text-xs text-slate-500 mt-1">High-DPI Chromium engine</div>
        </div>
      </div>

      {/* Recent Invoices Section */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Invoices</h2>
            <p className="text-xs text-slate-500">Live invoices with consultant badges and vector export</p>
          </div>
          <Link
            href="/invoices"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

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
              {invoices.map((inv) => (
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
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Authorization Letters Section */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Authorization Letters</h2>
            <p className="text-xs text-slate-500">Official letters featuring physical ink print mode toggles</p>
          </div>
          <Link
            href="/authorization-letters"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {letters.map((letObj) => {
            const isTruthy = (val: any) => val === true || val === 1 || val === '1';
            const isDigital = isTruthy(letObj.show_signature) && isTruthy(letObj.show_stamp);
            return (
              <div
                key={letObj.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-slate-500 font-semibold">{letObj.letter_number}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        isDigital
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isDigital ? 'Digital Signed' : 'Print Ready (Blank Sign/Seal)'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{letObj.representative_name}</h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{letObj.relationship}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{letObj.purpose}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Date: {letObj.letter_date}</span>
                  <Link
                    href={`/authorization-letters/${letObj.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Open Editor
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
