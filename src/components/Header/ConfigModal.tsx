import { Modal } from "../ui/Modal";
import { Avatar } from "../shared/Avatar";
import { Mail, Phone, Briefcase, Info, Globe, Shield } from "lucide-react";
import { Badge } from "../ui/badge";

interface ConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    full_name?: string;
    foto?: string;
    email?: string;
    celular?: string;
    ocupacion?: string;
    biografia?: string;
    sitio_web?: string;
    rol?: string;
  };
}

export const ConfigModal = ({
  open,
  onOpenChange,
  profile,
}: ConfigModalProps) => {
  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Configuración de la Cuenta"
    >
      <div className="flex flex-col gap-6 py-4">
        {/* Header con foto y nombre */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <Avatar
              uri={profile.foto}
              name={profile.full_name || "Usuario"}
              size={100}
              className="ring-4 ring-primary/10"
            />
            {profile.rol && (
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white border-none px-3 py-0.5 shadow-lg">
                {profile.rol === "agente" ? "Agente Inmobiliario" : profile.rol}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {profile.full_name || "Usuario"}
            </h2>
            <p className="text-muted-foreground font-medium">
              {profile.ocupacion || "Miembro de i360"}
            </p>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Email
              </p>
              <p className="text-sm font-semibold truncate">
                {profile.email || "No especificado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Celular
              </p>
              <p className="text-sm font-semibold truncate">
                {profile.celular || "No especificado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Ocupación
              </p>
              <p className="text-sm font-semibold truncate">
                {profile.ocupacion || "No especificado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Globe className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Sitio Web
              </p>
              <p className="text-sm font-semibold truncate">
                {profile.sitio_web || "No especificado"}
              </p>
            </div>
          </div>
        </div>

        {/* Biografía */}
        {profile.biografia && (
          <div className="px-2">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Biografía
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{profile.biografia}"
              </p>
            </div>
          </div>
        )}

        {/* Nota de seguridad */}
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground bg-muted/20 rounded-xl mx-2 italic">
          <Shield className="h-3 w-3" />
          <span>Tus datos personales están protegidos por i360.</span>
        </div>
      </div>
    </Modal>
  );
};
