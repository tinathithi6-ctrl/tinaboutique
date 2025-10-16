/**
 * 📋 Vérification des tables de la base de données
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

async function checkTables() {
  console.log('\n🔍 Vérification des tables dans la base de données...\n');
  
  try {
    // Liste toutes les tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📋 TABLES EXISTANTES (' + result.rows.length + '):\n');
    console.log('═'.repeat(50));
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    console.log('═'.repeat(50));
    
    // Vérifier les tables essentielles
    const essentialTables = [
      'users',
      'products', 
      'categories',
      'orders',
      'order_items',
      'cart_items',
      'site_settings'
    ];
    
    const existingTables = result.rows.map(r => r.table_name);
    const missingTables = essentialTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  TABLES MANQUANTES:\n');
      missingTables.forEach(table => console.log(`   ❌ ${table}`));
    } else {
      console.log('\n✅ Toutes les tables essentielles sont présentes!');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
