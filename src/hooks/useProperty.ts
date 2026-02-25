import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/propertyService";
import type { PropertyView } from "@/types/types";

export function useProperty(id?: string) {
  return useQuery<PropertyView | null>({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) return null;
      return propertyService.getPropertyById(id);
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}
