import { useQuery } from "@tanstack/react-query";
import apiFetch from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const data = await apiFetch('/api/categories');
      return Array.isArray(data) ? (data as Category[]) : [];
    },
  });
};
