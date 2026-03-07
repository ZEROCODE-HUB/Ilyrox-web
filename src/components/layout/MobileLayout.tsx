import { PropertyView } from "@/types/types";
import { UserLocation } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Home, MapPin } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import MapViewContainer from "@/components/Map/MapViewContainer";
import { PropertyCard } from "@/components/PropertyCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SimplifiedFilters } from "@/components/SimplifiedFilters";
import { MapControls } from "../MapControls";

interface MobileLayoutProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  isMapHidden: boolean;
  setIsMapHidden: (hidden: boolean) => void;
  handleToggleMap: () => void;
  filteredProperties: PropertyView[];
  selectedProperty: PropertyView | null;
  setSelectedProperty: (prop: PropertyView | null) => void;
  isLoading: boolean;
  user: any;
  setShowAuthPopup: (show: boolean) => void;
  handleClearFilters: () => void;
  centerLocation: [number, number];
  radiusKm: number;
  userLocation: UserLocation | null;
  hasActiveFilters: boolean;
  hasStateSelected: boolean;
  setRadiusKm: (radius: number) => void;
}

export const MobileLayout = ({
  showFilters,
  setShowFilters,
  isMapHidden,
  setIsMapHidden,
  handleToggleMap,
  filteredProperties,
  selectedProperty,
  setSelectedProperty,
  isLoading,
  user,
  setShowAuthPopup,
  handleClearFilters,
  centerLocation,
  radiusKm,
  userLocation,
  hasActiveFilters,
  hasStateSelected,
  setRadiusKm,
}: MobileLayoutProps) => {
  return (
    <div className="lg:hidden h-full w-full flex flex-col relative">
      {showFilters && (
        <div className="absolute inset-0 z-30 bg-background overflow-y-auto">
          <div className="sticky top-0 z-10 bg-card border-b shadow-sm">
            {/* <div className="px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filtros</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="h-9"
              >
                Aplicar
              </Button>
            </div> */}
          </div>
          <div className="p-5">
            <SimplifiedFilters
              setShowFilters={() => setShowFilters(false)}
              onClearAll={handleClearFilters}
            />
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
            <h2 className="text-base font-semibold">Mapa de Propiedades</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMap}
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
                handleToggleMap={handleToggleMap}
              />
              <div className=" absolute bottom-0 right-0 z-10 w-full">
                <MapControls
                  radiusKm={radiusKm}
                  onRadiusChange={setRadiusKm}
                  userLocation={userLocation}
                />
              </div>
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
                onClick={handleToggleMap}
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
  );
};
