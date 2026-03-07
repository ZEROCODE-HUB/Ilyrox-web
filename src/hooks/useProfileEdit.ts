import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useProfileEdit() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // We might need a way to refresh the context, but we don't have a direct refresh method exported. supabase onAuthStateChange will not catch manual DB updates. We can reload the page or rely on the user visually seeing it, or we may need to manually update AuthContext somehow if the user function provides a way. For now, since AuthContext uses `supabase.from("perfiles")` on auth change, let's just make the DB update.

  const updateProfileField = async (
    field: "celular" | "estado",
    value: string,
  ) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para actualizar tu perfil",
      });
      return false;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("perfiles")
        .update({ [field]: value })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: `El campo ha sido actualizado exitosamente.`,
      });

      return true;
    } catch (error: any) {
      console.error("Error updating profile field:", error);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error al guardar los cambios",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProfileField, isUpdating };
}
