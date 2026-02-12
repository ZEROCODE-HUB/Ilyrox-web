import { useState } from 'react';
import { Property, ContactForm } from '@/types/property';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Bed, Bath, Car, Ruler, Calendar, Heart, Share2, Check, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import mapReference from '@/assets/map-reference.jpg';
import { PropertyComments } from '@/components/PropertyComments';

interface PropertyDetailProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}
export function PropertyDetail({
  property,
  isOpen,
  onClose
}: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState([5]);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    comments: '',
    propertyId: ''
  });
  const [budgetRange, setBudgetRange] = useState('');
  const [purchaseTimeframe, setPurchaseTimeframe] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactSuccessPopup, setShowContactSuccessPopup] = useState(false);
  const { toast } = useToast();
  if (!property) return null;
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  const nextImage = () => {
    setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1);
  };
  const prevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1);
  };
  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budgetRange || !purchaseTimeframe) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona tu presupuesto y plazo de compra.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud ha sido enviada a ${property.advisor.name}. Te contactarán pronto.`
      });
      setContactForm({
        name: '',
        email: '',
        phone: '',
        comments: '',
        propertyId: ''
      });
      setIsContactFormOpen(false);
      setShowContactSuccessPopup(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const openContactForm = () => {
    setContactForm(prev => ({
      ...prev,
      propertyId: property.id
    }));
    setIsContactFormOpen(true);
  };

  // Mock reviews data
  const reviews = {
    average: 4.5,
    total: 127,
    breakdown: {
      5: 78,
      4: 32,
      3: 12,
      2: 3,
      1: 2
    }
  };

  const getFilteredReviewsCount = () => {
    const selectedStars = reviewFilter[0];
    return reviews.breakdown[selectedStars as keyof typeof reviews.breakdown];
  };
  return <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{property.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Galería de imágenes */}
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img src={property.images[currentImageIndex]} alt={`${property.title} - Imagen ${currentImageIndex + 1}`} className="w-full h-full object-cover" />
              </div>
              
              {property.images.length > 1 && <>
                  <Button variant="ghost" size="sm" className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white" onClick={prevImage}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white" onClick={nextImage}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>}

              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="bg-white/80 hover:bg-white"
                  onClick={() => {
                    const propertyUrl = `${window.location.origin}/property/${property.id}`;
                    navigator.clipboard.writeText(propertyUrl).then(() => {
                      toast({
                        title: "Enlace copiado",
                        description: "El enlace de la propiedad se ha copiado al portapapeles"
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{property.type}</Badge>
                      <Badge variant="secondary">{property.subtype}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => setIsMapModalOpen(true)}>
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="underline underline-offset-2">{property.location.address}, {property.location.city}, {property.location.state}</span>
                  </div>
                </div>

                {/* Características principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                    <Ruler className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.area}</div>
                      <div className="text-sm text-muted-foreground">m²</div>
                    </div>
                  </div>
                  
                  {property.bedrooms > 0 && <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                      <Bed className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.bedrooms}</div>
                        <div className="text-sm text-muted-foreground">Habitaciones</div>
                      </div>
                    </div>}
                  
                  {property.bathrooms > 0 && <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                      <Bath className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.bathrooms}</div>
                        <div className="text-sm text-muted-foreground">Baños</div>
                      </div>
                    </div>}
                  
                  {property.parking > 0 && <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                      <Car className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.parking}</div>
                        <div className="text-sm text-muted-foreground">Estacionamientos</div>
                      </div>
                    </div>}
                </div>

                {/* Descripción */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Descripción</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Características adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Características</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Amoblado</span>
                        {property.furnished ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Pet-friendly</span>
                        {property.petFriendly ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sin gravamen</span>
                        {!property.lien ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Antigüedad</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {property.age} años
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amenidades */}
                  <div>
                    <h4 className="font-medium mb-3">Amenidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map(amenity => <Badge key={amenity} variant="secondary">
                          {amenity}
                        </Badge>)}
                    </div>
                  </div>
                </div>

                {/* Financiamiento */}
                <div>
                  <h4 className="font-medium mb-3">Opciones de Financiamiento</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.financing.map(option => <Badge key={option} variant="outline">
                        {option}
                      </Badge>)}
                  </div>
                </div>

                {/* Comentarios */}
                <Separator className="my-6" />
                <PropertyComments propertyId={property.id} />
              </div>

              {/* Información del asesor */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <img src={property.advisor.photo} alt={property.advisor.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                      <h3 className="font-semibold text-lg">{property.advisor.name}</h3>
                      <p className="text-muted-foreground text-sm">{property.advisor.title}</p>
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
                                star <= Math.floor(reviews.average)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : star === Math.ceil(reviews.average) && reviews.average % 1 !== 0
                                  ? 'fill-yellow-400/50 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{reviews.average}</span>
                        <span className="text-sm text-muted-foreground">({reviews.total} reseñas)</span>
                      </div>

                      {/* Filtro de reseñas */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span>Ver reseñas de:</span>
                          <span className="font-medium">{reviewFilter[0]} estrella{reviewFilter[0] !== 1 ? 's' : ''}</span>
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
                          {getFilteredReviewsCount()} reseñas con {reviewFilter[0]} estrella{reviewFilter[0] !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <Button onClick={openContactForm} className="w-full" size="lg">
                      Solicitar más información
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario de contacto */}
      <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar información</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleContactFormSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="text-center space-y-1 pb-2">
              <p className="text-sm text-muted-foreground">
                Para que un asesor pueda ayudarte mejor, ¿podrías responder estas dos preguntas?
              </p>
              <p className="text-xs text-muted-foreground">
                (te tomará menos de 20 segundos)
              </p>
            </div>

            <div className="space-y-2">
              <Label>¿Cuál es tu presupuesto? <span className="text-destructive">*</span></Label>
              <Select value={budgetRange} onValueChange={setBudgetRange} required>
                <SelectTrigger className={!budgetRange ? "border-input" : ""}>
                  <SelectValue placeholder="Selecciona un rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-definido">No lo tengo definido</SelectItem>
                  <SelectItem value="hasta-500k">Hasta $500,000</SelectItem>
                  <SelectItem value="500k-1m">De $500,000 a $1,000,000</SelectItem>
                  <SelectItem value="1m-3m">De $1,000,000 a $3,000,000</SelectItem>
                  <SelectItem value="3m+">Más de $3,000,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>¿En qué plazo planeas comprar o rentar? <span className="text-destructive">*</span></Label>
              <Select value={purchaseTimeframe} onValueChange={setPurchaseTimeframe} required>
                <SelectTrigger className={!purchaseTimeframe ? "border-input" : ""}>
                  <SelectValue placeholder="Selecciona un plazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inmediato">Inmediato (0–3 meses)</SelectItem>
                  <SelectItem value="corto">Corto plazo (3–6 meses)</SelectItem>
                  <SelectItem value="mediano">Mediano plazo (6–12 meses)</SelectItem>
                  <SelectItem value="comparando">Solo estoy comparando</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" value={contactForm.name} onChange={e => setContactForm(prev => ({
              ...prev,
              name: e.target.value
            }))} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={contactForm.email} onChange={e => setContactForm(prev => ({
              ...prev,
              email: e.target.value
            }))} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" value={contactForm.phone} onChange={e => setContactForm(prev => ({
              ...prev,
              phone: e.target.value
            }))} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comentarios (opcional)</Label>
              <Textarea id="comments" value={contactForm.comments} onChange={e => setContactForm(prev => ({
              ...prev,
              comments: e.target.value
            }))} placeholder="Escribe cualquier pregunta o comentario adicional..." rows={3} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsContactFormOpen(false)} className="flex-1" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal del mapa */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ubicación de la propiedad</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
            </div>
            
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img 
                src={mapReference} 
                alt="Ubicación de la propiedad en el mapa" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              Ubicación aproximada de la propiedad. El mapa muestra la zona general por motivos de privacidad.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popup de éxito de contacto */}
      <Dialog open={showContactSuccessPopup} onOpenChange={setShowContactSuccessPopup}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">¡Solicitud enviada!</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-muted-foreground">
              Tu solicitud ya fue enviada a un asesor.
            </p>
            <p className="text-muted-foreground">
              En breve se pondrá en contacto contigo.
            </p>
          </div>
          <Button onClick={() => setShowContactSuccessPopup(false)} className="w-full">
            Aceptar
          </Button>
        </DialogContent>
      </Dialog>
    </>;
}