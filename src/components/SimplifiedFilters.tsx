import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Building2, Factory, Save, Sprout } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MUNICIPIOS_ESTADO } from "@/constants/MexLocations/municipios";
import { COLONIAS_POR_MUNICIPIO } from "@/constants/MexLocations/colonias";
import { useSaveSearch } from "@/hooks/useSaveSearch";
import { useAuth } from "@/contexts/AuthContext";
import { sileo } from "sileo";
import { cn } from "@/lib/utils";

import {
  useFilterStore,
  useEstadoMexico,
  useColonias,
  usePriceRange,
  useOperationType,
  usePropertyType,
  useFeatures,
  useAreaFilters,
} from "@/stores/useFilterStore";

// ──────────────────────────────────────────────
// Static data
// ──────────────────────────────────────────────

const subtiposPorTipo: Record<string, { value: string; label: string }[]> = {
  habitacional: [
    { value: "Casa (Fracc. Abierto)", label: "Casa (Fracc. Abierto)" },
    { value: "Casa en Condominio", label: "Casa en Condominio" },
    { value: "Casa de campo/Descanso", label: "Casa de Campo/Descanso" },
    { value: "Departamento", label: "Departamentos" },
    { value: "Quinta", label: "Quinta" },
    { value: "Rancho", label: "Rancho" },
    { value: "Terreno", label: "Terreno" },
    { value: "Villa", label: "Villa" },
  ],
  comercial: [
    { value: "Bodega Comercial", label: "Bodega Comercial" },
    {
      value: "Casa con uso de suelo comercial",
      label: "Casa con Uso de Suelo Comercial",
    },
    { value: "Edificio", label: "Edificio" },
    { value: "Huerta", label: "Huerta" },
    { value: "Local comercial", label: "Local Comercial" },
    { value: "Local en centro comercial", label: "Local en Centro Comercial" },
    { value: "Oficina", label: "Oficina" },
    { value: "Terreno Comercial", label: "Terreno Comercial" },
  ],
  industrial: [
    { value: "Bodega Industrial", label: "Bodega Industrial" },
    { value: "Nave Industrial", label: "Nave Industrial" },
    { value: "Terreno Industrial", label: "Terreno Industrial" },
  ],
  agricola: [
    { value: "Rancho agrícola", label: "Rancho" },
    { value: "Terreno Agrícola", label: "Terreno Agrícola" },
    { value: "Granja", label: "Granja" },
    { value: "Invernadero", label: "Invernadero" },
  ],
};

const propertyTypes = [
  {
    value: "habitacional",
    label: "Habitacional",
    icon: <Home className="w-5 h-5" />,
  },
  {
    value: "comercial",
    label: "Comercial",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    value: "industrial",
    label: "Industrial",
    icon: <Factory className="w-5 h-5" />,
  },
  {
    value: "agricola",
    label: "Agrícola",
    icon: <Sprout className="w-5 h-5" />,
  },
];

// ──────────────────────────────────────────────
// Props (kept minimal for backward compatibility)
// ──────────────────────────────────────────────

interface SimplifiedFiltersProps {
  onApplyFilters?: () => void;
  onCancel?: () => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function SimplifiedFilters({
  onApplyFilters,
  onCancel,
}: SimplifiedFiltersProps) {
  const { user } = useAuth();
  const { handleSaveSearch } = useSaveSearch(user?.id);

  // ── Granular store selectors ────────────────
  const estadoMexico = useEstadoMexico();
  const colonias = useColonias();
  const { priceMin, priceMax, currency } = usePriceRange();
  const operationType = useOperationType();
  const { type, subtype } = usePropertyType();
  const { bedrooms, bathrooms, parking, levels } = useFeatures();
  const { landAreaMin, constructionAreaMin } = useAreaFilters();

  // ── Store actions (stable references) ───────
  const {
    setEstadoMexico,
    setPriceMin,
    setPriceMax,
    setCurrency,
    setOperationType,
    setType,
    setSubtype,
    setBedrooms,
    setBathrooms,
    setParking,
    setLevels,
    setLandAreaMin,
    setConstructionAreaMin,
    resetFilters,
  } = useFilterStore();

  // ── Local UI state ──────────────────────────
  const [coloniaSearch, setColoniaSearch] = useState("");

  // ── Derived data ────────────────────────────
  const availableColonias = useMemo(() => {
    if (!estadoMexico) return [];
    const municipios = MUNICIPIOS_ESTADO[estadoMexico] || [];
    const allCols: string[] = [];
    municipios.forEach((muni) => {
      const cols = COLONIAS_POR_MUNICIPIO[muni] || [];
      allCols.push(...cols);
    });
    return Array.from(new Set(allCols)).sort();
  }, [estadoMexico]);

  const filteredColonias = useMemo(() => {
    if (!coloniaSearch) return availableColonias;
    return availableColonias.filter((c) =>
      c.toLowerCase().includes(coloniaSearch.toLowerCase()),
    );
  }, [availableColonias, coloniaSearch]);

  const subtiposDisponibles = type ? subtiposPorTipo[type] || [] : [];
  const hasPropertyTypeSelected = !!type;

  // ── Handlers ────────────────────────────────
  const handleEstadoChange = (estado: string) => {
    setEstadoMexico(estado);
    setColoniaSearch("");
  };

  const handlePriceMinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setPriceMin(numericValue ? parseInt(numericValue) : undefined);
  };

  const handlePriceMaxChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setPriceMax(numericValue ? parseInt(numericValue) : undefined);
  };

  const handleCurrencyChange = (newCurrency: "MXN" | "USD") => {
    setCurrency(newCurrency);
  };

  const formatCurrencyValue = (value: number | undefined) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleClearAll = () => {
    resetFilters();
    setColoniaSearch("");
  };

  const onSaveClick = async () => {
    if (!user) {
      sileo.error({ title: "Debes iniciar sesión para guardar tu búsqueda" });
      return;
    }

    const success = await handleSaveSearch(
      {
        operacion: operationType,
        tipoPropiedad: type,
        subtipo: subtype,
        precioMin: priceMin,
        precioMax: priceMax,
        moneda: currency,
        habitaciones: bedrooms,
        banos: bathrooms,
        estacionamientos: parking,
        niveles: levels,
        m2TerrenoMin: landAreaMin,
        m2ConstruccionMin: constructionAreaMin,
        locationFilter: {
          estado: estadoMexico,
          municipio: "",
          colonias: colonias,
        },
      },
      () => {},
    );

    if (success) {
      sileo.success({ title: "Búsqueda guardada con éxito" });
    }
  };
  // ── Render ──────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-7 px-5 py-5 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="font-bold text-lg text-foreground">
            Filtros Avanzados
          </h3>
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-primary hover:underline transition-colors"
          >
            Limpiar todo
          </button>
        </div>

        {/* Tipo de Operación */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Tipo de Operación
          </Label>
          <div className="flex gap-2">
            {(
              [
                { value: "todas", label: "Todas" },
                { value: "venta", label: "Venta" },
                { value: "renta", label: "Renta" },
              ] as const
            ).map((option) => {
              const isSelected = operationType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOperationType(option.value)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? "border-2 border-primary text-foreground bg-primary/5"
                      : "border border-input text-muted-foreground bg-background hover:border-primary/50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rango de Precio */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground">
              Rango de Precio
            </Label>
            <div className="flex rounded-lg border border-input overflow-hidden">
              {(["MXN", "USD"] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-3 py-1 text-xs font-medium transition-all ${
                    currency === curr
                      ? "bg-primary/10 text-primary"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  } ${curr === "MXN" ? "border-r border-input" : ""}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Mínimo ({currency})
              </Label>
              <Input
                type="text"
                placeholder="0"
                value={priceMin ? formatCurrencyValue(priceMin) : ""}
                onChange={(e) => handlePriceMinChange(e.target.value)}
                className="h-11 bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Máximo ({currency})
              </Label>
              <Input
                type="text"
                placeholder="Sin límite"
                value={priceMax ? formatCurrencyValue(priceMax) : ""}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
                className="h-11 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Ubicación
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-foreground">
            Ubicación
          </Label>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase">
              Estado
            </Label>
            <Select value={estadoMexico} onValueChange={handleEstadoChange}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {ESTADOS_MEXICO.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

         
          {estadoMexico && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Colonias en {estadoMexico} ({availableColonias.length} disponibles)
                </Label>
                {colonias.length > 0 && (
                  <button
                    onClick={() => setColonias([])}
                    className="text-[10px] text-primary hover:underline font-medium"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>

              
              {colonias.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {colonias.map((col) => (
                    <Badge
                      key={col}
                      variant="default"
                      className="flex items-center gap-1 bg-primary text-white border-primary px-3 py-1.5 rounded-full text-xs font-medium shadow-sm cursor-pointer hover:bg-primary/90 transition-all"
                    >
                      {col}
                      <X
                        className="h-3 w-3 ml-0.5 hover:opacity-70"
                        onClick={() => removeColonia(col)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filtrar colonias..."
                  value={coloniaSearch}
                  onChange={(e) => setColoniaSearch(e.target.value)}
                  className="pl-9 h-10 text-sm"
                />
                {coloniaSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setColoniaSearch("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-100 rounded-full"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>

              
              <ScrollArea className="h-52 w-full rounded-lg border bg-white/50">
                <div className="flex flex-wrap gap-2 p-3">
                  {filteredColonias.map((colonia) => {
                    const isSelected = colonias.includes(colonia);
                    return (
                      <Badge
                        key={colonia}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer px-3 py-1.5 rounded-full text-xs transition-all border font-medium select-none",
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm scale-[1.02]"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-primary/5 hover:border-primary/40 hover:text-primary",
                        )}
                        onClick={() => toggleColonia(colonia)}
                      >
                        {isSelected && <Check className="h-3 w-3 mr-1" />}
                        {colonia}
                      </Badge>
                    );
                  })}
                  {filteredColonias.length === 0 && (
                    <div className="w-full text-center py-6 text-sm text-muted-foreground">
                      No se encontraron colonias
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {!estadoMexico && (
            <div className="p-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/30 text-center">
              <Label className="text-sm font-medium text-slate-600">
                Selecciona un Estado para ver colonias disponibles
              </Label>
            </div>
          )}
        </div> */}

        {/* Tipo de Propiedad */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-foreground">
            Tipo de Propiedad
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {propertyTypes.map((pt) => {
              const isSelected = type === pt.value;
              return (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setType(isSelected ? undefined : pt.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl text-sm font-medium transition-all border-2 ${
                    isSelected
                      ? "border-primary text-foreground bg-primary/5"
                      : "border-input text-muted-foreground bg-background hover:border-primary/50"
                  }`}
                >
                  <span className="mb-2">{pt.icon}</span>
                  <span>{pt.label}</span>
                </button>
              );
            })}
          </div>

          {type && subtiposDisponibles.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Subtipo
              </Label>
              <Select
                value={subtype || ""}
                onValueChange={(val) => setSubtype(val)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecciona un subtipo" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {subtiposDisponibles.map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>
                      {sub.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Características */}
        {hasPropertyTypeSelected && (
          <div className="space-y-5 pt-2">
            <Label className="text-sm font-semibold text-foreground">
              Características
            </Label>

            <div className="grid grid-cols-2 gap-4">
              {/* Recámaras */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Recámaras
                </Label>
                <Select
                  value={bedrooms?.toString() || "any"}
                  onValueChange={(val) =>
                    setBedrooms(val === "any" ? undefined : parseInt(val))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquiera</SelectItem>
                    {["1", "2", "3", "4", "5"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                        {n === "5" ? "+" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Baños */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Baños
                </Label>
                <Select
                  value={bathrooms?.toString() || "any"}
                  onValueChange={(val) =>
                    setBathrooms(val === "any" ? undefined : parseInt(val))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquiera</SelectItem>
                    {["1", "2", "3", "4", "5"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                        {n === "5" ? "+" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estacionamiento */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Estacionamiento
                </Label>
                <Select
                  value={parking?.toString() || "any"}
                  onValueChange={(val) =>
                    setParking(val === "any" ? undefined : parseInt(val))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquiera</SelectItem>
                    {["1", "2", "3", "4"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                        {n === "4" ? "+" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Niveles */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Niveles
                </Label>
                <Select
                  value={levels?.toString() || "any"}
                  onValueChange={(val) =>
                    setLevels(val === "any" ? undefined : parseInt(val))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquiera</SelectItem>
                    {["1", "2", "3", "4"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                        {n === "4" ? "+" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* m² Terreno y Construcción */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  m² Terreno Mín.
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={landAreaMin || ""}
                  onChange={(e) =>
                    setLandAreaMin(parseInt(e.target.value) || undefined)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  m² Constr. Mín.
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={constructionAreaMin || ""}
                  onChange={(e) =>
                    setConstructionAreaMin(
                      parseInt(e.target.value) || undefined,
                    )
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botón Guardar */}
        <div className="pt-4">
          <Button
            className="w-full h-12 bg-white hover:bg-slate-50 text-foreground border border-input shadow-sm transition-all"
            variant="outline"
            onClick={onSaveClick}
          >
            <Save className="w-5 h-5 mr-3" />
            Guardar búsqueda
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-slate-50/50 p-4 sticky bottom-0 z-10">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-12 bg-white shadow-sm font-semibold"
          >
            Cerrar
          </Button>
          <Button
            onClick={onApplyFilters}
            className="h-12 bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-95 font-semibold"
          >
            Ver Resultados
          </Button>
        </div>
      </div>
    </div>
  );
}
