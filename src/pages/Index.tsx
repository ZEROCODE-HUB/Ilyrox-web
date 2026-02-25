import { useState, useEffect, useMemo, useRef } from "react";
import { PropertyView } from "@/types/types";
import { UserLocation } from "@/types/property";
import { ImperativePanelHandle } from "@/components/ui/resizable";
import { useAuth } from "@/contexts/AuthContext";
import { PropertyDetail } from "@/components/PropertyDetails/PropertyDetail";
import { MainTabs } from "@/components/MainTabs";
import { AuthPopup } from "@/components/AuthPopup";
import { RentSellPopup } from "@/components/RentSellPopup";
import { useNavigate } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
// Import Location Data
import { COORDENADAS_ESTADO } from "@/constants/locations";

// ── Zustand + React Query ─────────────────────
import { useFilterStore, useEstadoMexico } from "@/stores/useFilterStore";
import { useProperties } from "@/hooks/useProperties";
import { getDistanceFromLatLonInKm } from "@/utils/distance";
import { DesktopHeader } from "@/components/Header/DesktopHeader";
import { MobileHeader } from "@/components/Header/MobileHeader";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { DesktopResizableLayout } from "@/components/layout/DesktopResizableLayout";

const Index = () => {
  // ── Store state ─────────────────────────────
  const estadoMexico = useEstadoMexico();
  const resetFilters = useFilterStore((s) => s.resetFilters);

  // ── React Query (replaces manual fetching) ──
  const { data: properties = [], isLoading } = useProperties(0, 50);

  const radiusKm = useFilterStore((s) => s.radiusKm);
  const setRadiusKm = useFilterStore((s) => s.setRadiusKm);

  // ── Local UI state ──────────────────────────
  const [selectedProperty, setSelectedProperty] = useState<PropertyView | null>(
    null,
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // Client-side radius filtering
  const [showFilters, setShowFilters] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [isMapHidden, setIsMapHidden] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();

  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showRentSellPopup, setShowRentSellPopup] = useState(false);

  const [centerLocation, setCenterLocation] = useState<[number, number]>([
    19.4326, -99.1332,
  ]);

  const navigate = useNavigate();
  const filtersPanelRef = useRef<ImperativePanelHandle>(null);
  const mapPanelRef = useRef<ImperativePanelHandle>(null);
  const propertiesPanelRef = useRef<ImperativePanelHandle>(null);

  // ── Derived ─────────────────────────────────
  const hasStateSelected = Boolean(estadoMexico);

  // Client-side distance-filtered properties
  const filteredProperties = useMemo(() => {
    if (radiusKm > 0 && userLocation) {
      return properties.filter((p) => {
        const dist = getDistanceFromLatLonInKm(
          centerLocation[0],
          centerLocation[1],
          p.latitud || 0,
          p.longitud || 0,
        );
        return dist <= radiusKm;
      });
    }
    return properties;
  }, [properties, radiusKm, userLocation, centerLocation]);

  // ── Effects ─────────────────────────────────

  // Map center when state changes
  useEffect(() => {
    if (estadoMexico && COORDENADAS_ESTADO[estadoMexico]) {
      const { lat, lng } = COORDENADAS_ESTADO[estadoMexico];
      setCenterLocation([lat, lng]);
    }
  }, [estadoMexico]);

  // ── Handlers ────────────────────────────────

  const handleClearFilters = () => {
    resetFilters();
  };

  const handleToggleMap = () => {
    if (isMapHidden) {
      // Primero hacemos espacio reduciendo el panel de propiedades (solo en desktop)
      propertiesPanelRef.current?.resize(50);

      // Luego expandimos el mapa a su tamaño deseado
      if (mapPanelRef.current) {
        mapPanelRef.current.expand();
        mapPanelRef.current.resize(40);
      }

      setIsMapHidden(false);
    } else {
      // El método collapse() llevará el tamaño a 0 automáticamente (desktop)
      // Si no hay ref (mobile), llamamos directamente a setIsMapHidden(true)
      if (mapPanelRef.current) {
        mapPanelRef.current.collapse();
      } else {
        setIsMapHidden(true);
      }
    }
  };

  const hasActiveFilters = Boolean(estadoMexico || radiusKm > 0);

  // ── Render ──────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header Principal */}
      <div className="bg-navbar sticky top-0 z-20 shadow-md">
        <DesktopHeader
          user={user}
          onLogin={() => setShowAuthPopup(true)}
          setShowRentSellPopup={setShowRentSellPopup}
          isAuthLoading={isAuthLoading}
        />
        {/* Mobile Header */}
        <MobileHeader
          user={user}
          onLogin={() => setShowAuthPopup(true)}
          setUserLocation={setUserLocation}
          setCenterLocation={setCenterLocation}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
      </div>

      <MainTabs>
        <div className="h-[calc(100vh-264px)] md:h-[calc(112vh-200px)] overflow-hidden">
          {/* Vista móvil */}
          <MobileLayout
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            isMapHidden={isMapHidden}
            setIsMapHidden={setIsMapHidden}
            handleToggleMap={handleToggleMap}
            filteredProperties={filteredProperties}
            selectedProperty={selectedProperty}
            setSelectedProperty={setSelectedProperty}
            isLoading={isLoading}
            user={user}
            setShowAuthPopup={setShowAuthPopup}
            handleClearFilters={handleClearFilters}
            centerLocation={centerLocation}
            radiusKm={radiusKm}
            userLocation={userLocation}
            hasActiveFilters={hasActiveFilters}
            hasStateSelected={hasStateSelected}
          />

          {/* Vista desktop */}
          <DesktopResizableLayout
            filtersPanelRef={filtersPanelRef}
            isFiltersCollapsed={isFiltersCollapsed}
            setIsFiltersCollapsed={setIsFiltersCollapsed}
            mapPanelRef={mapPanelRef}
            isMapHidden={isMapHidden}
            setIsMapHidden={setIsMapHidden}
            filteredProperties={filteredProperties}
            selectedProperty={selectedProperty}
            setSelectedProperty={setSelectedProperty}
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
            centerLocation={centerLocation}
            hasActiveFilters={hasActiveFilters}
            handleToggleMap={handleToggleMap}
            userLocation={userLocation}
            propertiesPanelRef={propertiesPanelRef}
            isLoading={isLoading}
            user={user}
            setShowAuthPopup={setShowAuthPopup}
            hasStateSelected={hasStateSelected}
            handleClearFilters={handleClearFilters}
          />
        </div>
      </MainTabs>

      <PropertyDetail
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
      />

      <RentSellPopup
        isOpen={showRentSellPopup}
        onClose={() => setShowRentSellPopup(false)}
      />
    </div>
  );
};
export default Index;
