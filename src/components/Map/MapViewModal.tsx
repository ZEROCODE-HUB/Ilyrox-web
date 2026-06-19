import React, { useCallback, useState, useEffect } from "react";
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { useGoogleMapsApi } from "@/lib/googleMaps";
import Skeleton from "react-loading-skeleton";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface MapViewModalProps {
  centerLocation: { lat: number; lng: number };
}

const MapViewModal: React.FC<MapViewModalProps> = ({ centerLocation }) => {
  const { isLoaded, loadError } = useGoogleMapsApi();

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback((_map: google.maps.Map) => {
    setMap(null);
  }, []);

  // Update center and zoom when map or centerLocation changes
  useEffect(() => {
    if (
      map &&
      centerLocation &&
      centerLocation.lat !== 0 &&
      centerLocation.lng !== 0
    ) {
      map.panTo(centerLocation);
      map.setZoom(15);
    }
  }, [map, centerLocation]);

  if (loadError) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-red-500 p-4">
        Error al cargar Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton height={400} />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerLocation}
      zoom={15}
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
      {centerLocation.lat !== 0 && centerLocation.lng !== 0 && (
        <Circle
          center={centerLocation}
          radius={300}
          options={{
            strokeColor: "#2563EB",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#2563EB",
            fillOpacity: 0.1,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default MapViewModal;
