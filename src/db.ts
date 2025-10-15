import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables Supabase manquantes. Configurez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration du pool de connexions PostgreSQL direct
// Assurez-vous que DATABASE_URL est bien configuré dans votre .env
// Format: postgresql://[user]:[password]@[host]:[port]/[database]
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL non définie. La connexion directe à PostgreSQL est désactivée.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requis pour se connecter à des bases de données cloud comme Supabase/Render
  }
});

pool.on('connect', () => {
  console.log('🔌 Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données', err.stack);
});
