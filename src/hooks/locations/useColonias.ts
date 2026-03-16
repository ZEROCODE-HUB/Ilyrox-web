// hooks/useColonias.ts
import { useState, useCallback, useRef } from "react";
import { supabaseGeo } from "@/lib/supabase-geo";

const PAGE_SIZE = 30;

interface Colonia {
  id: number;
  nombre: string;
  codigo_postal: string;
  asentamiento: string;
  municipio_nombre: string;
  latitud: number;
  longitud: number;
  total_count: number;
}

export function useColonias() {
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const searchRef = useRef("");

  const fetchColonias = useCallback(
    async ({
      estadoId,
      municipioId,
      busqueda = "",
      reset = false,
    }: {
      estadoId?: number;
      municipioId?: number;
      busqueda?: string;
      reset?: boolean;
    }) => {
      setLoading(true);

      // Si cambia la búsqueda o se resetea, volver a offset 0
      const offset = reset ? 0 : offsetRef.current;
      searchRef.current = busqueda;

      const { data, error } = await supabaseGeo.rpc("obtener_colonias", {
        p_estado_id: estadoId ?? null,
        p_municipio_id: municipioId ?? null,
        p_nombre_busqueda: busqueda,
        p_limit: PAGE_SIZE,
        p_offset: offset,
      });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const results = data as Colonia[];
      const total = results[0]?.total_count ?? 0;

      if (reset || busqueda !== "") {
        // Búsqueda o primer carga: reemplazar lista
        setColonias(results);
        offsetRef.current = PAGE_SIZE;
      } else {
        // Scroll infinito: agregar al final
        setColonias((prev) => [...prev, ...results]);
        offsetRef.current = offset + PAGE_SIZE;
      }

      // ¿Quedan más resultados? Solo aplica sin búsqueda activa
      setHasMore(busqueda === "" && offsetRef.current < total);
      setLoading(false);
    },
    [],
  );

  const loadMore = useCallback(
    (params: { estadoId?: number; municipioId?: number }) => {
      fetchColonias({ ...params, busqueda: searchRef.current, reset: false });
    },
    [fetchColonias],
  );

  return { colonias, loading, hasMore, fetchColonias, loadMore };
}
