import { useState, useEffect } from 'react';
import logo360 from '@/assets/logo-360.png';
import { Property, PropertyFilters, UserLocation } from '@/types/property';
import { mockProperties } from '@/data/mockData';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyDetail } from '@/components/PropertyDetail';
import { SimplifiedFilters as FiltersComponent } from '@/components/SimplifiedFilters';
import { SearchAndSort } from '@/components/SearchAndSort';
import { LocationPermission } from '@/components/LocationPermission';
import { MapView } from '@/components/MapView';
import { MapControls } from '@/components/MapControls';
import { ZoneSearch } from '@/components/ZoneSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { filterProperties, sortProperties } from '@/utils/propertyUtils';
import { addDistanceToProperties, getCurrentLocation } from '@/utils/geolocation';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Home, Filter, ChevronLeft, ChevronRight, Bell, Heart } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';
import { MainTabs } from '@/components/MainTabs';
import { AuthPopup } from '@/components/AuthPopup';
import { RentSellPopup } from '@/components/RentSellPopup';
import { useNavigate, Link } from 'react-router-dom';
interface Zone {
  id: string;
  name: string;
  coordinates: [number, number];
}
const mockZones: Zone[] = [{
  id: '1',
  name: 'Centro Histórico',
  coordinates: [45, 40]
}, {
  id: '2',
  name: 'Zona Norte',
  coordinates: [30, 25]
}, {
  id: '3',
  name: 'Zona Sur',
  coordinates: [60, 65]
}, {
  id: '4',
  name: 'Zona Este',
  coordinates: [70, 45]
}, {
  id: '5',
  name: 'Zona Oeste',
  coordinates: [25, 50]
}, {
  id: '6',
  name: 'Barrio Residencial',
  coordinates: [55, 30]
}, {
  id: '7',
  name: 'Distrito Comercial',
  coordinates: [40, 55]
}];
const Index = () => {
  // Estados principales
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [isMapHidden, setIsMapHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showRentSellPopup, setShowRentSellPopup] = useState(false);

  // Estados para controles del mapa
  const [radiusKm, setRadiusKm] = useState(0);
  const [centerLocation, setCenterLocation] = useState<[number, number]>([50, 50]);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Verificar si el usuario está logueado
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('currentUser');
      setIsLoggedIn(!!user);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Inicializar propiedades al cargar
  useEffect(() => {
    setProperties(mockProperties);
    setIsLoading(false);
  }, []);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let result = filterProperties(properties, filters, searchTerm);
    result = sortProperties(result, sortBy, sortOrder);
    setFilteredProperties(result);
  }, [properties, filters, searchTerm, sortBy, sortOrder]);

  // Manejar permisos de ubicación
  const handleLocationGranted = (location: UserLocation) => {
    setUserLocation(location);
    setHasLocationPermission(true);

    // Agregar distancia a las propiedades
    const propertiesWithDistance = addDistanceToProperties(mockProperties, location);
    setProperties(propertiesWithDistance);

    // Cambiar ordenamiento por distancia
    setSortBy('distance');
    setSortOrder('asc');
    toast({
      title: "Ubicación detectada",
      description: "Mostrando propiedades cercanas a tu ubicación."
    });
  };
  const handleLocationDenied = () => {
    setHasLocationPermission(false);
    setProperties(mockProperties);
  };

  // Solicitar ubicación manualmente
  const handleLocationSearch = async () => {
    try {
      const location = await getCurrentLocation();
      handleLocationGranted(location);
    } catch (error) {
      toast({
        title: "Error de ubicación",
        description: "No se pudo obtener tu ubicación. Verifica los permisos del navegador.",
        variant: "destructive"
      });
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortBy('relevance');
    setSortOrder('desc');
  };

  // Comentado para prototipo - sin restricción de ubicación
  // if (hasLocationPermission === null) {
  //   return <LocationPermission onLocationGranted={handleLocationGranted} onLocationDenied={handleLocationDenied} />;
  // }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header Principal - Logo, Búsqueda y Navegación */}
      <div className="bg-navbar sticky top-0 z-20 shadow-md">
        {/* Desktop Header */}
        <div className="hidden md:block">
        <div className="px-[25px] py-3">
            <div className="flex items-center justify-between">
              {/* Spacer izquierdo para balance */}
              <div className="flex-shrink-0 w-[200px]"></div>
              
              {/* Logo + Barra de búsqueda - Centro */}
              <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl">
                <Link to="/" className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity">
                  <img src={logo360} alt="360" className="h-[74px] w-auto" />
                </Link>
                <div className="flex-1">
                  <SearchAndSort searchTerm={searchTerm} onSearchChange={setSearchTerm} sortBy={sortBy} onSortChange={setSortBy} sortOrder={sortOrder} onSortOrderChange={setSortOrder} onLocationSearch={!userLocation ? handleLocationSearch : undefined} resultsCount={filteredProperties.length} />
                </div>
              </div>
              
              {/* Right side - Autenticación condicional */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-5">
                  <button onClick={() => isLoggedIn ? navigate('/notifications') : setShowAuthPopup(true)} className="p-2 hover:bg-white/15 hover:scale-110 transition-all duration-200 rounded-full">
                    <Bell className="h-9 w-9 text-white" strokeWidth={1.5} />
                  </button>
                  
                  <button onClick={() => isLoggedIn ? navigate('/saved') : setShowAuthPopup(true)} className="p-2 hover:bg-white/15 hover:scale-110 transition-all duration-200 rounded-full">
                    <Heart className="h-9 w-9 text-white" strokeWidth={1.5} />
                  </button>
                  
                  {isLoggedIn ? <UserProfile /> : <Button onClick={() => navigate('/auth')} className="bg-white text-navbar hover:bg-white/90 font-medium px-5 h-11 shadow-md rounded-full">
                      Iniciar sesión
                    </Button>}
                </div>
                
                {/* Enlace de rentar/vender */}
                <button onClick={() => setShowRentSellPopup(true)} className="flex items-center gap-1.5 text-white/80 hover:text-white text-base font-medium transition-colors mt-1 group">
                  <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="underline-offset-2 group-hover:underline">Quiero rentar / vender mi inmueble</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Zona de búsqueda por zonas - Desktop (sin borde divisor) */}
          <div className="bg-navbar/95">
            <div className="px-[25px] pt-0.5 pb-4">
              <div className="flex justify-center">
                <ZoneSearch selectedZones={selectedZones} onZonesChange={setSelectedZones} availableZones={mockZones} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="px-3 py-3 flex items-center justify-between gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity">
              <div className="flex items-end">
                <div className="flex flex-col items-center mr-0.5">
                  <MapPin className="h-4 w-4 text-purple-600 -mb-0.5" />
                  <span className="text-2xl font-bold text-purple-600 leading-none">i</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight leading-none">360</span>
              </div>
            </Link>
            
            {/* Right side - Autenticación condicional */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => isLoggedIn ? navigate('/notifications') : setShowAuthPopup(true)} className="h-9 w-9 hover:bg-white/10 transition-colors">
                <Bell className="h-5 w-5 text-white" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => isLoggedIn ? navigate('/saved') : setShowAuthPopup(true)} className="h-9 w-9 hover:bg-white/10 transition-colors">
                <Heart className="h-5 w-5 text-white" />
              </Button>
              
              {isLoggedIn ? <UserProfile /> : <Button onClick={() => navigate('/auth')} className="bg-white text-navbar hover:bg-white/90 font-medium px-3 h-9 text-sm shadow-md">
                  Iniciar sesión
                </Button>}
            </div>
          </div>
          
          {/* Barra de búsqueda y zonas - Mobile */}
          <div className="px-3 pb-3 space-y-3">
            <SearchAndSort searchTerm={searchTerm} onSearchChange={setSearchTerm} sortBy={sortBy} onSortChange={setSortBy} sortOrder={sortOrder} onSortOrderChange={setSortOrder} onLocationSearch={!userLocation ? handleLocationSearch : undefined} resultsCount={filteredProperties.length} />
            <ZoneSearch selectedZones={selectedZones} onZonesChange={setSelectedZones} availableZones={mockZones} />
            {/* Botón de Más Filtros */}
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs de Navegación Principal */}
      <MainTabs>
        <div className="h-[calc(100vh-264px)] md:h-[calc(100vh-200px)] overflow-hidden">
        {/* Vista móvil - mapa y lista exclusivos */}
        <div className="lg:hidden h-full w-full flex flex-col relative">
          {/* Panel de filtros móvil - desplegable */}
          {showFilters && <div className="absolute inset-0 z-30 bg-background overflow-y-auto">
              <div className="sticky top-0 z-10 bg-card border-b shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Filtros</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="h-9">
                    Aplicar
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <FiltersComponent filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />
              </div>
            </div>}

          {/* Contenido principal móvil */}
          <div className="flex-1 overflow-hidden">
            {isMapHidden ?
            // Vista de lista móvil
            <div className="h-full overflow-y-auto bg-background">
                {/* Header de propiedades */}
                <div className="px-5 py-4 border-b bg-card sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold truncate">
                        {userLocation ? 'Propiedades cerca de ti' : 'Propiedades disponibles'}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {filteredProperties.length} resultado{filteredProperties.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={() => setIsMapHidden(false)} className="flex items-center gap-1.5 h-9 shadow-sm">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Mapa</span>
                    </Button>
                  </div>
                </div>

                {/* Lista de propiedades */}
                <div className="p-5 space-y-5">
                  {filteredProperties.length > 0 ? <div className="grid gap-5 grid-cols-1">
                      {filteredProperties.map(property => <PropertyCard key={property.id} property={property} onViewDetails={setSelectedProperty} isLoggedIn={isLoggedIn} onAuthRequired={() => setShowAuthPopup(true)} />)}
                    </div> : <div className="text-center py-20 px-5">
                      <div className="max-w-md mx-auto">
                        <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No se encontraron propiedades</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Intenta ajustar tus filtros de búsqueda o eliminar algunos criterios.
                        </p>
                        <Button onClick={handleClearFilters} variant="outline" size="sm">
                          Limpiar filtros
                        </Button>
                      </div>
                    </div>}
                </div>
              </div> :
            // Vista de mapa móvil
            <div className="h-full flex flex-col">
                {/* Header del mapa */}
                <div className="px-4 py-4 border-b bg-card shadow-sm flex items-center justify-between">
                  <h2 className="text-base font-semibold">Mapa de Propiedades</h2>
                  <Button variant="outline" size="sm" onClick={() => setIsMapHidden(true)} className="flex items-center gap-1.5 h-9 shadow-sm">
                    <Home className="h-4 w-4" />
                    <span className="font-medium">Lista</span>
                  </Button>
                </div>
                
                {/* Mapa - ocupa todo el espacio en móvil */}
                <div className="flex-1">
                  <MapView properties={filteredProperties} selectedProperty={selectedProperty} onPropertySelect={setSelectedProperty} onHide={() => setIsMapHidden(true)} radiusKm={radiusKm} centerLocation={centerLocation} selectedZones={selectedZones} />
                </div>
              </div>}
          </div>
        </div>

        {/* Vista desktop - mapa y lista simultáneos */}
        <ResizablePanelGroup direction="horizontal" className="hidden lg:flex w-full">
          {/* Panel de Filtros - Optimizado */}
          <ResizablePanel defaultSize={isFiltersCollapsed ? 3 : isMapHidden ? 28 : 22} minSize={3} maxSize={isMapHidden ? 40 : 32}>
            <div className="h-full border-r bg-card shadow-sm">
              {!isFiltersCollapsed ? <div className="h-full overflow-y-auto">
                  <div className="flex items-center justify-end px-3 py-2 border-b bg-card/50 sticky top-0 z-10">
                    <Button variant="ghost" size="sm" onClick={() => setIsFiltersCollapsed(true)} className="h-7 w-7 p-0 hover:bg-muted">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <FiltersComponent filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />
                </div> : <div className="h-full flex flex-col items-center pt-6 bg-card">
                  <Button variant="ghost" size="sm" onClick={() => setIsFiltersCollapsed(false)} className="h-8 w-8 p-0 mb-6 hover:bg-primary/10">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="writing-mode-vertical text-xs font-medium text-muted-foreground tracking-wider">
                    FILTROS
                  </div>
                </div>}
            </div>
          </ResizablePanel>
          
          {!isFiltersCollapsed && <ResizableHandle withHandle />}

          {/* Panel de Mapa - Equilibrado */}
          {!isMapHidden && <>
              <ResizablePanel defaultSize={isFiltersCollapsed ? 47.5 : 38} minSize={28} maxSize={55}>
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <MapView properties={filteredProperties} selectedProperty={selectedProperty} onPropertySelect={setSelectedProperty} onHide={() => setIsMapHidden(true)} radiusKm={radiusKm} centerLocation={centerLocation} selectedZones={selectedZones} />
                    <MapControls radiusKm={radiusKm} onRadiusChange={setRadiusKm} />
                  </div>
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
            </>}

          {/* Panel de Propiedades - Balanceado */}
          <ResizablePanel defaultSize={isMapHidden ? isFiltersCollapsed ? 97 : 72 : isFiltersCollapsed ? 48.5 : 39} minSize={32}>
            <div className="h-full overflow-y-auto bg-background">
              {/* Header de propiedades - Mejorado */}
              <div className="px-4 md:px-6 py-4 border-b bg-card sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base md:text-xl font-bold truncate">
                      {userLocation ? 'Propiedades cerca de ti' : 'Propiedades disponibles'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {filteredProperties.length} resultado{filteredProperties.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {/* Botón para alternar vista de mapa - solo desktop */}
                  <div className="flex gap-2">
                    {isMapHidden ? <Button variant="outline" size="sm" onClick={() => setIsMapHidden(false)} className="flex items-center gap-1.5 h-9">
                        <MapPin className="h-4 w-4" />
                        <span>Mostrar mapa</span>
                      </Button> : <Button variant="ghost" size="sm" onClick={() => setIsMapHidden(true)} className="flex items-center gap-1.5 h-9">
                        <Home className="h-4 w-4" />
                        Solo lista
                      </Button>}
                  </div>
                </div>
              </div>

              {/* Lista de propiedades */}
              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                {filteredProperties.length > 0 ? <div className={`grid gap-4 md:gap-5 ${isMapHidden ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
                    {filteredProperties.map(property => <PropertyCard key={property.id} property={property} onViewDetails={setSelectedProperty} isLoggedIn={isLoggedIn} onAuthRequired={() => setShowAuthPopup(true)} />)}
                  </div> : <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No se encontraron propiedades</h3>
                      <p className="text-muted-foreground mb-4">
                        Intenta ajustar tus filtros de búsqueda o eliminar algunos criterios.
                      </p>
                      <Button onClick={handleClearFilters} variant="outline">
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        </div>
      </MainTabs>

      {/* Modal de detalle de propiedad */}
      <PropertyDetail property={selectedProperty} isOpen={!!selectedProperty} onClose={() => setSelectedProperty(null)} />
      
      {/* Popup de autenticación */}
      <AuthPopup isOpen={showAuthPopup} onClose={() => setShowAuthPopup(false)} />
      
      {/* Popup de rentar/vender */}
      <RentSellPopup isOpen={showRentSellPopup} onClose={() => setShowRentSellPopup(false)} />
    </div>;
};
export default Index;