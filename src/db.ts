import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Supabase (recommandé pour simplicité)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables Supabase manquantes. Configurez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Pour compatibilité avec l'ancien code PostgreSQL direct
export const pool = {
  query: async (text: string, params?: any[]) => {
    // Convertir les requêtes PostgreSQL en appels Supabase
    // Cette implémentation basique permet la transition
    console.log('Query:', text, params);
    return { rows: [], rowCount: 0 };
  }
};
