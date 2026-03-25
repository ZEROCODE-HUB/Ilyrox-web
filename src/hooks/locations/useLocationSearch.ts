// hooks/locations/useLocationSearch.ts
import { useState, useCallback, useRef } from "react";
import { supabaseGeo } from "@/lib/supabase-geo";
import { useDebouncedCallback } from "use-debounce";

export type LocationType = "colonia" | "municipio" | "estado";

export interface LocationSuggestion {
  id: number;
  tipo: LocationType;
  nombre: string;
  municipio_nombre?: string;
  estado_nombre?: string;
}

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const termRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = async (term: string, reset = false) => {
    if (!term || term.trim().length < 2) {
      setSuggestions([]);
      setHasMore(false);
      offsetRef.current = 0;
      return;
    }

    if (loading && !reset) return;

    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    const offset = reset ? 0 : offsetRef.current;
    termRef.current = term;

    try {
      const { data, error } = await supabaseGeo.rpc("buscar_ubicaciones", {
        p_nombre_busqueda: term.trim(),
        p_limit: 20,
        p_offset: offset,
      });

      if (error) throw error;

      const totalCount = data?.[0]?.total_count ?? 0;
      const results: LocationSuggestion[] = (data || []).map((item: any) => ({
        id: item.id,
        tipo: item.tipo as LocationType,
        nombre: item.nombre,
        municipio_nombre: item.municipio_nombre ?? undefined,
        estado_nombre: item.estado_nombre ?? undefined,
      }));

      if (reset) {
        setSuggestions(results);
        offsetRef.current = 20;
      } else {
        setSuggestions((prev) => [...prev, ...results]);
        offsetRef.current = offset + 20;
      }

      setHasMore(offsetRef.current < totalCount);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Location search error:", err);
        if (reset) setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const search = useDebouncedCallback((term: string) => {
    fetchSuggestions(term, true);
  }, 300);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchSuggestions(termRef.current, false);
    }
  }, [loading, hasMore]);

  const clear = useCallback(() => {
    setSuggestions([]);
    setHasMore(false);
    offsetRef.current = 0;
    termRef.current = "";
  }, []);

  return { suggestions, loading, hasMore, search, loadMore, clear };
}
