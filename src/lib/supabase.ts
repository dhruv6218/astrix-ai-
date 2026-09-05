// Frontend-only: Supabase disabled — all data lives in localStorage
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
      }),
    }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({ eq: async () => ({ error: null }) }),
    delete: async () => ({ error: null }),
  }),
  rpc: async () => ({ data: null, error: { message: 'Backend disabled' } }),
  functions: { invoke: async () => ({ data: null, error: { message: 'Backend disabled' } }) },
};
