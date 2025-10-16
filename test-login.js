// Test de connexion direct
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔍 Test de connexion admin...\n');

  try {
    const email = 'odirussell@gmail.com';
    const passwordToTest = 'admin123';

    // Récupérer l'utilisateur
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      console.error('❌ Erreur lecture DB:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Utilisateur non trouvé avec cet email');
      return;
    }

    const user = users[0];
    console.log('✅ Utilisateur trouvé:');
    console.log('   📧 Email:', user.email);
    console.log('   👤 Nom:', user.full_name);
    console.log('   🛡️  Rôle:', user.role);
    console.log('   🔐 Hash dans DB:', user.password_hash ? user.password_hash.substring(0, 30) + '...' : 'ABSENT');
    console.log('');

    if (!user.password_hash) {
      console.log('❌ PROBLÈME: Aucun password_hash dans la base !');
      console.log('   Réinitialisons maintenant...\n');
      
      const newHash = await bcrypt.hash(passwordToTest, 10);
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('email', email);

      if (updateError) {
        console.error('❌ Erreur mise à jour:', updateError.message);
        return;
      }
      
      console.log('✅ Password_hash mis à jour !');
      console.log('   Essayez de vous connecter maintenant avec:');
      console.log('   📧 Email: odirussell@gmail.com');
      console.log('   🔑 Mot de passe: admin123');
      return;
    }

    // Tester le mot de passe
    console.log('🔍 Test de comparaison bcrypt...');
    const isMatch = await bcrypt.compare(passwordToTest, user.password_hash);

    if (isMatch) {
      console.log('✅ LE MOT DE PASSE CORRESPOND ! La connexion devrait fonctionner.');
      console.log('');
      console.log('📋 Informations de connexion:');
      console.log('   📧 Email: odirussell@gmail.com');
      console.log('   🔑 Mot de passe: admin123');
      console.log('   🌐 URL: https://sparkling-biscotti-defcce.netlify.app/auth');
    } else {
      console.log('❌ LE MOT DE PASSE NE CORRESPOND PAS !');
      console.log('   Réinitialisons avec un nouveau hash...\n');

      const newHash = await bcrypt.hash(passwordToTest, 10);
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('email', email);

      if (updateError) {
        console.error('❌ Erreur mise à jour:', updateError.message);
        return;
      }

      console.log('✅ Nouveau hash créé et enregistré !');
      console.log('   Essayez maintenant avec:');
      console.log('   📧 Email: odirussell@gmail.com');
      console.log('   🔑 Mot de passe: admin123');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testLogin();
