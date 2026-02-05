import { useQuery } from "@tanstack/react-query";
import { CategoryService, Category } from '@/services/productService';

export type { Category };

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      return await CategoryService.getAllCategories();
    },
  });
};
