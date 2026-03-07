import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/stores/useFilterStore";
import { propertyService } from "@/services/propertyService";
import type { PropertyView } from "@/types/types";

/**
 * Custom hook that fetches properties using React Query.
 *
 * Each filter is read as a **primitive** selector from Zustand so changes
 * are detected without creating new object references every render.
 * The `colonias` array is serialised for the queryKey to avoid
 * reference-instability loops.
 */
export function useProperties(page = 0, pageSize = 10) {
  // Primitive selectors – only re-render when the actual value changes
  const estadoMexico = useFilterStore((s) => s.estadoMexico);
  const radiusKm = useFilterStore((s) => s.radiusKm);
  const coloniasKey = useFilterStore((s) => JSON.stringify(s.colonias));
  const priceMin = useFilterStore((s) => s.priceMin);
  const priceMax = useFilterStore((s) => s.priceMax);
  const currency = useFilterStore((s) => s.currency);
  const operationType = useFilterStore((s) => s.operationType);
  const type = useFilterStore((s) => s.type);
  const subtypeKey = useFilterStore((s) => JSON.stringify(s.subtype));
  const bedrooms = useFilterStore((s) => s.bedrooms);
  const bathrooms = useFilterStore((s) => s.bathrooms);
  const parking = useFilterStore((s) => s.parking);
  const levels = useFilterStore((s) => s.levels);
  const landAreaMin = useFilterStore((s) => s.landAreaMin);
  const constructionAreaMin = useFilterStore((s) => s.constructionAreaMin);
  const searchTerm = useFilterStore((s) => s.searchTerm);

  return useQuery<PropertyView[]>({
    queryKey: [
      "properties",
      estadoMexico,
      radiusKm,
      coloniasKey,
      priceMin,
      priceMax,
      currency,
      operationType,
      type,
      subtypeKey,
      bedrooms,
      bathrooms,
      parking,
      levels,
      landAreaMin,
      constructionAreaMin,
      searchTerm,
      page,
      pageSize,
    ],
    queryFn: async () => {
      // Read latest state directly from the store (not from hook values)
      const s = useFilterStore.getState();
      if (!s.estadoMexico && s.radiusKm === 0 && !s.searchTerm) return [];

      return propertyService.searchProperties(
        {
          searchText: s.searchTerm,
          state: s.estadoMexico || undefined,
          colonias: s.colonias.length > 0 ? s.colonias : undefined,
          type: s.type,
          subtype: s.subtype,
          operationType:
            s.operationType === "todas" ? undefined : s.operationType,
          priceMin: s.priceMin,
          priceMax: s.priceMax,
          currency: s.currency,
          bedrooms: s.bedrooms,
          bathrooms: s.bathrooms,
          parking: s.parking,
          levels: s.levels,
          landAreaMin: s.landAreaMin,
          constructionAreaMin: s.constructionAreaMin,
        },
        page,
        pageSize,
      );
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
