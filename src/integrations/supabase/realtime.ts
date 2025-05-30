
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://amityhneeclqenbiyixl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaXR5aG5lZWNscWVuYml5aXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNjkyMzMsImV4cCI6MjA2MTg0NTIzM30.GpU93dY5XKWWGzKAZLofhu6DgDrqxFo_wa3Gq6upc2M";

/* Second client WITH realtime (used only where needed) */
export const supabaseRT = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
