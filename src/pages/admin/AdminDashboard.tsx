import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Shield, Activity, AlertTriangle, CheckCircle2,
  Ban, Coins, LogIn, LogOut, BarChart3, Mail, Zap,
  TrendingUp, RefreshCw, Loader2, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminUsers, api } from '../../lib/api';
import { AdminUser } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const ADMIN_NAV = [
  { name: 'User Management', icon: Users, id: 'users' },
  { name: 'System Health', icon: Activity, id: 'health' },
];

export const AdminDashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { data: adminUsers, isLoading, refetch } = useAdminUsers();
  const [activeTab, setActiveTab] = useState<'users' | 'health'>('users');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSignOut = async () => { await signOut(); navigate('/admin'); };

  const handleBlock = async (u: AdminUser) => {
    setProcessingId(u.id);
    await api.admin.updateUser(u.id, { status: u.status === 'blocked' ? 'active' : 'blocked' });
    addToast(`User ${u.status === 'blocked' ? 'unblocked' : 'blocked'} successfully`, 'success');
    refetch(); setProcessingId(null);
  };

  const handleSuspend = async (u: AdminUser) => {
    setProcessingId(u.id);
    await api.admin.updateUser(u.id, { status: u.status === 'suspended' ? 'active' : 'suspended' });
    addToast(`User ${u.status === 'suspended' ? 'reactivated' : 'suspended'} successfully`, 'success');
    refetch(); setProcessingId(null);
  };

  const handleAddCredits = async (u: AdminUser) => {
    setProcessingId(u.id);
    await api.admin.addCredits(u.id, 3);
    addToast(`Added 3 free credits to ${u.full_name}`, 'success');
    refetch(); setProcessingId(null);
  };

  const handleImpersonate = (u: AdminUser) => {
    addToast(`Impersonating ${u.full_name} — (Demo: this would log you in as this user)`, 'warning');
  };

  const filtered = adminUsers.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecovered = adminUsers.reduce((s, u) => s + u.total_recovered, 0);
  const activeUsers = adminUsers.filter(u => u.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-950 flex font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 fixed h-full flex flex-col z-50">
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-blue" />
            <span className="font-heading text-lg font-black tracking-tighter text-white">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {ADMIN_NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as 'users' | 'health')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === item.id ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.name}
            </button>
          ))}
          <div className="pt-4 border-t border-gray-800 mt-4">
            <Link to="/app" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <LogIn className="w-4 h-4" /> View App
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-800 shrink-0">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <div className="mt-2 px-3">
            <div className="text-xs text-gray-600 truncate">{user?.email}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-[1200px] mx-auto animate-[fadeIn_0.4s_ease-out]">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-white mb-1">
              {activeTab === 'users' ? 'User Management' : 'System Health'}
            </h1>
            <p className="text-gray-500 text-sm">Astrix AI Admin Dashboard</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: adminUsers.length, icon: Users, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
              { label: 'Active', value: activeUsers, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-900/30' },
              { label: 'Total Recovered', value: `$${(totalRecovered / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
              { label: 'Suspended', value: adminUsers.filter(u => u.status === 'suspended').length, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-900/30' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className={`p-2 ${stat.bg} rounded-lg w-fit mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-heading font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ─── USER MANAGEMENT ─── */}
          {activeTab === 'users' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <h2 className="font-heading text-lg font-bold text-white">All Users</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search users..." className="bg-transparent text-sm text-white outline-none placeholder-gray-600 w-40" />
                  </div>
                  <button onClick={() => refetch()} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg border border-gray-700">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-800">
                      <tr>
                        {['User', 'Plan', 'Status', 'Credits Used', 'Recovered', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {filtered.map(u => (
                        <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-white">{u.full_name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.plan === 'Agency' ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' : u.plan === 'Solo' ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                              {u.plan}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.status === 'active' ? 'bg-green-900/50 text-green-300 border border-green-700/50' : u.status === 'suspended' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50' : 'bg-red-900/50 text-red-300 border border-red-700/50'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-gray-300">{u.credits_used}</td>
                          <td className="px-5 py-4 font-mono font-bold text-green-400">
                            ${(u.total_recovered / 1000).toFixed(1)}k
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 flex-nowrap">
                              <button onClick={() => handleImpersonate(u)} title="Login as User"
                                className="p-1.5 bg-gray-800 hover:bg-blue-900 text-gray-400 hover:text-blue-300 rounded-lg border border-gray-700 transition-colors" aria-label={`Login as ${u.full_name}`}>
                                <LogIn className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleAddCredits(u)} disabled={processingId === u.id} title="Add 3 free credits"
                                className="p-1.5 bg-gray-800 hover:bg-yellow-900 text-gray-400 hover:text-yellow-300 rounded-lg border border-gray-700 transition-colors disabled:opacity-50" aria-label={`Add credits to ${u.full_name}`}>
                                <Coins className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleSuspend(u)} disabled={processingId === u.id} title={u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                className="p-1.5 bg-gray-800 hover:bg-orange-900 text-gray-400 hover:text-orange-300 rounded-lg border border-gray-700 transition-colors disabled:opacity-50" aria-label={u.status === 'suspended' ? `Reactivate ${u.full_name}` : `Suspend ${u.full_name}`}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleBlock(u)} disabled={processingId === u.id} title={u.status === 'blocked' ? 'Unblock' : 'Block'}
                                className="p-1.5 bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-300 rounded-lg border border-gray-700 transition-colors disabled:opacity-50" aria-label={u.status === 'blocked' ? `Unblock ${u.full_name}` : `Block ${u.full_name}`}>
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── SYSTEM HEALTH ─── */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'AI API Tokens (Today)', value: '142,500', limit: '500,000', pct: 28, color: 'bg-brand-blue', icon: Zap },
                  { label: 'Emails Sent (Today)', value: '89', limit: '500', pct: 17, color: 'bg-green-500', icon: Mail },
                  { label: 'Active Chase Jobs', value: '24', limit: '∞', pct: 45, color: 'bg-purple-500', icon: Activity },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gray-800 rounded-lg"><item.icon className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{item.label}</div>
                        <div className="text-2xl font-heading font-black text-white">{item.value}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-600 font-mono">Limit: {item.limit}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-blue" /> Cost Breakdown (This Month)
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'OpenAI API (Tone Cloning + Drafts)', cost: '$18.42', trend: '+5%' },
                    { label: 'Resend (Transactional Email)', cost: '$3.20', trend: '-2%' },
                    { label: 'Vercel (Edge Functions + Cron)', cost: '$9.00', trend: '0%' },
                    { label: 'Supabase (Database + Auth)', cost: '$25.00', trend: '0%' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                      <span className="text-sm text-gray-300 font-medium">{item.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 font-mono">{item.trend}</span>
                        <span className="font-mono font-bold text-white">{item.cost}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-white">Total MRR Cost</span>
                    <span className="font-heading font-black text-yellow-400 text-xl">$55.62</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-950/30 border border-green-800/50 rounded-2xl p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-green-300 text-sm mb-1">All Systems Operational</div>
                  <div className="text-xs text-green-600">Last checked: Just now. Daily Chase Engine is healthy and scheduled for 09:00 UTC.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
