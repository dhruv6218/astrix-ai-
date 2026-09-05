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
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  activeWorkspace: null,
  workspaces: [],
  isWorkspaceInitializing: true,
  setActiveWorkspace: () => {},
  refreshWorkspaces: async () => {},
});

const STORAGE_KEY = 'astrix_demo_workspace';

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isWorkspaceInitializing, setIsWorkspaceInitializing] = useState(true);

  const fetchWorkspaces = async () => {
    setIsWorkspaceInitializing(true);

    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsWorkspaceInitializing(false);
      return;
    }

    // Demo: Create a default workspace if none exists
    const storedWorkspace = localStorage.getItem(STORAGE_KEY);
    
    if (storedWorkspace) {
      try {
        const ws = JSON.parse(storedWorkspace) as Workspace;
        setWorkspaces([ws]);
        setActiveWorkspace(ws);
        initializeWorkspace(ws.id);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      // Create default workspace
      const defaultWorkspace: Workspace = {
        id: 'demo-workspace-' + Math.random().toString(36).substring(7),
        name: 'My Workspace',
        slug: 'my-workspace',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        logo_url: null,
        product_areas: ['Authentication', 'Dashboard', 'API', 'Billing'],
        segments: ['Enterprise', 'SMB', 'Self-Serve'],
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkspace));
      setWorkspaces([defaultWorkspace]);
      setActiveWorkspace(defaultWorkspace);
      initializeWorkspace(defaultWorkspace.id);
    }

    setIsWorkspaceInitializing(false);
  };

  const handleSetActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  return (
    <WorkspaceContext.Provider value={{
      activeWorkspace,
      workspaces,
      isWorkspaceInitializing,
      setActiveWorkspace: handleSetActiveWorkspace,
      refreshWorkspaces: fetchWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
