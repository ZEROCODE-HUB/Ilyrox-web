/**
 * Configuración central del cargador de Google Maps JS API.
 *
 * Todas las invocaciones de `useJsApiLoader` deben compartir EXACTAMENTE el
 * mismo `id` y `libraries` (referencia estable), de lo contrario la librería
 * `@react-google-maps/api` recarga el script y emite warnings. Por eso la lista
 * de libraries vive a nivel de módulo (no recrear en cada render).
 *
 * Incluye la librería `places` para el autocomplete de ubicaciones (paridad con
 * la app móvil, que usa Google Places en vez de tablas de Supabase).
 */
import { useJsApiLoader, type Libraries } from "@react-google-maps/api";

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export const GOOGLE_MAPS_LOADER_ID = "google-map-script";

export const GOOGLE_MAPS_LIBRARIES: Libraries = ["places"];

/** Hook compartido para cargar Google Maps + Places una sola vez en la app. */
export function useGoogleMapsApi() {
  return useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
}
