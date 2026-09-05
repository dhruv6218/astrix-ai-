// Frontend-only: Analytics disabled
// This file provides stub implementations

export const posthog = {
  init: () => {},
  capture: () => {},
  identify: () => {},
};

export const Sentry = {
  init: () => {},
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
};
