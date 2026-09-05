import Papa from 'papaparse';
import { api } from './api';

const normalizeHeader = (h: string) => h.toLowerCase().trim().replace(/\s+/g, '_');

export const processInvoicesCsv = async (file: File, workspaceId: string): Promise<number> => {
  if (!workspaceId) throw new Error('Workspace is required');
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: async (results) => {
        try {
          const rows = results.data as Record<string, string>[];
          if (rows.length === 0) throw new Error('CSV is empty');

          const headers = Object.keys(rows[0]);
          if (!headers.includes('client_name')) throw new Error('Missing required column: client_name');
          if (!headers.includes('amount')) throw new Error('Missing required column: amount');
          if (!headers.includes('due_date')) throw new Error('Missing required column: due_date');

          let count = 0;
          for (const row of rows) {
            const clientName = String(row.client_name || '').trim();
            const amount = parseFloat(row.amount || '0');
            const dueDate = String(row.due_date || '').trim();
            if (clientName && amount > 0 && dueDate) {
              await api.invoices.create({
                workspace_id: workspaceId,
                client_name: clientName,
                client_email: String(row.client_email || '').trim() || `${clientName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
                amount,
                currency: String(row.currency || 'USD').trim().toUpperCase(),
                due_date: dueDate,
                status: 'pending',
              });
              count++;
            }
          }
          resolve(count);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
};
