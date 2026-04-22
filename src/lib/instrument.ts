import * as Sentry from "@sentry/react";
import posthog from 'posthog-js';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || 'development',
  });
}

// Initialize PostHog for Product Analytics
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    autocapture: false, // We want explicit, high-signal events only
    capture_pageview: false, // Handled manually if needed, keeping it lean
  });
}

export { posthog, Sentry };
