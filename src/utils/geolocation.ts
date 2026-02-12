import { UserLocation, Property } from '@/types/property';

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del primer punto
 * @param lng1 Longitud del primer punto
 * @param lat2 Latitud del segundo punto
 * @param lng2 Longitud del segundo punto
 * @returns Distancia en kilómetros
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
}

/**
 * Convierte grados a radianes
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Agrega la distancia del usuario a cada propiedad
 * @param properties Lista de propiedades
 * @param userLocation Ubicación del usuario
 * @returns Propiedades con distancia calculada
 */
export function addDistanceToProperties(properties: Property[], userLocation: UserLocation): Property[] {
  return properties.map(property => ({
    ...property,
    distance: calculateDistance(
      userLocation.lat,
      userLocation.lng,
      property.location.lat,
      property.location.lng
    )
  }));
}

/**
 * Ordena las propiedades por distancia (más cercanas primero)
 * @param properties Lista de propiedades con distancia
 * @returns Propiedades ordenadas por distancia
 */
export function sortPropertiesByDistance(properties: Property[]): Property[] {
  return [...properties].sort((a, b) => {
    if (!a.distance && !b.distance) return 0;
    if (!a.distance) return 1;
    if (!b.distance) return -1;
    return a.distance - b.distance;
  });
}

/**
 * Obtiene la ubicación actual del usuario
 * @returns Promise con la ubicación del usuario
 */
export function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
}