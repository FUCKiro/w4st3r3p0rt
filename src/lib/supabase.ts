import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export interface User {
  id: string;
  email: string;
  user_metadata: {
    username?: string;
  };
}

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

export interface UserStats {
  user_id: string;
  xp: number;
  level: number;
  reports_submitted: number;
  reports_verified: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export const BADGES = {
  first_report: {
    id: 'first_report',
    name: 'Primo Passo',
    description: 'Hai fatto la tua prima segnalazione',
    icon: '🌱'
  },
  five_reports: {
    id: 'five_reports',
    name: 'Sentinella',
    description: 'Hai fatto 5 segnalazioni',
    icon: '👀'
  },
  ten_reports: {
    id: 'ten_reports',
    name: 'Guardiano',
    description: 'Hai fatto 10 segnalazioni',
    icon: '🛡️'
  },
  first_verification: {
    id: 'first_verification',
    name: 'Verificatore',
    description: 'Hai verificato la tua prima segnalazione',
    icon: '✅'
  },
  five_verifications: {
    id: 'five_verifications',
    name: 'Ispettore',
    description: 'Hai verificato 5 segnalazioni',
    icon: '🔍'
  }
};