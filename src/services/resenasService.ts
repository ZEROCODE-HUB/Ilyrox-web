import { supabase } from "@/lib/supabase";

export const resenasService = async (asesor_id: string) => {
  const { data, error } = await supabase
    .from("resenas")
    .select("calificacion_general")
    .eq("profesional_id", asesor_id);

  if (error) {
    console.error("Error fetching reviews:", error);
    return;
  }

  return data;
};
