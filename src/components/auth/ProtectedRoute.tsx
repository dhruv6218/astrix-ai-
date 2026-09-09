'use client';

import React from 'react';

// Pure Mock Mode: Passes through all protected routes directly for UI demonstration
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;
