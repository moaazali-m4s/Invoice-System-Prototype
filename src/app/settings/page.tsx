import React from 'react';
import { dbService } from '@/lib/db';
import DataManagement from '@/components/DataManagement';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const company = dbService.getCompany('xyz-company');
  const activityLogs = dbService.getActivityLogs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System & Data Backup</h1>
        <p className="text-xs text-slate-500 mt-1">Export full JSON snapshots, restore datasets, and review audit trail</p>
      </div>

      {/* Embedded Data Management Component */}
      <DataManagement />

      {/* Company Identity Summary */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Company Profile</h3>
        {company && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
            <div className="space-y-1.5">
              <div><strong className="text-slate-800">Legal Name:</strong> {company.legal_name}</div>
              <div><strong className="text-slate-800">Tagline:</strong> {company.tagline}</div>
              <div><strong className="text-slate-800">Address:</strong> {company.address_line1}, {company.city}, {company.state} {company.zip}</div>
              <div><strong className="text-slate-800">Country:</strong> {company.country}</div>
            </div>
            <div className="space-y-1.5">
              <div><strong className="text-slate-800">Signatory:</strong> {company.default_signatory_name} ({company.default_signatory_title})</div>
              <div><strong className="text-slate-800">Email:</strong> {company.email}</div>
              <div><strong className="text-slate-800">Phone:</strong> {company.phone}</div>
              <div><strong className="text-slate-800">Website:</strong> {company.website}</div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Logs Audit Trail */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">System Activity Audit Log</h3>
        <div className="space-y-2">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-slate-200 text-slate-800 text-[10px]">
                  {log.action}
                </span>
                <span className="text-slate-700">{log.description}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{log.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
