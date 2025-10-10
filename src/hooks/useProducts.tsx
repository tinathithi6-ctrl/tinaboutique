import { useQuery } from "@tanstack/react-query";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price_eur: number;
  price_usd: number;
  price_cdf: number;
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
