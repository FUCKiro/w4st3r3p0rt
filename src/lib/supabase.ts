import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface WasteReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  waste_type: number;
  size: number;
  notes: string;
  status: 'new' | 'verified' | 'in_progress' | 'resolved' | 'archived';
  created_at: string;
  updated_at: string;
}