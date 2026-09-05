import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import {
  CreditCard, Loader2, Trash2, Plus, X,
  Mail, DollarSign, TrendingUp, Clock, AlertCircle,
  CheckCircle2, Volume2, Sliders, Eye, Copy,
  ShieldCheck, Zap, Activity, Bot, Settings as SettingsIcon
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Invoice {
  id: string;
  client_name: string;
  client_email: string;
  amount: number;
  currency: string;
  due_date: string;
  status: 'pending' | 'paid' | 'paused' | 'disputed';
  ai_status: 'nudge_sent' | 'escalated' | 'pending' | 'paid';
  days_overdue: number;
  reminder_count: number;
}

interface ActivityItem {
  id: string;
  type: 'nudge_sent' | 'payment_received' | 'escalated' | 'invoice_created';
  message: string;
  timestamp: string;
  amount?: number;
}

interface DashboardMetrics {
  total_recovered: number;
  currently_outstanding: number;
  active_chases: number;
  recovery_rate: number;
  pending_invoices: number;
  this_month_recovered: number;
}

const MOCK_INVOICES: Invoice[] = [
  { id: '1', client_name: 'Acme Corp', client_email: 'billing@acme.com', amount: 2400, currency: 'USD', due_date: '2025-01-01', status: 'pending', days_overdue: 14, ai_status: 'nudge_sent', reminder_count: 2 },
  { id: '2', client_name: 'TechStart GmbH', client_email: 'finance@techstart.de', amount: 1800, currency: 'EUR', due_date: '2024-12-28', status: 'pending', days_overdue: 18, ai_status: 'escalated', reminder_count: 3 },
  { id: '3', client_name: 'DataFlow Ltd', client_email: 'accounts@dataflow.co', amount: 890, currency: 'USD', due_date: '2025-01-05', status: 'pending', days_overdue: 10, ai_status: 'pending', reminder_count: 0 },
  { id: '4', client_name: 'InnovateLab', client_email: 'pay@innovatelab.com', amount: 1500, currency: 'USD', due_date: '2024-12-15', status: 'paid', days_overdue: 0, ai_status: 'paid', reminder_count: 1 },
  { id: '5', client_name: 'CloudScale Inc', client_email: 'ap@cloudscale.io', amount: 3200, currency: 'USD', due_date: '2024-12-20', status: 'paused', days_overdue: 25, ai_status: 'nudge_sent', reminder_count: 2 },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'nudge_sent', message: 'AI sent a friendly nudge to Acme Corp for Invoice #1042', timestamp: '2 hours ago', amount: 2400 },
  { id: '2', type: 'payment_received', message: 'Payment received from InnovateLab — Invoice #1039 cleared', timestamp: '5 hours ago', amount: 1500 },
  { id: '3', type: 'escalated', message: 'AI escalated TechStart GmbH to Level 2 (Firm tone)', timestamp: '1 day ago' },
  { id: '4', type: 'invoice_created', message: 'New invoice added for DataFlow Ltd', timestamp: '2 days ago', amount: 890 },
  { id: '5', type: 'nudge_sent', message: 'AI sent 2nd reminder to CloudScale Inc', timestamp: '3 days ago', amount: 3200 },
];

const MOCK_METRICS: DashboardMetrics = {
  total_recovered: 47200,
  currently_outstanding: 8290,
  active_chases: 3,
  recovery_rate: 94,
  pending_invoices: 4,
  this_month_recovered: 12400
};

type TabId = 'overview' | 'action-center' | 'tone-studio' | 'settings';

export const Settings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activities] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Action Center
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'paused'>('all');

  // Tone Studio
  const [sampleEmails, setSampleEmails] = useState('');
  const [toneLevel, setToneLevel] = useState(2);
  const [generatedPreview, setGeneratedPreview] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Settings
  const [connectedGateways] = useState<string[]>(['stripe']);
  const [showAddGateway, setShowAddGateway] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    payment_received: true,
    nudge_sent: true,
    payment_failed: true,
    weekly_summary: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoices(MOCK_INVOICES);
      setMetrics(MOCK_METRICS);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number, currency = 'USD') => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  };

  const handlePauseAI = (id: string) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: inv.status === 'paused' ? 'pending' as const : 'paused' as const } : inv
    ));
    const inv = invoices.find(i => i.id === id);
    addToast(inv?.status === 'paused' ? 'AI resumed for this invoice.' : 'AI paused. You can resume anytime.', 'success');
  };

  const handleGeneratePreview = () => {
    if (!sampleEmails.trim()) { addToast('Paste a sample email first.', 'warning'); return; }
    setIsGeneratingPreview(true);
    setTimeout(() => {
      const previews: Record<number, string> = {
        1: `Hey Sarah!\n\nHope you're doing well 😊 Just a quick nudge — Invoice #1042 for $2,400 was due Jan 1st. No stress, but whenever you get a moment:\n\npay.astrix.ai/1042\n\nThanks so much! Really appreciate working with you.`,
        2: `Hi Sarah,\n\nFollowing up on Invoice #1042 ($2,400) — now 14 days past due. Could you process this at your earliest convenience?\n\npay.astrix.ai/1042\n\nLet me know if any questions.\n\nBest regards`,
        3: `Sarah,\n\nThis is my third follow-up on Invoice #1042 — $2,400, 14 days overdue.\n\nPlease settle this today: pay.astrix.ai/1042\n\nIf payment is not received within 48 hours, I will need to explore further options.\n\nRegards`,
      };
      setGeneratedPreview(previews[toneLevel]);
      setIsGeneratingPreview(false);
    }, 1500);
  };

  const getStatusBadge = (status: Invoice['status'], aiStatus: Invoice['ai_status']) => {
    if (status === 'paid') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap"><CheckCircle2 className="w-3 h-3" /> Paid</span>;
    if (status === 'paused') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">⏸ AI Paused</span>;
    if (status === 'disputed') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 whitespace-nowrap"><AlertCircle className="w-3 h-3" /> Disputed</span>;
    switch (aiStatus) {
      case 'nudge_sent': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">📤 Nudge Sent</span>;
      case 'escalated': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap"><TrendingUp className="w-3 h-3" /> Escalated</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 whitespace-nowrap"><Clock className="w-3 h-3" /> Queued</span>;
    }
  };

  const filteredInvoices = invoices.filter(inv => filterStatus === 'all' || inv.status === filterStatus);

  const tabs: { id: TabId; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', name: 'Overview', icon: DollarSign },
    { id: 'action-center', name: 'Action Center', icon: Activity },
    { id: 'tone-studio', name: 'Tone Studio', icon: Bot },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <AppLayout title="Dashboard" subtitle="Revenue recovery overview">

      {/* Tab Navigation */}
      <div className="flex gap-1.5 mb-8 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.name}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-astrix-teal" />
        </div>
      ) : (
        <>
          {/* ═══════════ OVERVIEW TAB ═══════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-50 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3"><div className="p-1.5 bg-green-100 rounded-lg"><DollarSign className="w-4 h-4 text-green-600" /></div><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Recovered</span></div>
                    <div className="text-3xl font-heading font-black text-gray-900">{formatCurrency(metrics?.total_recovered || 0)}</div>
                    <div className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{formatCurrency(metrics?.this_month_recovered || 0)} this month</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-50 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3"><div className="p-1.5 bg-red-100 rounded-lg"><AlertCircle className="w-4 h-4 text-red-500" /></div><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Outstanding</span></div>
                    <div className="text-3xl font-heading font-black text-gray-900">{formatCurrency(metrics?.currently_outstanding || 0)}</div>
                    <div className="text-xs text-gray-500 font-bold mt-2">{metrics?.pending_invoices} invoices pending</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-teal-50 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3"><div className="p-1.5 bg-teal-100 rounded-lg"><Zap className="w-4 h-4 text-astrix-teal" /></div><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recovery Rate</span></div>
                    <div className="text-3xl font-heading font-black text-astrix-teal">{metrics?.recovery_rate}%</div>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5"><div className="bg-astrix-teal h-1.5 rounded-full" style={{ width: `${metrics?.recovery_rate}%` }}></div></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3"><div className="p-1.5 bg-blue-100 rounded-lg"><Activity className="w-4 h-4 text-brand-blue" /></div><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Chases</span></div>
                    <div className="text-3xl font-heading font-black text-gray-900">{metrics?.active_chases}</div>
                    <div className="text-xs text-brand-blue font-bold mt-2 flex items-center gap-1"><Bot className="w-3 h-3" /> AI running autonomously</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-heading text-base font-bold text-gray-900 flex items-center gap-2"><Activity className="w-4 h-4 text-brand-blue" /> Activity Feed</h2>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live</span>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
                    {activities.map(act => (
                      <div key={act.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm ${act.type === 'payment_received' ? 'bg-green-100' : act.type === 'nudge_sent' ? 'bg-blue-100' : act.type === 'escalated' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                          {act.type === 'payment_received' ? '💰' : act.type === 'nudge_sent' ? '📤' : act.type === 'escalated' ? '📈' : '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium leading-snug">{act.message}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">{act.timestamp}</span>
                            {act.amount && <span className="text-xs font-bold text-gray-600">{formatCurrency(act.amount)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-astrix-teal/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Daily Chase Engine</span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-white mb-1">AI Running Autonomously</h3>
                      <p className="text-sm text-gray-400 mb-4">Next batch: Tomorrow 09:00 AM UTC</p>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between text-gray-500"><span>Last run</span><span className="text-white font-bold">Today 9:00 AM</span></div>
                        <div className="flex justify-between text-gray-500"><span>Reminders sent</span><span className="text-green-400 font-bold">3 today</span></div>
                        <div className="flex justify-between text-gray-500"><span>Guardrail</span><span className="text-astrix-teal font-bold">3-5 day gap active</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <button onClick={() => setActiveTab('action-center')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left group">
                        <div className="p-1.5 bg-blue-100 rounded-lg"><Activity className="w-4 h-4 text-brand-blue" /></div>
                        <div><div className="text-sm font-bold text-gray-900">View Invoices</div><div className="text-[11px] text-gray-400">Manage all invoices</div></div>
                      </button>
                      <button onClick={() => setActiveTab('tone-studio')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left group">
                        <div className="p-1.5 bg-purple-100 rounded-lg"><Bot className="w-4 h-4 text-purple-600" /></div>
                        <div><div className="text-sm font-bold text-gray-900">Train AI Tone</div><div className="text-[11px] text-gray-400">Customize your voice</div></div>
                      </button>
                      <button onClick={() => setActiveTab('settings')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left group">
                        <div className="p-1.5 bg-green-100 rounded-lg"><CreditCard className="w-4 h-4 text-green-600" /></div>
                        <div><div className="text-sm font-bold text-gray-900">Connect Gateway</div><div className="text-[11px] text-gray-400">Stripe, Razorpay, UPI</div></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ ACTION CENTER TAB ═══════════ */}
          {activeTab === 'action-center' && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              {/* Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'All', count: invoices.length, filter: 'all' as const },
                  { label: 'Pending', count: invoices.filter(i => i.status === 'pending').length, filter: 'pending' as const },
                  { label: 'Paused', count: invoices.filter(i => i.status === 'paused').length, filter: 'paused' as const },
                  { label: 'Paid', count: invoices.filter(i => i.status === 'paid').length, filter: 'paid' as const },
                ].map(stat => (
                  <button
                    key={stat.label}
                    onClick={() => setFilterStatus(stat.filter)}
                    className={`p-4 rounded-2xl text-left transition-all bg-white border ${filterStatus === stat.filter ? 'border-astrix-teal ring-2 ring-astrix-teal ring-offset-2' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="text-2xl font-heading font-black text-gray-900">{stat.count}</div>
                    <div className="text-xs font-bold text-gray-500">{stat.label}</div>
                  </button>
                ))}
              </div>

              {/* Invoice Table - Desktop */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-heading text-base font-bold text-gray-900">Overdue Invoices</h2>
                  <button onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))} className="flex items-center gap-2 bg-astrix-teal text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-astrix-darkTeal">
                    <Plus className="w-3.5 h-3.5" /> Add Invoice
                  </button>
                </div>

                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                      <tr>
                        {['Client', 'Amount', 'Due Date', 'Overdue', 'AI Status', 'Reminders', 'Actions'].map(h => (
                          <th key={h} className="p-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{inv.client_name}</div>
                            <div className="text-xs text-gray-400">{inv.client_email}</div>
                          </td>
                          <td className="p-4"><span className="font-bold text-gray-900 font-mono">{formatCurrency(inv.amount, inv.currency)}</span></td>
                          <td className="p-4"><span className="text-gray-600">{new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></td>
                          <td className="p-4">
                            {inv.days_overdue > 0
                              ? <span className={`font-bold text-sm ${inv.days_overdue > 14 ? 'text-red-600' : 'text-orange-500'}`}>{inv.days_overdue}d</span>
                              : <span className="text-green-600 font-bold">—</span>
                            }
                          </td>
                          <td className="p-4">{getStatusBadge(inv.status, inv.ai_status)}</td>
                          <td className="p-4"><span className="font-mono font-bold text-gray-600">{inv.reminder_count}</span></td>
                          <td className="p-4">
                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => handlePauseAI(inv.id)}
                                aria-label={inv.status === 'paused' ? `Resume AI for ${inv.client_name}` : `Pause AI for ${inv.client_name}`}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${inv.status === 'paused' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                              >
                                {inv.status === 'paused' ? '▶ Resume' : '⏸ Pause AI'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredInvoices.map(inv => (
                    <div key={inv.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-gray-900">{inv.client_name}</div>
                          <div className="text-xs text-gray-400">{inv.client_email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono text-gray-900">{formatCurrency(inv.amount)}</div>
                          {inv.days_overdue > 0 && <div className={`text-xs font-bold ${inv.days_overdue > 14 ? 'text-red-600' : 'text-orange-500'}`}>{inv.days_overdue}d overdue</div>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(inv.status, inv.ai_status)}
                        {inv.status !== 'paid' && (
                          <button onClick={() => handlePauseAI(inv.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${inv.status === 'paused' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {inv.status === 'paused' ? '▶ Resume' : '⏸ Pause'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredInvoices.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-gray-900 mb-1">All clear!</h3>
                    <p className="text-sm text-gray-500">No {filterStatus !== 'all' ? filterStatus : ''} invoices found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════ TONE STUDIO TAB ═══════════ */}
          {activeTab === 'tone-studio' && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Training Input */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading text-lg font-bold text-gray-900 mb-1">AI Tone Training</h2>
                  <p className="text-sm text-gray-500 mb-6">Paste 2–3 of your typical client emails. AI learns your writing style.</p>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Sample Email(s)</label>
                      <textarea
                        value={sampleEmails}
                        onChange={e => setSampleEmails(e.target.value)}
                        placeholder="Paste a typical email you'd send to a client about payment..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-brand-blue resize-none h-36"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">
                        Tone Level — <span className="text-brand-blue">Level {toneLevel}</span>
                        <span className="ml-2 text-gray-400 font-normal">({toneLevel === 1 ? 'Friendly 😊' : toneLevel === 2 ? 'Balanced 📧' : 'Firm 📋'})</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { level: 1, label: 'Friendly', emoji: '😊', desc: 'Warm & casual' },
                          { level: 2, label: 'Balanced', emoji: '📧', desc: 'Professional' },
                          { level: 3, label: 'Firm', emoji: '📋', desc: 'Assertive & direct' },
                        ].map(opt => (
                          <button key={opt.level} onClick={() => setToneLevel(opt.level)} className={`p-3 rounded-xl text-sm font-bold transition-all border ${toneLevel === opt.level ? 'bg-brand-blue text-white border-brand-blue shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                            <div className="text-lg mb-1">{opt.emoji}</div>
                            <div>{opt.label}</div>
                            <div className={`text-[10px] font-normal mt-0.5 ${toneLevel === opt.level ? 'text-blue-100' : 'text-gray-400'}`}>{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleGeneratePreview} disabled={isGeneratingPreview || !sampleEmails.trim()} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      {isGeneratingPreview ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Eye className="w-4 h-4" /> Generate Preview</>}
                    </button>
                  </div>
                </div>

                {/* Right: Preview Output */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading text-lg font-bold text-gray-900">AI-Generated Preview</h2>
                    {generatedPreview && (
                      <button onClick={() => { navigator.clipboard.writeText(generatedPreview); addToast('Copied!', 'success'); }} className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    )}
                  </div>
                  {generatedPreview ? (
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${toneLevel === 1 ? 'bg-green-100 text-green-700' : toneLevel === 2 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          Level {toneLevel} — {toneLevel === 1 ? 'Friendly' : toneLevel === 2 ? 'Balanced' : 'Firm'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">Your Voice Cloned</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-medium flex-1 min-h-[200px]">
                        {generatedPreview}
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">1-Click Checkout Embedded</p>
                            <p className="text-xs text-gray-600">Every reminder includes a unique payment link via your connected gateway.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 min-h-[280px] text-center p-8">
                      <Bot className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-sm font-bold text-gray-500 mb-1">No preview yet</p>
                      <p className="text-xs text-gray-400">Paste a sample email and click Generate Preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ SETTINGS TAB ═══════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              {/* Plan Banner */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-brand-blue/20 to-transparent"></div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Current Plan</div>
                    <h3 className="font-heading text-2xl font-bold text-white mb-1">Hook — Free</h3>
                    <p className="text-sm text-gray-400">3 free recoveries · First 3 invoices on us</p>
                  </div>
                  <Link to="/pricing" className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg text-sm whitespace-nowrap">
                    Upgrade to Solo — $29/mo
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Gateways */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-green-100 rounded-xl"><CreditCard className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Payment Gateways</h3>
                      <p className="text-xs text-gray-400">Connect to generate 1-click checkout links</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {connectedGateways.map(gw => (
                      <div key={gw} className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm capitalize">{gw}</div>
                            <div className="text-xs text-gray-400">Connected via API Key</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                      </div>
                    ))}

                    {!showAddGateway ? (
                      <>
                        <button onClick={() => setShowAddGateway(true)} className="w-full p-3.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Connect Razorpay
                        </button>
                        <button onClick={() => addToast('UPI link integration coming soon.', 'warning')} className="w-full p-3.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Add UPI / Static Link
                        </button>
                      </>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                        <input type="text" placeholder="Paste your Razorpay API Key..." className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-astrix-teal" />
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddGateway(false)} className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100">Cancel</button>
                          <button onClick={() => { setShowAddGateway(false); addToast('Gateway connected successfully!', 'success'); }} className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-astrix-teal hover:bg-astrix-darkTeal">Connect</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-blue-100 rounded-xl"><Mail className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-400">Control what alerts you receive</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key: 'payment_received', label: 'Payment received alert' },
                      { key: 'nudge_sent', label: 'Reminder sent confirmation' },
                      { key: 'payment_failed', label: 'Invoice dispute alert' },
                      { key: 'weekly_summary', label: 'Weekly recovery summary' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                          onChange={e => setNotifPrefs(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="w-5 h-5 accent-astrix-teal rounded cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Your data is secure</h4>
                  <p className="text-xs text-gray-600">All API keys are encrypted with AES-256. We never store your clients' payment data. Running in demo mode — connect Supabase to enable real data persistence.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};
