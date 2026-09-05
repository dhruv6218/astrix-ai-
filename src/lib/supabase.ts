// Frontend-only: Supabase is disabled
// This file provides mock implementations for type compatibility

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: { message: 'Backend disabled' } }),
    signUp: async () => ({ data: { session: null }, error: null }),
    signInWithOAuth: async () => {},
    signOut: async () => {},
    resetPasswordForEmail: async () => ({ error: null }),
    updateUser: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        order: () => ({ range: async () => ({ data: [], count: 0, error: null }) }),
        in: () => ({ order: () => ({ range: async () => ({ data: [], count: 0, error: null }) }) }),
      }),
      order: () => ({ range: async () => ({ data: [], count: 0, error: null }) }),
    }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ error: null }),
    delete: async () => ({ error: null }),
  }),
  rpc: async () => ({ data: null, error: { message: 'Backend disabled' } }),
  functions: {
    invoke: async () => ({ data: null, error: { message: 'Backend disabled' } }),
  },
};
