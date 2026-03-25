import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X, Building2, Map } from "lucide-react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { AlertTriangle } from "lucide-react";

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
  const [showStateWarning, setShowStateWarning] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] =
    useState<LocationSuggestion | null>(null);

  // ── Store ────────────────────────────────────
  const estadoMexico = useEstadoMexico();
  const selectedColonias = useSelectedColonias();
  const selectedMunicipios = useSelectedMunicipios();
  const { setEstadoMexico, toggleColonia, toggleMunicipio } = useFilterStore();

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
      search(val);
      if (!open) setOpen(true);
    } else {
      clear();
      if (val === "") setOpen(false);
    }
  };

  const applySelection = (s: LocationSuggestion) => {
    const { tipo, nombre, municipio_nombre, estado_nombre } = s;

    if (tipo === "estado") {
      setEstadoMexico(nombre);
    } else if (tipo === "municipio") {
      if (estado_nombre) setEstadoMexico(estado_nombre);
      toggleMunicipio(nombre);
    } else {
      if (estado_nombre) setEstadoMexico(estado_nombre);
      toggleColonia(nombre, municipio_nombre);
    }

    setInputValue("");
    clear();
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleSelectSuggestion = (s: LocationSuggestion) => {
    const { tipo, nombre, estado_nombre } = s;

    // Si ya hay un estado y el nuevo es distinto, avisar si hay filtros activos
    const newEstado = tipo === "estado" ? nombre : estado_nombre;
    const hasActiveFilters =
      selectedColonias.length > 0 || selectedMunicipios.length > 0;

    if (
      estadoMexico &&
      newEstado &&
      estadoMexico !== newEstado &&
      hasActiveFilters
    ) {
      setPendingSuggestion(s);
      setShowStateWarning(true);
      setOpen(false); // Close suggestions popover
      return;
    }

    applySelection(s);
  };

  const handleClearAll = () => {
    setEstadoMexico("");
    setInputValue("");
    clear();
    setOpen(false);
  };

  const hasValue = inputValue.trim().length > 0;
  const hasSuggestions = suggestions.length > 0;
  const hasActiveFilter =
    estadoMexico !== "" ||
    selectedColonias.length > 0 ||
    selectedMunicipios.length > 0;

  // Count of active location selections
  const selectionCount =
    selectedColonias.length +
    selectedMunicipios.length +
    (estadoMexico &&
    selectedColonias.length === 0 &&
    selectedMunicipios.length === 0
      ? 1
      : 0);

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
                placeholder={
                  hasActiveFilter
                    ? `${estadoMexico} seleccionada · Buscar otra...`
                    : "Busca por colonia, municipio o estado..."
                }
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
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
                  <div className="py-3 px-3 flex items-center gap-3 group">
                    <div className="">
                      <Skeleton className="rounded-full w-9 h-9 ml-1" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton height={12} width="50%" />
                      <Skeleton height={10} width="30%" />
                    </div>
                    <Skeleton
                      height={15}
                      width="10%"
                      className="flex-shrink-0 w-10 px-7 py-1 rounded-full"
                    />
                  </div>
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
                      : estadoMexico === s.nombre;

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
                  <div
                    ref={loadMoreRef}
                    className="py-4 flex flex-col items-center gap-2"
                  >
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Cargando más resultados...
                    </span>
                  </div>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Modal
        isOpen={showStateWarning}
        onClose={() => setShowStateWarning(false)}
        title="Cambiar de Estado"
        size="sm"
        className="z-50"
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-2">
            ¿Quieres buscar en otro estado?
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Al seleccionar una ubicación en{" "}
            <span className="font-bold text-slate-700">
              {pendingSuggestion?.tipo === "estado"
                ? pendingSuggestion.nombre
                : pendingSuggestion?.estado_nombre}
            </span>
            , se borrarán las colonias y municipios de{" "}
            <span className="font-bold text-slate-700">{estadoMexico}</span> que
            tienes seleccionados.
          </p>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setShowStateWarning(false)}
              className="rounded-xl py-6 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (pendingSuggestion) applySelection(pendingSuggestion);
                setShowStateWarning(false);
              }}
              className="rounded-xl py-6 bg-navbar hover:bg-navbar/90 shadow-lg shadow-navbar/20 text-white font-semibold"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
