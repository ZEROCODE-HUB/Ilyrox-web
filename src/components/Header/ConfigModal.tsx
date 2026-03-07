import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Avatar } from "../shared/Avatar";
import {
  Mail,
  Phone,
  Briefcase,
  Info,
  Globe,
  Shield,
  MapPin,
  Pen,
  Check,
  X,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useProfileEdit } from "@/hooks/useProfileEdit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ESTADOS_MEXICO } from "@/constants/locations";

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
    estado?: string;
    rol?: string;
  };
}

export const ConfigModal = ({
  open,
  onOpenChange,
  profile,
}: ConfigModalProps) => {
  const { updateProfileField, isUpdating } = useProfileEdit();
  const [editingField, setEditingField] = useState<"celular" | "estado" | null>(
    null,
  );
  const [editValue, setEditValue] = useState("");
  // Estado local para actualizaciones optimistas (refleja los cambios al instante en UI)
  const [localOverrides, setLocalOverrides] = useState<Partial<typeof profile>>(
    {},
  );

  // Reset local form states when modal opens/closes
  useEffect(() => {
    if (!open) {
      setEditingField(null);
      setEditValue("");
    }
  }, [open]);

  const handleEditClick = (
    field: "celular" | "estado",
    currentValue: string,
  ) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSaveEdit = async () => {
    if (!editingField) return;
    const success = await updateProfileField(editingField, editValue);
    if (success) {
      // Optimistic update
      setLocalOverrides((prev) => ({ ...prev, [editingField]: editValue }));
      setEditingField(null);
    }
  };

  // Values merged with optimistic updates
  const displayCelular =
    localOverrides.celular !== undefined
      ? localOverrides.celular
      : profile.celular || "No especificado";
  const displayEstado =
    localOverrides.estado !== undefined
      ? localOverrides.estado
      : profile.estado || "No especificado";

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Mi Perfil">
      <div className="flex flex-col gap-6 py-4">
        {/* Header con foto y nombre */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <Avatar
              uri={profile.foto}
              name={profile.full_name || "Usuario"}
              size={100}
              className="ring-4 ring-primary/10 cursor-default"
            />
            {profile.rol && (
              <Badge className="absolute cursor-default -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white border-none px-3 py-0.5 shadow-lg hover:translate-y-6 duration-150 transition-all ">
                {profile.rol === "agente" ? "Agente Inmobiliario" : profile.rol}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {profile.full_name || "Usuario"}
            </h2>
            <p className="text-muted-foreground font-medium">
              {profile.ocupacion || "Miembro de ilyrox"}
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
            {editingField === "celular" ? (
              // Modo de edición
              <div className="flex-1 flex flex-col gap-2 w-full animate-in fade-in slide-in-from-top-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Editar Celular
                </p>
                <div className="flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-8 text-sm"
                    disabled={isUpdating}
                    autoFocus
                    placeholder="Ejem. 5512345678"
                  />
                  <button
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="p-1.5 bg-green-500/10 text-green-600 rounded-md hover:bg-green-500/20 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="p-1.5 bg-red-500/10 text-red-600 rounded-md hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Modo vista
              <>
                <div
                  className="bg-primary/10 p-2 rounded-lg text-primary cursor-pointer"
                  onClick={() =>
                    handleEditClick(
                      "celular",
                      displayCelular === "No especificado"
                        ? ""
                        : displayCelular,
                    )
                  }
                >
                  <button className="group relative flex items-center justify-center rounded-lg transition-colors">
                    <Phone className="h-4 w-4 opacity-100 group-hover:opacity-0 transition-opacity duration-200" />
                    <Pen className="absolute w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Celular
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {displayCelular}
                  </p>
                </div>
              </>
            )}
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
            {editingField === "estado" ? (
              // Modo de edición
              <div className="flex-1 flex flex-col gap-2 w-full animate-in fade-in slide-in-from-top-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Editar Estado
                </p>
                <div className="flex gap-2">
                  <Select
                    value={editValue}
                    onValueChange={setEditValue}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-8 text-sm flex-1">
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

                  <button
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="p-1.5 bg-green-500/10 text-green-600 rounded-md hover:bg-green-500/20 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="p-1.5 bg-red-500/10 text-red-600 rounded-md hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Modo vista
              <>
                <div
                  className="bg-primary/10 p-2 rounded-lg text-primary cursor-pointer"
                  onClick={() =>
                    handleEditClick(
                      "estado",
                      displayEstado === "No especificado" ? "" : displayEstado,
                    )
                  }
                >
                  <button className="group relative flex items-center justify-center rounded-lg transition-colors">
                    <MapPin className="h-4 w-4 opacity-100 group-hover:opacity-0 transition-opacity duration-200" />
                    <Pen className="absolute w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Estado
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {displayEstado}
                  </p>
                </div>
              </>
            )}
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
          <span>Tus datos personales están protegidos por ilyrox.</span>
        </div>
      </div>
    </Modal>
  );
};
