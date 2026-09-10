'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthorizationLetter, Company } from '@/types';
import GenericLetterTemplate from '@/templates/letter/GenericLetterTemplate';

interface AuthorizationLetterEditorProps {
  initialLetter?: AuthorizationLetter;
  companies: Company[];
  isNew?: boolean;
}

export const AuthorizationLetterEditor: React.FC<AuthorizationLetterEditorProps> = ({
  initialLetter,
  companies,
  isNew = false,
}) => {
  const router = useRouter();
  const defaultCompany = companies[0] || null;

  const [letter, setLetter] = useState<AuthorizationLetter>(() => {
    if (initialLetter) return initialLetter;

    return {
      id: `letter-${Date.now()}`,
      company_id: defaultCompany?.id || 'xyz-company',
      letter_number: `AL-XYZ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      letter_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      salutation: 'To Whom It May Concern,',
      representative_name: 'Jordan Smith',
      company_name: defaultCompany?.legal_name || 'XYZ Company LLC',
      relationship: 'Senior Solutions Consultant',
      purpose: 'for commercial contract execution, technical representations, and billing-related activities on behalf of the company.',
      opening_text: '',
      duties_text: `${defaultCompany?.legal_name || 'XYZ Company LLC'} confirms that the above-named representative is authorized to perform assigned technical duties, execute statements of work, and communicate with commercial clients on behalf of the company in connection with legitimate business operations.`,
      validity_statement: `This authorization shall remain in effect until revoked in writing by ${defaultCompany?.legal_name || 'XYZ Company LLC'}.`,
      signatory_name: defaultCompany?.default_signatory_name || 'Alex Morgan',
      signatory_title: defaultCompany?.default_signatory_title || 'CEO & Founder',
      signatory_signature_url: defaultCompany?.signature_url || '/assets/signatures/alex_morgan.png',
      show_signature: 1,
      stamp_url: defaultCompany?.stamp_url || '/assets/seals/xyz_seal.png',
      show_stamp: 1,
      document_name: '',
      status: 'issued',
      is_sample: 0,
    };
  });

  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [zoom, setZoom] = useState<number>(0.9);

  const isTruthy = (val: any) => val === true || val === 1 || val === '1';

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const url = isNew ? '/api/authorization-letters' : `/api/authorization-letters/${letter.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letter),
      });

      if (!res.ok) throw new Error('Failed to save authorization letter');
      const data = await res.json();
      setMessage({ type: 'success', text: 'Authorization letter saved successfully!' });
      if (isNew) {
        router.push(`/authorization-letters/${data.id}`);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving letter' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/pdf/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letter, company: defaultCompany }),
      });

      if (!res.ok) throw new Error('PDF Generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Authorization-Letter-${letter.representative_name.replace(/\s+/g, '-')}.pdf`;
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
      {/* Top Action Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-16 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/authorization-letters')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to Letters"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {isNew ? 'New Authorization Letter' : `Letter: ${letter.representative_name}`}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                {isTruthy(letter.show_signature) && isTruthy(letter.show_stamp) ? 'Digital Issued' : 'Physical Print Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-500">Dual-mode: Digital dispatch or physical ink signing</p>
          </div>
        </div>

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
            {saving ? 'Saving...' : 'Save Letter'}
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1700px] mx-auto w-full">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
          {/* Card 1: Print & Physical Security Controls (Per User Request) */}
          <div className="bg-white rounded-2xl p-5 border-2 border-blue-500/30 bg-blue-50/20 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print & Stamp Toggles</span>
              </h3>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setLetter({ ...letter, show_signature: 1, show_stamp: 1 })}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                >
                  Digital Full
                </button>
                <button
                  type="button"
                  onClick={() => setLetter({ ...letter, show_signature: 0, show_stamp: 0 })}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-white shadow-xs hover:bg-slate-800"
                >
                  Print Ready
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Toggle digital elements off if printing physical documents for pen signature or manual wax/ink stamp.
            </p>

            <div className="space-y-3">
              {/* Signature Toggle */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={letter.show_signature === undefined ? true : isTruthy(letter.show_signature)}
                  onChange={(e) => setLetter({ ...letter, show_signature: e.target.checked ? 1 : 0 })}
                  className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Include Digital Signature</span>
                  <span className="text-[11px] text-slate-500">
                    Uncheck to leave a clean blank line for handwritten executive signature.
                  </span>
                </div>
              </label>

              {/* Stamp Toggle */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={letter.show_stamp === undefined ? true : isTruthy(letter.show_stamp)}
                  onChange={(e) => setLetter({ ...letter, show_stamp: e.target.checked ? 1 : 0 })}
                  className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Include Corporate Rubber Seal</span>
                  <span className="text-[11px] text-slate-500">
                    Uncheck to leave an empty circle area for physical embossed/ink stamping.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Card 2: Representative & Authority Details */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Representative Information</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={letter.letter_number || ''}
                  onChange={(e) => setLetter({ ...letter, letter_number: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  value={letter.letter_date}
                  onChange={(e) => setLetter({ ...letter, letter_date: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Representative Full Name</label>
              <input
                type="text"
                value={letter.representative_name}
                onChange={(e) => setLetter({ ...letter, representative_name: e.target.value })}
                className="w-full text-xs font-bold text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship / Role</label>
                <input
                  type="text"
                  value={letter.relationship}
                  onChange={(e) => setLetter({ ...letter, relationship: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salutation</label>
                <input
                  type="text"
                  value={letter.salutation}
                  onChange={(e) => setLetter({ ...letter, salutation: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scope / Purpose</label>
              <textarea
                rows={2}
                value={letter.purpose}
                onChange={(e) => setLetter({ ...letter, purpose: e.target.value })}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Card 3: Letter Body & Legal Scope */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Letter Content & Legal Clauses</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duties & Authority Statement (Paragraph 2)
              </label>
              <textarea
                rows={3}
                value={letter.duties_text || ''}
                onChange={(e) => setLetter({ ...letter, duties_text: e.target.value })}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Validity Statement (Paragraph 3)</label>
              <textarea
                rows={2}
                value={letter.validity_statement || ''}
                onChange={(e) => setLetter({ ...letter, validity_statement: e.target.value })}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Card 4: Signatory Details */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Authorized Signatory</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Signatory Name</label>
                <input
                  type="text"
                  value={letter.signatory_name}
                  onChange={(e) => setLetter({ ...letter, signatory_name: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Signatory Title</label>
                <input
                  type="text"
                  value={letter.signatory_title}
                  onChange={(e) => setLetter({ ...letter, signatory_title: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-7 bg-slate-200/60 rounded-3xl p-6 border border-slate-300/60 flex flex-col items-center justify-start overflow-auto">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex justify-center"
          >
            <GenericLetterTemplate letter={letter} company={defaultCompany} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuthorizationLetterEditor;
