import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home } from "lucide-react";
import {
  ESTADOS_MEXICO,
  CIUDADES_POR_ESTADO,
  COLONIAS_POR_MUNICIPIO,
} from "@/constants/locations";
import { propertyRequestService } from "@/services/propertyRequestService";
import { solicitudes_propiedad } from "@/types/types";
import { formatPriceInput, parseCurrency } from "@/utils/propertyUtils";
import { sileo } from "sileo";

interface RentSellPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RentSellPopup({ isOpen, onClose }: RentSellPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    propertyType: "" as solicitudes_propiedad["tipo"],
    priceMin: "",
    priceMax: "",
    estado: "",
    municipio: "",
    colonia: "",
    otraColonia: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [availableMunicipios, setAvailableMunicipios] = useState<string[]>([]);
  const [availableColonias, setAvailableColonias] = useState<string[]>([]);

  // Update municipios when estado changes
  useEffect(() => {
    if (formData.estado) {
      setAvailableMunicipios(CIUDADES_POR_ESTADO[formData.estado] || []);
      setFormData((prev) => ({
        ...prev,
        municipio: "",
        colonia: "",
        otraColonia: "",
      }));
    } else {
      setAvailableMunicipios([]);
    }
  }, [formData.estado]);

  // Update colonias when municipio changes
  useEffect(() => {
    if (formData.municipio) {
      setAvailableColonias(COLONIAS_POR_MUNICIPIO[formData.municipio] || []);
      setFormData((prev) => ({ ...prev, colonia: "", otraColonia: "" }));
    } else {
      setAvailableColonias([]);
    }
  }, [formData.municipio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalColonia =
        formData.colonia === "otro" ? formData.otraColonia : formData.colonia;

      await propertyRequestService.submitPropertyRequest({
        nombre_completo: formData.name,
        email: formData.email,
        telefono: formData.phone,
        descripcion: formData.description,
        tipo: formData.propertyType,
        rango_min: parseCurrency(formData.priceMin),
        rango_max: parseCurrency(formData.priceMax),
        estado: formData.estado,
        municipio: formData.municipio,
        colonia: finalColonia,
        usuario_id: null, // This is handled by the service
      } as any);

      sileo.success({
        title: "Su solicitud se envió con éxito",
        description: "Nos pondremos en contacto contigo pronto.",
        position: "top-right",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        description: "",
        propertyType: "" as any,
        priceMin: "",
        priceMax: "",
        estado: "",
        municipio: "",
        colonia: "",
        otraColonia: "",
      });
      onClose();
      setShowSuccessPopup(true);
    } catch (error: any) {
      console.error("Error submitting property request:", error);
      sileo.error({
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta nuevamente.",
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatPriceInput(value);
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Home className="h-5 w-5 text-primary" />
              Quiero rentar / vender mi inmueble
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="10 dígitos"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción corta del inmueble
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe brevemente tu inmueble (tamaño, características)..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de inmueble</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, propertyType: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="habitacional">Habitacional</SelectItem>
                  <SelectItem value="agricola">Agrícola</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rango de precio estimado</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="text"
                    name="priceMin"
                    className="pl-7"
                    value={formData.priceMin}
                    onChange={handlePriceChange}
                    placeholder="Mínimo"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="text"
                    name="priceMax"
                    className="pl-7"
                    value={formData.priceMax}
                    onChange={handlePriceChange}
                    placeholder="Máximo"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, estado: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_MEXICO.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Municipio / Ciudad</Label>
                <Select
                  value={formData.municipio}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, municipio: value }))
                  }
                  disabled={!formData.estado}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona Municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMunicipios.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Colonia</Label>
              <Select
                value={formData.colonia}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, colonia: value }))
                }
                disabled={!formData.municipio}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona Colonia" />
                </SelectTrigger>
                <SelectContent>
                  {availableColonias.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value="otro">Otro (Especificar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.colonia === "otro" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label htmlFor="otraColonia">Especifique la colonia</Label>
                <Input
                  id="otraColonia"
                  value={formData.otraColonia}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      otraColonia: e.target.value,
                    }))
                  }
                  placeholder="Nombre de la colonia"
                  required
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Popup de éxito */}
      <Dialog open={showSuccessPopup} onOpenChange={handleCloseSuccessPopup}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">
              ¡Solicitud enviada!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-muted-foreground">
              Tu solicitud para rentar/vender ha sido recibida.
            </p>
            <p className="font-medium text-sm">
              Te contactará un asesor en breve para dar seguimiento.
            </p>
          </div>
          <Button onClick={handleCloseSuccessPopup} className="w-full">
            Aceptar
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
