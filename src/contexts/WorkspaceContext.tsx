'use client';

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

const DEFAULT_MOCK_WORKSPACE: Workspace = {
  id: 'ws-demo-astrix',
  name: 'Acme Corp Workspace',
  slug: 'acme-corp',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  logo_url: null,
  plan: 'Hook',
  created_at: new Date().toISOString(),
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([DEFAULT_MOCK_WORKSPACE]);
  const [activeWorkspace, setActiveWs] = useState<Workspace | null>(DEFAULT_MOCK_WORKSPACE);
  const [isWorkspaceInitializing, setIsWorkspaceInitializing] = useState(false);

  const fetchWorkspaces = async () => {
    setIsWorkspaceInitializing(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const ws = JSON.parse(stored) as Workspace;
        setWorkspaces([ws]);
        setActiveWs(ws);
        initializeWorkspace(ws.id);
      } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_WORKSPACE));
        setWorkspaces([DEFAULT_MOCK_WORKSPACE]);
        setActiveWs(DEFAULT_MOCK_WORKSPACE);
        initializeWorkspace(DEFAULT_MOCK_WORKSPACE.id);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_WORKSPACE));
      setWorkspaces([DEFAULT_MOCK_WORKSPACE]);
      setActiveWs(DEFAULT_MOCK_WORKSPACE);
      initializeWorkspace(DEFAULT_MOCK_WORKSPACE.id);
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

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

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
