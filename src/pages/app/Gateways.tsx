import React from 'react';
import { Navigate } from 'react-router-dom';

// Gateways live inside Dashboard Settings tab
export const Gateways = () => {
  return <Navigate to="/app" replace />;
};
