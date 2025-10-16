// Script pour réinitialiser le mot de passe admin
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans le fichier .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdminPassword() {
  console.log('🔧 Réinitialisation du mot de passe admin...\n');

  try {
    // Nouveau mot de passe simple pour test
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le compte odirussell@gmail.com
    const { data: updated, error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('email', 'odirussell@gmail.com')
      .select();

    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }

    if (updated && updated.length > 0) {
      console.log('✅ Mot de passe réinitialisé avec succès !');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 Email: odirussell@gmail.com');
      console.log('🔑 Nouveau mot de passe: admin123');
      console.log('🛡️  Rôle: admin');
      console.log('═══════════════════════════════════════════════════════');
      console.log('\n⚠️  IMPORTANT : Changez ce mot de passe après connexion !');
      console.log('\n🌐 Connectez-vous sur : https://sparkling-biscotti-defcce.netlify.app/auth');
    } else {
      console.log('❌ Utilisateur non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

resetAdminPassword();
