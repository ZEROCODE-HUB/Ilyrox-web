import { supabase } from "@/lib/supabase";

export const notificationService = {
  async getNotifications(id: string) {
    const { data, error } = await supabase
      .from("notificaciones")
      .select("*")
      .eq("user_id", id);
    if (error) throw error;
    return data;
  },
};
