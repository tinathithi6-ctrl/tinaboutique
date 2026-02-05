import { supabase } from "@/integrations/supabase/client";

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price_eur: number;
  price_usd: number;
  price_cdf: number;
  stock_quantity: number;
  images: string[];
  category_id: string;
  is_active: boolean;
  pricing?: {
    originalPrice: number;
    finalPrice: number;
    discountApplied: boolean;
    currency: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

// Service pour les produits
export const ProductService = {
  // Récupérer tous les produits actifs
  getAllProducts: async (): Promise<Product[]> => {
    if (!supabase) return [];
    
    // Récupérer les produits
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
      
    if (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }

    // Calculer les prix (logique simple côté client pour l'instant)
    return (data || []).map((product: any) => ({
      ...product,
      pricing: {
        originalPrice: product.price_eur,
        finalPrice: product.sale_price_eur || product.price_eur,
        discountApplied: !!product.sale_price_eur,
        currency: 'EUR'
      }
    }));
  },

  // Récupérer un produit par ID
  getProductById: async (id: string): Promise<Product | null> => {
    if (!supabase) return null;

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return null;
    }

    // Ajouter la logique de prix
    return {
      ...product,
      pricing: {
        originalPrice: product.price_eur,
        finalPrice: product.sale_price_eur || product.price_eur,
        discountApplied: !!product.sale_price_eur,
        currency: 'EUR'
      }
    } as Product;
  },

  // Récupérer un produit par Slug (simulé par ID pour l'instant si pas de slug)
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    // Si le slug ressemble à un UUID, on cherche par ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    if (isUuid) {
      return ProductService.getProductById(slug);
    }
    
    // Sinon on essaie de chercher par nom (approximation) ou on retourne null
    if (!supabase) return null;
    
    // Note: Idéalement il faudrait une colonne 'slug' dans la DB
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${slug.replace(/-/g, ' ')}%`) // Recherche approximative
      .limit(1)
      .single();
      
    if (error || !product) {
       // Fallback: chercher par ID si le slug est en fait un ID passé comme chaine
       return ProductService.getProductById(slug);
    }

    return {
      ...product,
      pricing: {
        originalPrice: product.price_eur,
        finalPrice: product.sale_price_eur || product.price_eur,
        discountApplied: !!product.sale_price_eur,
        currency: 'EUR'
      }
    } as Product;
  },

  // Récupérer les produits par catégorie
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    if (!supabase) return [];

    // Si on passe un nom de catégorie, il faudrait idéalement chercher l'ID d'abord
    // Pour simplifier, supposons qu'on récupère tous les produits et on filtre (ou on a l'ID)
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true);

    if (error) throw error;
    
    return (data || []).map((product: any) => ({
      ...product,
      pricing: {
        originalPrice: product.price_eur,
        finalPrice: product.sale_price_eur || product.price_eur,
        discountApplied: !!product.sale_price_eur,
        currency: 'EUR'
      }
    }));
  }
};

// Service pour les catégories
export const CategoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Erreur récupération catégories:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Trouver une catégorie par nom (pour les routes /category/:name)
  getCategoryByName: async (name: string): Promise<Category | null> => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', name)
      .single();
      
    if (error) return null;
    return data;
  }
};
