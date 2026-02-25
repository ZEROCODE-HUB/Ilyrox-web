import { useState, useEffect, useMemo, useRef } from "react";
import logo360 from "@/assets/logo-360.png";
import { PropertyView } from "@/types/types";
import { UserLocation } from "@/types/property";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyDetail } from "@/components/PropertyDetails/PropertyDetail";
import { SimplifiedFilters as FiltersComponent } from "@/components/SimplifiedFilters";
import { SearchAndSort } from "@/components/Header/SearchAndSort";
import MapViewContainer from "@/components/Map/MapViewContainer";
import { MapControls } from "@/components/MapControls";
import { ZoneSearch } from "@/components/Header/ZoneSearch";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ImperativePanelHandle,
} from "@/components/ui/resizable";
import { getCurrentLocation } from "@/utils/geolocation";
import {
  MapPin,
  Home,
  Filter,
  ChevronLeft,
  ChevronRight,
  Bell,
  Heart,
} from "lucide-react";
import { UserProfile } from "@/components/Header/UserProfile";
import { useAuth } from "@/contexts/AuthContext";

import { MainTabs } from "@/components/MainTabs";
import { AuthPopup } from "@/components/AuthPopup";
import { RentSellPopup } from "@/components/RentSellPopup";
import { useNavigate, Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
// Import Location Data
import {
  CIUDADES_POR_ESTADO,
  MUNICIPIOS_POR_CIUDAD,
  COLONIAS_POR_MUNICIPIO,
  COORDENADAS_ESTADO,
} from "@/constants/locations";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// ── Zustand + React Query ─────────────────────
import { useFilterStore, useEstadoMexico } from "@/stores/useFilterStore";
import { useProperties } from "@/hooks/useProperties";
import { sileo } from "sileo";

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

  // ── Helpers ─────────────────────────────────

  function getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  // ── Handlers ────────────────────────────────

  const handleLocationSearch = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setCenterLocation([location.lat, location.lng]);
      setRadiusKm(5);
      sileo.success({
        title: "Ubicación detectada",
        description: "Mostrando propiedades cercanas a tu ubicación.",
        position: "top-right",
      });
    } catch {
      sileo.error({
        title: "Error de ubicación",
        description:
          "No se pudo obtener tu ubicación. Verifica los permisos del navegador.",
        position: "top-right",
      });
    }
  };

  const handleSearchFocus = async () => {
    if (userLocation && filteredProperties.length > 0) {
      let minDistance = Infinity;
      filteredProperties.forEach((p) => {
        const d = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          p.latitud || 0,
          p.longitud || 0,
        );
        if (d < minDistance) minDistance = d;
      });

      if (minDistance !== Infinity) {
        sileo.info({
          title: "Distancia",
          description: `La propiedad más cercana está a ${minDistance.toFixed(
            2,
          )} km de tu ubicación.`,
          position: "top-right",
        });
      }
    }
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  const hasActiveFilters = Boolean(estadoMexico || radiusKm > 0);

  // ── Render ──────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header Principal */}
      <div className="bg-navbar sticky top-0 z-20 shadow-md">
        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="px-[25px] py-3">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 w-[200px]"></div>

              <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl">
                <Link
                  to="/"
                  className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity"
                >
                  <img src={logo360} alt="360" className="h-[74px] w-auto" />
                </Link>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <SearchAndSort
                    onLocationSearch={handleLocationSearch}
                    onFocus={() => {}} // Notificación de propiedades cercanas handleSearchFocus
                  />
                  <div className="w-full">
                    <ZoneSearch />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() =>
                      !!user
                        ? navigate("/notifications")
                        : setShowAuthPopup(true)
                    }
                    className="p-2 hover:bg-white/15 hover:scale-110 transition-all duration-200 rounded-full"
                  >
                    <Bell className="h-9 w-9 text-white" strokeWidth={1.5} />
                  </button>

                  <button
                    onClick={() =>
                      !!user ? navigate("/saved") : setShowAuthPopup(true)
                    }
                    className="p-2 hover:bg-white/15 hover:scale-110 transition-all duration-200 rounded-full"
                  >
                    <Heart className="h-9 w-9 text-white" strokeWidth={1.5} />
                  </button>

                  {user ? (
                    <>
                      {isAuthLoading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                      ) : (
                        <UserProfile />
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => navigate("/auth")}
                      className="bg-white text-navbar hover:bg-white/90 font-medium px-5 h-11 shadow-md rounded-full"
                    >
                      Iniciar sesión
                    </Button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (user) setShowRentSellPopup(true);
                    else {
                      setShowAuthPopup(true);
                    }
                  }}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white text-base font-medium transition-colors mt-1 group"
                >
                  <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="underline-offset-2 group-hover:underline">
                    Quiero rentar / vender mi inmueble
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="px-3 py-3 flex items-center justify-between gap-2">
            <Link
              to="/"
              className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity"
            >
              <div className="flex items-end">
                <div className="flex flex-col items-center mr-0.5">
                  <img src={logo360} alt="360" className="h-[60px] w-auto" />
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  !!user ? navigate("/notifications") : setShowAuthPopup(true)
                }
                className="h-9 w-9 hover:bg-white/10 transition-colors"
              >
                <Bell className="h-5 w-5 text-white" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  !!user ? navigate("/saved") : setShowAuthPopup(true)
                }
                className="h-9 w-9 hover:bg-white/10 transition-colors"
              >
                <Heart className="h-5 w-5 text-white" />
              </Button>

              {!!user ? (
                <UserProfile />
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-white text-navbar hover:bg-white/90 font-medium px-3 h-9 text-sm shadow-md"
                >
                  Iniciar sesión
                </Button>
              )}
            </div>
          </div>

          <div className="px-3 pb-3 space-y-3">
            <SearchAndSort onLocationSearch={handleLocationSearch} />
            <ZoneSearch />
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>
      </div>

      <MainTabs>
        <div className="h-[calc(100vh-264px)] md:h-[calc(112vh-200px)] overflow-hidden">
          {/* Empty State: No state selected */}
          {/* Vista móvil */}
          <div className="lg:hidden h-full w-full flex flex-col relative">
            {showFilters && (
              <div className="absolute inset-0 z-30 bg-background overflow-y-auto">
                <div className="sticky top-0 z-10 bg-card border-b shadow-sm">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Filtros</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-9"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <FiltersComponent />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              <div
                className="absolute inset-0 z-0 bg-background flex flex-col"
                style={{
                  visibility: !isMapHidden ? "visible" : "hidden",
                }}
              >
                <div className="px-4 py-4 border-b bg-card shadow-sm flex items-center justify-between z-10">
                  <h2 className="text-base font-semibold">
                    Mapa de Propiedades
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMapHidden(true)}
                    className="flex items-center gap-1.5 h-9 shadow-sm bg-white"
                  >
                    <Home className="h-4 w-4" />
                    <span className="font-medium">Lista</span>
                  </Button>
                </div>

                <div className="flex-1 relative">
                  <ErrorBoundary>
                    <MapViewContainer
                      properties={filteredProperties}
                      selectedProperty={selectedProperty}
                      onPropertySelect={setSelectedProperty}
                      radiusKm={radiusKm}
                      centerLocation={{
                        lat: centerLocation[0],
                        lng: centerLocation[1],
                      }}
                      hasFilters={hasActiveFilters}
                    />
                  </ErrorBoundary>
                </div>
              </div>

              <div
                className={`absolute inset-0 z-10 bg-background flex flex-col transition-transform duration-300 ease-in-out ${
                  isMapHidden ? "translate-x-0" : "translate-x-full"
                }`}
              >
                <div className="px-5 py-4 border-b bg-card sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold truncate">
                        {userLocation
                          ? "Propiedades cerca de ti"
                          : "Propiedades disponibles"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {filteredProperties.length} resultado
                        {filteredProperties.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMapHidden(false)}
                      className="flex items-center gap-1.5 h-9 shadow-sm"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Mapa</span>
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {isLoading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => <SkeletonCard key={i} />)
                  ) : filteredProperties.length > 0 ? (
                    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      {filteredProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          onViewDetails={setSelectedProperty}
                          isLoggedIn={!!user}
                          onAuthRequired={() => setShowAuthPopup(true)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 px-5">
                      <div className="max-w-md mx-auto">
                        <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {hasStateSelected
                            ? "No se encontraron propiedades"
                            : "Comienza tu búsqueda"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {hasStateSelected
                            ? "Intenta ajustar tus filtros de búsqueda o eliminar algunos criterios."
                            : "Selecciona un estado o utiliza tu ubicación para encontrar propiedades."}
                        </p>
                        <Button
                          onClick={handleClearFilters}
                          variant="outline"
                          size="sm"
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vista desktop */}
          <ResizablePanelGroup
            direction="horizontal"
            className="hidden lg:flex w-full"
          >
            {/* Panel de Filtros */}
            <ResizablePanel
              key="filters-panel"
              ref={filtersPanelRef}
              defaultSize={22}
              collapsible={true}
              collapsedSize={4}
              minSize={20}
              maxSize={32}
              onCollapse={() => setIsFiltersCollapsed(true)}
              onExpand={() => setIsFiltersCollapsed(false)}
            >
              <div className="h-full border-r bg-card shadow-sm transition-all duration-300">
                {!isFiltersCollapsed ? (
                  <div className="h-full overflow-y-auto">
                    <div className="flex items-center justify-end px-3 py-2 border-b bg-card/50 sticky top-0 z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => filtersPanelRef.current?.collapse()}
                        className="h-7 w-7 p-0 hover:bg-muted"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <FiltersComponent
                      onCancel={() => filtersPanelRef.current?.collapse()}
                    />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center pt-6 bg-card">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => filtersPanelRef.current?.expand()}
                      className="h-8 w-8 p-0 mb-6 hover:bg-primary/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="writing-mode-vertical text-xs font-medium text-muted-foreground tracking-wider h-full flex justify-center pb-20">
                      FILTROS
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>

            {!isFiltersCollapsed && (
              <ResizableHandle key="filters-handle" withHandle />
            )}

            {/* Panel de Mapa */}
            {!isMapHidden && (
              <ResizablePanel
                key="map-panel"
                defaultSize={isFiltersCollapsed ? 47.5 : 38}
                minSize={28}
                maxSize={55}
              >
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <MapViewContainer
                      properties={filteredProperties}
                      selectedProperty={selectedProperty}
                      onPropertySelect={setSelectedProperty}
                      radiusKm={radiusKm}
                      centerLocation={{
                        lat: centerLocation[0],
                        lng: centerLocation[1],
                      }}
                      hasFilters={hasActiveFilters}
                    />
                    <div className=" top-4 right-4 z-10">
                      <MapControls
                        radiusKm={radiusKm}
                        onRadiusChange={setRadiusKm}
                        userLocation={userLocation}
                      />
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            )}

            {!isMapHidden && <ResizableHandle key="map-handle" withHandle />}

            {/* Panel de Propiedades */}
            <ResizablePanel
              key="properties-panel"
              defaultSize={
                isMapHidden
                  ? isFiltersCollapsed
                    ? 96
                    : 78
                  : isFiltersCollapsed
                    ? 48.5
                    : 40
              }
              minSize={32}
            >
              <div className="h-full overflow-y-auto bg-background">
                <div className="px-4 md:px-6 py-4 border-b bg-card sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base md:text-xl font-bold truncate">
                        {userLocation
                          ? "Propiedades cerca de ti"
                          : "Propiedades disponibles"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {filteredProperties.length} resultado
                        {filteredProperties.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {isMapHidden ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMapHidden(false)}
                          className="flex items-center gap-1.5 h-9"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Mostrar mapa</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMapHidden(true)}
                          className="flex items-center gap-1.5 h-9"
                        >
                          <Home className="h-4 w-4" />
                          Solo lista
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                  {isLoading ? (
                    <div
                      className={`grid gap-4 md:gap-5 ${isMapHidden ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}
                    >
                      {Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <SkeletonCard key={i} />
                        ))}
                    </div>
                  ) : filteredProperties.length > 0 ? (
                    <div
                      className={`grid gap-4 md:gap-5 ${isMapHidden ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}
                    >
                      {filteredProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          onViewDetails={setSelectedProperty}
                          isLoggedIn={!!user}
                          onAuthRequired={() => setShowAuthPopup(true)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="max-w-md mx-auto">
                        <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          {hasStateSelected
                            ? "No se encontraron propiedades"
                            : "Comienza tu búsqueda"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {hasStateSelected
                            ? "Intenta ajustar tus filtros de búsqueda o eliminar algunos criterios."
                            : "Selecciona un estado o utiliza tu ubicación para encontrar propiedades."}
                        </p>
                        <Button onClick={handleClearFilters} variant="outline">
                          Limpiar filtros
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
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
