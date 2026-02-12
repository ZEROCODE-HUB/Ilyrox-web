import { Property } from '@/types/property';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Car, Ruler, Heart, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  isLoggedIn?: boolean;
  onAuthRequired?: () => void;
}

export function PropertyCard({ property, onViewDetails, isLoggedIn, onAuthRequired }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  // Check auth status from localStorage if not passed as prop
  const checkIsLoggedIn = () => {
    if (isLoggedIn !== undefined) return isLoggedIn;
    return !!localStorage.getItem('currentUser');
  };

  // Check if property is saved on component mount
  useEffect(() => {
    const savedProperties = localStorage.getItem('savedProperties');
    if (savedProperties) {
      const saved = JSON.parse(savedProperties);
      setIsSaved(saved.some((p: Property) => p.id === property.id));
    }
  }, [property.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!checkIsLoggedIn()) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }
    
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    
    // Update localStorage
    const savedProperties = localStorage.getItem('savedProperties');
    let saved = savedProperties ? JSON.parse(savedProperties) : [];
    
    if (newSavedState) {
      saved.push(property);
      toast({
        title: "Propiedad guardada",
        description: "Se agregó a tus favoritos"
      });
    } else {
      saved = saved.filter((p: Property) => p.id !== property.id);
      toast({
        title: "Propiedad eliminada",
        description: "Se eliminó de tus favoritos"
      });
    }
    
    localStorage.setItem('savedProperties', JSON.stringify(saved));
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create property URL
    const propertyUrl = `${window.location.origin}/property/${property.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(propertyUrl).then(() => {
      toast({
        title: "Enlace copiado",
        description: "El enlace de la propiedad se ha copiado al portapapeles"
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive"
      });
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 border-border bg-card flex flex-col h-full">
      <div className="relative">
        {imageError ? (
          <div className="h-48 bg-muted flex items-center justify-center rounded-t-lg">
            <div className="text-muted-foreground text-sm">Imagen no disponible</div>
          </div>
        ) : (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        )}
        
        {property.featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            Destacada
          </Badge>
        )}
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 hover:bg-white h-8 w-8 p-0"
            onClick={handleShareClick}
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 hover:bg-white h-8 w-8 p-0"
            onClick={handleSaveClick}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>

        {property.distance && (
          <Badge variant="secondary" className="absolute bottom-2 right-2">
            {property.distance.toFixed(1)} km
          </Badge>
        )}
      </div>

      <CardContent className="px-4 pt-4 pb-0 flex flex-col h-full">
        <div className="flex flex-col flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">
              {property.title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{property.location.address}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
            </div>
            <Badge variant="outline">
              {property.type}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              <span>{property.area} m²</span>
            </div>
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.parking > 0 && (
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span>{property.parking}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{property.amenities.length - 3} más
              </Badge>
            )}
          </div>

          {/* Advisor Card */}
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-3">
              <img 
                src={property.advisor.photo} 
                alt={property.advisor.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-background shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground leading-tight">
                  {property.advisor.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {property.advisor.title}
                </span>
              </div>
            </div>
            <button
              className="h-9 w-9 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${property.advisor.email}`;
              }}
            >
              {/* Chat bubble icon with ellipsis */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.2303 20 8.57296 19.5185 7.14286 18.6857L3 20L4.3 16.5C3.47617 15.0356 3 13.3251 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" fill="#17C3B2"/>
                <circle cx="8" cy="11.5" r="1.2" fill="white"/>
                <circle cx="12" cy="11.5" r="1.2" fill="white"/>
                <circle cx="16" cy="11.5" r="1.2" fill="white"/>
              </svg>
            </button>
          </div>

          <div className="mt-auto pt-4 pb-[15px]">
            <Button 
              onClick={() => onViewDetails(property)}
              className="w-full"
            >
              Ver más detalles
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
