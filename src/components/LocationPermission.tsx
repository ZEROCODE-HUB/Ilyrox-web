import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { UserLocation } from '@/types/property';

interface LocationPermissionProps {
  onLocationGranted: (location: UserLocation) => void;
  onLocationDenied: () => void;
}

export function LocationPermission({ onLocationGranted, onLocationDenied }: LocationPermissionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAsked, setHasAsked] = useState(false);

  useEffect(() => {
    // Intentar obtener ubicación automáticamente al cargar
    if (!hasAsked) {
      handleLocationRequest();
    }
  }, [hasAsked]);

  const handleLocationRequest = () => {
    setIsLoading(true);
    setError(null);
    setHasAsked(true);

    if (!navigator.geolocation) {
      setError('La geolocalización no es compatible con este navegador.');
      setIsLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minuto
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setIsLoading(false);
        onLocationGranted(location);
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = 'No se pudo obtener tu ubicación.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permisos de ubicación denegados. Puedes habilitarlos en la configuración de tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'La información de ubicación no está disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'La solicitud de ubicación ha caducado.';
            break;
        }
        
        setError(errorMessage);
      },
      options
    );
  };

  const handleSkip = () => {
    onLocationDenied();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Obteniendo tu ubicación</h2>
            <p className="text-muted-foreground">
              Esto nos ayudará a mostrarte propiedades cercanas...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Encuentra propiedades cerca de ti</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Permítenos acceder a tu ubicación para mostrarte las mejores propiedades cercanas,
            ordenadas por distancia.
          </p>

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleLocationRequest} 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Usar mi ubicación
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSkip} 
              className="w-full"
              disabled={isLoading}
            >
              Continuar sin ubicación
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center mt-4">
            <p>Tu privacidad es importante. Solo usamos tu ubicación para mejorar tu experiencia de búsqueda.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}