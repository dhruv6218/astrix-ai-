import React from 'react';
import { Navigate } from 'react-router-dom';

// Tone Studio lives inside Dashboard — redirect to /app
export const ToneStudio = () => {
  return <Navigate to="/app" replace />;
};
