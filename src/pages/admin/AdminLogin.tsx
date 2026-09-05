import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLogin: React.FC = () => {
  const { signInAsAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const { error: err } = await signInAsAdmin(email, password);
    if (err) { setError(err); setIsLoading(false); return; }
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-[fadeIn_0.4s_ease-out]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-brand-blue" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Restricted access only</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-xl flex items-start gap-2 text-sm text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="admin-email">Admin Email</label>
              <input type="email" id="admin-email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-brand-blue placeholder-gray-600"
                placeholder="admin@astrix.ai" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="admin-password">Password</label>
              <input type="password" id="admin-password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-brand-blue placeholder-gray-600"
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-brand-blue text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</> : 'Access Admin Panel'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-6">
            Demo: <code className="text-gray-400">admin@astrix.ai</code> / <code className="text-gray-400">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};
