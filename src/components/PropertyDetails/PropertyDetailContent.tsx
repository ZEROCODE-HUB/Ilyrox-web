import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyView } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Calendar,
  Heart,
  Share2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Home,
  MoveDiagonal,
  Building2,
} from "lucide-react";
import { PropertyComments } from "@/components/PropertyComments";
import { Avatar } from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { useAuth } from "@/contexts/AuthContext";
import { MapModal } from "./MapModal";
import { InfoModal } from "./InfoModal";
import { useToast } from "@/hooks/use-toast";
import { useResenas } from "@/hooks/useResenas";

interface PropertyDetailContentProps {
  property: PropertyView;
  onAuthRequired?: () => void;
}

export function PropertyDetailContent({
  property,
  onAuthRequired,
}: PropertyDetailContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState([5]);
  const [displayProperty, setDisplayProperty] =
    useState<PropertyView>(property);

  useEffect(() => {
    if (property) {
      setDisplayProperty(property);
      setCurrentImageIndex(0);
    }
  }, [property]);

  const { reviewsData } = useResenas(displayProperty?.asesor_id);
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    isSaved,
    toggleSave,
    isLoading: isSavedLoading,
  } = useSavedProperties();

  const isPropertySaved = displayProperty
    ? isSavedLoading
      ? displayProperty.isLiked || false
      : isSaved(displayProperty.id)
    : false;

  const handleSaveToggle = () => {
    if (!displayProperty) return;

    if (!user) {
      toast({
        variant: "destructive",
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar propiedades",
      });
      return;
    }

    toggleSave({ id: displayProperty.id, intendedState: !isPropertySaved });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    if (displayProperty.fotos)
      setCurrentImageIndex((prev) =>
        prev === (displayProperty.fotos?.length || 0) - 1 ? 0 : prev + 1,
      );
  };

  const prevImage = () => {
    if (displayProperty.fotos)
      setCurrentImageIndex((prev) =>
        prev === 0 ? (displayProperty.fotos?.length || 0) - 1 : prev - 1,
      );
  };

  const getFilteredReviewsCount = () => {
    const selectedStars = reviewFilter[0];
    return reviewsData.breakdown[
      selectedStars as keyof typeof reviewsData.breakdown
    ];
  };

  // Construct location string
  const lineCalle = property.calle == null ? "" : property.calle + ", ";
  const lineColonia = property.colonia == null ? "" : property.colonia + ", ";
  const lineMunicipio =
    property.municipio == null ? "" : property.municipio + ", ";
  const lineEstado = property.estado == null ? "" : property.estado + ", ";

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Galería de imágenes */}
        <div className="relative">
          <div className="relative w-full aspect-[4/3] md:aspect-video max-h-[600px] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center group isolate shadow-md">
            {/* Capa 1: Fondo Dinámico con Blur */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={`bg-${currentImageIndex}`}
                src={displayProperty.fotos?.[currentImageIndex] || ""}
                alt="Fondo decorativo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover blur-[80px] scale-125 select-none pointer-events-none opacity-50"
                aria-hidden="true"
              />
            </AnimatePresence>

            {/* Capa 2: Imagen Principal con Escalado Inteligente */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-0 md:p-2">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={`main-${currentImageIndex}`}
                  src={displayProperty.fotos?.[currentImageIndex] || ""}
                  alt={`${displayProperty.tipo} ${displayProperty.subtipo}`}
                  initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="w-full h-full object-cover md:object-contain rounded-lg shadow-2xl select-none relative z-10 pointer-events-none"
                />
              </AnimatePresence>
            </div>

            {/* Gradiente sutil para profundidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 z-0 pointer-events-none" />
          </div>

          {displayProperty.fotos && displayProperty.fotos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm z-10">
                {currentImageIndex + 1} / {displayProperty.fotos?.length || 0}
              </div>
            </>
          )}

          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "bg-white/80 hover:bg-white",
                isPropertySaved && "text-red-500",
              )}
              onClick={handleSaveToggle}
            >
              <Heart
                className={cn("h-4 w-4", isPropertySaved && "fill-current")}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white"
              onClick={() => {
                const propertyUrl = `${window.location.origin}/property/${displayProperty.id}`;
                navigator.clipboard.writeText(propertyUrl).then(() => {
                  toast({
                    title: "Enlace copiado",
                    description:
                      "El enlace de la propiedad se ha copiado al portapapeles",
                  });
                });
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Precio y ubicación */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {displayProperty.operaciones.map((op, index) => (
                    <div
                      key={index}
                      className="bg-[#1a2e2f] rounded-md px-3 py-2 flex items-center gap-2"
                    >
                      <span className="text-gray-400 text-xs font-bold uppercase">
                        {op.tipo}
                      </span>
                      <span className="text-white text-2xl font-bold">
                        {op.moneda} {formatPrice(op.precio || 0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold capitalize border border-border">
                    {displayProperty.tipo}
                  </div>
                  <div className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold capitalize border border-border">
                    {displayProperty.subtipo}
                  </div>
                </div>
              </div>

              <div
                className="flex items-center text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsMapModalOpen(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                <span className="underline underline-offset-2">
                  {lineCalle} {lineColonia} {lineMunicipio} {lineEstado}
                </span>
              </div>
            </div>

            {/* Características principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayProperty.metros_cuadrados_construccion && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                  <Home className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">
                      {displayProperty.metros_cuadrados_construccion}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      m² Construcción
                    </div>
                  </div>
                </div>
              )}
              {displayProperty.metros_cuadrados_terreno && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                  <MoveDiagonal className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">
                      {displayProperty.metros_cuadrados_terreno}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      m² Terreno
                    </div>
                  </div>
                </div>
              )}

              {(displayProperty.habitaciones || 0) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">
                      {displayProperty.habitaciones}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Habitaciones
                    </div>
                  </div>
                </div>
              )}

              {(displayProperty.banos || 0) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{displayProperty.banos}</div>
                    <div className="text-sm text-muted-foreground">Baños</div>
                  </div>
                </div>
              )}

              {(displayProperty.estacionamientos || 0) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">
                      {displayProperty.estacionamientos}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estacionamientos
                    </div>
                  </div>
                </div>
              )}

              {(displayProperty.pisos || 0) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">
                      {displayProperty.pisos < 2
                        ? displayProperty.pisos + " piso"
                        : displayProperty.pisos + " pisos"}
                    </div>
                    <div className="text-sm text-muted-foreground">Nivel</div>
                  </div>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {displayProperty.descripcion}
              </p>
            </div>

            {/* Características adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Características</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amoblado</span>
                    {displayProperty.amueblado == "Parcial" ? (
                      <span className="text-muted-foreground text-xs text-green-500">
                        Parcial
                      </span>
                    ) : displayProperty.amueblado == "Sí" ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground text-red-500" />
                    )}
                  </div>
                  {displayProperty.tipo_operacion == "renta" && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Pet-friendly
                      </span>
                      {displayProperty.pet_friendly == "Sí" ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground text-red-500" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Antigüedad</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {displayProperty.antiguedad} años
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenidades */}
              <div>
                <h4 className="font-medium mb-3">Amenidades</h4>
                <div className="flex flex-wrap gap-2">
                  {displayProperty.amenidades &&
                    displayProperty.amenidades.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            {/* Comentarios */}
            <Separator className="my-6" />
            <PropertyComments
              propertyId={displayProperty.id}
              feedItemId={displayProperty.feed_item_id}
            />
          </div>

          {/* Información del asesor */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Avatar
                    uri={displayProperty.asesor_foto}
                    name={displayProperty.asesor_nombre}
                    size={80}
                    className="mx-auto mb-3"
                  />
                  <h3 className="font-semibold text-lg">
                    {displayProperty.asesor_nombre}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {displayProperty.asesor_rol
                      ? displayProperty.asesor_rol.charAt(0).toUpperCase() +
                        displayProperty.asesor_rol.slice(1)
                      : "Asesor"}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Reseñas */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.floor(reviewsData.average)
                              ? "fill-yellow-400 text-yellow-400"
                              : star === Math.ceil(reviewsData.average) &&
                                  reviewsData.average % 1 !== 0
                                ? "fill-yellow-400/50 text-yellow-400"
                                : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{reviewsData.average}</span>
                    <span className="text-sm text-muted-foreground">
                      ({reviewsData.total} reseñas)
                    </span>
                  </div>

                  {/* Filtro de reseñas */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>Ver reseñas de:</span>
                      <span className="font-medium">
                        {reviewFilter[0]} estrella
                        {reviewFilter[0] !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <Slider
                      value={reviewFilter}
                      onValueChange={setReviewFilter}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1★</span>
                      <span>2★</span>
                      <span>3★</span>
                      <span>4★</span>
                      <span>5★</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getFilteredReviewsCount()} reseñas con {reviewFilter[0]}{" "}
                      estrella
                      {reviewFilter[0] !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button
                  onClick={() => {
                    if (!user) {
                      toast({
                        variant: "destructive",
                        title: "Inicia sesión",
                        description:
                          "Debes iniciar sesión para solicitar información",
                      });
                      return;
                    }
                    setIsContactFormOpen(true);
                  }}
                  className="w-full"
                  size="lg"
                >
                  Solicitar más información
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Formulario de contacto */}
      <InfoModal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        propertyId={displayProperty?.id || ""}
      />

      {/* Modal del mapa */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        property={displayProperty}
      />
    </>
  );
}
