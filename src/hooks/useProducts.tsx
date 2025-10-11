import { useQuery } from "@tanstack/react-query";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price_eur: number;
  price_usd: number;
  price_cdf: number;
  // Champs de promotion intégrés
  sale_price_eur: number | null;
  sale_price_usd: number | null;
  sale_price_cdf: number | null;
  sale_start_date: string | null;
  sale_end_date: string | null;
  // Champs de réduction par quantité
  bulk_discount_threshold: number | null;
  bulk_discount_percentage: number | null;
  stock_quantity: number;
  images: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<Product[]>;
    },
  });
};

export const useProductsByCategory = (categoryId: string | null) => {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const products: Product[] = await response.json();
      if (categoryId) {
        return products.filter(p => p.category_id === categoryId);
      }
      return products;
    },
    enabled: categoryId !== undefined,
  });
};
