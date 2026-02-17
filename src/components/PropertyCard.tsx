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
  MessageCircle,
  Home,
  MoveDiagonal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { savePropertyService } from "@/services/savePropertyService";

import { Avatar } from "@/components/shared/Avatar";

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
  const [isSaved, setIsSaved] = useState(property.isLiked || false);
  const [likesCount, setLikesCount] = useState(property.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(
    property.comentarios_count || 0,
  );
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSaved(property.isLiked || false);
    setLikesCount(property.likes_count || 0);
    setCommentsCount(property.comentarios_count || 0);
  }, [property.likes_count, property.comentarios_count, property.isLiked]);

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

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!checkIsLoggedIn()) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    // Optimistic UI update
    const previousState = isSaved;
    const newState = !isSaved;
    setIsSaved(newState);
    setLikesCount((prev) => (newState ? prev + 1 : Math.max(0, prev - 1)));

    // Call service to toggle save
    try {
      if (newState) {
        await savePropertyService.saveProperty(property.id);
        toast({
          title: "Propiedad guardada",
          description: "La propiedad se ha guardado en tu lista.",
        });
      } else {
        await savePropertyService.removeProperty(property.id);
        toast({
          title: "Eliminado de guardados",
          description: "La propiedad se ha eliminado de tu lista.",
        });
      }
    } catch (error: any) {
      // Revert on error
      console.error("Error toggling save:", error);
      setIsSaved(previousState);
      setLikesCount((prev) =>
        previousState ? prev + 1 : Math.max(0, prev - 1),
      );
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar guardados.",
        variant: "destructive",
      });
    }
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
          title: "Error",
          description: "No se pudo copiar el enlace",
          variant: "destructive",
        });
      });
  };

  // Construct location string
  const locationLine1 =
    `${property.calle || ""} ${property.numero_exterior || ""}`.trim() ||
    property.colonia;
  const locationLine2 = `${property.municipio || ""}, ${property.estado || ""}`;

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
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg border-border bg-card animate-fade-in flex flex-col h-full min-h-[440px]"
      onClick={() => onViewDetails(property)}
    >
      <div className="relative h-56 flex-shrink-0 overflow-hidden bg-muted">
        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-[1] flex gap-2">
          <Badge
            variant={isVenta && !isRenta ? "default" : "secondary"}
            className="backdrop-blur-md bg-primary/90 text-white shadow-sm font-semibold"
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
        <div className="absolute top-3 right-3 z-[1] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-8 w-8 rounded-full shadow-md backdrop-blur-sm hover:bg-white",
              isSaved && "text-red-500 bg-white",
            )}
            onClick={handleSaveClick}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-md backdrop-blur-sm hover:bg-white"
            onClick={handleShareClick}
          >
            <Share2 className="h-4 w-4" />
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
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleImageError}
          loading="lazy"
        />

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div className="space-y-2">
          <div>
            <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors min-h-[3.5rem] flex items-center">
              <span className="line-clamp-2">
                {property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1)}{" "}
                en {property.municipio}
              </span>
            </h3>
            <div className="flex items-start text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
              <p className="text-xs line-clamp-1 flex-1">
                {locationLine1} {locationLine2}
              </p>
            </div>
          </div>

          {/* Price Tag Overlay */}
          <div className="text-primary flex flex-col gap-0">
            {ventaOp ? (
              <p className="text-xl font-bold">
                {ventaOp.moneda === "MXN" ? "MXN" : "USD"}{" "}
                {formatPrice(ventaOp.precio)}
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
            {property.habitaciones ? (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.habitaciones} Recámaras`}
              >
                <Bed className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  {property.habitaciones || 0}
                </span>
              </div>
            ) : null}
            {property.banos ? (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.banos} Baños`}
              >
                <Bath className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  {property.banos || 0}
                </span>
              </div>
            ) : null}
            {property.estacionamientos ? (
              <div
                className="flex items-center gap-1.5 text-muted-foreground"
                title={`${property.estacionamientos} Estacionamientos`}
              >
                <Car className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  {property.estacionamientos || 0}
                </span>
              </div>
            ) : null}
            {property.metros_cuadrados_construccion ? (
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
            ) : null}
            {property.metros_cuadrados_terreno ? (
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
            ) : null}
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

        {/* Social Proof Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors"
              onClick={handleSaveClick}
            >
              <Heart className={cn("h-3.5 w-3.5")} />
              <span className="font-medium">{likesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="font-medium">{commentsCount}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] uppercase font-bold tracking-wider py-0 px-2 h-5 border-muted-foreground/30 bg-muted/20"
          >
            {property.subtipo || property.tipo}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
