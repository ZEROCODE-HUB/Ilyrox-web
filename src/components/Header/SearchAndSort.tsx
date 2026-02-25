import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Check, X, MapPinned } from "lucide-react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useState, useMemo } from "react";
import { ESTADOS_MEXICO } from "@/constants/MexLocations/estados";
import { MUNICIPIOS_ESTADO } from "@/constants/MexLocations/municipios";
import { COLONIAS_POR_MUNICIPIO } from "@/constants/MexLocations/colonias";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  useFilterStore,
  useEstadoMexico,
  useColonias,
  useSearchTerm,
} from "@/stores/useFilterStore";

interface SearchAndSortProps {
  onLocationSearch?: () => void;
  onFocus?: () => void;
}

export function SearchAndSort({
  onLocationSearch,
  onFocus,
}: SearchAndSortProps) {
  const [open, setOpen] = useState(false);

  // ── Store state (granular selectors) ────────
  const estadoMexico = useEstadoMexico();
  const selectedColonias = useColonias();
  const searchTerm = useSearchTerm();

  const { setSearchTerm, setEstadoMexico } = useFilterStore();

  // ── Derived Data ────────────────────────────

  // States filtered by search term
  const filteredStates = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return ESTADOS_MEXICO.slice(0, 5);
    return ESTADOS_MEXICO.filter((state) =>
      state.toLowerCase().includes(term),
    ).slice(0, 5);
  }, [searchTerm]);

  // ── Handlers ────────────────────────────────

  const handleSelectState = (state: string) => {
    setEstadoMexico(state);
    setSearchTerm(""); // Clear search term when state is selected
    setOpen(false); // Close popover after selecting state
  };

  const handleClearAll = () => {
    setEstadoMexico("");
    setSearchTerm("");
    setOpen(false);
  };

  const hasResults = filteredStates.length > 0;

  return (
    <div className="flex flex-col w-full max-w-2xl gap-2">
      <div className="relative w-full">
        <Popover
          open={open && (hasResults || !!searchTerm)}
          onOpenChange={setOpen}
        >
          <PopoverAnchor asChild>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Busca por Estado..."
                value={searchTerm || estadoMexico || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  // If user clears the input, clear the state filter too
                  if (val === "") {
                    setEstadoMexico("");
                  }
                  if (!open) setOpen(true);
                }}
                onFocus={() => {
                  setOpen(true);
                  if (onFocus) onFocus();
                }}
                onClick={() => {
                  if (!open) setOpen(true);
                }}
                className="pl-10 pr-12 bg-white w-full shadow-sm rounded-full h-11 border-slate-200 focus:border-primary transition-all text-sm font-medium"
              />
              {(onLocationSearch || estadoMexico || searchTerm) && (
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {(estadoMexico || searchTerm) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm("");
                        setEstadoMexico("");
                        setOpen(false);
                      }}
                      className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  {onLocationSearch && !searchTerm && !estadoMexico && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLocationSearch();
                      }}
                      className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                      title="Usar mi ubicación"
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </PopoverAnchor>
          <PopoverContent
            className="p-0 border-slate-200 shadow-xl rounded-xl overflow-hidden mt-1"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <Command className="max-h-[450px]">
              <CommandList className="max-h-none overflow-y-auto">
                {/* States SECTION (only if no state selected or searching for another) */}
                {(!estadoMexico ||
                  (searchTerm && filteredStates.length > 0)) && (
                  <>
                    <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-slate-50/50">
                      Estados
                    </div>
                    {filteredStates.map((state) => (
                      <CommandItem
                        key={state}
                        value={`state-${state}`}
                        onSelect={() => handleSelectState(state)}
                        className="cursor-pointer mx-1 my-0.5 rounded-lg hover:bg-primary/5 transition-colors py-2.5 px-3 flex items-center justify-between group"
                      >
                        <div className="flex items-center">
                          <MapPin className="mr-3 h-4 w-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                          <span className="text-sm font-medium">{state}</span>
                        </div>
                        {estadoMexico === state && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </>
                )}

                {filteredStates.length === 0 && searchTerm && !estadoMexico && (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No se encontraron estados
                  </div>
                )}

                {/* Colonies SECTION (only if state selected) */}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
