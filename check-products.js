// Script pour vérifier le nombre de produits dans la base de données Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans le fichier .env');
  console.error('   Vérifiez SUPABASE_URL et SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('🔍 Vérification des produits dans la base de données...\n');

  try {
    // Compter tous les produits
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError.message);
      return;
    }

    // Récupérer quelques produits pour affichage
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price_eur, category_id, is_active, images')
      .limit(10);

    if (productsError) {
      console.error('❌ Erreur lors de la récupération:', productsError.message);
      return;
    }

    // Compter les produits actifs
    const { count: activeCount, error: activeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) {
      console.error('❌ Erreur lors du comptage des produits actifs:', activeError.message);
      return;
    }

    // Afficher les résultats
    console.log('📊 RÉSULTATS:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Total de produits: ${totalCount}`);
    console.log(`🟢 Produits actifs: ${activeCount}`);
    console.log(`🔴 Produits inactifs: ${totalCount - activeCount}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (products && products.length > 0) {
      console.log('📦 Aperçu des produits (10 premiers):');
      console.log('───────────────────────────────────────────────────────');
      products.forEach((product, index) => {
        const status = product.is_active ? '🟢' : '🔴';
        console.log(`${index + 1}. ${status} [ID: ${product.id}] ${product.name} - ${product.price_eur}€`);
        
        // Afficher les images
        if (product.images && product.images.length > 0) {
          console.log(`   📷 Images: ${product.images.join(', ')}`);
        } else {
          console.log(`   ⚠️ Aucune image définie`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️ Aucun produit trouvé dans la base de données.');
    }

    console.log('\n✅ Vérification terminée!');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter la vérification
checkProducts();
