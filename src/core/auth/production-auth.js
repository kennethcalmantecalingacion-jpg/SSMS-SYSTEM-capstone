import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL?.trim();
const supabasePublicKey = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  || import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim();

let supabase = null;
let configurationError = null;

export function getProductionAuthClient() {
  if (!supabaseUrl || !supabasePublicKey || configurationError) {
  return null;
  }
  if (supabase) {
  return supabase;
  }

  let projectUrl;
  try {
  projectUrl = new URL(supabaseUrl);
  } catch {
  configurationError = "VITE_SUPABASE_URL must be a valid absolute URL.";
  return null;
  }
  if (!["https:", "http:"].includes(projectUrl.protocol)) {
  configurationError = "VITE_SUPABASE_URL must use HTTP or HTTPS.";
  return null;
  }

  try {
  supabase = createClient(supabaseUrl, supabasePublicKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
  } catch (error) {
  configurationError = error instanceof Error
    ? error.message
    : "Supabase client configuration is invalid.";
  return null;
  }
  return supabase;
}

export function isProductionAuthConfigured() {
  return getProductionAuthClient() !== null;
}

export function getProductionAuthConfigurationError() {
  return configurationError;
}
