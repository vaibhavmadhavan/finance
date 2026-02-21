import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqwxrqbumbsrljphjxtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxd3hycWJ1bWJzcmxqcGhqeHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mzc2NzMsImV4cCI6MjA4NzAxMzY3M30.XpAXxQDN_nLgzhxJzI2DjWADDo16gXkohkA7FMDwC9M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);