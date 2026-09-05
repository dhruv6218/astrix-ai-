import Papa from 'papaparse';
import { api } from './api';

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

          let count = 0;
          for (const row of rows) {
            const name = String(row.account_name || '').trim();
            if (name.length > 0) {
              await api.accounts.create({
                workspace_id: workspaceId,
                name: name,
                arr: Number(row.arr || 0),
                domain: row.domain || null,
                plan: row.plan || null,
                health_score: row.health_score || null
              });
              count++;
            }
          }
          resolve(count);
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

          let count = 0;
          for (const row of rows) {
            const text = String(row.signal_text || '').trim();
            if (text.length > 0) {
              await api.signals.create({
                workspace_id: workspaceId,
                raw_text: text,
                source_type: row.source || 'CSV Import',
                severity_label: row.severity || 'Medium',
                sentiment_label: row.sentiment || 'Neutral',
                account_id: null
              });
              count++;
            }
          }
          resolve(count);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
};
