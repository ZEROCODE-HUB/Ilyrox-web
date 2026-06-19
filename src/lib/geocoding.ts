/**
 * Servicio de geocodificación basado en Google Places (librería JS).
 *
 * Espeja la lógica de ubicación de la app móvil (que usa Google Places), pero
 * implementado con la API JavaScript de Google (`AutocompleteService` /
 * `PlacesService`) porque desde el navegador NO se pueden llamar los endpoints
 * REST de Places (bloqueo de CORS).
 *
 * El flujo es el mismo que en móvil:
 *   usuario escribe → searchPlaces (sugerencias) → al elegir, resolvePlace
 *   (detalles + componentes) → estado / municipio / colonia.
 *
 * La búsqueda devuelve por NOMBRES (estado/municipio/colonia), que es como el
 * resto de la app filtra las propiedades.
 */

export type LocationType = "estado" | "municipio" | "colonia";

export interface PlaceSuggestion {
  placeId: string;
  tipo: LocationType;
  nombre: string; // texto principal (ej. "Polanco")
  secondaryText?: string; // contexto (ej. "Miguel Hidalgo, CDMX")
}

export interface ResolvedPlace {
  tipo: LocationType;
  estado: string;
  municipio: string;
  colonia: string;
  lat?: number;
  lng?: number;
}

const COUNTRY = "mx";

/** Deriva el nivel (estado/municipio/colonia) a partir de los `types` de Google. */
export function derivePlaceType(types: string[] = []): LocationType {
  if (types.includes("administrative_area_level_1")) return "estado";
  if (
    types.includes("locality") ||
    types.includes("administrative_area_level_2") ||
    types.includes("administrative_area_level_3")
  )
    return "municipio";
  return "colonia";
}

/** Espera (poll) a que la librería Places esté cargada por el loader de Maps. */
function waitForPlaces(timeoutMs = 10000): Promise<typeof google.maps.places | null> {
  return new Promise((resolve) => {
    if (window.google?.maps?.places) {
      resolve(window.google.maps.places);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(interval);
        resolve(window.google.maps.places);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
}

let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;

async function getAutocompleteService() {
  const places = await waitForPlaces();
  if (!places) return null;
  if (!autocompleteService) autocompleteService = new places.AutocompleteService();
  return autocompleteService;
}

async function getPlacesService() {
  const places = await waitForPlaces();
  if (!places) return null;
  if (!placesService) {
    placesService = new places.PlacesService(document.createElement("div"));
  }
  return placesService;
}

/** Sugerencias de ubicación (estado/municipio/colonia) para un texto. */
export async function searchPlaces(
  query: string,
  sessionToken?: google.maps.places.AutocompleteSessionToken,
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const service = await getAutocompleteService();
  if (!service) return [];

  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input: trimmed,
        componentRestrictions: { country: COUNTRY },
        language: "es",
        // (regions) limita a estados/ciudades/colonias/cp, sin negocios ni direcciones puntuales
        types: ["(regions)"],
        sessionToken,
      },
      (predictions, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          resolve([]);
          return;
        }
        resolve(
          predictions.map((p) => ({
            placeId: p.place_id,
            tipo: derivePlaceType(p.types),
            nombre: p.structured_formatting?.main_text ?? p.description,
            secondaryText: p.structured_formatting?.secondary_text,
          })),
        );
      },
    );
  });
}

function pickComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string,
): string {
  const c = components.find((comp) => comp.types.includes(type));
  return c?.long_name ?? "";
}

/** Resuelve un place_id en estado/municipio/colonia + coordenadas. */
export async function resolvePlace(
  placeId: string,
  tipoHint?: LocationType,
  sessionToken?: google.maps.places.AutocompleteSessionToken,
): Promise<ResolvedPlace | null> {
  const service = await getPlacesService();
  if (!service) return null;

  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ["address_components", "geometry", "types", "name"],
        language: "es",
        sessionToken,
      },
      (place, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !place
        ) {
          resolve(null);
          return;
        }
        const comps = place.address_components ?? [];
        const tipo = tipoHint ?? derivePlaceType(place.types ?? []);
        const estado = pickComponent(comps, "administrative_area_level_1");
        const municipio =
          pickComponent(comps, "locality") ||
          pickComponent(comps, "administrative_area_level_2");
        const colonia =
          pickComponent(comps, "sublocality_level_1") ||
          pickComponent(comps, "sublocality") ||
          pickComponent(comps, "neighborhood");

        // El nombre principal del lugar (cuando el reverse "sobre-especifica")
        const mainName = place.name ?? "";

        resolve({
          tipo,
          estado,
          // Si es municipio y el reverse no lo trae, usar el nombre del lugar
          municipio: tipo === "municipio" ? municipio || mainName : municipio,
          colonia: tipo === "colonia" ? colonia || mainName : colonia,
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
        });
      },
    );
  });
}

/** Token de sesión para agrupar autocomplete + details y reducir costos. */
export function newSessionToken(): google.maps.places.AutocompleteSessionToken | undefined {
  if (window.google?.maps?.places) {
    return new window.google.maps.places.AutocompleteSessionToken();
  }
  return undefined;
}
