import { useState } from "react";
import { Modal } from "../ui/Modal";
// Removed duplicate Label import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ContactForm } from "@/types/property";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  Clock,
  Wallet,
} from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

export function InfoModal({ isOpen, onClose, propertyId }: InfoModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    comments: "",
    budget: "",
    timeframe: "",
    propertyId: propertyId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactForm.budget || !contactForm.timeframe) {
      toast({
        variant: "destructive",
        title: "Información incompleta",
        description: "Por favor selecciona tu presupuesto y plazo de compra.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullMessage = `Presupuesto: ${contactForm.budget}
Plazo: ${contactForm.timeframe}
Comentarios: ${contactForm.comments || "Sin comentarios adicionales"}`;

      const { error } = await supabase.from("solicitudes_info").insert({
        propiedad_id: propertyId,
        solicitante_id: user?.id || null,
        nombre: contactForm.name,
        telefono: contactForm.phone,
        email: contactForm.email,
        mensaje: fullMessage,
        origen: "Web",
        estado: "nuevo",
      });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description:
          "Gracias por tu interés. Uno de nuestros asesores te contactarán pronto.",
      });

      setContactForm({
        name: "",
        email: "",
        phone: "",
        comments: "",
        budget: "",
        timeframe: "",
        propertyId: propertyId,
      });
      onClose();
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar información"
      size="md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto p-6 "
      >
        <div className="text-center space-y-1 pb-2 font-medium">
          <p className="text-sm text-muted-foreground">
            Para que un asesor pueda ayudarte mejor, ¿podrías responder estas
            dos preguntas?
          </p>
          <p className="text-xs text-muted-foreground">
            (te tomará menos de 20 segundos)
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            ¿Cuál es tu presupuesto? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={contactForm.budget}
            onValueChange={(val) =>
              setContactForm((prev) => ({ ...prev, budget: val }))
            }
            required
          >
            <SelectTrigger
              className={cn(
                "transition-all duration-200",
                !contactForm.budget
                  ? "border-slate-200"
                  : "border-primary ring-1 ring-primary/20 shadow-sm",
              )}
            >
              <SelectValue placeholder="Selecciona un rango" />
            </SelectTrigger>
            <SelectContent className="z-[110]">
              <SelectItem value="no-definido">No lo tengo definido</SelectItem>
              <SelectItem value="hasta-500k">Hasta $500,000</SelectItem>
              <SelectItem value="500k-1m">De $500,000 a $1,000,000</SelectItem>
              <SelectItem value="1m-3m">De $1,000,000 a $3,000,000</SelectItem>
              <SelectItem value="3m+">Más de $3,000,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            ¿En qué plazo planeas comprar o rentar?{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={contactForm.timeframe}
            onValueChange={(val) =>
              setContactForm((prev) => ({ ...prev, timeframe: val }))
            }
            required
          >
            <SelectTrigger
              className={cn(
                "transition-all duration-200",
                !contactForm.timeframe
                  ? "border-slate-200"
                  : "border-primary ring-1 ring-primary/20 shadow-sm",
              )}
            >
              <SelectValue placeholder="Selecciona un plazo" />
            </SelectTrigger>
            <SelectContent className="z-[110]">
              <SelectItem value="inmediato">Inmediato (0–3 meses)</SelectItem>
              <SelectItem value="corto">Corto plazo (3–6 meses)</SelectItem>
              <SelectItem value="mediano">
                Mediano plazo (6–12 meses)
              </SelectItem>
              <SelectItem value="comparando">Solo estoy comparando</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-slate-700 font-semibold flex items-center gap-2"
          >
            <User className="h-4 w-4 text-primary" />
            Nombre completo
          </Label>
          <Input
            id="name"
            value={contactForm.name}
            onChange={(e) =>
              setContactForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            required
            placeholder="Ej: Juan Pérez"
            className="border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-slate-700 font-semibold flex items-center gap-2"
          >
            <Mail className="h-4 w-4 text-primary" />
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            value={contactForm.email}
            onChange={(e) =>
              setContactForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            required
            placeholder="juan@ejemplo.com"
            className="border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-slate-700 font-semibold flex items-center gap-2"
          >
            <Phone className="h-4 w-4 text-primary" />
            Teléfono
          </Label>
          <Input
            id="phone"
            type="tel"
            value={contactForm.phone}
            onChange={(e) =>
              setContactForm((prev) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
            required
            placeholder="55 1234 5678"
            className="border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="comments"
            className="text-slate-700 font-semibold flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            Comentarios (opcional)
          </Label>
          <Textarea
            id="comments"
            value={contactForm.comments}
            onChange={(e) =>
              setContactForm((prev) => ({
                ...prev,
                comments: e.target.value,
              }))
            }
            placeholder="¿Tienes alguna duda específica sobre esta propiedad?"
            rows={3}
            className="border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none shadow-sm"
          />
        </div>

        <div className="flex gap-3 pt-6 sticky bottom-0 bg-white pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-200 hover:bg-slate-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
