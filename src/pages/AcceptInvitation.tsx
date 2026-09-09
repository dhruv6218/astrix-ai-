'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { createClient } from '../lib/supabase';


function AcceptInvitationInner() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { refreshWorkspaces } = useWorkspace();

  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      setIsLoading(false);
      return;
    }

    const fetchInvite = async () => {
      const { data, error } = await supabase
        .from('workspace_invites')
        .select('id, workspace_id, email, role, expires_at')
        .eq('token', token)
        .single();

      if (error || !data) {
        setError('Invitation is invalid or expired.');
        setIsLoading(false);
        return;
      }

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', data.workspace_id)
        .single();

      setInviteDetails({ ...data, workspaceName: workspace?.name || 'Unknown Workspace' });
      setIsLoading(false);
    };

    fetchInvite();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteDetails) return;
    setIsAccepting(true);
    setError(null);

    try {
      // Sign out current user if different email
      if (user && user.email !== inviteDetails.email) {
        await signOut();
      }

      // Send magic link to invited email
      const { error: magicErr } = await supabase.auth.signInWithOtp({
        email: inviteDetails.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/app` },
      });

      if (magicErr) throw new Error(magicErr.message);

      // Mark invite as accepted in DB
      await supabase.from('workspace_invites').update({ accepted_at: new Date().toISOString() }).eq('token', token);
      await refreshWorkspaces();
      setSuccessMsg(`Magic link sent to ${inviteDetails.email}! Check your inbox to finish joining ${inviteDetails.workspaceName}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="bg-white p-10 rounded-3xl shadow-apple border border-gray-200 flex flex-col items-center justify-center gap-4 animate-[fadeIn_0.5s_ease-out]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="text-sm text-gray-500 font-medium">Validating your invitation...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-apple border border-gray-200 w-full animate-[fadeIn_0.5s_ease-out]">
        {successMsg ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Check your inbox!</h2>
            <p className="text-gray-500 text-sm font-medium">{successMsg}</p>
            <Link href="/login" className="mt-6 inline-block text-sm text-brand-blue font-bold hover:underline">
              Back to Login →
            </Link>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-500 text-sm font-medium mb-6">{error}</p>
            <Link href="/signup" className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
              Create an Account Instead
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <CheckCircle2 className="w-7 h-7 text-brand-blue" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2 tracking-tight">You&apos;re Invited!</h1>
              <p className="text-gray-500 text-sm font-medium">
                You&apos;ve been invited to join <strong className="text-gray-900">{inviteDetails?.workspaceName}</strong> as a <strong className="text-gray-900 capitalize">{inviteDetails?.role || 'Member'}</strong>.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Invitation sent to</p>
              <p className="text-sm font-bold text-gray-900">{inviteDetails?.email}</p>
            </div>

            <form onSubmit={handleAccept}>
              <button
                type="submit"
                disabled={isAccepting}
                className="w-full flex items-center justify-center text-white bg-brand-blue hover:bg-blue-700 disabled:bg-brand-blue/70 disabled:cursor-not-allowed font-bold rounded-xl text-sm px-5 py-4 transition-all shadow-glow-blue btn-shine outline-none h-[52px]"
              >
                {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Accept Invitation & Sign In ✨`}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              A Magic Link will be sent to your email for instant, passwordless access.
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export const AcceptInvitation = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>}>
    <AcceptInvitationInner />
  </Suspense>
);

export default AcceptInvitation;
