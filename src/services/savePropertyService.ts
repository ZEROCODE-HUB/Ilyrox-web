import { supabase } from "@/lib/supabase";

export const savePropertyService = {
  async saveProperty(propiedadId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      throw new Error("Debes iniciar sesión para guardar una propiedad");

    const { data, error } = await supabase
      .from("propiedades_guardadas")
      .insert({
        propiedad_id: propiedadId,
        usuario_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeProperty(propiedadId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      throw new Error("Debes iniciar sesión para realizar esta acción");

    const { error } = await supabase
      .from("propiedades_guardadas")
      .delete()
      .eq("propiedad_id", propiedadId)
      .eq("usuario_id", user.id);

    if (error) throw error;
  },

  async isPropertySaved(propiedadId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("propiedades_guardadas")
      .select("id")
      .eq("propiedad_id", propiedadId)
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  async getSavedProperties(): Promise<any[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get IDs from the pivot table (which has the correct FK relationship)
    const { data: pivotData, error: pivotError } = await supabase
      .from("propiedades_guardadas")
      .select("propiedad_id")
      .eq("usuario_id", user.id);

    if (pivotError) {
      console.error("Error fetching saved property IDs:", pivotError);
      throw pivotError;
    }

    if (!pivotData || pivotData.length === 0) return [];

    const propertyIds = pivotData.map((item) => item.propiedad_id);

    // 2. Fetch full details from the search view
    const { data, error } = await supabase
      .from("propiedades_busqueda_view")
      .select("*")
      .in("id", propertyIds);

    if (error) {
      console.error("Error fetching detailed saved properties:", error);
      throw error;
    }

    return (data || []).map((p) => ({
      ...p,
      isLiked: true,
    }));
  },
};
