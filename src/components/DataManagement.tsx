'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileJson,
  X,
  Layers,
  Database,
  Info,
} from 'lucide-react';
import { BackupData } from '@/types';

interface DataManagementProps {
  onDataUpdated?: () => void;
}

export default function DataManagement({ onDataUpdated }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'replace' | 'merge'>('replace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await fetch('/api/backup/export');
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate export backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `invoice-studio-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage('Backup downloaded successfully. All records and configurations are safely preserved.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while exporting data.');
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger File Input
  const handleImportClick = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle File Selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text) as BackupData;

        if (!json || typeof json !== 'object') {
          throw new Error('Selected file does not contain valid JSON.');
        }

        if (json.version !== 1) {
          throw new Error(
            `Unsupported backup schema version: ${json.version ?? 'unknown'}. Only version 1 is supported.`
          );
        }

        setPendingBackup(json);
        setSelectedMode('replace');
        setImportModalOpen(true);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to read or parse the JSON backup file.');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Could not read the selected file from disk.');
    };
    reader.readAsText(file);
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (!pendingBackup) return;

    try {
      setIsImporting(true);
      setErrorMessage(null);

      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: pendingBackup,
          mode: selectedMode,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to restore database from backup.');
      }

      setImportModalOpen(false);
      setPendingBackup(null);
      setSuccessMessage(
        `Database restored successfully (${selectedMode === 'replace' ? 'Restore & Replace' : 'Merge & Update'}). Restored ${
          result.counts?.invoices ?? 0
        } invoices and ${result.counts?.authorizationLetters ?? 0} letters.`
      );

      if (onDataUpdated) {
        onDataUpdated();
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while restoring backup.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Data Management & Backup</h3>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          Schema v1.0
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-5 leading-relaxed">
        Export complete database snapshots to portable JSON format including all invoices, authorization letters,
        companies, clients, payment profiles, and PDF editor layouts. Restore anytime using Replace or Merge strategy.
      </p>

      {/* Notifications */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">{successMessage}</div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting || isImporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
        >
          {isExporting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Export Data</span>
        </button>

        <button
          onClick={handleImportClick}
          disabled={isExporting || isImporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
        >
          {isImporting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>Import Data</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        <span className="text-[11px] text-slate-400">
          Standard JSON backup format (<code className="font-mono">invoice-studio-backup-YYYY-MM-DD.json</code>)
        </span>
      </div>

      {/* Import Confirmation & Mode Selection Modal */}
      {importModalOpen && pendingBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Confirm Database Import</h4>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                disabled={isImporting}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                You are about to restore data from a valid <strong className="text-slate-900">v1 backup archive</strong>.
              </p>

              {/* Backup Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Backup Contents Summary
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span>Exported Date:</span>
                    <span className="font-mono font-medium text-slate-900">
                      {pendingBackup.exportedAt ? new Date(pendingBackup.exportedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span>Invoices:</span>
                    <span className="font-bold text-slate-900">{pendingBackup.invoices?.length ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span>Auth Letters:</span>
                    <span className="font-bold text-slate-900">
                      {pendingBackup.authorizationLetters?.length ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span>Clients:</span>
                    <span className="font-bold text-slate-900">{pendingBackup.clients?.length ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span>Companies:</span>
                    <span className="font-bold text-slate-900">{pendingBackup.companies?.length ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span>Payment Profiles:</span>
                    <span className="font-bold text-slate-900">
                      {pendingBackup.paymentProfiles?.length ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2.5 pt-1">
                <label className="block font-bold text-slate-800 text-xs">Choose Import Strategy:</label>

                {/* Strategy A: Restore & Replace */}
                <label
                  onClick={() => setSelectedMode('replace')}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
                    selectedMode === 'replace'
                      ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={selectedMode === 'replace'}
                    onChange={() => setSelectedMode('replace')}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Restore & Replace</span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-red-100 text-red-700 rounded">
                        Clean Restore
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Replaces existing database records with the backup file data. Recommended for disaster recovery or complete workspace restores.
                    </p>
                  </div>
                </label>

                {/* Strategy B: Merge & Update */}
                <label
                  onClick={() => setSelectedMode('merge')}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
                    selectedMode === 'merge'
                      ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={selectedMode === 'merge'}
                    onChange={() => setSelectedMode('merge')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Merge & Update</span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded">
                        Additive
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Updates matching existing records by ID and inserts new ones. Preserves existing invoices and letters not present in the backup.
                    </p>
                  </div>
                </label>
              </div>

              {selectedMode === 'replace' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded flex items-center gap-2 text-[11px] text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Warning: This will overwrite current records with the contents of this backup file.</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                disabled={isImporting}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors ${
                  selectedMode === 'replace'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Restoring Database...</span>
                  </>
                ) : (
                  <span>
                    Proceed with {selectedMode === 'replace' ? 'Restore & Replace' : 'Merge & Update'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
