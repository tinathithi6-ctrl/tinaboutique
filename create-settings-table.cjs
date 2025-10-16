// Script pour créer la table des paramètres (compatible CommonJS)
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createSettingsTable() {
  console.log('🔧 Création de la table settings...\n');

  try {
    // Créer la table si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW(),
        updated_by INTEGER
      );
    `);

    console.log('✅ Table site_settings créée');

    // Insérer les paramètres par défaut
    await pool.query(`
      INSERT INTO site_settings (setting_key, setting_value, description)
      VALUES 
        ('whatsapp_business_number', '+243837352401', 'Numéro WhatsApp Business pour les notifications'),
        ('whatsapp_enabled', 'false', 'Activer/Désactiver les notifications WhatsApp'),
        ('email_notifications_enabled', 'true', 'Activer/Désactiver les notifications Email'),
        ('sendgrid_configured', 'false', 'SendGrid est-il configuré ?'),
        ('twilio_configured', 'false', 'Twilio est-il configuré ?')
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    console.log('✅ Paramètres par défaut insérés');
    console.log('\n📋 PARAMÈTRES:');
    console.log('═══════════════════════════════════════════════════════');
    
    const result = await pool.query('SELECT * FROM site_settings ORDER BY setting_key');
    result.rows.forEach(row => {
      console.log(`${row.setting_key}: ${row.setting_value}`);
    });
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✅ Configuration terminée !');
    console.log('\n🎯 Prochaines étapes:');
    console.log('1. Allez dans Dashboard Admin → Paramètres');
    console.log('2. Configurez vos services de notifications');
    console.log('3. Testez l\'envoi de messages\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

createSettingsTable();
