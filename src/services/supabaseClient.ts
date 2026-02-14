import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ibhzfowehdguaucuntfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaHpmb3dlaGRndWF1Y3VudGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjE1MzgsImV4cCI6MjA4NjYzNzUzOH0.unSbeTid8_lVuUH3Zjl6_la7so_7zQf8HonAkOflZE0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
