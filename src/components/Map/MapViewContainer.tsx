import React, { useCallback, useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from "@react-google-maps/api";
import { PropertyView } from "@/types/types";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default to Mexico City
const defaultCenter = {
  lat: 19.4326,
  lng: -99.1332,
};

interface MapViewContainerProps {
  properties: PropertyView[];
  centerLocation?: { lat: number; lng: number };
  radiusKm?: number;
  hasFilters?: boolean;
  onPropertySelect?: (property: PropertyView) => void;
  selectedProperty?: PropertyView | null;
}

const MapViewContainer: React.FC<MapViewContainerProps> = ({
  properties,
  centerLocation,
  radiusKm = 0,
  hasFilters = false,
  onPropertySelect,
  selectedProperty,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback((_map: google.maps.Map) => {
    setMap(null);
  }, []);

  // Update center
  useEffect(() => {
    if (map && centerLocation) {
      map.panTo(centerLocation);
      // Adjust zoom based on whether we have a specific location or just default
      // If radius is set, zoom to fit radius roughly
      if (radiusKm > 0) {
        // Rough estimation: output zoom level
        const zoom = Math.round(14 - Math.log(radiusKm) / Math.LN2);
        map.setZoom(zoom);
      } else {
        map.setZoom(12);
      }
    }
  }, [map, centerLocation, radiusKm]);

  // Fit bounds if properties change and we have filters, or initial load?
  useEffect(() => {
    if (map && properties.length > 0 && hasFilters && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasPoints = false;

      properties.forEach((prop) => {
        const lat = prop.latitud || 0;
        const lng = prop.longitud || 0;

        if (lat !== 0 || lng !== 0) {
          bounds.extend({ lat, lng });
          hasPoints = true;
        }
      });

      if (hasPoints) {
        map.fitBounds(bounds);

        // Adjust if only one property
        if (properties.length === 1) {
          const listener = google.maps.event.addListener(map, "idle", () => {
            // @ts-ignore
            if (map.getZoom() > 16) map.setZoom(16);
            google.maps.event.removeListener(listener);
          });
        }
      }
    }
  }, [map, properties, hasFilters]);

  if (loadError) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-red-500 p-4">
        Error loading Google Maps. Check API Key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
        Cargando mapa...
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200 relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centerLocation || defaultCenter}
        zoom={4}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {/* Radius Circle */}
        {radiusKm > 0 && centerLocation && (
          <Circle
            center={centerLocation}
            radius={radiusKm * 1000} // meters
            options={{
              strokeColor: "#2563EB",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#2563EB",
              fillOpacity: 0.1,
            }}
          />
        )}

        {/* Markers - Only show if filters are active */}
        {hasFilters &&
          properties.map((property) => {
            const lat = property.latitud || 0;
            const lng = property.longitud || 0;

            if (!lat && !lng) return null;

            return (
              <Marker
                key={property.id}
                position={{ lat, lng }}
                title={
                  property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1)
                }
                onClick={() => {
                  onPropertySelect?.(property);
                }}
                // Highlight selected property
                icon={
                  selectedProperty?.id === property.id
                    ? {
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                      }
                    : undefined
                }
              />
            );
          })}
      </GoogleMap>

      {/* Overlay count */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-md z-10 border border-gray-100 text-gray-800">
        {hasFilters
          ? `${properties.length} propiedades encontradas`
          : "Aplica filtros para ver propiedades"}
      </div>
    </div>
  );
};

export default MapViewContainer;
