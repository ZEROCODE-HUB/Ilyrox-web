import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X, Building2, Map } from "lucide-react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useState, useRef, useEffect } from "react";

import {
  useFilterStore,
  useEstadoMexico,
  useColonias as useSelectedColonias,
  useMunicipios as useSelectedMunicipios,
} from "@/stores/useFilterStore";
import {
  useLocationSearch,
  type LocationSuggestion,
} from "@/hooks/locations/useLocationSearch";
import { resolvePlace } from "@/lib/geocoding";
import { SkeletonSearch } from "./SkeletonSearch";

interface SearchAndSortProps {
  onFocus?: () => void;
}

export function SearchAndSort({ onFocus }: SearchAndSortProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Store ────────────────────────────────────
  const estados = useEstadoMexico();
  const selectedColonias = useSelectedColonias();
  const selectedMunicipios = useSelectedMunicipios();
  const { toggleEstado, toggleColonia, toggleMunicipio } = useFilterStore();

  // ── Search (Google Places) ───────────────────
  const { suggestions, loading, search, clear, getSessionToken } =
    useLocationSearch();

  // ── Handlers ────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim().length >= 2) {
      search(val);
      if (!open) setOpen(true);
    } else {
      clear();
      if (val === "") setOpen(false);
    }
  };

  // La selección resuelve el lugar (Google Place Details) para obtener
  // estado/municipio/colonia y aplicar el filtro por nombres.
  const handleSelectSuggestion = async (s: LocationSuggestion) => {
    const resolved = await resolvePlace(s.placeId, s.tipo, getSessionToken());
    if (!resolved) return;

    const { tipo, estado, municipio, colonia } = resolved;
    if (tipo === "estado") {
      if (estado) toggleEstado(estado);
    } else if (tipo === "municipio") {
      if (municipio) toggleMunicipio(municipio);
    } else if (colonia) {
      toggleColonia(colonia, municipio || undefined);
    }

    // Limpiar el input para una nueva búsqueda; mantener el foco.
    setInputValue("");
    clear();
    setOpen(false);
    inputRef.current?.focus();
  };

  const hasValue = inputValue.trim().length > 0;
  const hasSuggestions = suggestions.length > 0;
  const hasActiveFilter =
    estados.length > 0 ||
    selectedColonias.length > 0 ||
    selectedMunicipios.length > 0;

  const selectionCount =
    estados.length + selectedColonias.length + selectedMunicipios.length;

  const placeholderText = hasActiveFilter
    ? `${selectionCount} zona${selectionCount !== 1 ? "s" : ""} seleccionada${selectionCount !== 1 ? "s" : ""} · Buscar otra...`
    : "Busca por colonia, municipio o estado...";

  const getIconForType = (tipo: LocationSuggestion["tipo"]) => {
    if (tipo === "estado")
      return (
        <Map className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
      );
    if (tipo === "municipio")
      return (
        <Building2 className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
      );
    return (
      <MapPin className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
    );
  };

  return (
    <div className="flex flex-col w-full max-w-2xl gap-2">
      <div className="relative w-full">
        <Popover
          open={open && (hasSuggestions || loading)}
          onOpenChange={setOpen}
        >
          <PopoverAnchor asChild>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder={placeholderText}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                  if (inputValue.trim().length >= 2) setOpen(true);
                  if (onFocus) onFocus();
                }}
                className="pl-10 pr-12 bg-white w-full shadow-sm rounded-full h-11 border-slate-200 focus:border-primary transition-all text-sm font-medium"
              />
              {/* Spinner */}
              {loading && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
              {/* Clear button */}
              {hasValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInputValue("");
                    clear();
                    setOpen(false);
                  }}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          </PopoverAnchor>

          <PopoverContent
            className="p-0 border-slate-200 shadow-xl rounded-xl overflow-hidden mt-1"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <Command className="max-h-[420px]">
              <CommandList className="max-h-none overflow-y-auto">
                {loading && suggestions.length === 0 && (
                  <>
                    {Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <SkeletonSearch key={i} />
                      ))}
                  </>
                )}

                {!loading &&
                  suggestions.length === 0 &&
                  inputValue.length >= 2 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No se encontraron resultados para "{inputValue}"
                    </div>
                  )}

                {suggestions.map((s, idx) => {
                  const isColonia = s.tipo === "colonia";
                  const isMunicipio = s.tipo === "municipio";

                  return (
                    <CommandItem
                      key={`loc-${s.placeId}-${idx}`}
                      value={`loc-${s.placeId}-${s.nombre}`}
                      onSelect={() => handleSelectSuggestion(s)}
                      onMouseDown={(e) => {
                        // Evita que el click robe el foco y cierre el Popover
                        e.preventDefault();
                      }}
                      className="cursor-pointer mx-1 my-0.5 rounded-lg hover:bg-primary/5 transition-colors py-3 px-3 flex items-center gap-3 group"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors bg-slate-100 group-hover:bg-primary/10">
                        {getIconForType(s.tipo)}
                      </div>

                      {/* Text */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {s.nombre}
                        </span>
                        {s.secondaryText && (
                          <span className="text-xs font-medium text-slate-500/90 truncate">
                            {s.secondaryText}
                          </span>
                        )}
                      </div>

                      {/* Type pill */}
                      <span
                        className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isColonia
                            ? "bg-blue-50 text-blue-500"
                            : isMunicipio
                              ? "bg-amber-50 text-amber-600"
                              : "bg-green-50 text-green-600"
                        }`}
                      >
                        {isColonia
                          ? "Colonia"
                          : isMunicipio
                            ? "Municipio"
                            : "Estado"}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
