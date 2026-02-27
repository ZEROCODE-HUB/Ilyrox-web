import { PropertyView } from "@/types/types";
import { UserLocation } from "@/types/property";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapPin, Home, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ImperativePanelHandle,
} from "@/components/ui/resizable";
import { SimplifiedFilters as FiltersComponent } from "@/components/SimplifiedFilters";
import MapViewContainer from "@/components/Map/MapViewContainer";
import { MapControls } from "@/components/MapControls";
import { PropertyCard } from "@/components/PropertyCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

interface DesktopResizableLayoutProps {
  filtersPanelRef: React.RefObject<ImperativePanelHandle>;
  isFiltersCollapsed: boolean;
  setIsFiltersCollapsed: (collapsed: boolean) => void;
  mapPanelRef: React.RefObject<ImperativePanelHandle>;
  isMapHidden: boolean;
  setIsMapHidden: (hidden: boolean) => void;
  filteredProperties: PropertyView[];
  selectedProperty: PropertyView | null;
  setSelectedProperty: (prop: PropertyView | null) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  centerLocation: [number, number];
  hasActiveFilters: boolean;
  handleToggleMap: () => void;
  userLocation: UserLocation | null;
  propertiesPanelRef: React.RefObject<ImperativePanelHandle>;
  isLoading: boolean;
  user: any;
  setShowAuthPopup: (show: boolean) => void;
  hasStateSelected: boolean;
  handleClearFilters: () => void;
}

export const DesktopResizableLayout = ({
  filtersPanelRef,
  isFiltersCollapsed,
  setIsFiltersCollapsed,
  mapPanelRef,
  isMapHidden,
  setIsMapHidden,
  filteredProperties,
  selectedProperty,
  setSelectedProperty,
  radiusKm,
  setRadiusKm,
  centerLocation,
  hasActiveFilters,
  handleToggleMap,
  userLocation,
  propertiesPanelRef,
  isLoading,
  user,
  setShowAuthPopup,
  hasStateSelected,
  handleClearFilters,
}: DesktopResizableLayoutProps) => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="hidden lg:flex w-full h-[calc(100vh-140px)]"
      autoSaveId="i360-main-layout"
    >
      {/* Panel de Filtros */}
      <ResizablePanel
        key="filters-panel"
        ref={filtersPanelRef}
        defaultSize={20}
        collapsible={true}
        collapsedSize={3}
        minSize={10}
        maxSize={30}
        onCollapse={() => setIsFiltersCollapsed(true)}
        onExpand={() => setIsFiltersCollapsed(false)}
        className={cn(
          "transition-all duration-300 ease-in-out",
          isFiltersCollapsed && "z-20",
        )}
      >
        <div className="h-full border-r bg-card shadow-sm">
          {!isFiltersCollapsed ? (
            <div className="h-full flex flex-col">
              {/* <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => filtersPanelRef.current?.collapse()}
                  className="h-8 w-8 p-0 hover:bg-background rounded-full transition-transform hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div> */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1 ">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => filtersPanelRef.current?.collapse()}
                  className="h-8 w-8 p-0 ml-2 hover:bg-background rounded-full transition-transform hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <FiltersComponent
                  onCancel={() => filtersPanelRef.current?.collapse()}
                  onClearAll={handleClearFilters}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center pt-6 bg-card border-r">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => filtersPanelRef.current?.expand()}
                className="h-9 w-9 p-0 mb-6 hover:bg-primary/10 rounded-full transition-all hover:rotate-180"
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </Button>
              <div className="writing-mode-vertical text-[10px] font-bold text-muted-foreground/60 tracking-[0.2em] h-full flex justify-center pb-20 uppercase">
                Filtros
              </div>
            </div>
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle
        withHandle
        className="bg-border/50 hover:bg-primary/30 transition-colors w-1.5"
      />

      {/* Panel de Mapa */}
      <ResizablePanel
        key="map-panel"
        ref={mapPanelRef}
        defaultSize={isMapHidden ? 0 : 40}
        minSize={isMapHidden ? 0 : 25}
        maxSize={70}
        collapsible={true}
        collapsedSize={0}
        onCollapse={() => setIsMapHidden(true)}
        onExpand={() => setIsMapHidden(false)}
        className="transition-all duration-300 ease-in-out"
      >
        <div className="h-full flex flex-col relative group">
          <div className="flex-1 overflow-hidden relative">
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
          </div>
        </div>
      </ResizablePanel>

      {!isMapHidden && (
        <ResizableHandle
          withHandle
          className="bg-border/50 hover:bg-primary/30 transition-colors w-1.5"
        />
      )}

      {/* Panel de Propiedades */}
      <ResizablePanel
        key="properties-panel"
        ref={propertiesPanelRef}
        defaultSize={40}
        minSize={30}
        className="transition-all duration-300 ease-in-out"
      >
        <div className="h-full flex flex-col bg-background">
          <div className="px-6 py-4 border-b bg-card/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate text-foreground flex items-center gap-2">
                {userLocation ? (
                  <MapPin className="h-5 w-5 text-primary" />
                ) : (
                  <Home className="h-5 w-5 text-primary" />
                )}
                {userLocation ? "Cerca de ti" : "Disponibles"}
              </h2>
              <p className="text-xs text-muted-foreground/80 font-medium">
                {filteredProperties.length} inmueble
                {filteredProperties.length !== 1 ? "s" : ""} encontrado
                {filteredProperties.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isMapHidden ? "default" : "outline"}
                size="sm"
                onClick={handleToggleMap}
                className="flex items-center gap-2 h-9 rounded-full px-4 shadow-sm"
              >
                {isMapHidden ? (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Ver Mapa</span>
                  </>
                ) : (
                  <>
                    <Home className="h-4 w-4" />
                    <span>Solo Lista</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {isLoading ? (
              <div
                className={`grid gap-6 ${isMapHidden ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 xl:grid-cols-2"}`}
              >
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div
                className={`grid gap-6 ${isMapHidden ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 xl:grid-cols-2"}`}
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
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="bg-muted/50 p-8 rounded-full mb-6">
                  <Home className="h-16 w-16 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {hasStateSelected ? "Sin resultados" : "Comienza tu búsqueda"}
                </h3>
                <p className="text-muted-foreground max-w-sm mb-8">
                  {hasStateSelected
                    ? "Prueba ajustando los filtros o cambiando la zona de búsqueda para encontrar lo que necesitas."
                    : "Selecciona un estado para explorar las mejores propiedades disponibles en la zona."}
                </p>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="rounded-full px-8 h-12 font-semibold hover:bg-primary hover:text-white transition-all"
                >
                  Limpiar todos los filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
