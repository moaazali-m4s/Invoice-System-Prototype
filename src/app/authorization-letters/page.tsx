import React from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function LettersListPage() {
  const letters = dbService.getAuthorizationLetters();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Authorization Letters</h1>
          <p className="text-xs text-slate-500 mt-1">Official corporate letters with dual-mode signature & rubber seal control</p>
        </div>
        <Link
          href="/authorization-letters/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <span>+ Issue Authorization Letter</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {letters.map((letObj) => {
          const isTruthy = (val: any) => val === true || val === 1 || val === '1';
          const isDigital = isTruthy(letObj.show_signature) && isTruthy(letObj.show_stamp);
          return (
            <div
              key={letObj.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-slate-500 font-semibold">{letObj.letter_number}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      isDigital
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isDigital ? 'Full Digital (Signed + Sealed)' : 'Physical Print Ready (Blank)'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{letObj.representative_name}</h3>
                <p className="text-xs text-blue-700 font-semibold mt-0.5">{letObj.relationship}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{letObj.purpose}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Date: {letObj.letter_date}</span>
                <Link
                  href={`/authorization-letters/${letObj.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Edit / PDF
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
