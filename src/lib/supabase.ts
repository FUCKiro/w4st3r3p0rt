import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
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
  username?: string;
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
  environmental_impact?: {
    co2_saved: number;
    waste_recovered: number;
  };
}

// Coefficienti di impatto ambientale per tipo di rifiuto (kg CO2 per kg di rifiuto)
export const WASTE_IMPACT = {
  // Rifiuti Urbani
  0: {
    co2_per_kg: 3.0,
    avg_weight: 5 // kg
  },
  // Rifiuti Ingombranti
  1: {
    co2_per_kg: 4.0,
    avg_weight: 50 // kg
  },
  // Materiali Pericolosi
  2: {
    co2_per_kg: 6.5,
    avg_weight: 10 // kg
  },
  // Discarica Abusiva
  3: {
    co2_per_kg: 4.5,
    avg_weight: 200 // kg
  },
  // Rifiuti Verdi
  4: {
    co2_per_kg: 1.8,
    avg_weight: 25 // kg
  }
};

// Coefficienti per dimensione
export const SIZE_MULTIPLIER = {
  0: 0.5,  // Piccolo
  1: 1,    // Medio
  2: 2,    // Grande
  3: 4     // Molto Grande
};

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