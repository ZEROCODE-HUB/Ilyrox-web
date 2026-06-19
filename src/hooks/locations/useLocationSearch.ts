// hooks/locations/useLocationSearch.ts
//
// Búsqueda de ubicaciones con Google Places (paridad con la app móvil).
// Antes consultaba RPCs de un Supabase "geo"; ahora usa el autocomplete de
// Google. Mantiene la misma interfaz pública para no romper el consumidor.
import { useState, useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  searchPlaces,
  newSessionToken,
  type PlaceSuggestion,
  type LocationType,
} from "@/lib/geocoding";

export type { LocationType };
// Se mantiene el nombre del tipo para compatibilidad con los consumidores.
export type LocationSuggestion = PlaceSuggestion;

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  // Google Places no pagina como la RPC anterior; siempre false.
  const hasMore = false;
  const reqIdRef = useRef(0);
  const sessionRef = useRef<
    google.maps.places.AutocompleteSessionToken | undefined
  >(undefined);

  const getSession = () => {
    if (!sessionRef.current) sessionRef.current = newSessionToken();
    return sessionRef.current;
  };

  const fetchSuggestions = async (term: string) => {
    if (!term || term.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const reqId = ++reqIdRef.current;
    setLoading(true);
    try {
      const results = await searchPlaces(term, getSession());
      // Descartar respuestas obsoletas (carrera entre teclas)
      if (reqId === reqIdRef.current) setSuggestions(results);
    } catch (err) {
      console.error("Location search error:", err);
      if (reqId === reqIdRef.current) setSuggestions([]);
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  };

  const search = useDebouncedCallback((term: string) => {
    fetchSuggestions(term);
  }, 300);

  // Sin paginación con Places.
  const loadMore = useCallback(() => {}, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    // Nueva sesión de autocomplete tras limpiar (mejor facturación de Places).
    sessionRef.current = newSessionToken();
  }, []);

  /** Expone el session token actual para resolver el detalle del lugar. */
  const getSessionToken = useCallback(() => sessionRef.current, []);

  return { suggestions, loading, hasMore, search, loadMore, clear, getSessionToken };
}
