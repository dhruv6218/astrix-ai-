import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect /app/invoices to main dashboard with invoices tab context
export const Invoices = () => {
  return <Navigate to="/app" replace />;
};
