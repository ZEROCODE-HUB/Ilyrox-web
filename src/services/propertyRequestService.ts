import { supabase } from "@/lib/supabase";
import { solicitudes_propiedad } from "@/types/types";

export const propertyRequestService = {
  async submitPropertyRequest(
    request: Omit<solicitudes_propiedad, "id" | "created_at">,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("solicitudes_propiedad")
      .insert({
        ...request,
        usuario_id: user?.id || null, // Optional if user is not logged in
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
