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
import Skeleton from "react-loading-skeleton";
import { SkeletonSearch } from "./SkeletonSearch";

interface SearchAndSortProps {
  onLocationSearch?: () => void;
  onFocus?: () => void;
}

export function SearchAndSort({
  onLocationSearch,
  onFocus,
}: SearchAndSortProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Store ────────────────────────────────────
  const estados = useEstadoMexico();
  const selectedColonias = useSelectedColonias();
  const selectedMunicipios = useSelectedMunicipios();
  const { toggleEstado, toggleColonia, toggleMunicipio } = useFilterStore();

  // ── Search ───────────────────────────────────
  const { suggestions, loading, hasMore, search, loadMore, clear } =
    useLocationSearch();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // ── Infinite Scroll Observer ───────────────
  useEffect(() => {
    if (!hasMore || loading || !open) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, open, loadMore]);

  // ── Handlers ────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim().length >= 2) {
      search(val.replace(/,/g, ""));
      if (!open) setOpen(true);
    } else {
      clear();
      if (val === "") setOpen(false);
    }
  };

  const applySelection = (s: LocationSuggestion) => {
    const { tipo, nombre, municipio_nombre, estado_nombre } = s;

    if (tipo === "estado") {
      toggleEstado(nombre);
    } else if (tipo === "municipio") {
      // Ensure parent estado is added if not already present
      if (estado_nombre && !estados.includes(estado_nombre)) {
        toggleEstado(estado_nombre);
      }
      toggleMunicipio(nombre);
    } else {
      // Colonia
      if (estado_nombre && !estados.includes(estado_nombre)) {
        toggleEstado(estado_nombre);
      }
      toggleColonia(nombre, municipio_nombre);
    }

    // Mantenemos el input intacto para que no desaparezca la lista y se cierre el popover
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (s: LocationSuggestion) => {
    applySelection(s);
  };

  const handleClearAll = () => {
    // Clear all estados
    useFilterStore.setState({ estadoMexico: [], colonias: [], municipios: [] });
    setInputValue("");
    clear();
    setOpen(false);
  };

  const hasValue = inputValue.trim().length > 0;
  const hasSuggestions = suggestions.length > 0;
  const hasActiveFilter =
    estados.length > 0 ||
    selectedColonias.length > 0 ||
    selectedMunicipios.length > 0;

  // Count of active location selections
  const selectionCount =
    estados.length + selectedColonias.length + selectedMunicipios.length;

  // Placeholder text
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
              {(hasValue || hasActiveFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputValue("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
              {/* GPS button */}
              {onLocationSearch && !hasValue && !hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLocationSearch();
                  }}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                  title="Usar mi ubicación"
                >
                  <MapPin className="h-4 w-4 text-primary" />
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
                  const isEstado = s.tipo === "estado";

                  // Check if this suggestion is already selected
                  const keyColonia = s.municipio_nombre
                    ? `${s.nombre} (${s.municipio_nombre})`
                    : `${s.nombre},`;
                  const isAlreadySelected = isColonia
                    ? selectedColonias.includes(keyColonia)
                    : isMunicipio
                      ? selectedMunicipios.includes(s.nombre)
                      : estados.includes(s.nombre);

                  // Subtitle: colonia: municipio, estado / municipio: estado / estado: nothing
                  const subtitle = isEstado
                    ? null
                    : isMunicipio
                      ? `, ${s.estado_nombre}`
                      : [`, ${s.municipio_nombre}, ${s.estado_nombre}`]
                          .filter(Boolean)
                          .join(", ");

                  return (
                    <CommandItem
                      key={`loc-${s.tipo}-${s.id}-${idx}`}
                      value={`loc-${s.tipo}-${s.id}-${s.nombre}`}
                      onSelect={() => handleSelectSuggestion(s)}
                      onMouseDown={(e) => {
                        // Previene que el click robe el foco del input y cierre el Popover espontáneamente
                        e.preventDefault();
                      }}
                      className="cursor-pointer mx-1 my-0.5 rounded-lg hover:bg-primary/5 transition-colors py-3 px-3 flex items-center gap-3 group"
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors ${isAlreadySelected ? "bg-primary/10" : "bg-slate-100 group-hover:bg-primary/10"}`}
                      >
                        {isAlreadySelected ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-primary"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          getIconForType(s.tipo)
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex  min-w-0 flex-1">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {s.nombre}
                        </span>
                        {subtitle && (
                          <span className="text-sm font-semibold text-slate-500/90 truncate">
                            {subtitle}
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

                {/* Sentinel for infinite scroll */}
                {hasMore && (
                  <div ref={loadMoreRef}>
                    {Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <SkeletonSearch key={i} />
                      ))}
                  </div>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
