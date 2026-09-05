import { useState, useEffect, useCallback } from 'react';
import { Signal, Account, Problem, Opportunity, Decision, Artifact, Launch, TeamMember, WorkspaceInvite } from '../types';

// Local Storage Keys
const STORAGE_KEYS = {
  SIGNALS: 'astrix_signals',
  ACCOUNTS: 'astrix_accounts',
  PROBLEMS: 'astrix_problems',
  OPPORTUNITIES: 'astrix_opportunities',
  DECISIONS: 'astrix_decisions',
  ARTIFACTS: 'astrix_artifacts',
  LAUNCHES: 'astrix_launches',
  WORKSPACE: 'astrix_workspace',
};

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to get/set localStorage
const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

// Global event to trigger refetches
export const triggerUpdate = () => window.dispatchEvent(new Event('data-updated'));

// Initialize with sample data if empty
const initializeSampleData = (workspaceId: string) => {
  const existingSignals = getStorage<Signal[]>(STORAGE_KEYS.SIGNALS, []);
  
  if (existingSignals.length === 0) {
    // Sample Accounts
    const sampleAccounts: Account[] = [
      { id: generateId(), workspace_id: workspaceId, name: 'CloudScale Inc', domain: 'cloudscale.io', arr: 240000, plan: 'Enterprise', health_score: '85', created_at: new Date().toISOString() },
      { id: generateId(), workspace_id: workspaceId, name: 'TechStart GmbH', domain: 'techstart.de', arr: 120000, plan: 'Pro', health_score: '72', created_at: new Date().toISOString() },
      { id: generateId(), workspace_id: workspaceId, name: 'DataFlow Ltd', domain: 'dataflow.co', arr: 89000, plan: 'Standard', health_score: '91', created_at: new Date().toISOString() },
      { id: generateId(), workspace_id: workspaceId, name: 'InnovateLab', domain: 'innovatelab.com', arr: 45000, plan: 'Starter', health_score: '68', created_at: new Date().toISOString() },
      { id: generateId(), workspace_id: workspaceId, name: 'Enterprise Corp', domain: 'enterprisecorp.com', arr: 520000, plan: 'Enterprise', health_score: '55', created_at: new Date().toISOString() },
    ];
    setStorage(STORAGE_KEYS.ACCOUNTS, sampleAccounts);

    // Sample Signals
    const sampleSignals: Signal[] = [
      { id: generateId(), workspace_id: workspaceId, source_type: 'Slack', raw_text: 'Users are complaining about the new billing page layout. It takes too many clicks to update payment methods.', sentiment_label: 'Negative', severity_label: 'High', product_area: 'Billing', account_id: sampleAccounts[0].id, created_at: new Date().toISOString(), normalized_text: null, category: null },
      { id: generateId(), workspace_id: workspaceId, source_type: 'Discord', raw_text: 'SAML SSO is throwing a 500 error for our enterprise team. This is blocking our security audit.', sentiment_label: 'Negative', severity_label: 'Critical', product_area: 'Authentication', account_id: sampleAccounts[0].id, created_at: new Date().toISOString(), normalized_text: null, category: null },
      { id: generateId(), workspace_id: workspaceId, source_type: 'Email', raw_text: 'Love the new dark mode feature! Would be great to have a toggle in the navbar.', sentiment_label: 'Positive', severity_label: 'Low', product_area: 'UI', account_id: sampleAccounts[1].id, created_at: new Date().toISOString(), normalized_text: null, category: null },
      { id: generateId(), workspace_id: workspaceId, source_type: 'Support Ticket', raw_text: 'API rate limits are too restrictive for our data sync operations. We need at least 10k requests per hour.', sentiment_label: 'Negative', severity_label: 'High', product_area: 'API', account_id: sampleAccounts[2].id, created_at: new Date().toISOString(), normalized_text: null, category: null },
      { id: generateId(), workspace_id: workspaceId, source_type: 'GitHub', raw_text: 'The webhook delivery is inconsistent. Sometimes events are delayed by hours.', sentiment_label: 'Negative', severity_label: 'Medium', product_area: 'Integrations', account_id: sampleAccounts[3].id, created_at: new Date().toISOString(), normalized_text: null, category: null },
      { id: generateId(), workspace_id: workspaceId, source_type: 'Interview', raw_text: 'We would switch from competitor X if you had better reporting dashboards.', sentiment_label: 'Neutral', severity_label: 'Medium', product_area: 'Analytics', account_id: sampleAccounts[4].id, created_at: new Date().toISOString(), normalized_text: null, category: null },
      { id: generateId(), workspace_id: workspaceId, source_type: 'Slack', raw_text: 'The onboarding flow is confusing. New team members struggle to find the invite link.', sentiment_label: 'Negative', severity_label: 'Medium', product_area: 'Onboarding', account_id: sampleAccounts[1].id, created_at: new Date().toISOString(), normalized_text: null, category: null },
      { id: generateId(), workspace_id: workspaceId, source_type: 'NPS Survey', raw_text: 'Great product but the export functionality is limited. Need CSV export for all data.', sentiment_label: 'Neutral', severity_label: 'Medium', product_area: 'Export', account_id: sampleAccounts[2].id, created_at: new Date().toISOString(), normalized_text: null, category: null },
    ];
    setStorage(STORAGE_KEYS.SIGNALS, sampleSignals);

    // Sample Problems
    const sampleProblems: Problem[] = [
      { id: generateId(), workspace_id: workspaceId, title: 'SAML SSO Integration Issues', description: 'Enterprise customers are experiencing authentication failures with SAML SSO. This is blocking security audits and causing churn risk.', status: 'Active', severity: 'Critical', trend: 'Rising', product_area: 'Authentication', evidence_count: 24, affected_arr: 760000, created_at: new Date().toISOString() },
      { id: generateId(), workspace_id: workspaceId, title: 'API Rate Limiting Too Restrictive', description: 'High-volume customers are hitting rate limits during data sync operations, causing business disruption.', status: 'Active', severity: 'High', trend: 'Stable', product_area: 'API', evidence_count: 18, affected_arr: 450000, created_at: new Date().toISOString() },
      { id: generateId(), workspace_id: workspaceId, title: 'Onboarding Friction', description: 'New users struggle with the initial setup and team invitation process.', status: 'Active', severity: 'Medium', trend: 'Rising', product_area: 'Onboarding', evidence_count: 12, affected_arr: 280000, created_at: new Date().toISOString() },
    ];
    setStorage(STORAGE_KEYS.PROBLEMS, sampleProblems);

    // Sample Opportunities
    const sampleOpportunities: Opportunity[] = [
      { id: generateId(), workspace_id: workspaceId, problem_id: sampleProblems[0].id, opportunity_score: 92, demand_score: 85, pain_score: 95, arr_score: 90, trend_score: 80, recommended_action: 'Build', problems: sampleProblems[0] },
      { id: generateId(), workspace_id: workspaceId, problem_id: sampleProblems[1].id, opportunity_score: 78, demand_score: 70, pain_score: 80, arr_score: 75, trend_score: 65, recommended_action: 'Fix', problems: sampleProblems[1] },
      { id: generateId(), workspace_id: workspaceId, problem_id: sampleProblems[2].id, opportunity_score: 64, demand_score: 60, pain_score: 55, arr_score: 70, trend_score: 60, recommended_action: 'Review', problems: sampleProblems[2] },
    ];
    setStorage(STORAGE_KEYS.OPPORTUNITIES, sampleOpportunities);

    // Sample Decisions
    const sampleDecisions: Decision[] = [
      { id: generateId(), workspace_id: workspaceId, title: 'Implement SAML SSO', action: 'Build', rationale: 'Critical for enterprise retention. Multiple customers citing security compliance as blocker for renewal.', author_id: 'demo', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), users: { full_name: 'Demo User' } },
    ];
    setStorage(STORAGE_KEYS.DECISIONS, sampleDecisions);

    // Sample Artifacts
    const sampleArtifacts: Artifact[] = [
      { id: generateId(), workspace_id: workspaceId, decision_id: sampleDecisions[0].id, title: 'SAML SSO Implementation PRD', type: 'prd', content: `# Product Requirements Document\n\n## Problem Statement\nEnterprise customers are experiencing authentication failures with SAML SSO implementation.\n\n## Evidence\n- 24 signals from high-value accounts\n- $760k ARR at risk\n- Multiple customers citing security compliance as blocker\n\n## Scope\n- Implement SAML 2.0 protocol\n- Support Okta and Azure AD\n- Add SCIM provisioning\n\n## Success Metrics\n- 0 churns citing security compliance in Q2\n- NPS improvement for enterprise segment`, author_id: 'demo', external_url: null, external_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), decisions: { title: 'Implement SAML SSO' }, users: { full_name: 'Demo User' } },
    ];
    setStorage(STORAGE_KEYS.ARTIFACTS, sampleArtifacts);

    // Sample Launches
    const sampleLaunches: Launch[] = [
      { id: generateId(), workspace_id: workspaceId, decision_id: sampleDecisions[0].id, title: 'SAML SSO Integration', action: 'Build', launched_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active', expected_outcome: 'Reduce enterprise churn citing security compliance to 0', before_count: 24, created_by: 'demo', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    ];
    setStorage(STORAGE_KEYS.LAUNCHES, sampleLaunches);
  }
};

// API object with localStorage-based implementations
export const api = {
  signals: {
    list: async (wsId: string, opts?: any) => {
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 10;
      let signals = getStorage<Signal[]>(STORAGE_KEYS.SIGNALS, []).filter(s => s.workspace_id === wsId);
      
      if (opts?.globalFilter) {
        signals = signals.filter(s => 
          s.raw_text.toLowerCase().includes(opts.globalFilter.toLowerCase()) ||
          (s.accounts as any)?.name?.toLowerCase().includes(opts.globalFilter.toLowerCase())
        );
      }
      if (opts?.severityFilter) {
        signals = signals.filter(s => s.severity_label === opts.severityFilter);
      }
      if (opts?.sentimentFilter) {
        signals = signals.filter(s => s.sentiment_label === opts.sentimentFilter);
      }
      if (opts?.sourceFilter) {
        signals = signals.filter(s => s.source_type === opts.sourceFilter);
      }
      
      const total = signals.length;
      const start = (page - 1) * limit;
      const rows = signals.slice(start, start + limit);
      
      // Attach accounts
      const accounts = getStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
      const rowsWithAccounts = rows.map(s => ({
        ...s,
        accounts: accounts.find(a => a.id === s.account_id) || null
      }));
      
      return { rows: rowsWithAccounts, total };
    },
    create: async (data: Partial<Signal>) => {
      const signals = getStorage<Signal[]>(STORAGE_KEYS.SIGNALS, []);
      const newSignal: Signal = {
        id: generateId(),
        workspace_id: data.workspace_id!,
        source_type: data.source_type || 'Manual',
        raw_text: data.raw_text!,
        normalized_text: data.normalized_text || null,
        sentiment_label: data.sentiment_label || 'Neutral',
        severity_label: data.severity_label || 'Medium',
        category: data.category || null,
        product_area: data.product_area || null,
        account_id: data.account_id || null,
        created_at: new Date().toISOString(),
      };
      signals.push(newSignal);
      setStorage(STORAGE_KEYS.SIGNALS, signals);
      triggerUpdate();
      return newSignal;
    },
    get: async (id: string) => {
      const signals = getStorage<Signal[]>(STORAGE_KEYS.SIGNALS, []);
      const accounts = getStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
      const signal = signals.find(s => s.id === id);
      if (signal) {
        return { ...signal, accounts: accounts.find(a => a.id === signal.account_id) || null };
      }
      return null;
    }
  },
  accounts: {
    list: async (wsId: string, opts?: any) => {
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 10;
      let accounts = getStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, []).filter(a => a.workspace_id === wsId);
      
      if (opts?.globalFilter) {
        accounts = accounts.filter(a => 
          a.name.toLowerCase().includes(opts.globalFilter.toLowerCase()) ||
          a.domain?.toLowerCase().includes(opts.globalFilter.toLowerCase())
        );
      }
      
      const total = accounts.length;
      const start = (page - 1) * limit;
      const rows = accounts.slice(start, start + limit);
      
      return { rows, total };
    },
    create: async (data: Partial<Account>) => {
      const accounts = getStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
      const newAccount: Account = {
        id: generateId(),
        workspace_id: data.workspace_id!,
        name: data.name!,
        domain: data.domain || null,
        arr: data.arr || 0,
        plan: data.plan || 'Standard',
        health_score: data.health_score || null,
        created_at: new Date().toISOString(),
      };
      accounts.push(newAccount);
      setStorage(STORAGE_KEYS.ACCOUNTS, accounts);
      triggerUpdate();
      return newAccount;
    },
    get: async (id: string) => {
      const accounts = getStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
      const signals = getStorage<Signal[]>(STORAGE_KEYS.SIGNALS, []);
      const account = accounts.find(a => a.id === id);
      if (!account) return null;
      
      const accountSignals = signals.filter(s => s.account_id === id);
      return { account, signals: accountSignals, problems: [] };
    }
  },
  problems: {
    list: async (wsId: string) => {
      return getStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []).filter(p => p.workspace_id === wsId);
    },
    get: async (id: string) => {
      const problems = getStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
      const signals = getStorage<Signal[]>(STORAGE_KEYS.SIGNALS, []);
      const accounts = getStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
      
      const problem = problems.find(p => p.id === id);
      if (!problem) return null;
      
      // Get related signals (simplified - in real app would have proper linking)
      const relatedSignals = signals.slice(0, problem.evidence_count);
      const relatedAccountIds = [...new Set(relatedSignals.map(s => s.account_id).filter(Boolean))] as string[];
      const relatedAccounts = accounts.filter(a => relatedAccountIds.includes(a.id));
      
      return { problem, signals: relatedSignals, accounts: relatedAccounts };
    },
    create: async (data: Partial<Problem>) => {
      const problems = getStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
      const newProblem: Problem = {
        id: generateId(),
        workspace_id: data.workspace_id!,
        title: data.title!,
        description: data.description || null,
        status: 'Active',
        severity: data.severity || 'Medium',
        trend: 'Stable',
        product_area: data.product_area || null,
        evidence_count: 0,
        affected_arr: 0,
        created_at: new Date().toISOString(),
      };
      problems.push(newProblem);
      setStorage(STORAGE_KEYS.PROBLEMS, problems);
      triggerUpdate();
      return newProblem;
    }
  },
  opportunities: {
    list: async (wsId: string) => {
      const opportunities = getStorage<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, []).filter(o => o.workspace_id === wsId);
      const problems = getStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
      
      return opportunities.map(o => ({
        ...o,
        problems: problems.find(p => p.id === o.problem_id) || null
      }));
    },
    get: async (id: string) => {
      const opportunities = getStorage<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, []);
      const problems = getStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
      const opp = opportunities.find(o => o.id === id);
      if (!opp) return null;
      
      return {
        ...opp,
        problems: problems.find(p => p.id === opp.problem_id) || null
      };
    }
  },
  decisions: {
    list: async (wsId: string) => {
      const decisions = getStorage<Decision[]>(STORAGE_KEYS.DECISIONS, []).filter(d => d.workspace_id === wsId);
      return decisions.map(d => ({
        ...d,
        users: { full_name: 'Demo User' }
      }));
    },
    get: async (id: string) => {
      const decisions = getStorage<Decision[]>(STORAGE_KEYS.DECISIONS, []);
      const dec = decisions.find(d => d.id === id);
      if (!dec) return null;
      
      return {
        ...dec,
        users: { full_name: 'Demo User' }
      };
    },
    create: async (data: Partial<Decision>) => {
      const decisions = getStorage<Decision[]>(STORAGE_KEYS.DECISIONS, []);
      const newDecision: Decision = {
        id: generateId(),
        workspace_id: data.workspace_id!,
        title: data.title!,
        action: data.action!,
        rationale: data.rationale!,
        author_id: data.author_id || 'demo',
        created_at: new Date().toISOString(),
        opportunity_id: data.opportunity_id,
        problem_id: data.problem_id,
      };
      decisions.push(newDecision);
      setStorage(STORAGE_KEYS.DECISIONS, decisions);
      triggerUpdate();
      return newDecision;
    }
  },
  artifacts: {
    list: async (wsId: string) => {
      const artifacts = getStorage<Artifact[]>(STORAGE_KEYS.ARTIFACTS, []).filter(a => a.workspace_id === wsId);
      const decisions = getStorage<Decision[]>(STORAGE_KEYS.DECISIONS, []);
      
      return artifacts.map(a => ({
        ...a,
        decisions: decisions.find(d => d.id === a.decision_id) ? { title: decisions.find(d => d.id === a.decision_id)!.title } : null,
        users: { full_name: 'Demo User' }
      }));
    },
    create: async (data: Partial<Artifact>) => {
      const artifacts = getStorage<Artifact[]>(STORAGE_KEYS.ARTIFACTS, []);
      const newArtifact: Artifact = {
        id: generateId(),
        workspace_id: data.workspace_id!,
        decision_id: data.decision_id!,
        title: data.title!,
        type: data.type || 'prd',
        content: data.content!,
        author_id: data.author_id || 'demo',
        external_url: null,
        external_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      artifacts.push(newArtifact);
      setStorage(STORAGE_KEYS.ARTIFACTS, artifacts);
      triggerUpdate();
      return newArtifact;
    },
    update: async (id: string, data: Partial<Artifact>) => {
      const artifacts = getStorage<Artifact[]>(STORAGE_KEYS.ARTIFACTS, []);
      const index = artifacts.findIndex(a => a.id === id);
      if (index !== -1) {
        artifacts[index] = { ...artifacts[index], ...data, updated_at: new Date().toISOString() };
        setStorage(STORAGE_KEYS.ARTIFACTS, artifacts);
        triggerUpdate();
      }
    },
    get: async (id: string) => {
      const artifacts = getStorage<Artifact[]>(STORAGE_KEYS.ARTIFACTS, []);
      const decisions = getStorage<Decision[]>(STORAGE_KEYS.DECISIONS, []);
      const artifact = artifacts.find(a => a.id === id);
      if (!artifact) return null;
      
      return {
        ...artifact,
        decisions: decisions.find(d => d.id === artifact.decision_id) ? { title: decisions.find(d => d.id === artifact.decision_id)!.title } : null,
        users: { full_name: 'Demo User' }
      };
    }
  },
  launches: {
    list: async (wsId: string) => {
      return getStorage<Launch[]>(STORAGE_KEYS.LAUNCHES, []).filter(l => l.workspace_id === wsId);
    },
    create: async (data: Partial<Launch>) => {
      const launches = getStorage<Launch[]>(STORAGE_KEYS.LAUNCHES, []);
      const newLaunch: Launch = {
        id: generateId(),
        workspace_id: data.workspace_id!,
        decision_id: data.decision_id!,
        title: data.title!,
        action: data.action!,
        launched_at: data.launched_at!,
        status: 'active',
        expected_outcome: data.expected_outcome || null,
        before_count: data.before_count || 0,
        created_by: data.created_by || 'demo',
        created_at: new Date().toISOString(),
      };
      launches.push(newLaunch);
      setStorage(STORAGE_KEYS.LAUNCHES, launches);
      triggerUpdate();
      return newLaunch;
    },
    update: async (id: string, data: Partial<Launch>) => {
      const launches = getStorage<Launch[]>(STORAGE_KEYS.LAUNCHES, []);
      const index = launches.findIndex(l => l.id === id);
      if (index !== -1) {
        launches[index] = { ...launches[index], ...data };
        setStorage(STORAGE_KEYS.LAUNCHES, launches);
        triggerUpdate();
      }
    }
  },
  team: {
    list: async (wsId: string) => {
      return {
        members: [{ id: '1', workspace_id: wsId, user_id: 'demo', role: 'owner', created_at: new Date().toISOString(), users: { full_name: 'Demo User', email: 'demo@example.com' } }],
        invites: []
      };
    },
    invite: async () => {
      throw new Error('Team invitations require backend setup');
    },
    removeMember: async () => {
      throw new Error('Team management requires backend setup');
    }
  }
};

// Initialize sample data on first load
export const initializeWorkspace = (workspaceId: string) => {
  initializeSampleData(workspaceId);
};

// React Hooks
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
