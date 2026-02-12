import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyDetail } from '@/components/PropertyDetail';

const SavedProperties = () => {
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from localStorage or a backend
    const saved = localStorage.getItem('savedProperties');
    if (saved) {
      setSavedProperties(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="h-16 bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 h-full flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-primary">Propiedades Guardadas</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {savedProperties.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {savedProperties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onViewDetails={setSelectedProperty}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes propiedades guardadas</h3>
              <p className="text-muted-foreground mb-4">
                Guarda propiedades haciendo clic en el icono de marcador en las tarjetas de propiedades.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Explorar propiedades
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      <PropertyDetail 
        property={selectedProperty} 
        isOpen={!!selectedProperty} 
        onClose={() => setSelectedProperty(null)} 
      />
    </div>
  );
};

export default SavedProperties;