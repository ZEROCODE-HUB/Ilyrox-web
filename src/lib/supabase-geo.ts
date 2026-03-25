import { createClient } from "@supabase/supabase-js";

const supabaseUrlGeo = (
  import.meta.env.VITE_PUBLIC_SUPABASE_GEO_URL || ""
).trim();
const supabaseAnonKeyGeo = (
  import.meta.env.VITE_PUBLIC_SUPABASE_GEO_ANON_KEY || ""
).trim();

if (!supabaseUrlGeo || !supabaseAnonKeyGeo) {
  console.error("Geo config missing!");
} else {
  // console.log("Geo config loaded:", {
  //   urlLength: supabaseUrlGeo.length,
  //   keyLength: supabaseAnonKeyGeo.length,
  //   urlStart: supabaseUrlGeo.substring(0, 8) + "...",
  // });
}

export const supabaseGeo = createClient(supabaseUrlGeo, supabaseAnonKeyGeo, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
