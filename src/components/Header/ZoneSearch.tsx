import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  useFilterStore,
  useEstadoMexico,
  useColonias,
} from "@/stores/useFilterStore";
import { MUNICIPIOS_ESTADO } from "@/constants/MexLocations/municipios";
import { COLONIAS_POR_MUNICIPIO } from "@/constants/MexLocations/colonias";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/Modal";
import { usePropertyColonias } from "@/hooks/usePropertyColonias";

export function ZoneSearch() {
  const estadoMexico = useEstadoMexico();
  const selectedColonias = useColonias();
  const { toggleColonia } = useFilterStore();
  const [searchModal, setSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { colonias } = usePropertyColonias(estadoMexico);

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

  const allStateColonias = useMemo(() => {
    if (!estadoMexico) return [];

    const normalized = normalizeEstado(estadoMexico);
    // Get all municipalities for this state
    const municipios = MUNICIPIOS_ESTADO[normalized] || [];

    // Aggregate all colonies from those municipalities
    const coloniesSet = new Set<string>();
    municipios.forEach((muni) => {
      const cols = COLONIAS_POR_MUNICIPIO[muni] || [];
      cols.forEach((c) => coloniesSet.add(c));
    });

    // Add colonias from Supabase
    if (Array.isArray(colonias)) {
      colonias.forEach((item: any) => {
        if (item.colonia) {
          coloniesSet.add(item.colonia);
        }
      });
    }

    return Array.from(coloniesSet).sort();
  }, [estadoMexico, colonias]);

  const filteredColonias = useMemo(() => {
    if (!searchQuery.trim()) return allStateColonias;
    const query = searchQuery.toLowerCase().trim();
    return allStateColonias.filter((colony) =>
      colony.toLowerCase().includes(query),
    );
  }, [allStateColonias, searchQuery]);

  if (!estadoMexico || allStateColonias.length === 0) return null;

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
            {allStateColonias.slice(0, 20).map((colony) => {
              const isSelected = selectedColonias.includes(colony);
              return (
                <Badge
                  key={colony}
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
            {allStateColonias.length > 20 && (
              <Button
                variant="ghost"
                onClick={() => setSearchModal(true)}
                className="text-white/70 hover:text-white hover:bg-white/10 text-xs px-3 h-9 rounded-full transition-all"
              >
                +{allStateColonias.length - 20} más...
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {filteredColonias.map((colony) => {
                  const isSelected = selectedColonias.includes(colony);
                  return (
                    <div
                      key={colony}
                      onClick={() => toggleColonia(colony)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 select-none group",
                        isSelected
                          ? "bg-primary/5 border-primary text-primary shadow-sm"
                          : "bg-white border-slate-100 hover:border-primary/30 hover:bg-slate-50",
                      )}
                    >
                      <span className="text-sm font-medium leading-tight">
                        {colony}
                      </span>
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
                {filteredColonias.length === 0 && (
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
