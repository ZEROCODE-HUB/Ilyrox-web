import { useState } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import mapReference from '@/assets/map-reference.jpg';

interface Zone {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface MapViewProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property) => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  onHide?: () => void;
  radiusKm?: number;
  centerLocation?: [number, number];
  selectedZones?: Zone[];
}

export function MapView({ 
  properties, 
  selectedProperty, 
  onPropertySelect,
  onMinimize,
  isMinimized = false,
  onHide,
  radiusKm = 0,
  centerLocation = [50, 50],
  selectedZones = []
}: MapViewProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <Button
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Mostrar mapa
        </Button>
      </div>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      {/* Header del mapa */}
      <div className="p-3 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Mapa de propiedades</span>
          <Badge variant="secondary" className="text-xs">
            {properties.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {onMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onHide ? onHide() : setIsVisible(false)}
            className="h-8 w-8 p-0"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Contenido del mapa */}
      <div className="relative h-[calc(100%-60px)] overflow-hidden cursor-grab active:cursor-grabbing">
        {/* Imagen base del mapa con filtro para estilo Google Maps */}
        <div className="relative w-full h-full">
          <img 
            src={mapReference} 
            alt="Mapa de propiedades" 
            className="w-full h-full object-cover filter brightness-95 contrast-105 saturate-75 select-none"
            draggable={false}
          />
          {/* Overlay sutil para mejorar el aspecto */}
          <div className="absolute inset-0 bg-blue-50/20 mix-blend-soft-light pointer-events-none"></div>
        </div>
        
        {/* Círculo de radio si está definido */}
        {radiusKm > 0 && (
          <div
            className="absolute border-2 border-primary/60 bg-primary/10 rounded-full pointer-events-none"
            style={{
              left: `${centerLocation[0]}%`,
              top: `${centerLocation[1]}%`,
              width: `${radiusKm * 8}px`,
              height: `${radiusKm * 8}px`,
              transform: 'translate(-50%, -50%)',
              minWidth: '20px',
              minHeight: '20px',
              maxWidth: '400px',
              maxHeight: '400px'
            }}
          />
        )}

        {/* Zonas seleccionadas */}
        {selectedZones.map((zone) => (
          <div
            key={zone.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${zone.coordinates[0]}%`,
              top: `${zone.coordinates[1]}%`,
            }}
          >
            <div className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-1 py-0.5 bg-blue-500 text-white text-xs rounded whitespace-nowrap">
              {zone.name}
            </div>
          </div>
        ))}
        
        {/* Controles de zoom */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 bg-white shadow-md hover:bg-gray-50"
            onClick={() => {
              // Funcionalidad de zoom in - aquí se puede implementar la lógica real
              console.log('Zoom in');
            }}
          >
            <span className="text-lg font-bold">+</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 bg-white shadow-md hover:bg-gray-50"
            onClick={() => {
              // Funcionalidad de zoom out - aquí se puede implementar la lógica real
              console.log('Zoom out');
            }}
          >
            <span className="text-lg font-bold">−</span>
          </Button>
        </div>

        {/* Alerta de usuarios viendo */}
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2 text-sm bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {Math.floor(Math.random() * 8) + 1} personas están viendo esta propiedad
          </Badge>
        </div>

        {/* Overlay con puntos de propiedades simulados - Distribución aleatoria */}
        <div className="absolute inset-0">
          {/* Primeras 10 propiedades con datos reales */}
          {properties.slice(0, 10).map((property, index) => {
            // Posiciones más aleatorias para las propiedades reales
            const randomPositions = [
              [25, 30], [45, 22], [65, 35], [35, 55], [70, 45],
              [20, 65], [55, 28], [80, 60], [40, 40], [60, 70]
            ];
            const [left, top] = randomPositions[index] || [50, 50];
            
            return (
              <div
                key={property.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
              >
                {/* Marcador rojo estilo Google Maps */}
                <button
                  onClick={() => onPropertySelect?.(property)}
                  className={`relative transition-all hover:scale-110 ${
                    selectedProperty?.id === property.id 
                      ? 'z-20 scale-125' 
                      : 'z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    {/* Pin del marcador estilo Google Maps mejorado */}
                    <div className="relative">
                      <div className={`w-6 h-6 rounded-full border-2 border-white shadow-md transition-all ${
                        selectedProperty?.id === property.id
                          ? 'bg-orange-500 scale-110'
                          : 'bg-red-500 hover:scale-105'
                      }`}>
                        <div className="w-2 h-2 bg-white rounded-full m-auto mt-1"></div>
                      </div>
                      {/* Sombra suave del pin */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black/15 rounded-full blur-[1px]"></div>
                    </div>
                    
                    {/* Precio al hover o selección */}
                    {selectedProperty?.id === property.id && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-white rounded shadow-lg border text-xs font-medium whitespace-nowrap">
                        ${property.price.toLocaleString()}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white"></div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}

          {/* Marcadores adicionales distribuidos aleatoriamente - Todos clickeables */}
          {Array.from({ length: 20 }, (_, i) => {
            // Posiciones completamente aleatorias pero predefinidas para consistencia
            const randomPositions = [
              [15, 25], [88, 30], [32, 18], [76, 55], [18, 72],
              [92, 65], [28, 82], [58, 15], [85, 40], [12, 45],
              [72, 25], [38, 68], [82, 75], [45, 85], [65, 12],
              [22, 38], [95, 20], [48, 75], [75, 82], [35, 92]
            ];
            const [left, top] = randomPositions[i] || [50, 50];
            
            return (
              <div
                key={`extra-${i}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
              >
                <button
                  onClick={() => {
                    // Simular click en propiedad aleatoria para marcadores adicionales
                    const randomProperty = properties[Math.floor(Math.random() * properties.length)];
                    onPropertySelect?.(randomProperty);
                  }}
                  className="relative transition-all hover:scale-110 z-10"
                >
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full border border-white shadow-md bg-red-400 hover:scale-105 transition-all cursor-pointer">
                      <div className="w-1 h-1 bg-white rounded-full m-auto mt-1.5"></div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-1.5 bg-black/10 rounded-full blur-[0.5px]"></div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Información de la propiedad seleccionada */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="p-3">
              <div className="flex items-start gap-3">
                <img 
                  src={selectedProperty.images[0]} 
                  alt={selectedProperty.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {selectedProperty.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedProperty.location.address}, {selectedProperty.location.city}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    ${selectedProperty.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}