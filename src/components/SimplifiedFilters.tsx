import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Building2, Factory, Sprout, Bookmark } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
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
  setShowFilters?: (showFilters: boolean) => void;
  onClearAll?: () => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function SimplifiedFilters({
  onApplyFilters,
  onCancel,
  setShowFilters,
  onClearAll,
}: SimplifiedFiltersProps) {
  const { toast } = useToast();
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

  const handlePriceMinChange = (value: string) => {
    // Preserve digits, optional dot, and remove other characters like commas or $
    const cleanValue = value.replace(/[$,\s]/g, "").replace(/[^0-9.]/g, "");
    const numericValue = parseFloat(cleanValue);
    setPriceMin(!isNaN(numericValue) ? Math.floor(numericValue) : undefined);
  };

  const handlePriceMaxChange = (value: string) => {
    const cleanValue = value.replace(/[$,\s]/g, "").replace(/[^0-9.]/g, "");
    const numericValue = parseFloat(cleanValue);
    setPriceMax(!isNaN(numericValue) ? Math.ceil(numericValue) : undefined);
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
    if (onClearAll) onClearAll();
  };

  const onSaveClick = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Iniciar Sesión",
        description: "Debes iniciar sesión para guardar tu búsqueda",
      });
      return;
    }

    if (!type) {
      toast({
        variant: "destructive",
        title: "Información faltante",
        description:
          "Debe seleccionar un tipo de propiedad para guardar la búsqueda.",
      });
      return;
    }

    if (!estadoMexico) {
      toast({
        variant: "destructive",
        title: "Información faltante",
        description: "Debe seleccionar un estado para guardar la búsqueda.",
      });
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
        pisos: levels,
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
      toast({
        title: "Búsqueda guardada con éxito",
      });
    }
  };
  // ── Render ──────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-7 px-5 py-5 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="font-bold text-lg text-foreground">Filtros</h3>
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

          <div className="flex flex-wrap gap-2">
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
          <div className="flex flex-wrap items-center justify-between">
            <Label className="text-sm font-semibold text-foreground ">
              Rango de Precio
            </Label>
            <div className="flex rounded-lg border border-input overflow-hidden">
              {(["USD", "MXN"] as const).map((curr) => (
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
              <Label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="priceMin"
              >
                Mínimo ({currency})
              </Label>
              <Input
                type="text"
                placeholder="0"
                value={priceMin ? formatCurrencyValue(priceMin) : ""}
                onChange={(e) => handlePriceMinChange(e.target.value)}
                className="h-11 bg-background"
                maxLength={15}
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
                maxLength={15}
              />
            </div>
          </div>
        </div>

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
            <Bookmark className="w-5 h-5 mr-3" />
            Guardar búsqueda
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-slate-50/50 p-4 sticky bottom-0 z-10">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters?.(false)}
            className="h-12 bg-white shadow-sm font-semibold"
          >
            Cerrar
          </Button>
          <Button
            onClick={() => {
              onApplyFilters?.();
              setShowFilters?.(false);
            }}
            className="h-12 bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-95 font-semibold"
          >
            <span className="text-wrap"> Ver Resultados</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
