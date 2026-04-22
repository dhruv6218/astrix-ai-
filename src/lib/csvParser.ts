import Papa from 'papaparse';
import { supabase } from './supabase';

const normalizeHeader = (header: string) => header.toLowerCase().trim().replace(/\s+/g, '_');

export const processAccountsCsv = async (file: File, workspaceId: string): Promise<number> => {
  if (!workspaceId) throw new Error('Workspace is required');
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          if (rows.length === 0) throw new Error("CSV is empty");

          const headers = Object.keys(rows[0]);
          if (!headers.includes('account_name')) throw new Error("Missing required column: account_name");

          const payload = rows
            .filter((row) => String(row.account_name || '').trim().length > 0)
            .map((row) => ({
            workspace_id: workspaceId,
            name: String(row.account_name).trim(),
            arr: Number(row.arr || 0),
            domain: row.domain || null,
            plan: row.plan || null,
            health_score: row.health_score || null
          }));

          const { error } = await supabase.from('accounts').insert(payload);
          if (error) throw error;
          resolve(rows.length);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
};

export const processSignalsCsv = async (file: File, workspaceId: string): Promise<number> => {
  if (!workspaceId) throw new Error('Workspace is required');
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          if (rows.length === 0) throw new Error("CSV is empty");

          const headers = Object.keys(rows[0]);
          if (!headers.includes('signal_text')) throw new Error("Missing required column: signal_text");

          const accountNames = rows.map((row) => row.account_name).filter(Boolean);
          let accountMap = new Map<string, string>();

          if (accountNames.length) {
            const { data: accounts, error: accountError } = await supabase
              .from('accounts')
              .select('id, name')
              .eq('workspace_id', workspaceId)
              .in('name', accountNames);
            if (accountError) throw accountError;
            accountMap = new Map((accounts ?? []).map((a: any) => [a.name, a.id]));
          }

          const payload = rows
            .filter((row) => String(row.signal_text || '').trim().length > 0)
            .map((row) => ({
            workspace_id: workspaceId,
            raw_text: String(row.signal_text).trim(),
            source_type: row.source || 'CSV Import',
            severity_label: row.severity || 'Medium',
            sentiment_label: row.sentiment || 'Neutral',
            account_id: row.account_name ? accountMap.get(row.account_name) ?? null : null
          }));

          const { error } = await supabase.from('signals').insert(payload);
          if (error) throw error;
          resolve(rows.length);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
};
