import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useMousePosition } from './hooks/useMousePosition';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';

// Public Pages
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { NotFound } from './pages/NotFound';
import { AcceptInvitation } from './pages/AcceptInvitation';

// Marketing & Legal Pages
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';

// Onboarding Pages
import { Step1Workspace } from './pages/onboarding/Step1Workspace';
import { Step2Data } from './pages/onboarding/Step2Data';
import { Step3Results } from './pages/onboarding/Step3Results';

// App Pages — Revenue Recovery SaaS
import { Dashboard } from './pages/app/Dashboard';
import { Invoices } from './pages/app/Invoices';
import { ToneStudio } from './pages/app/ToneStudio';
import { Gateways } from './pages/app/Gateways';
import { Analytics } from './pages/app/Analytics';
import { Settings } from './pages/app/Settings';

function App() {
  useMousePosition();

  return (
    <ToastProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Router>
            <KeyboardShortcuts />
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />
              
              {/* Marketing & Legal */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Protected Onboarding Flow */}
              <Route path="/onboarding" element={<Navigate to="/onboarding/step-1" replace />} />
              <Route path="/onboarding/step-1" element={<ProtectedRoute><Step1Workspace /></ProtectedRoute>} />
              <Route path="/onboarding/step-2" element={<ProtectedRoute><Step2Data /></ProtectedRoute>} />
              <Route path="/onboarding/step-3" element={<ProtectedRoute><Step3Results /></ProtectedRoute>} />

              {/* Protected App Routes — Revenue Recovery */}
              <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/app/dashboard" element={<Navigate to="/app" replace />} />
              <Route path="/app/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
              <Route path="/app/tone" element={<ProtectedRoute><ToneStudio /></ProtectedRoute>} />
              <Route path="/app/gateways" element={<ProtectedRoute><Gateways /></ProtectedRoute>} />
              <Route path="/app/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Catch all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </WorkspaceProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
