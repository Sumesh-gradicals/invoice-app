"use server";

import { query } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function getProfile(id: string) {
  try {
    const result = await query('SELECT * FROM "Profile" WHERE id = $1', [id]);
    const profile = result.rows[0] || null;
    console.log(`[getProfile] id: ${id}, found: ${!!profile}, role: ${profile?.role}`);
    return profile;
  } catch (e) {
    console.error("Failed to get profile", e);
    return null;
  }
}

export async function syncProfile(id: string, email: string) {
  try {
    console.log(`[syncProfile] id: ${id}, email: ${email}`);
    // This will create the profile if it doesn't exist, defaulting to 'Ops'
    await query(
      'INSERT INTO "Profile" (id, email, role, "updatedAt") VALUES ($1, $2, \'Ops\', NOW()) ON CONFLICT (id) DO NOTHING',
      [id, email]
    );
    return await getProfile(id);
  } catch (e) {
    console.error("Failed to sync profile", e);
    return null;
  }
}

export async function isAdmin() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.log("[isAdmin] No session found");
    return false;
  }
  
  const profile = await getProfile(session.user.id);
  const result = profile?.role === "Admin";
  console.log(`[isAdmin] email: ${session.user.email}, role: ${profile?.role}, result: ${result}`);
  return result;
}
