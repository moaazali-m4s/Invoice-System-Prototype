'use client';

import React, { useState, useEffect } from 'react';
import { PaymentProfile } from '@/types';

export default function PaymentProfilesPage() {
  const [profiles, setProfiles] = useState<PaymentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PaymentProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const defaultFormData: Partial<PaymentProfile> = {
    company_id: 'xyz-company',
    profile_name: '',
    bank_name: '',
    bank_location: '',
    bank_address: '',
    account_name: 'XYZ Company LLC',
    account_type: 'Corporate Checking',
    currency: 'USD',
    account_number: '',
    routing_number: '',
    routing_number_wire: '',
    swift_code: '',
    reference_instructions: 'Invoice {INVOICE_NUMBER}',
    additional_instructions: 'Please send remittance advice upon transfer.',
  };

  const [formData, setFormData] = useState<Partial<PaymentProfile>>(defaultFormData);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payment-profiles');
      if (res.ok) {
        const data: PaymentProfile[] = await res.json();
        setProfiles(data);
      }
    } catch (e) {
      console.error('Failed to fetch payment profiles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleOpenAdd = () => {
    setEditingProfile(null);
    setFormData({ ...defaultFormData });
    setModalOpen(true);
  };

  const handleOpenEdit = (profile: PaymentProfile) => {
    setEditingProfile(profile);
    setFormData({ ...profile });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.profile_name?.trim()) {
      alert('Profile Name is required');
      return;
    }
    if (!formData.bank_name?.trim()) {
      alert('Bank Name is required');
      return;
    }
    if (!formData.account_number?.trim()) {
      alert('Account Number is required');
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const isEdit = Boolean(editingProfile?.id);
      const url = isEdit ? `/api/payment-profiles/${editingProfile!.id}` : '/api/payment-profiles';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        company_id: formData.company_id || 'xyz-company',
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save payment profile');
      }

      setFeedback({
        type: 'success',
        text: isEdit ? 'Payment profile updated successfully!' : 'Payment profile created successfully!',
      });
      setModalOpen(false);
      await fetchProfiles();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Save error:', err);
      setFeedback({ type: 'error', text: err.message || 'Error saving payment profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete payment profile "${name}"? Invoices linked to this profile will retain their saved snapshot details.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/payment-profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: `Payment profile "${name}" deleted.` });
        await fetchProfiles();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete payment profile');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to delete payment profile');
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.profile_name?.toLowerCase().includes(q) ||
      p.bank_name?.toLowerCase().includes(q) ||
      p.bank_location?.toLowerCase().includes(q) ||
      p.account_name?.toLowerCase().includes(q) ||
      p.account_number?.toLowerCase().includes(q) ||
      p.currency?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with High-Contrast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Treasury & Remittance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Payment Profiles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage corporate bank accounts, wire remittance details, and electronic transfer routing for invoices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-slate-900/20 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add Payment Profile
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs hover:underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search bank, account, or currency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{filteredProfiles.length}</span> profile{filteredProfiles.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 mt-4">Loading payment profiles...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">No payment profiles found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            {search ? 'No profiles match your current search query.' : 'Configure your company bank accounts to include wiring instructions automatically on invoices.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add First Profile
          </button>
        </div>
      ) : (
        /* Profiles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProfiles.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Badge Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                    {p.account_type || 'Checking'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {p.currency || 'USD'}
                    </span>
                  </div>
                </div>

                {/* Profile Title & Bank */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{p.profile_name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {p.bank_name} {p.bank_location ? `• ${p.bank_location}` : ''}
                  </p>
                  {p.bank_address && (
                    <p className="text-xs text-slate-400 mt-0.5">{p.bank_address}</p>
                  )}
                </div>

                {/* Bank Account Details Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Account Name:</span>
                    <span className="font-bold text-slate-900 text-right">{p.account_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Account Number:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {p.account_number}
                    </span>
                  </div>
                  {p.routing_number && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Routing / ABA:</span>
                      <span className="font-mono text-slate-800">{p.routing_number}</span>
                    </div>
                  )}
                  {p.routing_number_wire && p.routing_number_wire !== p.routing_number && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Wire Routing:</span>
                      <span className="font-mono text-slate-800">{p.routing_number_wire}</span>
                    </div>
                  )}
                  {p.swift_code && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">SWIFT / BIC:</span>
                      <span className="font-mono font-bold text-slate-800">{p.swift_code}</span>
                    </div>
                  )}
                </div>

                {/* Reference Instructions */}
                {p.reference_instructions && (
                  <div className="text-xs text-slate-500 bg-amber-50/60 border border-amber-200/40 p-2.5 rounded-xl">
                    <span className="font-semibold text-amber-900">Remittance Reference: </span>
                    <span className="font-mono text-amber-950 font-medium">{p.reference_instructions}</span>
                  </div>
                )}
                {p.additional_instructions && (
                  <p className="text-xs text-slate-400 italic">
                    Note: {p.additional_instructions}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.profile_name)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Add / Edit Payment Profile */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editingProfile ? 'Edit Payment Profile' : 'Add New Payment Profile'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Remittance and banking instructions will be selectable on invoices.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile & Identification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Profile Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Primary Operating Account (USD)"
                      value={formData.profile_name || ''}
                      onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
                    <select
                      value={formData.account_type || 'Corporate Checking'}
                      onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="Corporate Checking">Corporate Checking</option>
                      <option value="Checking">Checking</option>
                      <option value="Savings">Savings</option>
                      <option value="Business Money Market">Business Money Market</option>
                      <option value="Wire Remittance Only">Wire Remittance Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                    <select
                      value={formData.currency || 'USD'}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                      <option value="CAD">CAD ($ - Canadian Dollar)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bank Institution Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Institution</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bank Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JPMorgan Chase Bank, N.A."
                      value={formData.bank_name || ''}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Location (City, State)</label>
                    <input
                      type="text"
                      placeholder="e.g. New York, NY, USA"
                      value={formData.bank_location || ''}
                      onChange={(e) => setFormData({ ...formData, bank_location: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 270 Park Avenue"
                      value={formData.bank_address || ''}
                      onChange={(e) => setFormData({ ...formData, bank_address: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Account Numbers & Routing */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Beneficiary / Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. XYZ Company LLC"
                      value={formData.account_name || ''}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Number / IBAN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1029384756"
                      value={formData.account_number || ''}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Routing / ABA (Domestic)</label>
                    <input
                      type="text"
                      placeholder="9 digits (e.g. 021000021)"
                      value={formData.routing_number || ''}
                      onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Wire Routing (If different)</label>
                    <input
                      type="text"
                      placeholder="e.g. 021000021"
                      value={formData.routing_number_wire || ''}
                      onChange={(e) => setFormData({ ...formData, routing_number_wire: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      placeholder="8-11 alphanumeric characters"
                      value={formData.swift_code || ''}
                      onChange={(e) => setFormData({ ...formData, swift_code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Remittance Instructions & Notes */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Remittance & Reference Advice</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reference Line Format</label>
                    <input
                      type="text"
                      placeholder="e.g. Invoice {INVOICE_NUMBER}"
                      value={formData.reference_instructions || ''}
                      onChange={(e) => setFormData({ ...formData, reference_instructions: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports tag <code>{'{INVOICE_NUMBER}'}</code> which auto-fills the corresponding invoice number.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Additional Transfer Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Please send proof of payment or remittance advice to finance@example.com"
                      value={formData.additional_instructions || ''}
                      onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingProfile ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
