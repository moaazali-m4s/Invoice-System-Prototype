import React from 'react';
import { AuthorizationLetter, Company } from '@/types';

interface GenericLetterTemplateProps {
  letter: AuthorizationLetter;
  company?: Company | null;
}

export const GenericLetterTemplate: React.FC<GenericLetterTemplateProps> = ({ letter, company }) => {
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

  const isTruthy = (val: any) => val === true || val === 1 || val === '1';
  const showSig = letter.show_signature === undefined ? true : isTruthy(letter.show_signature);
  const showStamp = letter.show_stamp === undefined ? true : isTruthy(letter.show_stamp);
  const sigUrl = letter.signatory_signature_url || comp.signature_url || '/assets/signatures/alex_morgan.png';
  const stampUrl = letter.stamp_url || comp.stamp_url || '/assets/seals/xyz_seal.png';

  const defaultPurpose = 'for commercial contract execution, technical representations, and billing-related activities on behalf of the company.';
  const defaultDuties = `${letter.company_name || comp.legal_name || comp.name} confirms that the above-named representative is authorized to perform assigned technical duties, execute statements of work, and communicate with commercial clients on behalf of the company in connection with legitimate business operations.`;
  const defaultValidity = `This authorization shall remain in effect until revoked in writing by ${letter.company_name || comp.legal_name || comp.name}.`;

  return (
    <div
      id="letter-sheet"
      className="w-full max-w-[816px] min-h-[1056px] mx-auto bg-white text-slate-800 shadow-xl border border-slate-200/80 rounded-2xl p-12 flex flex-col justify-between font-sans relative overflow-hidden print:shadow-none print:border-0 print:p-8 print:rounded-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600"></div>

      <div>
        {/* Letterhead Header */}
        <div className="flex items-center justify-between pb-8 border-b-2 border-slate-900">
          <div className="flex items-center gap-4">
            <img
              src={comp.logo_url || '/assets/company/logo.png'}
              alt={comp.name}
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{comp.legal_name || comp.name}</h1>
              {comp.tagline && <p className="text-xs text-slate-500 font-medium tracking-wide">{comp.tagline}</p>}
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-900">{comp.address_line1}</div>
            <div>{comp.city}, {comp.state} {comp.zip}, {comp.country}</div>
            <div>Email: <span className="text-slate-800 font-medium">{comp.email}</span></div>
            <div>Phone: <span className="text-slate-800 font-medium">{comp.phone}</span></div>
            <div>Web: <span className="text-blue-600 font-medium">{comp.website}</span></div>
          </div>
        </div>

        {/* Reference & Date Bar */}
        <div className="flex justify-between items-center mt-8 mb-8 text-sm">
          <div>
            {letter.letter_number && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Ref: {letter.letter_number}
              </span>
            )}
          </div>
          <div className="text-slate-600 font-medium">
            Date: <span className="text-slate-900 font-semibold">{letter.letter_date}</span>
          </div>
        </div>

        {/* Salutation */}
        <div className="text-base font-bold text-slate-900 mb-6">
          {letter.salutation || 'To Whom It May Concern,'}
        </div>

        {/* Letter Subject */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject</span>
          <span className="text-sm font-bold text-slate-900 uppercase">
            Letter of Authorization — {letter.representative_name}
          </span>
        </div>

        {/* Body Opening */}
        <div className="text-sm leading-relaxed text-slate-700 mb-6 text-justify">
          {letter.opening_text || (
            <>
              This letter serves as official confirmation that{' '}
              <strong className="text-slate-900 font-bold underline decoration-blue-500 underline-offset-2">
                {letter.representative_name}
              </strong>{' '}
              is an authorized representative of {letter.company_name || comp.legal_name || comp.name} and is duly
              authorized to act on behalf of the company {letter.purpose || defaultPurpose}
            </>
          )}
        </div>

        {/* Details Cards */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Company Information
            </span>
            <div className="text-sm font-bold text-slate-900">{letter.company_name || comp.legal_name || comp.name}</div>
            <div className="text-xs text-slate-600 mt-1">{comp.address_line1}, {comp.city}</div>
            <div className="text-xs text-slate-500 mt-0.5">Jurisdiction: {comp.country}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Representative Details
            </span>
            <div className="text-sm font-bold text-slate-900">{letter.representative_name}</div>
            <div className="text-xs text-slate-700 mt-1 font-medium">
              Role: <span className="text-blue-700">{letter.relationship || 'Authorized Representative'}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Status: Active & Authorized</div>
          </div>
        </div>

        {/* Duties Paragraph */}
        <div className="text-sm leading-relaxed text-slate-700 mb-6 text-justify">
          {letter.duties_text || defaultDuties}
        </div>

        {/* Validity Paragraph */}
        <div className="text-sm leading-relaxed text-slate-700 mb-8 text-justify">
          {letter.validity_statement || defaultValidity}
        </div>
      </div>

      {/* Sign-off & Signatures */}
      <div className="pt-6 border-t border-slate-200">
        <div className="text-sm text-slate-700 font-medium mb-4">Sincerely,</div>

        <div className="flex items-end justify-between">
          {/* Signatory details */}
          <div className="w-64">
            <div className="h-16 flex items-end">
              {showSig && sigUrl ? (
                <img
                  src={sigUrl}
                  alt={letter.signatory_name || 'Signature'}
                  className="h-14 w-auto object-contain pb-1"
                />
              ) : (
                <div className="h-14 flex items-center text-xs text-slate-300 italic">
                  [Physical Signature Space]
                </div>
              )}
            </div>
            <div className="w-48 border-t border-slate-400 mb-1.5"></div>
            <div className="font-bold text-slate-900 text-sm">{letter.signatory_name || 'Alex Morgan'}</div>
            <div className="text-xs text-slate-600">{letter.signatory_title || 'CEO & Founder'}</div>
            <div className="text-xs text-slate-500 font-medium">{letter.company_name || comp.legal_name || comp.name}</div>
          </div>

          {/* Corporate Seal */}
          <div className="w-36 h-36 flex items-center justify-center">
            {showStamp && stampUrl ? (
              <img
                src={stampUrl}
                alt="Corporate Seal"
                className="w-32 h-32 object-contain opacity-95 filter contrast-125"
              />
            ) : (
              <div className="w-28 h-28 border border-dashed border-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-300 text-center p-2">
                Physical Corporate Seal
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 pt-8 mt-6 border-t border-slate-100">
          This document is generated by {comp.legal_name || comp.name} • Registered Corporate Document
        </div>
      </div>
    </div>
  );
};
export default GenericLetterTemplate;
