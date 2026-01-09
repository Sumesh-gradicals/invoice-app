import { createClient as createBrowser } from './supabase/client'
import { createClient as createServer } from './supabase/server'

/**
 * Convenience functions to get the appropriate Supabase client.
 * Note: These should be called within the relevant context (client or server).
 */
export const getSupabaseClient = () => createBrowser()
export const getSupabaseServer = () => createServer()
