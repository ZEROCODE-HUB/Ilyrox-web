import { PropertyView } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Heart,
  Share2,
  Home,
  MoveDiagonal,
  Building2,
  MoveUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { useAuth } from "@/contexts/AuthContext";

import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/hooks/use-toast";
import { upperWord } from "@/utils/upperWord";

interface PropertyCardProps {
  property: PropertyView;
  onViewDetails: (property: PropertyView) => void;
  isLoggedIn?: boolean; // Can remove if we check supabase auth directly but props are fine
  onAuthRequired?: () => void;
}

export function PropertyCard({
  property,
  onViewDetails,
  isLoggedIn,
  onAuthRequired,
}: PropertyCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    isSaved,
    toggleSave,
    isLoading: isSavedLoading,
  } = useSavedProperties();

  // Use property.isLiked as initial state if loading, otherwise use the hook's state
  const isPropertySaved = isSavedLoading
    ? property.isLiked || false
    : isSaved(property.id);

  const IconHeart = isPropertySaved ? (
    <Heart className="h-4 w-4" />
  ) : (
    <Heart className="h-4 w-4" />
  );

  const [likesCount, setLikesCount] = useState(property.likes_count || 0); // Keep purely for potential UI count if needed later
  const [commentsCount, setCommentsCount] = useState(
    property.comentarios_count || 0,
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setLikesCount(property.likes_count || 0);
    setCommentsCount(property.comentarios_count || 0);
  }, [property.likes_count, property.comentarios_count]);

  const checkIsLoggedIn = () => {
    if (isLoggedIn !== undefined) return isLoggedIn;
    return !!localStorage.getItem("currentUser");
  };

  const formatPrice = (price: number, currency: string = "MXN") => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast({
          variant: "destructive",
          title: "Inicia sesión",
          description: "Debes iniciar sesión para guardar propiedades.",
        });
      }
      return;
    }

    // Optimistic UI update handled by the hook
    const wasSaved = isPropertySaved;
    const intendedState = !wasSaved;

    toggleSave({ id: property.id, intendedState });

    // Update local likes count only for visual feedback if needed,
    // relying on the hook is better but we kept this for immediate feedback
    setLikesCount((prev) => (intendedState ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const propertyUrl = `${window.location.origin}/property/${property.id}`;
    navigator.clipboard
      .writeText(propertyUrl)
      .then(() => {
        toast({
          title: "Enlace copiado",
          description:
            "El enlace de la propiedad se ha copiado al portapapeles",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo copiar el enlace",
        });
      });
  };

  // Construct location string
  const lineCalle = property.calle == null ? "" : property.calle + ", ";
  const lineColonia = property.colonia == null ? "" : property.colonia + ", ";
  const lineMunicipio =
    property.municipio == null ? "" : property.municipio + ", ";
  const lineEstado = property.estado == null ? "" : property.estado + ", ";

  const operations = property.operaciones || [];
  const isVenta =
    operations.some((o) => o.tipo === "venta") ||
    property.tipo_operacion?.includes("venta");
  const isRenta =
    operations.some((o) => o.tipo === "renta") ||
    property.tipo_operacion?.includes("renta");

  const badgeText =
    isVenta && isRenta ? "Venta & Renta" : isRenta ? "Renta" : "Venta";

  // Get specific prices
  const ventaOp = operations.find((o) => o.tipo === "venta");
  const rentaOp = operations.find((o) => o.tipo === "renta");

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg border-border bg-card animate-fade-in flex flex-col h-full min-h-[440px]">
      <div className="relative h-56 flex-shrink-0 overflow-hidden bg-muted">
        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-[1] flex gap-2">
          <Badge
            variant={isVenta && !isRenta ? "default" : "secondary"}
            className="cursor-default backdrop-blur-md bg-primary/90 text-white shadow-sm font-semibold hover:bg-primary"
          >
            {badgeText}
          </Badge>
          {/* {property.relevancia_score && property.relevancia_score > 80 && (
            <Badge variant="destructive" className="shadow-sm font-semibold">
              Destacada
            </Badge>
          )} */}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 z-[1] flex gap-2 transition-opacity duration-200">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-md shadow-md backdrop-blur-sm hover:bg-white"
            onClick={handleShareClick}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-8 w-8 rounded-md shadow-md backdrop-blur-sm hover:bg-white",
              isPropertySaved && "text-red-500 bg-white",
            )}
            onClick={handleSaveClick}
          >
            <Heart
              className={cn("h-4 w-4", isPropertySaved && "fill-current")}
            />
          </Button>
        </div>

        {/* Image */}
        <img
          src={
            !imageError && property.fotos && property.fotos.length > 0
              ? property.fotos[0]
              : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
          }
          alt={property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
          onError={handleImageError}
          loading="lazy"
          onClick={() => onViewDetails(property)}
        />

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div className="space-y-2">
          <div>
            <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors min-h-[3.5rem] flex items-center">
              <span className="line-clamp-2">
                {upperWord(property.tipo)} en {property.municipio}
              </span>
            </h3>
            <div className="flex items-start text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
              <p className="text-xs line-clamp-1 flex-1">
                {lineCalle} {lineColonia} {lineMunicipio} {lineEstado}
              </p>
            </div>
          </div>

          {/* Price Tag Overlay */}
          <div className="text-primary flex flex-col gap-0">
            {ventaOp ? (
              <p className="text-xl font-bold">
                {ventaOp.moneda || ""} {formatPrice(ventaOp.precio)}
              </p>
            ) : rentaOp ? (
              <p className="text-xl font-bold">
                {rentaOp.moneda === "MXN" ? "MXN" : "USD"}{" "}
                {formatPrice(rentaOp.precio)}
              </p>
            ) : (
              <p className="text-xl font-bold">Consultar Precio</p>
            )}
          </div>

          {/* Features Grid */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 border-t border-border/50">
            {property.habitaciones && (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.habitaciones} Recámaras`}
              >
                <Bed className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  {property.habitaciones || 0}
                </span>
              </div>
            )}
            {property.banos && (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.banos} Baños`}
              >
                <Bath className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  {property.banos || 0}
                </span>
              </div>
            )}
            {property.estacionamientos && (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.estacionamientos} Estacionamientos`}
              >
                <Car className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  {property.estacionamientos || 0}
                </span>
              </div>
            )}
            {property.metros_cuadrados_construccion && (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.metros_cuadrados_construccion} m²`}
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {property.metros_cuadrados_construccion}
                  <span className="text-[10px] ml-0.5 uppercase opacity-70">
                    m²
                  </span>
                </span>
              </div>
            )}
            {property.metros_cuadrados_terreno && (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.metros_cuadrados_terreno} m²`}
              >
                <MoveDiagonal className="h-5 w-5" />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {property.metros_cuadrados_terreno}
                  <span className="text-[10px] ml-0.5 uppercase opacity-70">
                    m²
                  </span>
                </span>
              </div>
            )}
            {property.pisos && (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.pisos}`}
              >
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {property.pisos < 2
                    ? property.pisos + " piso"
                    : property.pisos + " pisos"}
                </span>
              </div>
            )}
          </div>
          {/* Amenidades */}
          {property.amenidades && property.amenidades.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {property.amenidades.slice(0, 3).map((amenidad) => (
                <span
                  key={amenidad}
                  className="text-xs font-semibold rounded-full px-2 py-0.5 bg-muted text-muted-foreground whitespace-nowrap"
                >
                  {amenidad}
                </span>
              ))}
              {property.amenidades.length > 3 && (
                <span className="text-xs font-bold rounded-full px-2 py-0.5 bg-muted text-muted-foreground whitespace-nowrap">
                  +{property.amenidades.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>

        {/* Perfil del Agente */}
        <div className="flex items-center gap-2 mt-auto border border-border/50 rounded-lg p-3 w-full bg-gray-50">
          <Avatar
            uri={property.asesor_foto}
            name={property.asesor_nombre}
            size={35}
            className="group-hover:ring-1 group-hover:ring-primary transition-all"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none text-foreground/80 line-clamp-1">
              {property.asesor_nombre || "Agente Privado"}
            </span>
            <span className="text-xs text-muted-foreground">
              {(property.asesor_rol || "Asesor Inmobiliario")
                .charAt(0)
                .toUpperCase() +
                (property.asesor_rol || "Asesor Inmobiliario").slice(1)}
            </span>
          </div>
        </div>

        {/* Button details */}

        <div>
          <Button
            variant="outline"
            className="w-full bg-primary text-gray-100 hover:bg-primary/90 hover:text-gray-100"
            onClick={() => onViewDetails(property)}
          >
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
