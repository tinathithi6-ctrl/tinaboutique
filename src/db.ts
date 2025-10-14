import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration pour Render (production) - utilise DATABASE_URL
// Configuration pour développement local - utilise les variables individuelles
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    });
