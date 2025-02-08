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
    name: 'Sentinella Verde',
    description: 'Hai fatto la tua prima segnalazione',
    icon: '🌱' as const
  },
  five_reports: {
    id: 'five_reports',
    name: 'Guardiano Ambientale',
    description: 'Hai fatto 5 segnalazioni',
    icon: '👀' as const
  },
  ten_reports: {
    id: 'ten_reports',
    name: 'Difensore della Terra',
    description: 'Hai fatto 10 segnalazioni',
    icon: '🛡️' as const
  },
  first_verification: {
    id: 'first_verification',
    name: 'Verificatore Verde',
    description: 'Hai verificato la tua prima segnalazione',
    icon: '✅' as const
  },
  five_verifications: {
    id: 'five_verifications',
    name: 'Ispettore Ecologico',
    description: 'Hai verificato 5 segnalazioni',
    icon: '🔍' as const
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Eroe del Weekend',
    description: 'Hai fatto 3 segnalazioni durante il weekend',
    icon: '🌞' as const
  },
  urban_guardian: {
    id: 'urban_guardian',
    name: 'Guardiano Urbano',
    description: 'Hai segnalato 10 rifiuti urbani',
    icon: '🏙️' as const
  },
  nature_protector: {
    id: 'nature_protector',
    name: 'Protettore della Natura',
    description: 'Hai segnalato 10 rifiuti in aree verdi',
    icon: '🌳' as const
  },
  team_player: {
    id: 'team_player',
    name: 'Giocatore di Squadra',
    description: 'Hai verificato 5 segnalazioni di altri utenti',
    icon: '🤝' as const
  },
  rapid_responder: {
    id: 'rapid_responder',
    name: 'Primo Soccorso',
    description: 'Hai verificato una segnalazione entro 30 minuti',
    icon: '⚡' as const
  },
  eco_explorer: {
    id: 'eco_explorer',
    name: 'Esploratore Ecologico',
    description: 'Hai fatto segnalazioni in 10 zone diverse',
    icon: '🗺️' as const
  },
  waste_warrior: {
    id: 'waste_warrior',
    name: 'Guerriero dei Rifiuti',
    description: 'Le tue segnalazioni hanno portato alla rimozione di 2000kg di rifiuti',
    icon: '💪' as const
  },
  community_hero: {
    id: 'community_hero',
    name: 'Eroe della Comunità',
    description: 'Hai contribuito alla risoluzione di 30 segnalazioni',
    icon: '🌟' as const
  },
  documentation_master: {
    id: 'documentation_master',
    name: 'Maestro della Documentazione',
    description: 'Hai aggiunto note dettagliate a 15 segnalazioni',
    icon: '📝' as const
  },
  seasonal_guardian: {
    id: 'seasonal_guardian',
    name: 'Guardiano delle Stagioni',
    description: 'Hai fatto segnalazioni in tutte le stagioni dell\'anno',
    icon: '🌍' as const
  },
  hazard_eliminator: {
    id: 'hazard_eliminator',
    name: 'Eliminatore di Pericoli',
    description: 'Hai segnalato 5 materiali pericolosi che sono stati rimossi',
    icon: '☢️' as const
  },
  recycling_champion: {
    id: 'recycling_champion',
    name: 'Campione del Riciclo',
    description: 'Hai segnalato 20 rifiuti riciclabili che sono stati recuperati',
    icon: '♻️' as const
  },
  streak_week: {
    id: 'streak_week',
    name: 'Costanza Settimanale',
    description: 'Hai fatto segnalazioni per 7 giorni consecutivi',
    icon: '📅' as const
  },
  eco_warrior: {
    id: 'eco_warrior',
    name: 'Guerriero Verde',
    description: 'Hai segnalato 5 rifiuti verdi',
    icon: '🌿' as const
  },
  hazard_hunter: {
    id: 'hazard_hunter',
    name: 'Cacciatore di Pericoli',
    description: 'Hai segnalato 3 materiali pericolosi',
    icon: '⚠️' as const
  },
  quick_response: {
    id: 'quick_response',
    name: 'Reazione Rapida',
    description: 'Hai verificato una segnalazione entro 1 ora',
    icon: '⚡' as const
  },
  night_watch: {
    id: 'night_watch',
    name: 'Guardiano Notturno',
    description: 'Hai fatto una segnalazione tra le 22:00 e le 6:00',
    icon: '🌙' as const
  },
  distance_walker: {
    id: 'distance_walker',
    name: 'Pattugliatore',
    description: 'Hai fatto segnalazioni in 5 zone diverse',
    icon: '👣' as const
  },
  cleanup_champion: {
    id: 'cleanup_champion',
    name: 'Campione della Pulizia',
    description: 'Le tue segnalazioni hanno portato alla rimozione di 1000kg di rifiuti',
    icon: '🏆' as const
  },
  community_pillar: {
    id: 'community_pillar',
    name: 'Pilastro della Comunità',
    description: 'Hai aiutato a risolvere 20 segnalazioni',
    icon: '🏛️' as const
  },
  photo_reporter: {
    id: 'photo_reporter',
    name: 'Foto Reporter',
    description: 'Hai aggiunto foto a 10 segnalazioni',
    icon: '📸' as const
  },
  early_bird: {
    id: 'early_bird',
    name: 'Uccello Mattiniero',
    description: 'Hai fatto una segnalazione prima delle 7:00',
    icon: '🌅' as const
  }
};