import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/shared/Avatar";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { contactarAsesor } from "@/services/chatService";
import type { PropertyView } from "@/types/types";

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyView | null;
}

export function ContactSellerModal({
  isOpen,
  onClose,
  property,
}: ContactSellerModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Mensaje inicial sugerido, con el código de la propiedad.
  useEffect(() => {
    if (isOpen && property) {
      const code = property.codigo_propiedad
        ? ` (${property.codigo_propiedad})`
        : "";
      setMessage(
        `Hola, me interesa esta propiedad${code}. ¿Me podrías dar más información?`,
      );
    }
  }, [isOpen, property]);

  const handleSend = async () => {
    if (!property) return;
    if (!user) {
      toast({
        variant: "destructive",
        title: "Inicia sesión",
        description: "Debes iniciar sesión para contactar al asesor.",
      });
      return;
    }
    if (!property.asesor_id) {
      toast({
        variant: "destructive",
        title: "Sin asesor",
        description: "Esta propiedad no tiene un asesor asignado.",
      });
      return;
    }
    if (!message.trim()) return;

    setSending(true);
    try {
      const id = await contactarAsesor({
        currentUserId: user.id,
        asesorId: property.asesor_id,
        propertyId: property.id,
        mensaje: message,
      });
      if (id) {
        toast({
          title: "Mensaje enviado",
          description: "El asesor recibirá tu mensaje y te contactará pronto.",
        });
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "No se pudo enviar",
          description: "Intenta de nuevo en un momento.",
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar",
        description: e?.message || "Ocurrió un error.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-md z-[110]"
        overlayClassName="z-[110]"
      >
        <DialogHeader>
          <DialogTitle>Contactar al asesor</DialogTitle>
          <DialogDescription>
            Envía un mensaje y el asesor lo recibirá en su bandeja de chat.
          </DialogDescription>
        </DialogHeader>

        {property && (
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
            <Avatar
              uri={property.asesor_foto}
              name={property.asesor_nombre}
              size={40}
            />
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">
                {property.asesor_nombre || "Asesor"}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {property.asesor_rol || "Asesor Inmobiliario"}
              </div>
            </div>
          </div>
        )}

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Escribe tu mensaje..."
          className="resize-none"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar mensaje
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
