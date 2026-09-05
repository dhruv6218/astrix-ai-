import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Workspace } from '../types';
import { initializeWorkspace } from '../lib/api';

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  isWorkspaceInitializing: boolean;
  setActiveWorkspace: (ws: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  updateWorkspaceName: (name: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  activeWorkspace: null, workspaces: [], isWorkspaceInitializing: true,
  setActiveWorkspace: () => {}, refreshWorkspaces: async () => {},
  updateWorkspaceName: () => {},
});

const STORAGE_KEY = 'astrix_demo_workspace';

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWs] = useState<Workspace | null>(null);
  const [isWorkspaceInitializing, setIsWorkspaceInitializing] = useState(true);

  const fetchWorkspaces = async () => {
    setIsWorkspaceInitializing(true);
    if (!user) { setWorkspaces([]); setActiveWs(null); setIsWorkspaceInitializing(false); return; }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const ws = JSON.parse(stored) as Workspace;
        setWorkspaces([ws]); setActiveWs(ws);
        initializeWorkspace(ws.id);
      } catch { localStorage.removeItem(STORAGE_KEY); }
    } else {
      const defaultWs: Workspace = {
        id: 'ws-' + Math.random().toString(36).substring(7),
        name: user.user_metadata?.full_name ? `${user.user_metadata.full_name.split(' ')[0]}'s Workspace` : 'My Workspace',
        slug: 'my-workspace',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        logo_url: null,
        plan: 'Hook',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWs));
      setWorkspaces([defaultWs]); setActiveWs(defaultWs);
      initializeWorkspace(defaultWs.id);
    }
    setIsWorkspaceInitializing(false);
  };

  const handleSetActiveWorkspace = (ws: Workspace) => {
    setActiveWs(ws);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
  };

  const updateWorkspaceName = (name: string) => {
    if (!activeWorkspace) return;
    const updated = { ...activeWorkspace, name };
    handleSetActiveWorkspace(updated);
    setWorkspaces([updated]);
  };

  useEffect(() => { fetchWorkspaces(); }, [user]);

  return (
    <WorkspaceContext.Provider value={{
      activeWorkspace, workspaces, isWorkspaceInitializing,
      setActiveWorkspace: handleSetActiveWorkspace,
      refreshWorkspaces: fetchWorkspaces,
      updateWorkspaceName,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
