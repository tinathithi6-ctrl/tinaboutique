import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Supabase (API JavaScript)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  throw new Error('Variables Supabase manquantes. Configurez SUPABASE_URL et SUPABASE_ANON_KEY dans .env');
}

// Client Supabase (pour l'API JavaScript)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Pool PostgreSQL pour connexion directe à Supabase
// Vous pouvez obtenir cette URL depuis: Supabase Dashboard > Settings > Database > Connection string
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL non définie. Certaines fonctionnalités (rapports, statistiques) ne fonctionneront pas.');
  console.warn('   Obtenez votre URL de connexion depuis: Supabase Dashboard > Settings > Database');
}

// Pool PostgreSQL (pour les requêtes SQL directes)
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL ? {
    rejectUnauthorized: false
  } : undefined
});

pool.on('connect', () => {
  console.log('✅ Client Supabase (API) initialisé');
  console.log('✅ Pool PostgreSQL (SQL direct) connecté à Supabase');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion PostgreSQL:', err.message);
});
