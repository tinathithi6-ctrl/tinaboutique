const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER || 'tinaboutique_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tinaboutique_db',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

async function createAdmin() {
  try {
    console.log('\n🔐 Création du compte administrateur...\n');

    // Générer le hash du mot de passe
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Supprimer l'ancien admin s'il existe
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@tinaboutique.com']);

    // Créer le nouveau compte admin
    await pool.query(`
      INSERT INTO users (email, password_hash, full_name, role, preferred_currency)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      'admin@tinaboutique.com',
      passwordHash,
      'Administrateur Principal',
      'admin',
      'EUR'
    ]);

    console.log('✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS !\n');
    console.log('📧 Email: admin@tinaboutique.com');
    console.log('🔑 Mot de passe: admin123\n');
    console.log('🌐 Connectez-vous sur: http://localhost:8080/auth\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createAdmin();
