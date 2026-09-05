import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../layouts/OnboardingLayout';
import { UploadCloud, Plus, Loader2, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { processInvoicesCsv } from '../../lib/csvParser';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';

export const Step3Results = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('manual');
  const [isUploading, setIsUploading] = useState(false);
  const [imported, setImported] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ client_name: '', client_email: '', amount: '', currency: 'USD', due_date: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [manualAdded, setManualAdded] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkspace) return;
    setIsUploading(true); setError(null);
    try {
      const count = await processInvoicesCsv(file, activeWorkspace.id);
      setImported(count);
      addToast(`${count} invoices imported!`, 'success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    setIsSaving(true); setError(null);
    try {
      await api.invoices.create({
        workspace_id: activeWorkspace.id,
        client_name: form.client_name.trim(),
        client_email: form.client_email.trim(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        due_date: form.due_date,
        status: 'pending',
      });
      setManualAdded(true);
      addToast('Invoice added successfully!', 'success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add invoice.');
    } finally {
      setIsSaving(false);
    }
  };

  const done = imported !== null || manualAdded;

  return (
    <OnboardingLayout step={3} totalSteps={3} showSkip onSkip={() => navigate('/app')}>
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Add Your First Invoice
        </h1>
        <p className="text-gray-500 text-base font-medium max-w-lg mx-auto">
          Start Astrix&apos;s recovery engine by adding an overdue invoice. AI will send the first reminder today.
        </p>
      </div>

      {done ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-apple text-center animate-[fadeIn_0.4s_ease-out]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
            {imported ? `${imported} Invoices Imported!` : 'Invoice Added!'}
          </h3>
          <p className="text-gray-500 mb-8">Astrix will begin chasing tomorrow at 09:00 UTC. Time to get paid! 💰</p>
          <button onClick={() => navigate('/app')}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-brand-blue transition-colors text-lg">
            Enter Your Dashboard →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
            <button onClick={() => setActiveTab('manual')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              <Plus className="w-4 h-4" /> Manual Entry
            </button>
            <button onClick={() => setActiveTab('csv')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'csv' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              <UploadCloud className="w-4 h-4" /> Upload CSV
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          {activeTab === 'manual' ? (
            <form onSubmit={handleManualAdd} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-apple space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Client Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))}
                    placeholder="Acme Corp" className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Client Email</label>
                  <input type="email" value={form.client_email} onChange={e => setForm(p => ({ ...p, client_email: e.target.value }))}
                    placeholder="billing@acme.com" className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Amount <span className="text-red-500">*</span></label>
                  <input type="number" required min="1" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="2400" className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Currency</label>
                  <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-blue">
                    <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Due Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
              </div>
              <button type="submit" disabled={isSaving}
                className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-glow-blue">
                {isSaving ? <><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Adding...</> : 'Add Invoice & Start Recovery'}
              </button>
            </form>
          ) : (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-apple text-center">
              <FileSpreadsheet className="w-12 h-12 text-brand-blue mx-auto mb-4 opacity-80" />
              <h3 className="font-bold text-gray-900 mb-1">Upload Invoice CSV</h3>
              <p className="text-xs text-gray-500 mb-1">Required: <code className="bg-gray-100 px-1 rounded">client_name</code>, <code className="bg-gray-100 px-1 rounded">amount</code>, <code className="bg-gray-100 px-1 rounded">due_date</code></p>
              <p className="text-xs text-gray-400 mb-6">Optional: client_email, currency</p>
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto transition-colors">
                {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : 'Select CSV File'}
              </button>
            </div>
          )}

          <div className="text-center">
            <button onClick={() => navigate('/app')} className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium">
              Skip — I&apos;ll add invoices from the dashboard
            </button>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
};
