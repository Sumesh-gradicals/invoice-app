"use server";

import { query } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function checkVercelHealth() {
  const diagnostics: any = {
    time: new Date().toISOString(),
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      db_url_masked: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + "..." : "MISSING",
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  };

  try {
    // 1. Test Database Connection
    const dbTest = await query('SELECT version()');
    diagnostics.db_connection = "SUCCESS";
    diagnostics.db_version = dbTest.rows[0].version;

    // 2. Check Tables
    const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    diagnostics.tables = tables.rows.map(r => r.table_name);

    // 3. Check Current User
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    diagnostics.session_user = session?.user?.email || "NOT LOGGED IN";
    
    if (session?.user) {
      const profileResult = await query('SELECT * FROM "Profile" WHERE id = $1', [session.user.id]);
      diagnostics.profile_record = profileResult.rows[0] || "NOT FOUND";
    }

  } catch (error: any) {
    diagnostics.error = error.message;
    diagnostics.stack = error.stack;
  }

  return diagnostics;
}
