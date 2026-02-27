import { supabase } from "@/lib/supabase";
import type { Property, Advisor, PropertyFilters } from "@/types/property";
import { PropertyView } from "@/types/types";

// Helper to map View row to PropertyView interface
const mapViewToPropertyView = (
  row: any,
  currentUserId?: string,
): PropertyView => {
  return {
    ...row,
    likes_count: Number(row.likes_count || 0),
    comentarios_count: Number(row.comentarios_count || 0),
    isLiked:
      Array.isArray(row.liked_by_users) && currentUserId
        ? row.liked_by_users.includes(currentUserId)
        : false,
    // Ensure operaciones is an array
    operaciones: Array.isArray(row.operaciones) ? row.operaciones : [],
  };
};

export const propertyService = {
  async searchProperties(
    filters: PropertyFilters & {
      searchText?: string;
      state?: string;
      municipality?: string;
      colony?: string;
    },
    page: number = 0,
    pageSize: number = 10,
  ): Promise<PropertyView[]> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    let exchangeRateToUSD = 1.0;
    const filterCurrency = filters.currency || "MXN";

    if ((filters.priceMin || filters.priceMax) && filterCurrency !== "USD") {
      try {
        const { data: config, error } = await supabase
          .from("configuracion_monedas")
          .select("valor_en_usd")
          .eq("codigo", filterCurrency)
          .single();

        if (!error && config?.valor_en_usd) {
          exchangeRateToUSD = config.valor_en_usd;
        } else if (filterCurrency === "MXN") {
          // Fallback to average rate if database query fails
          exchangeRateToUSD = 18.0;
        }
      } catch (e) {
        if (filterCurrency === "MXN") {
          exchangeRateToUSD = 18.0;
        }
      }
    }

    let query = supabase
      .from("propiedades_busqueda_view")
      .select("*", { count: "exact" });

    if (filters.searchText) {
      const term = `%${filters.searchText}%`;
      query = query.or(
        `municipio.ilike.${term},estado.ilike.${term},colonia.ilike.${term},codigo_propiedad.ilike.${term}`,
      );
    }

    if (filters.state) query = query.eq("estado", filters.state);
    if (filters.municipality)
      query = query.eq("municipio", filters.municipality);
    if (filters.colony) query = query.eq("colonia", filters.colony);
    if (filters.colonias && filters.colonias.length > 0) {
      query = query.in("colonia", filters.colonias);
    }

    if (filters.type && filters.type !== "Otros")
      query = query.eq("tipo", filters.type);

    if (filters.subtype) query = query.eq("subtipo", filters.subtype);

    if (filters.operationType && filters.operationType !== "todas") {
      // Use ilike because now it's a comma separated string in the view
      query = query.ilike("tipo_operacion", `%${filters.operationType}%`);
    }

    if (filters.priceMin) {
      const minUSD = filters.priceMin / exchangeRateToUSD;
      // Subtract a small epsilon to account for potential floating-point inaccuracies
      query = query.gte("precio_usd_normalizado", minUSD - 0.0001);
    }
    if (filters.priceMax) {
      const maxUSD = filters.priceMax / exchangeRateToUSD;
      // Add a small epsilon to account for potential floating-point inaccuracies
      query = query.lte("precio_usd_normalizado", maxUSD + 0.0001);
    }

    if (filters.bedrooms && filters.bedrooms > 0)
      query = query.gte("habitaciones", filters.bedrooms);
    if (filters.bathrooms && filters.bathrooms > 0)
      query = query.gte("banos", filters.bathrooms);
    if (filters.parking && filters.parking > 0)
      query = query.gte("estacionamientos", filters.parking);
    if (filters.levels && filters.levels > 0)
      query = query.gte("pisos", filters.levels);
    if (filters.constructionAreaMin)
      query = query.gte(
        "metros_cuadrados_construccion",
        filters.constructionAreaMin,
      );
    if (filters.landAreaMin)
      query = query.gte("metros_cuadrados_terreno", filters.landAreaMin);

    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error searching properties:", error);
      return [];
    }

    return (data || []).map((row) => mapViewToPropertyView(row, user?.id));
  },

  async getLocationsForProperty() {
    const { data, error } = await supabase
      .from("propiedades")
      .select("estado,municipio,colonia");

    if (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
    return data;
  },

  async getPropertyById(id: string): Promise<PropertyView | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    const { data, error } = await supabase
      .from("propiedades_busqueda_view")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting property by id:", error);
      return null;
    }
    if (!data) return null;

    return mapViewToPropertyView(data, user?.id);
  },

  async getPropertiesByIds(ids: string[]): Promise<PropertyView[]> {
    if (!ids || ids.length === 0) return [];

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    const { data, error } = await supabase
      .from("propiedades_busqueda_view")
      .select("*")
      .in("id", ids);

    if (error) {
      console.error("Error getting properties by ids:", error);
      return [];
    }

    return (data || []).map((row) => mapViewToPropertyView(row, user?.id));
  },

  async getComments(feedItemId: string) {
    const { data, error } = await supabase
      .from("comentarios")
      .select(
        `
        *,
        perfiles:publicado_por (
          id,
          nombre_completo,
          foto
        ),
        likes_comentarios (
          usuario_id
        )
      `,
      )
      .eq("feed_item_id", feedItemId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
    return data;
  },

  async addComment(
    feedItemId: string,
    content: string,
    parentCommentId?: string,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Debes iniciar sesión para comentar");

    const { data, error } = await supabase
      .from("comentarios")
      .insert({
        feed_item_id: feedItemId,
        publicado_por: user.id,
        contenido: content,
        parent_comentario_id: parentCommentId,
        nivel_anidacion: parentCommentId ? 1 : 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
