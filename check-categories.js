// Script pour vérifier les catégories dans la base de données
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

async function checkCategories() {
  console.log('🔍 Vérification des catégories...\n');

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }

    console.log('📊 CATÉGORIES ACTUELLES:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total: ${categories.length} catégories\n`);

    categories.forEach((cat, index) => {
      console.log(`${index + 1}. 🏷️  ${cat.name}`);
      console.log(`   🆔 ID: ${cat.id}`);
      console.log(`   📝 Description: ${cat.description || 'Aucune'}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════');
    
    // Vérifier si "Enfants" existe
    const enfantsExists = categories.some(cat => 
      cat.name.toLowerCase().includes('enfant')
    );

    if (!enfantsExists) {
      console.log('⚠️  La catégorie "Enfants" n\'existe PAS dans la base !');
      console.log('📁 Mais le dossier d\'images existe dans:');
      console.log('   image/produit/categorie/enfants/');
      console.log('\n💡 Voulez-vous que je crée cette catégorie ?');
    } else {
      console.log('✅ La catégorie "Enfants" existe déjà !');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkCategories();
