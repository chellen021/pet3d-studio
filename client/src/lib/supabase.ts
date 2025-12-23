import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://awxfzihqptxtfuwlagwh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eGZ6aWhxcHR4dGZ1d2xhZ3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTI5MTMsImV4cCI6MjA4MjAyODkxM30.3saG60SxTG8X4hc1Cu5IqAQEPxLfpKpODmT0aAjcWUs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabaseUrl, supabaseAnonKey };
