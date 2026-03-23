import { supabase } from "@/lib/supabase";
import { propertyService } from "./propertyService";

export const notificationService = {
  async getNotifications(userId: string) {
    // 1. Fetch matches from the table
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        propiedad_id,
        busqueda_id,
        tipo_match,
        detalle,
        estado,
        created_at
      `,
      )
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // 2. Filter duplicates by property_id and tipo_match
    const seen = new Set();
    const uniqueMatches = data.filter((item: any) => {
      const key = `${item.propiedad_id}-${item.tipo_match}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 3. Fetch full property data for these matches from the search view
    const propertyIds = [
      ...new Set(uniqueMatches.map((m: any) => m.propiedad_id)),
    ];
    const properties = await propertyService.getPropertiesByIds(propertyIds);

    // 4. Fetch search details for these matches
    const searchIds = [
      ...new Set(uniqueMatches.map((m: any) => m.busqueda_id)),
    ].filter(Boolean);
    const { data: searches, error: searchError } = await supabase
      .from("busquedas_guardadas")
      .select("*")
      .in("id", searchIds);

    if (searchError) console.error("Error fetching searches:", searchError);

    // 5. Merge everything back into matches
    const result = uniqueMatches.map((match: any) => {
      const prop = properties.find((p) => p.id === match.propiedad_id);
      const search = searches?.find((s) => s.id === match.busqueda_id);
      return {
        ...match,
        propiedades: prop,
        busqueda_detalle: search,
      };
    });

    return result;
  },

  async markAsRead(userId: string) {
    const { error } = await supabase
      .from("matches")
      .update({ estado: "visto" })
      .eq("usuario_id", userId)
      .eq("estado", "pendiente");
    if (error) throw error;
  },

  async getBusquedasById(busquedaId: string) {
    const { data, error } = await supabase
      .from("busquedas_guardadas")
      .select(
        "tipo_propiedad, tipo_operacion, precio_min, precio_max, moneda,habitaciones, estado, subtipo, habitaciones, banos, estacionamientos, metros_construccion, metros_construccion_max, metros_terreno, metros_terreno_max, colonias",
      )
      .eq("id", busquedaId)
      .single();
    if (error) throw error;
    return data;
  },
};
