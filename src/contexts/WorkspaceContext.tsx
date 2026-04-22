import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Workspace } from '../types';
import { supabase } from '../lib/supabase';

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

    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        workspace_id,
        workspaces (
          id,
          name,
          slug,
          timezone,
          logo_url,
          created_at,
          product_areas,
          segments
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to fetch workspaces:', error.message);
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsWorkspaceInitializing(false);
      return;
    }

    const fetchedWorkspaces = (data ?? [])
      .map((row: any) => row.workspaces)
      .filter(Boolean) as Workspace[];

    setWorkspaces(fetchedWorkspaces);

    setActiveWorkspace((prev) => {
      if (!fetchedWorkspaces.length) return null;
      const matched = prev ? fetchedWorkspaces.find((w) => w.id === prev.id) : null;
      return matched ?? fetchedWorkspaces[0];
    });

    setIsWorkspaceInitializing(false);
  };

  const handleSetActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
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
