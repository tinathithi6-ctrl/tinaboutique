// Promouvoir un utilisateur en admin
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteToAdmin() {
  console.log('🔧 Promotion utilisateur → admin...\n');

  const email = 'odirussel@gmail.com'; // Le compte avec 1 seul "l"

  try {
    const { data: updated, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('email', email)
      .select();

    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }

    if (updated && updated.length > 0) {
      console.log('✅ Utilisateur promu en ADMIN !');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 Email:', updated[0].email);
      console.log('👤 Nom:', updated[0].full_name);
      console.log('🛡️  Nouveau rôle:', updated[0].role);
      console.log('═══════════════════════════════════════════════════════');
      console.log('\n✅ Déconnectez-vous et reconnectez-vous pour voir le Dashboard Admin !');
    } else {
      console.log('❌ Utilisateur non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

promoteToAdmin();
