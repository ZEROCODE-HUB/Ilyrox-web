import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  useFilterStore,
  useEstadoMexico,
  useColonias as useSelectedColonias,
} from "@/stores/useFilterStore";
import { MAPA_ESTADO_ID } from "@/constants/MexLocations/estados";
import { MUNICIPIOS_ESTADO } from "@/constants/MexLocations/municipios";
import { COLONIAS_POR_MUNICIPIO } from "@/constants/MexLocations/colonias";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/Modal";
import { usePropertyColonias } from "@/hooks/usePropertyColonias";
import { useColonias } from "@/hooks/locations/useColonias";
import { useDebouncedCallback } from "use-debounce";

export function ZoneSearch() {
  const estadoMexico = useEstadoMexico();
  const selectedColonias = useSelectedColonias();
  const { toggleColonia } = useFilterStore();
  const [searchModal, setSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { colonias, loading, hasMore, fetchColonias, loadMore } = useColonias();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const estadoId = useMemo(() => {
    if (!estadoMexico) return null;
    const cleanEstado = estadoMexico.replace(" (CDMX)", "");
    return MAPA_ESTADO_ID[estadoMexico] || MAPA_ESTADO_ID[cleanEstado] || null;
  }, [estadoMexico]);

  useEffect(() => {
    if (!hasMore || loading || !searchModal) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore({ estadoId: estadoId as number });
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, searchModal, estadoId]);

  useEffect(() => {
    if (estadoId) {
      fetchColonias({ estadoId, reset: true });
    }
  }, [estadoId]);

  const handleSearch = useDebouncedCallback((value: string) => {
    if (estadoId) {
      fetchColonias({ estadoId, busqueda: value, reset: true });
    }
  }, 300);

  const normalizeEstado = (estado: string) => {
    if (!estado) return "";
    return estado
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(" (CDMX)", "")
      .replace(" de Zaragoza", "")
      .replace(" de Ocampo", "")
      .replace(" de Ignacio de la Llave", "");
  };

  const uniqueColonyNames = useMemo(() => {
    if (!estadoMexico) return [];

    const namesSet = new Set<string>();

    // Always include selected colonies names so they can be deselected
    selectedColonias.forEach((sc) => {
      const name = sc.includes(" (") ? sc.split(" (")[0] : sc;
      namesSet.add(name);
    });

    // Add from Supabase results
    if (Array.isArray(colonias)) {
      colonias.forEach((c: any) => {
        if (c.nombre) namesSet.add(c.nombre);
      });
    }

    // Fallback to constants if needed
    if (namesSet.size === 0) {
      const normalized = normalizeEstado(estadoMexico);
      const municipios = MUNICIPIOS_ESTADO[normalized] || [];
      municipios.forEach((muni) => {
        const cols = COLONIAS_POR_MUNICIPIO[muni] || [];
        cols.forEach((c) => namesSet.add(c));
      });
    }

    return Array.from(namesSet);
  }, [estadoMexico, colonias, selectedColonias]);

  const modalItems = useMemo(() => {
    const items = Array.isArray(colonias) ? [...colonias] : [];

    // Ensure all selected colonias are in the list even if not in current fetch/scroll
    selectedColonias.forEach((sc) => {
      const isAlreadyInList = items.some((item: any) => {
        const identifier = item.municipio_nombre
          ? `${item.nombre} (${item.municipio_nombre})`
          : item.nombre;
        return identifier === sc;
      });

      if (!isAlreadyInList) {
        let nombre = sc;
        let municipio_nombre = "";

        if (sc.includes(" (") && sc.endsWith(")")) {
          const parts = sc.split(" (");
          nombre = parts[0];
          municipio_nombre = parts[1].slice(0, -1);
        }

        items.push({
          id: `selected-${sc}`,
          nombre,
          municipio_nombre,
        });
      }
    });

    // Count occurrences to detect duplicates
    const counts: Record<string, number> = {};
    items.forEach((c: any) => {
      counts[c.nombre] = (counts[c.nombre] || 0) + 1;
    });

    return items.map((c: any) => ({
      ...c,
      isDuplicate: counts[c.nombre] > 1,
    }));
  }, [colonias, selectedColonias]);

  if (!estadoMexico || uniqueColonyNames.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
        <p className="text-white/90 text-md font-bold pb-2">
          Búsqueda por colonias
        </p>
        <ScrollArea className="w-full whitespace-nowrap pb-3">
          <div className="flex gap-2 px-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchModal(true)}
              className="bg-white/10 border-none text-white/90 hover:bg-white/20 sticky left-0 z-10 rounded-full h-9 w-9 min-w-[36px]"
            >
              <Search className="h-4 w-4" />
            </Button>
            {uniqueColonyNames
              .sort((a, b) => {
                const aSelected = selectedColonias.some(
                  (sc) => sc === a || sc.startsWith(`${a} (`),
                )
                  ? 0
                  : 1;
                const bSelected = selectedColonias.some(
                  (sc) => sc === b || sc.startsWith(`${b} (`),
                )
                  ? 0
                  : 1;
                if (aSelected !== bSelected) return aSelected - bSelected;
                return a.localeCompare(b);
              })
              .slice(0, 20)
              .map((colony) => {
                // For badges, we check if ANY item with this colony name is selected
                const isSelected = selectedColonias.some(
                  (sc) => sc === colony || sc.startsWith(`${colony} (`),
                );
                return (
                  <Badge
                    key={`badge-${colony}`}
                    variant={isSelected ? "default" : "secondary"}
                    className={cn(
                      "cursor-pointer px-4 py-1.5 rounded-full text-sm transition-all border-none font-medium select-none whitespace-nowrap",
                      isSelected
                        ? "bg-white text-navbar scale-105 shadow-md hover:bg-white/90"
                        : "bg-white/10 text-white/90 hover:bg-white/20",
                    )}
                    onClick={() => toggleColonia(colony)}
                  >
                    {colony}
                    {isSelected && <Check className="ml-1.5 h-3.5 w-3.5" />}
                  </Badge>
                );
              })}
            {uniqueColonyNames.length > 20 && (
              <Button
                variant="ghost"
                onClick={() => setSearchModal(true)}
                className="text-white/70 hover:text-white hover:bg-white/10 text-xs px-3 h-9 rounded-full transition-all"
              >
                +{uniqueColonyNames.length - 20} más...
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="bg-white/10" />
        </ScrollArea>
      </div>

      <Modal
        isOpen={searchModal}
        onClose={() => {
          setSearchModal(false);
          setSearchQuery("");
        }}
        title={`Colonias en ${estadoMexico}`}
        size="md"
      >
        <div className="p-4 space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Escribe el nombre de la colonia..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-slate-200"
              >
                <X className="h-3.5 w-3.5 text-slate-500" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              {searchQuery ? "Resultados de búsqueda" : "Todas las colonias"}
            </p>
            <ScrollArea className="h-[350px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...modalItems]
                  .sort((a, b) => {
                    const aId = (a as any).municipio_nombre
                      ? `${(a as any).nombre} (${(a as any).municipio_nombre})`
                      : (a as any).nombre;
                    const bId = (b as any).municipio_nombre
                      ? `${(b as any).nombre} (${(b as any).municipio_nombre})`
                      : (b as any).nombre;
                    const aSelected = selectedColonias.includes(aId) ? 0 : 1;
                    const bSelected = selectedColonias.includes(bId) ? 0 : 1;
                    if (aSelected !== bSelected) return aSelected - bSelected;
                    return (a as any).nombre.localeCompare((b as any).nombre);
                  })
                  .map((item) => {
                    const identifier = item.municipio_nombre
                      ? `${item.nombre} (${item.municipio_nombre})`
                      : item.nombre;
                    const isSelected = selectedColonias.includes(identifier);
                    return (
                      <div
                        key={`modal-col-${item.id}`}
                        onClick={() =>
                          toggleColonia(item.nombre, item.municipio_nombre)
                        }
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 select-none group",
                          isSelected
                            ? "bg-primary/5 border-primary text-primary shadow-sm focus:border-primary focus:ring-primary/20"
                            : "bg-white border-slate-100 hover:border-primary/30 hover:bg-slate-50",
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-tight">
                            {item.nombre}
                          </span>
                          {item.isDuplicate && item.municipio_nombre && (
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {item.municipio_nombre}
                            </span>
                          )}
                        </div>
                        <div
                          className={cn(
                            "h-5 w-5 rounded-md flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-primary text-white scale-110"
                              : "bg-slate-100 border border-slate-200 group-hover:border-primary/50",
                          )}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    );
                  })}

                <div ref={loadMoreRef} className="h-4 w-full" />

                {loading && (
                  <div className="col-span-full py-8 text-center animate-in fade-in">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-slate-400 text-xs mt-2 font-medium">
                      Cargando colonias...
                    </p>
                  </div>
                )}
                {modalItems.length === 0 && (
                  <div className="col-span-full py-12 text-center space-y-3">
                    <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                      <Search className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm">
                      No encontramos colonias que coincidan con{" "}
                      <span className="font-bold">"{searchQuery}"</span>
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery("")}
                      className="text-primary h-auto p-0"
                    >
                      Ver todas las colonias
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            <span className="font-bold text-primary">
              {selectedColonias.length}
            </span>{" "}
            {selectedColonias.length === 1
              ? "colonia seleccionada"
              : "colonias seleccionadas"}
          </p>
          <Button
            onClick={() => setSearchModal(false)}
            className="rounded-xl px-6 bg-navbar hover:bg-navbar/90 shadow-lg shadow-navbar/20 transition-all font-semibold"
          >
            Listo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
