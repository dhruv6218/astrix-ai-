import { useState, useEffect, useCallback } from 'react';
import { Invoice, GatewaySettings, ToneSettings, ActivityItem, AdminUser } from '../types';

// ─── Storage Keys ───────────────────────────────────────────────────────────
const KEYS = {
  INVOICES: 'astrix_invoices',
  GATEWAYS: 'astrix_gateways',
  TONE: 'astrix_tone_settings',
  ACTIVITY: 'astrix_activity',
  WORKSPACE: 'astrix_demo_workspace',
  ADMIN_USERS: 'astrix_admin_users',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).substring(2, 15);

const getStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

export const triggerUpdate = () => window.dispatchEvent(new Event('data-updated'));

// ─── Seed Data ────────────────────────────────────────────────────────────────
export const initializeWorkspace = (workspaceId: string) => {
  const existing = getStorage<Invoice[]>(KEYS.INVOICES, []);
  if (existing.length > 0) return;

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString().split('T')[0];

  const sampleInvoices: Invoice[] = [
    { id: genId(), workspace_id: workspaceId, client_name: 'Acme Corp', client_email: 'billing@acme.com', amount: 2400, currency: 'USD', due_date: daysAgo(14), status: 'pending', ai_status: 'nudge_sent', last_chased_at: daysAgo(4), reminder_count: 2, days_overdue: 14, created_at: daysAgo(20) },
    { id: genId(), workspace_id: workspaceId, client_name: 'TechStart GmbH', client_email: 'finance@techstart.de', amount: 1800, currency: 'EUR', due_date: daysAgo(18), status: 'pending', ai_status: 'escalated', last_chased_at: daysAgo(3), reminder_count: 3, days_overdue: 18, created_at: daysAgo(25) },
    { id: genId(), workspace_id: workspaceId, client_name: 'DataFlow Ltd', client_email: 'accounts@dataflow.co', amount: 890, currency: 'USD', due_date: daysAgo(10), status: 'pending', ai_status: 'pending', last_chased_at: null, reminder_count: 0, days_overdue: 10, created_at: daysAgo(15) },
    { id: genId(), workspace_id: workspaceId, client_name: 'InnovateLab', client_email: 'pay@innovatelab.com', amount: 1500, currency: 'USD', due_date: daysAgo(30), status: 'paid', ai_status: 'paid', last_chased_at: daysAgo(10), reminder_count: 1, days_overdue: 0, created_at: daysAgo(35) },
    { id: genId(), workspace_id: workspaceId, client_name: 'CloudScale Inc', client_email: 'ap@cloudscale.io', amount: 3200, currency: 'USD', due_date: daysAgo(25), status: 'paused', ai_status: 'nudge_sent', last_chased_at: daysAgo(5), reminder_count: 2, days_overdue: 25, created_at: daysAgo(30) },
    { id: genId(), workspace_id: workspaceId, client_name: 'DesignPro Studio', client_email: 'hello@designpro.io', amount: 4500, currency: 'USD', due_date: daysAgo(7), status: 'pending', ai_status: 'nudge_sent', last_chased_at: daysAgo(2), reminder_count: 1, days_overdue: 7, created_at: daysAgo(12) },
  ];
  setStorage(KEYS.INVOICES, sampleInvoices);

  const sampleGateways: GatewaySettings[] = [
    { id: genId(), workspace_id: workspaceId, type: 'stripe', label: 'Stripe', api_key: 'sk_demo_****', is_active: true, created_at: new Date().toISOString() },
  ];
  setStorage(KEYS.GATEWAYS, sampleGateways);

  const sampleActivity: ActivityItem[] = [
    { id: genId(), type: 'reminder_sent', message: 'AI sent a friendly nudge to Acme Corp for Invoice #1042', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), amount: 2400 },
    { id: genId(), type: 'payment_received', message: 'Payment received from InnovateLab — Invoice cleared', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), amount: 1500 },
    { id: genId(), type: 'escalated', message: 'AI escalated TechStart GmbH to Level 2 (Firm tone)', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: genId(), type: 'invoice_created', message: 'New invoice added for DataFlow Ltd', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), amount: 890 },
    { id: genId(), type: 'reminder_sent', message: 'AI sent 2nd reminder to CloudScale Inc', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), amount: 3200 },
  ];
  setStorage(KEYS.ACTIVITY, sampleActivity);

  const sampleAdminUsers: AdminUser[] = [
    { id: genId(), email: 'sarah@freelance.com', full_name: 'Sarah Johnson', plan: 'Solo', credits_used: 12, status: 'active', created_at: daysAgo(45), invoice_count: 8, total_recovered: 18400 },
    { id: genId(), email: 'mike@agency.co', full_name: 'Mike Chen', plan: 'Agency', credits_used: 5, status: 'active', created_at: daysAgo(30), invoice_count: 24, total_recovered: 67200 },
    { id: genId(), email: 'raj@indie.dev', full_name: 'Raj Patel', plan: 'Hook', credits_used: 3, status: 'active', created_at: daysAgo(10), invoice_count: 3, total_recovered: 4200 },
    { id: genId(), email: 'anna@studio.com', full_name: 'Anna Mueller', plan: 'Solo', credits_used: 0, status: 'suspended', created_at: daysAgo(60), invoice_count: 0, total_recovered: 0 },
  ];
  setStorage(KEYS.ADMIN_USERS, sampleAdminUsers);
};

// ─── Invoice API ──────────────────────────────────────────────────────────────
export const api = {
  invoices: {
    list: async (wsId: string): Promise<Invoice[]> => {
      return getStorage<Invoice[]>(KEYS.INVOICES, []).filter(i => i.workspace_id === wsId);
    },
    create: async (data: Omit<Invoice, 'id' | 'created_at' | 'ai_status' | 'last_chased_at' | 'reminder_count' | 'days_overdue'>): Promise<Invoice> => {
      const invoices = getStorage<Invoice[]>(KEYS.INVOICES, []);
      const dueDate = new Date(data.due_date);
      const today = new Date();
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / 86400000));
      const newInvoice: Invoice = {
        ...data,
        id: genId(),
        ai_status: 'pending',
        last_chased_at: null,
        reminder_count: 0,
        days_overdue: daysOverdue,
        created_at: new Date().toISOString(),
      };
      invoices.push(newInvoice);
      setStorage(KEYS.INVOICES, invoices);

      const activity = getStorage<ActivityItem[]>(KEYS.ACTIVITY, []);
      activity.unshift({ id: genId(), type: 'invoice_created', message: `New invoice added for ${data.client_name}`, timestamp: new Date().toISOString(), amount: data.amount });
      setStorage(KEYS.ACTIVITY, activity.slice(0, 20));

      triggerUpdate();
      return newInvoice;
    },
    update: async (id: string, data: Partial<Invoice>): Promise<void> => {
      const invoices = getStorage<Invoice[]>(KEYS.INVOICES, []);
      const idx = invoices.findIndex(i => i.id === id);
      if (idx !== -1) {
        invoices[idx] = { ...invoices[idx], ...data };
        setStorage(KEYS.INVOICES, invoices);
        triggerUpdate();
      }
    },
  },

  gateways: {
    list: async (wsId: string): Promise<GatewaySettings[]> => {
      return getStorage<GatewaySettings[]>(KEYS.GATEWAYS, []).filter(g => g.workspace_id === wsId);
    },
    create: async (data: Omit<GatewaySettings, 'id' | 'created_at'>): Promise<GatewaySettings> => {
      const gateways = getStorage<GatewaySettings[]>(KEYS.GATEWAYS, []);
      const newGw: GatewaySettings = { ...data, id: genId(), created_at: new Date().toISOString() };
      gateways.push(newGw);
      setStorage(KEYS.GATEWAYS, gateways);
      triggerUpdate();
      return newGw;
    },
    remove: async (id: string): Promise<void> => {
      const gateways = getStorage<GatewaySettings[]>(KEYS.GATEWAYS, []).filter(g => g.id !== id);
      setStorage(KEYS.GATEWAYS, gateways);
      triggerUpdate();
    },
  },

  tone: {
    get: async (wsId: string): Promise<ToneSettings | null> => {
      const settings = getStorage<ToneSettings | null>(KEYS.TONE, null);
      return settings?.workspace_id === wsId ? settings : null;
    },
    save: async (data: ToneSettings): Promise<void> => {
      setStorage(KEYS.TONE, { ...data, updated_at: new Date().toISOString() });
      triggerUpdate();
    },
  },

  activity: {
    list: async (): Promise<ActivityItem[]> => {
      return getStorage<ActivityItem[]>(KEYS.ACTIVITY, []);
    },
  },

  admin: {
    listUsers: async (): Promise<AdminUser[]> => {
      return getStorage<AdminUser[]>(KEYS.ADMIN_USERS, []);
    },
    updateUser: async (id: string, data: Partial<AdminUser>): Promise<void> => {
      const users = getStorage<AdminUser[]>(KEYS.ADMIN_USERS, []);
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        setStorage(KEYS.ADMIN_USERS, users);
        triggerUpdate();
      }
    },
    addCredits: async (id: string, credits: number): Promise<void> => {
      const users = getStorage<AdminUser[]>(KEYS.ADMIN_USERS, []);
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx].credits_used = Math.max(0, users[idx].credits_used - credits);
        setStorage(KEYS.ADMIN_USERS, users);
        triggerUpdate();
      }
    },
  },
};

// ─── React Hooks ──────────────────────────────────────────────────────────────
export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
    window.addEventListener('data-updated', execute);
    return () => window.removeEventListener('data-updated', execute);
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
}

export const useInvoices = (wsId?: string) => {
  const { data, isLoading, refetch } = useQuery(async () => {
    if (!wsId) return [];
    return api.invoices.list(wsId);
  }, [wsId]);
  return { data: data || [], isLoading, refetch };
};

export const useGateways = (wsId?: string) => {
  const { data, isLoading, refetch } = useQuery(async () => {
    if (!wsId) return [];
    return api.gateways.list(wsId);
  }, [wsId]);
  return { data: data || [], isLoading, refetch };
};

export const useToneSettings = (wsId?: string) => {
  const { data, isLoading } = useQuery(async () => {
    if (!wsId) return null;
    return api.tone.get(wsId);
  }, [wsId]);
  return { data, isLoading };
};

export const useActivity = () => {
  const { data, isLoading } = useQuery(async () => api.activity.list(), []);
  return { data: data || [], isLoading };
};

export const useAdminUsers = () => {
  const { data, isLoading, refetch } = useQuery(async () => api.admin.listUsers(), []);
  return { data: data || [], isLoading, refetch };
};
