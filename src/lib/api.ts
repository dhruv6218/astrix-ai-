import { useState, useEffect, useCallback } from 'react';
import { Signal, Account, Problem, Opportunity, Decision, Artifact, Launch, TeamMember, WorkspaceInvite } from '../types';
import { supabase } from './supabase';

// Global event to trigger refetches across hooks (simulates React Query invalidateQueries)
export const triggerUpdate = () => window.dispatchEvent(new Event('data-updated'));

const throwOnError = (error: any) => {
  if (error) throw new Error(error.message || 'Operation failed');
};

const getWorkspacePlan = async (workspaceId: string) => {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  return String(data?.plan || 'Free');
};

const getSignalLimitByPlan = (plan: string) => {
  if (plan === 'Scale') return 100000;
  if (plan === 'Growth') return 10000;
  if (plan === 'Starter') return 2000;
  return 200;
};

const getMemberLimitByPlan = (plan: string) => {
  if (plan === 'Scale') return 50;
  if (plan === 'Growth') return 10;
  return 1;
};

const applySignalFilters = (query: any, opts?: any) => {
  if (opts?.severityFilter) query = query.eq('severity_label', opts.severityFilter);
  if (opts?.sentimentFilter) query = query.eq('sentiment_label', opts.sentimentFilter);
  if (opts?.sourceFilter) query = query.eq('source_type', opts.sourceFilter);
  if (opts?.globalFilter) query = query.ilike('raw_text', `%${opts.globalFilter}%`);
  return query;
};

export const api = {
  signals: {
    list: async (wsId: string, opts?: any) => {
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 10;
      const sort = opts?.sorting?.[0];
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('signals')
        .select('*, accounts(name, arr, plan)', { count: 'exact' })
        .eq('workspace_id', wsId);

      query = applySignalFilters(query, opts);
      query = sort?.id ? query.order(sort.id, { ascending: !sort.desc }) : query.order('created_at', { ascending: false });

      const { data, count, error } = await query.range(from, to);
      throwOnError(error);

      return { rows: (data ?? []) as Signal[], total: count ?? 0 };
    },
    create: async (data: Partial<Signal>) => {
      if (data.workspace_id) {
        const [plan, countRes] = await Promise.all([
          getWorkspacePlan(data.workspace_id),
          supabase.from('signals').select('*', { count: 'exact', head: true }).eq('workspace_id', data.workspace_id)
        ]);
        const currentCount = countRes.count ?? 0;
        const limit = getSignalLimitByPlan(plan);
        if (currentCount >= limit) {
          throw new Error(`Signal quota reached for ${plan} plan (${limit}). Upgrade your plan to add more signals.`);
        }
      }
      const payload = { ...data };
      delete (payload as any).accounts;
      const { data: created, error } = await supabase.from('signals').insert(payload).select('*').single();
      throwOnError(error);
      triggerUpdate();
      return created as Signal;
    },
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('signals')
        .select('*, accounts(name, arr, plan)')
        .eq('id', id)
        .single();
      throwOnError(error);
      return data as Signal;
    }
  },
  accounts: {
    list: async (wsId: string, opts?: any) => {
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 10;
      const sort = opts?.sorting?.[0];
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      let query = supabase.from('accounts').select('*', { count: 'exact' }).eq('workspace_id', wsId);
      if (opts?.globalFilter) query = query.ilike('name', `%${opts.globalFilter}%`);
      query = sort?.id ? query.order(sort.id, { ascending: !sort.desc }) : query.order('created_at', { ascending: false });

      const { data, count, error } = await query.range(from, to);
      throwOnError(error);
      return { rows: (data ?? []) as Account[], total: count ?? 0 };
    },
    create: async (data: Partial<Account>) => {
      const { data: created, error } = await supabase.from('accounts').insert(data).select('*').single();
      throwOnError(error);
      triggerUpdate();
      return created as Account;
    },
    get: async (id: string) => {
      const [{ data: account, error: accountError }, { data: signals, error: signalsError }, { data: problems, error: problemsError }] = await Promise.all([
        supabase.from('accounts').select('*').eq('id', id).single(),
        supabase.from('signals').select('*').eq('account_id', id).order('created_at', { ascending: false }),
        supabase
          .from('problems')
          .select('*, problem_signal_links!inner(signal_id), signals!inner(account_id)')
          .eq('signals.account_id', id)
      ]);
      throwOnError(accountError);
      throwOnError(signalsError);
      if (problemsError && !String(problemsError.message || '').includes('signals')) throwOnError(problemsError);
      return { account, signals, problems };
    }
  },
  problems: {
    list: async (wsId: string) => {
      const { data, error } = await supabase.from('problems').select('*').eq('workspace_id', wsId).order('created_at', { ascending: false });
      throwOnError(error);
      return (data ?? []) as Problem[];
    },
    get: async (id: string) => {
      const { data: problem, error: problemError } = await supabase.from('problems').select('*').eq('id', id).single();
      throwOnError(problemError);

      const { data: links, error: linksError } = await supabase.from('problem_signal_links').select('signal_id').eq('problem_id', id);
      throwOnError(linksError);
      const signalIds = (links ?? []).map((l: any) => l.signal_id);

      let signals: Signal[] = [];
      if (signalIds.length) {
        const { data, error } = await supabase.from('signals').select('*, accounts(name, arr, plan)').in('id', signalIds).order('created_at', { ascending: false });
        throwOnError(error);
        signals = (data ?? []) as Signal[];
      }

      const accountIds = [...new Set(signals.map((s) => s.account_id).filter(Boolean))] as string[];
      let accounts: Account[] = [];
      if (accountIds.length) {
        const { data, error } = await supabase.from('accounts').select('*').in('id', accountIds);
        throwOnError(error);
        accounts = (data ?? []) as Account[];
      }
      return { problem, signals, accounts };
    },
    create: async (data: Partial<Problem>) => {
      const { data: created, error } = await supabase.from('problems').insert(data).select('*').single();
      throwOnError(error);
      triggerUpdate();
      return created as Problem;
    }
  },
  opportunities: {
    list: async (wsId: string) => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, problems(id, title, evidence_count, affected_arr)')
        .eq('workspace_id', wsId)
        .order('opportunity_score', { ascending: false });
      throwOnError(error);
      return (data ?? []) as Opportunity[];
    },
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, problems(id, title, evidence_count, affected_arr)')
        .eq('id', id)
        .single();
      throwOnError(error);
      return data as Opportunity;
    }
  },
  decisions: {
    list: async (wsId: string) => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*, users:profiles!decisions_author_id_fkey(full_name)')
        .eq('workspace_id', wsId)
        .order('created_at', { ascending: false });
      throwOnError(error);
      return (data ?? []) as Decision[];
    },
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*, users:profiles!decisions_author_id_fkey(full_name)')
        .eq('id', id)
        .single();
      throwOnError(error);
      return data as Decision;
    },
    create: async (data: Partial<Decision>) => {
      const { data: created, error } = await supabase.from('decisions').insert(data).select('*').single();
      throwOnError(error);
      triggerUpdate();
      return created as Decision;
    }
  },
  artifacts: {
    list: async (wsId: string) => {
      const { data, error } = await supabase
        .from('artifacts')
        .select(`
          *,
          decisions(title),
          users:profiles!artifacts_author_id_fkey(full_name)
        `)
        .eq('workspace_id', wsId)
        .order('updated_at', { ascending: false });
      throwOnError(error);
      return (data ?? []) as Artifact[];
    },
    create: async (data: Partial<Artifact>) => {
      const { data: created, error } = await supabase.from('artifacts').insert(data).select('*').single();
      throwOnError(error);
      triggerUpdate();
      return created as Artifact;
    },
    update: async (id: string, data: Partial<Artifact>) => {
      const { error } = await supabase.from('artifacts').update(data).eq('id', id);
      throwOnError(error);
      triggerUpdate();
    },
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('artifacts')
        .select(`
          *,
          decisions(title),
          users:profiles!artifacts_author_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();
      throwOnError(error);
      return data as Artifact;
    }
  },
  launches: {
    list: async (wsId: string) => {
      const { data, error } = await supabase.from('launches').select('*').eq('workspace_id', wsId).order('launched_at', { ascending: false });
      throwOnError(error);
      return (data ?? []) as Launch[];
    },
    create: async (data: Partial<Launch>) => {
      const payload = { status: 'active', ...data };
      const { data: created, error } = await supabase.from('launches').insert(payload).select('*').single();
      throwOnError(error);
      triggerUpdate();
      return created as Launch;
    },
    update: async (id: string, data: Partial<Launch>) => {
      const { error } = await supabase.from('launches').update(data).eq('id', id);
      throwOnError(error);
      triggerUpdate();
    }
  },
  team: {
    list: async (wsId: string) => {
      const [{ data: members, error: membersError }, { data: invites, error: invitesError }] = await Promise.all([
        supabase
          .from('workspace_members')
          .select('*, users:profiles!workspace_members_user_id_fkey(full_name, email, avatar_url)')
          .eq('workspace_id', wsId),
        supabase.from('workspace_invites').select('*').eq('workspace_id', wsId)
      ]);
      throwOnError(membersError);
      throwOnError(invitesError);
      return {
        members: (members ?? []) as TeamMember[],
        invites: (invites ?? []) as WorkspaceInvite[]
      };
    },
    invite: async (wsId: string, email: string, role: string) => {
      const normalizedRole = role === 'viewer' ? 'member' : role;
      if (!['member', 'owner'].includes(normalizedRole)) {
        throw new Error('Invalid role selected');
      }

      const [plan, membersRes] = await Promise.all([
        getWorkspacePlan(wsId),
        supabase.from('workspace_members').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId)
      ]);
      const currentMembers = membersRes.count ?? 0;
      const memberLimit = getMemberLimitByPlan(plan);
      if (currentMembers >= memberLimit && normalizedRole !== 'owner') {
        throw new Error(`Member limit reached for ${plan} plan (${memberLimit}).`);
      }

      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: { workspace_id: wsId, email, role: normalizedRole }
      });
      if (error) throw new Error(error.message || 'Failed to invite member');
      if (data?.error) throw new Error(data.error);
      triggerUpdate();
    },
    removeMember: async (id: string) => {
      const { error } = await supabase.from('workspace_members').delete().eq('id', id);
      throwOnError(error);
      triggerUpdate();
    }
  }
};

// --- REACT SERVER-STATE HOOKS ---

export function useQuery<T>(fetcher: () => Promise<T>, deps: any[]) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res);
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch data';
      setError(msg);
      console.error(msg, err);
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
    window.addEventListener('data-updated', execute);
    return () => window.removeEventListener('data-updated', execute);
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
}

export const useSignals = (wsId?: string, opts?: any) => {
  const { data, isLoading, refetch } = useQuery(async () => {
    if (!wsId) return { rows: [], total: 0 };
    return api.signals.list(wsId, opts);
  }, [wsId, JSON.stringify(opts)]);
  return { data: data || { rows: [], total: 0 }, isLoading, refetch };
};

export const useSignal = (id?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!id) return null;
    return api.signals.get(id);
  }, [id]);
  return { data, isLoading };
};

export const useAccounts = (wsId?: string, opts?: any) => {
  const { data, isLoading, refetch } = useQuery(async () => {
    if (!wsId) return { rows: [], total: 0 };
    return api.accounts.list(wsId, opts);
  }, [wsId, JSON.stringify(opts)]);
  return { data: data || { rows: [], total: 0 }, isLoading, refetch };
};

export const useAccount = (id?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!id) return null;
    return api.accounts.get(id);
  }, [id]);
  return { data, isLoading };
};

export const useProblems = (wsId?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!wsId) return [];
    return api.problems.list(wsId);
  }, [wsId]);
  return { data: data || [], isLoading };
};

export const useProblem = (id?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!id) return null;
    return api.problems.get(id);
  }, [id]);
  return { data, isLoading };
};

export const useOpportunities = (wsId?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!wsId) return [];
    return api.opportunities.list(wsId);
  }, [wsId]);
  return { data: data || [], isLoading };
};

export const useOpportunity = (id?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!id) return null;
    return api.opportunities.get(id);
  }, [id]);
  return { data, isLoading };
};

export const useDecisions = (wsId?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!wsId) return [];
    return api.decisions.list(wsId);
  }, [wsId]);
  return { data: data || [], isLoading };
};

export const useDecision = (id?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!id) return null;
    return api.decisions.get(id);
  }, [id]);
  return { data, isLoading };
};

export const useArtifacts = (wsId?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!wsId) return [];
    return api.artifacts.list(wsId);
  }, [wsId]);
  return { data: data || [], isLoading };
};

export const useArtifact = (id?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!id) return null;
    return api.artifacts.get(id);
  }, [id]);
  return { data, isLoading };
};

export const useLaunches = (wsId?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!wsId) return [];
    return api.launches.list(wsId);
  }, [wsId]);
  return { data: data || [], isLoading };
};

export const useTeam = (wsId?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!wsId) return { members: [], invites: [] };
    return api.team.list(wsId);
  }, [wsId]);
  return { data: data || { members: [], invites: [] }, isLoading };
};
