import { createClient } from '@supabase/supabase-js';

// Anon key is intentionally public — it is safe to commit
export const supabase = createClient(
  'https://utemzhplfoxgtocnnevc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0ZW16aHBsZm94Z3RvY25uZXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTUxMDIsImV4cCI6MjA5NzA5MTEwMn0.DD_8lBCVY6T-cyDFdGMfzyzeHNI6jXzIUWdDiMBiK7Y'
);
