import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface WasteReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  waste_type: string;
  size: string;
  notes: string;
  status: 'new' | 'verified' | 'in_progress' | 'resolved' | 'archived';
  created_at: string;
  updated_at: string;
}