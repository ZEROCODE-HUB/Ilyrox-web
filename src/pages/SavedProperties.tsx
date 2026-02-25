import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PropertyView } from "@/types/types";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyDetail } from "@/components/PropertyDetails/PropertyDetail";
import { savePropertyService } from "@/services/savePropertyService";
import { UserProfile } from "@/components/Header/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { sileo } from "sileo";

const SavedProperties = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: savedProperties = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["savedProperties", user?.id],
    queryFn: () => savePropertyService.getSavedProperties(),
    enabled: !!user,
  });

  useEffect(() => {
    if (isError) {
      sileo.error({
        title: "Error",
        description: "No se pudieron cargar las propiedades guardadas",
        position: "top-right",
      });
    }
  }, [isError]);

  const [selectedProperty, setSelectedProperty] = useState<PropertyView | null>(
    null,
  );

  const handleViewDetails = (property: PropertyView) => {
    setSelectedProperty(property);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="h-16 bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 h-full flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-primary">
              Propiedades Guardadas
            </span>
          </div>
          <div className="ml-auto">{user && <UserProfile />}</div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : savedProperties.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {savedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={handleViewDetails}
                isLoggedIn={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No tienes propiedades guardadas
              </h3>
              <p className="text-muted-foreground mb-4">
                Guarda propiedades haciendo clic en el icono de marcador en las
                tarjetas de propiedades.
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
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
