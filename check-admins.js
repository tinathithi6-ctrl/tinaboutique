// Script pour vérifier les comptes admin dans la base de données
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans le fichier .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
  console.log('🔍 Vérification des comptes admin...\n');

  try {
    // Récupérer tous les utilisateurs
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: true });

    if (allError) {
      console.error('❌ Erreur:', allError.message);
      return;
    }

    // Filtrer les admins
    const admins = allUsers.filter(user => user.role === 'admin');
    const regularUsers = allUsers.filter(user => user.role !== 'admin');

    console.log('📊 RÉSULTATS:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`👥 Total d'utilisateurs: ${allUsers.length}`);
    console.log(`🛡️  Administrateurs: ${admins.length}`);
    console.log(`👤 Utilisateurs normaux: ${regularUsers.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (admins.length > 0) {
      console.log('🛡️  COMPTES ADMINISTRATEURS:');
      console.log('───────────────────────────────────────────────────────');
      admins.forEach((admin, index) => {
        const date = new Date(admin.created_at).toLocaleDateString('fr-FR');
        console.log(`${index + 1}. 📧 ${admin.email}`);
        console.log(`   👤 Nom: ${admin.full_name || 'Non défini'}`);
        console.log(`   🆔 ID: ${admin.id}`);
        console.log(`   📅 Créé le: ${date}`);
        console.log('');
      });
    } else {
      console.log('⚠️  AUCUN administrateur trouvé dans la base !');
      console.log('   Vous devez créer un compte admin.');
    }

    if (regularUsers.length > 0) {
      console.log('\n👤 UTILISATEURS NORMAUX (5 premiers):');
      console.log('───────────────────────────────────────────────────────');
      regularUsers.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.full_name || 'Sans nom'}`);
      });
      if (regularUsers.length > 5) {
        console.log(`   ... et ${regularUsers.length - 5} autre(s)`);
      }
    }

    console.log('\n✅ Vérification terminée!');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkAdmins();
