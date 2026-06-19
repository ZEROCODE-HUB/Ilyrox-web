import React, { useCallback, useState, useEffect } from "react";
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { useGoogleMapsApi } from "@/lib/googleMaps";
import { PropertyView } from "@/types/types";
import { EyeOff, MapPin, Map as MapIcon, Globe } from "lucide-react";
import { Button } from "../ui/button";

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
  handleToggleMap: () => void;
}

const MapViewContainer: React.FC<MapViewContainerProps> = ({
  properties,
  centerLocation,
  radiusKm = 0,
  hasFilters = false,
  onPropertySelect,
  selectedProperty,
  handleToggleMap,
}) => {
  const { isLoaded, loadError } = useGoogleMapsApi();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapTypeId, setMapTypeId] = useState<"roadmap" | "satellite">(
    "roadmap",
  );
  // `center`/`zoom` se manejan en estado y se sincronizan con el mapa en `onIdle`
  // para que el fitBounds no sea revertido por las props controladas.
  const [center, setCenter] = useState(centerLocation || defaultCenter);
  const [zoom, setZoom] = useState(5);

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const onIdle = useCallback(() => {
    if (!map) return;
    const c = map.getCenter();
    if (c) setCenter({ lat: c.lat(), lng: c.lng() });
    const z = map.getZoom();
    if (typeof z === "number") setZoom(z);
  }, [map]);

  // Centra/ajusta el mapa según las propiedades cargadas.
  useEffect(() => {
    if (!map || !window.google) return;
    const pts = properties.filter(
      (p) => Number(p.latitud) || Number(p.longitud),
    );
    if (pts.length === 0) {
      if (centerLocation) map.panTo(centerLocation);
      return;
    }
    if (pts.length === 1) {
      map.panTo({
        lat: Number(pts[0].latitud),
        lng: Number(pts[0].longitud),
      });
      map.setZoom(15);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    pts.forEach((p) =>
      bounds.extend({ lat: Number(p.latitud), lng: Number(p.longitud) }),
    );
    map.fitBounds(bounds, 60);
  }, [map, properties, centerLocation]);

  // Precio abreviado para el marcador (igual que el móvil: "MXN 1.2M", "MXN 450k")
  const formatMarkerPrice = (price: number, moneda?: string) => {
    const sym = moneda === "USD" ? "USD" : "MXN";
    if (!price) return `${sym} 0`;
    if (price >= 1_000_000) return `${sym} ${(price / 1_000_000).toFixed(1)}M`;
    if (price >= 1000) return `${sym} ${Math.round(price / 1000)}k`;
    return `${sym} ${price}`;
  };

  // Marcador-etiqueta de precio (SVG), idéntico al del móvil. Teal normal,
  // naranja cuando está seleccionado.
  const buildPriceIcon = (
    property: PropertyView,
    selected: boolean,
  ): google.maps.Icon => {
    const op =
      property.operaciones?.find((o) => o.tipo === "venta") ||
      property.operaciones?.[0];
    const text = formatMarkerPrice(Number(op?.precio) || 0, op?.moneda);
    const color = selected ? "#f39c12" : "#45a0a5";
    const w = Math.max(74, text.length * 8 + 26);
    const rectW = w - 16;
    const cx = w / 2;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='45' viewBox='0 0 ${w} 45'><rect x='8' y='4' width='${rectW}' height='30' rx='15' fill='${color}' stroke='white' stroke-width='2.5'/><text x='${cx}' y='23' font-family='Arial' font-size='13' fill='white' text-anchor='middle' font-weight='bold'>${text}</text><path d='M ${cx - 5} 34 L ${cx} 42 L ${cx + 5} 34 Z' fill='${color}' stroke='white' stroke-width='2'/></svg>`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      anchor: new google.maps.Point(cx, 42),
    };
  };

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
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onIdle={onIdle}
        mapTypeId={mapTypeId}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: "cooperative",
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

        {/* Marcadores de las propiedades cargadas */}
        {properties.map((property) => {
            const lat = Number(property.latitud) || 0;
            const lng = Number(property.longitud) || 0;

            if (!lat && !lng) return null;

            const tipo = property.tipo || "";

            return (
              <Marker
                key={property.id}
                position={{ lat, lng }}
                title={tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : ""}
                onClick={() => {
                  onPropertySelect?.(property);
                }}
                zIndex={selectedProperty?.id === property.id ? 999 : undefined}
                icon={buildPriceIcon(
                  property,
                  selectedProperty?.id === property.id,
                )}
              />
            );
          })}
      </GoogleMap>

      {/* Overlay count */}
      <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-4 py-4 text-sm font-semibold z-10 text-gray-800">
        {properties ? (
          <>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Mapa de Propiedades{" "}
              <span className="rounded-full bg-gray-100 px-2">
                {properties.length}
              </span>
            </div>
          </>
        ) : (
          "Aplica filtros para ver propiedades"
        )}
        <div className="flex absolute top-1 right-1 gap-2">
          <Button
            variant={"outline"}
            size="sm"
            className="bg-white/90 backdrop-blur-sm px-3 text-xs font-semibold z-10 text-gray-800 border-border hover:bg-white shadow-sm flex items-center gap-2"
            onClick={() =>
              setMapTypeId(mapTypeId === "roadmap" ? "satellite" : "roadmap")
            }
          >
            {mapTypeId === "roadmap" ? (
              <>
                <Globe className="w-3.5 h-3.5" /> Satélite
              </>
            ) : (
              <>
                <MapIcon className="w-3.5 h-3.5" /> Mapa
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="icon"
            className="bg-white/90 backdrop-blur-sm text-gray-800 border-border hover:bg-white shadow-sm"
            onClick={handleToggleMap}
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapViewContainer;
