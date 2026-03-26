import { supabase } from "@/lib/supabase";
import type { Property, Advisor, PropertyFilters } from "@/types/property";
import { PropertyView } from "@/types/types";
import { MUNICIPIOS_ESTADO } from "@/constants/MexLocations/municipios";

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
      state?: string | string[];
      municipality?: string;
      colony?: string;
      municipios?: string[];
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

    // Filtro por zonas (colonias y municipios combinados en un OR)
    const locationOrConditions: string[] = [];

    // Colonias
    if (filters.colonias && filters.colonias.length > 0) {
      const withMunicipio: string[] = [];
      const withoutMunicipio: string[] = [];

      filters.colonias.forEach((c) => {
        const match = c.match(/(.+) \((.+)\)/);
        if (match) {
          withMunicipio.push(c);
        } else {
          withoutMunicipio.push(c);
        }
      });

      if (withMunicipio.length > 0) {
        withMunicipio.forEach((c) => {
          const match = c.match(/(.+) \((.+)\)/);
          if (match) {
            const colName = match[1].replace(/"/g, '""');
            const muniName = match[2].replace(/"/g, '""');
            locationOrConditions.push(`and(colonia.eq."${colName}",municipio.eq."${muniName}")`);
          }
        });
      }

      if (withoutMunicipio.length > 0) {
        const list = withoutMunicipio
          .map((c) => `"${c.replace(/"/g, '""')}"`)
          .join(",");
        locationOrConditions.push(`colonia.in.(${list})`);
      }
    }

    // Municipios
    if (filters.municipios && filters.municipios.length > 0) {
      const muniList = filters.municipios
        .map((m) => `"${m.replace(/"/g, '""')}"`)
        .join(",");
      locationOrConditions.push(`municipio.in.(${muniList})`);
    }

    // Identificar estados que "no tienen" filtros de municipio/colonia que los refinen
    // Para esos estados, debemos mostrar todas sus propiedades, agregándolos al OR global.
    const states = Array.isArray(filters.state) 
      ? filters.state 
      : (filters.state ? [filters.state] : []);

    if (states.length > 0) {
      const normalizeString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const unrefinedStates: string[] = [];

      states.forEach(state => {
        const normState = normalizeString(state);
        // Clean up common suffixes for matching with MUNICIPIOS_ESTADO keys 
        // e.g., "Ciudad de México (CDMX)" vs "Ciudad de México (CDMX)" usually matches perfectly,
        // but just in case we do a loose find.
        const stateKey = Object.keys(MUNICIPIOS_ESTADO).find(
          k => normalizeString(k).includes(normState) || normState.includes(normalizeString(k))
        );
        
        const stateMunis = stateKey ? MUNICIPIOS_ESTADO[stateKey] : [];
        const normStateMunis = stateMunis.map(m => normalizeString(m));
        
        let hasRefinements = false;

        if (filters.municipios?.some(m => normStateMunis.includes(normalizeString(m)))) {
          hasRefinements = true;
        }

        if (!hasRefinements && filters.colonias) {
          filters.colonias.forEach(c => {
            const match = c.match(/(.+) \((.+)\)/);
            if (match) {
               const muni = match[2];
               if (normStateMunis.includes(normalizeString(muni))) {
                 hasRefinements = true;
               }
            }
          });
        }

        if (!hasRefinements) {
          unrefinedStates.push(state);
        }
      });

      if (unrefinedStates.length > 0) {
        const unrefinedList = unrefinedStates.map(s => `"${s.replace(/"/g, '""')}"`).join(",");
        locationOrConditions.push(`estado.in.(${unrefinedList})`);
      }
    }

    // Aplicar el OR de todas las zonas si existen
    if (locationOrConditions.length > 0) {
      query = query.or(locationOrConditions.join(","));
    }

    // El filtro de estado se mantiene como base si está presente
    if (filters.state) {
      if (Array.isArray(filters.state) && filters.state.length > 0) {
        query = query.in("estado", filters.state);
      } else if (typeof filters.state === "string") {
        query = query.eq("estado", filters.state);
      }
    }

    if (filters.type && filters.type !== "Otros")
      query = query.eq("tipo", filters.type);

    if (filters.subtype) {
      if (Array.isArray(filters.subtype)) {
        if (filters.subtype.length > 0) {
          query = query.in("subtipo", filters.subtype);
        }
      } else {
        query = query.eq("subtipo", filters.subtype);
      }
    }

    if (filters.operationType && filters.operationType !== "todas") {
      // Use ilike because now it's a comma separated string in the view
      query = query.ilike("tipo_operacion", `%${filters.operationType}%`);
    }

    let priceColumn = "precio_usd_normalizado";
    if (filters.operationType === "venta") {
      priceColumn = "precio_usd_venta";
    } else if (filters.operationType === "renta") {
      priceColumn = "precio_usd_renta";
    }

    if (filters.priceMin) {
      const minUSD = filters.priceMin / exchangeRateToUSD;
      // Subtract a small epsilon to account for potential floating-point inaccuracies
      query = query.gte(priceColumn, minUSD - 0.0001);
    }
    if (filters.priceMax) {
      const maxUSD = filters.priceMax / exchangeRateToUSD;
      // Add a small epsilon to account for potential floating-point inaccuracies
      query = query.lte(priceColumn, maxUSD + 0.0001);
    }

    const applyFeatureFilter = (column: string, value?: string) => {
      if (!value) return;
      if (value.endsWith("+")) {
        const num = parseInt(value.slice(0, -1));
        if (!isNaN(num)) query = query.gte(column, num);
      } else {
        const num = parseInt(value);
        if (!isNaN(num)) query = query.eq(column, num);
      }
    };

    applyFeatureFilter("habitaciones", filters.bedrooms);
    applyFeatureFilter("banos", filters.bathrooms);
    applyFeatureFilter("estacionamientos", filters.parking);
    applyFeatureFilter("pisos", filters.levels);
    if (filters.constructionAreaMin)
      query = query.gte(
        "metros_cuadrados_construccion",
        filters.constructionAreaMin,
      );
    if (filters.constructionAreaMax)
      query = query.lte(
        "metros_cuadrados_construccion",
        filters.constructionAreaMax,
      );
    if (filters.landAreaMin)
      query = query.gte("metros_cuadrados_terreno", filters.landAreaMin);
    if (filters.landAreaMax)
      query = query.lte("metros_cuadrados_terreno", filters.landAreaMax);

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
