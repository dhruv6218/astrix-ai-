'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLogin: React.FC = () => {
  const { signInAsAdmin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const { error: err } = await signInAsAdmin(email, password);
    if (err) { setError(err); setIsLoading(false); return; }
    router.push('/godview/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative">
      <div className="bg-noise"></div>
      <div className="w-full max-w-sm animate-[fadeIn_0.4s_ease-out] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-brand-blue" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Restricted access only</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-sm text-red-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="admin-email">Admin Email</label>
              <input type="email" id="admin-email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-brand-blue placeholder-gray-400"
                placeholder="admin@astrix.ai" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="admin-password">Password</label>
              <input type="password" id="admin-password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-brand-blue placeholder-gray-400"
                placeholder="��������" required />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-brand-blue disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2 shadow-md">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</> : 'Access Admin Panel'}
            </button>
            <p className="text-center text-xs text-gray-500 font-medium mt-4">
              An OTP will be sent to your registered mobile number upon login.
            </p>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400 font-medium">
              Demo: <code className="text-gray-500 bg-gray-50 px-1 rounded">admin@astrix.ai</code> / <code className="text-gray-500 bg-gray-50 px-1 rounded">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
