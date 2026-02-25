import { supabase } from "@/lib/supabase";

export const locationService = {
  getLocationsForProperty: async (estado: string) => {
    const { data, error } = await supabase
      .from("propiedades")
      .select("estado, municipio, colonia")
      .eq("estado", estado)
      .is("tipo_contrato", null)
      .is("precio_contrato", null)
      .eq("activo", true);

    if (error) {
      console.error("Error al obtener las propiedades:", error);
      return [];
    }

    return data;
  },
};
