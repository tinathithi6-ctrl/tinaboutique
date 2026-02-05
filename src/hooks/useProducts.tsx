import { useQuery } from "@tanstack/react-query";
import { ProductService, Product } from '@/services/productService';

export type { Product };

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      return await ProductService.getAllProducts();
    },
  });
};

export const useProductsByCategory = (categoryId: string | null) => {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: async () => {
      if (categoryId) {
        return await ProductService.getProductsByCategory(categoryId);
      }
      return await ProductService.getAllProducts();
    },
    enabled: categoryId !== undefined,
  });
};
