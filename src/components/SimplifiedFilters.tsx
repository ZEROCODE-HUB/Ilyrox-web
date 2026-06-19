import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Home,
  Building2,
  Factory,
  Sprout,
  Bookmark,
  Store,
} from "lucide-react";
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
import { MarqueeText } from "@/components/ui/marquee-text";
import { resetNumber } from "@/utils/resetNumber";
import {
  PROPERTY_TYPES,
  getCamposVisibles,
  AMENIDADES,
} from "@/constants/propertyData";
import { TypeSpecificFilters } from "@/components/filters/TypeSpecificFilters";

import {
  useFilterStore,
  useEstadoMexico,
  useColonias,
  useMunicipios,
  usePriceRange,
  useOperationType,
  usePropertyType,
  useFeatures,
  useAreaFilters,
} from "@/stores/useFilterStore";

// ──────────────────────────────────────────────
// Static data
// ──────────────────────────────────────────────

// Subtipos derivados del catálogo real (alineado con el móvil y los datos en BD)
const subtiposPorTipo: Record<string, { value: string; label: string }[]> =
  Object.fromEntries(
    Object.entries(PROPERTY_TYPES).map(([tipo, subs]) => [
      tipo,
      (subs as readonly string[]).map((s) => ({ value: s, label: s })),
    ]),
  );

const propertyTypes = [
  {
    value: "habitacional",
    label: "Habitacional",
    icon: <Home className="w-5 h-5" />,
  },
  {
    value: "comercial",
    label: "Comercial",
    icon: <Store className="w-5 h-5" />,
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
  const municipios = useMunicipios();
  const { priceMin, priceMax, currency } = usePriceRange();
  const operationType = useOperationType();
  const { type, subtype } = usePropertyType();
  const { bedrooms, bathrooms, parking, levels } = useFeatures();
  const { landAreaMin, constructionAreaMin, landAreaMax, constructionAreaMax } =
    useAreaFilters();
  const antiguedad = useFilterStore((s) => s.antiguedad);
  const amenidades = useFilterStore((s) => s.amenidades);
  const comisionVentaMin = useFilterStore((s) => s.comisionVentaMin);
  const comisionRentaMin = useFilterStore((s) => s.comisionRentaMin);
  const anchoTerrenoMin = useFilterStore((s) => s.anchoTerrenoMin);
  const largoTerrenoMin = useFilterStore((s) => s.largoTerrenoMin);

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
    setLandAreaMax,
    setConstructionAreaMax,
    setAntiguedad,
    setComisionVentaMin,
    setComisionRentaMin,
    toggleAmenidad,
    setAnchoTerrenoMin,
    setLargoTerrenoMin,
    toggleSubtype,
    resetFilters,
  } = useFilterStore();

  // ── Local UI state ──────────────────────────
  const [coloniaSearch, setColoniaSearch] = useState("");

  // ── Derived data ────────────────────────────
  const availableColonias = useMemo(() => {
    if (!estadoMexico || estadoMexico.length === 0) return [];
    const allCols: string[] = [];
    estadoMexico.forEach((est) => {
      const munis = MUNICIPIOS_ESTADO[est] || [];
      munis.forEach((muni) => {
        const cols = COLONIAS_POR_MUNICIPIO[muni] || [];
        allCols.push(...cols);
      });
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
  // Visibilidad de campos según tipo/subtipo (misma lógica que el móvil)
  const cv = getCamposVisibles(subtype, type);

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

    if (!estadoMexico || estadoMexico.length === 0) {
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
        niveles: levels,
        m2TerrenoMin: landAreaMin,
        m2TerrenoMax: landAreaMax,
        m2ConstruccionMin: constructionAreaMin,
        m2ConstruccionMax: constructionAreaMax,
        locationFilter: {
          estado: estadoMexico,
          municipio: municipios,
          colonias: colonias,
        },
      },
      () => {},
    );

    if (success) {
      toast({
        title: "Búsqueda guardada con éxito",
        position: "bottom-left",
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

        {/* Comisión mínima (sliders, igual que el móvil) */}
        <div className="space-y-5">
          <Label className="text-sm font-semibold text-foreground">
            Comisión mínima
          </Label>

          {operationType !== "renta" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  Venta
                </Label>
                <span className="text-sm font-bold text-primary">
                  {comisionVentaMin ? `${comisionVentaMin}%` : "Cualquiera"}
                </span>
              </div>
              <Slider
                value={[comisionVentaMin ?? 0]}
                onValueChange={([v]) =>
                  setComisionVentaMin(v === 0 ? undefined : v)
                }
                min={0}
                max={10}
                step={0.5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Cualquiera</span>
                <span>10%</span>
              </div>
            </div>
          )}

          {operationType !== "venta" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  Renta
                </Label>
                <span className="text-sm font-bold text-primary">
                  {comisionRentaMin
                    ? `${comisionRentaMin} ${comisionRentaMin === 1 ? "mes" : "meses"}`
                    : "Cualquiera"}
                </span>
              </div>
              <Slider
                value={[comisionRentaMin ?? 0]}
                onValueChange={([v]) =>
                  setComisionRentaMin(v === 0 ? undefined : v)
                }
                min={0}
                max={3}
                step={0.5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Cualquiera</span>
                <span>3 meses</span>
              </div>
            </div>
          )}
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
                  className={`flex flex-col items-center justify-center p-4 rounded-xl text-sm font-medium transition-all border-2 group overflow-hidden ${
                    isSelected
                      ? "border-primary text-foreground bg-primary/5"
                      : "border-input text-muted-foreground bg-background hover:border-primary/50"
                  }`}
                >
                  <span className="mb-2">{pt.icon}</span>
                  <MarqueeText className="truncate text-center">
                    {pt.label}
                  </MarqueeText>
                </button>
              );
            })}
          </div>

          {type && subtiposDisponibles.length > 0 && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">
                  Subtipos disponibles
                </Label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                  Múltiple
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {subtiposDisponibles.map((sub) => {
                  const isSelected = subtype.includes(sub.value);
                  return (
                    <button
                      key={sub.value}
                      type="button"
                      onClick={() => toggleSubtype(sub.value)}
                      className={cn(
                        "px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between overflow-hidden group",
                        isSelected
                          ? "bg-primary text-white shadow-sm ring-2 ring-primary/20"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted border border-transparent",
                      )}
                    >
                      <MarqueeText className="flex-1 mr-2 text-inherit group-hover/marquee:text-white transition-colors duration-200">
                        {sub.label}
                      </MarqueeText>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white ml-2 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
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
              {cv.recamaras && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {type === "comercial" || type === "industrial"
                    ? "Espacios"
                    : "Recámaras"}
                </Label>
                <Select
                  value={bedrooms || "any"}
                  onValueChange={(val) =>
                    setBedrooms(val === "any" ? undefined : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquiera</SelectItem>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid grid-cols-1 gap-1 border-r pr-2">
                        {["1", "2", "3", "4", "5"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {["1+", "2+", "3+", "4+", "5+"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </div>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              )}

              {/* Baños */}
              {cv.banos && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Baños
                </Label>
                <Select
                  value={bathrooms || "any"}
                  onValueChange={(val) =>
                    setBathrooms(val === "any" ? undefined : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquiera</SelectItem>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid grid-cols-1 gap-1 border-r pr-2">
                        {["1", "2", "3", "4", "5"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {["1+", "2+", "3+", "4+", "5+"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </div>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              )}

              {/* Estacionamiento */}
              {cv.estacionamientos && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Estacionamiento
                </Label>
                <Select
                  value={parking || "any"}
                  onValueChange={(val) =>
                    setParking(val === "any" ? undefined : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquiera</SelectItem>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid grid-cols-1 gap-1 border-r pr-2">
                        {["1", "2", "3", "4", "5"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {["1+", "2+", "3+", "4+", "5+"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </div>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              )}

              {/* Niveles */}
              {cv.niveles && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Niveles
                </Label>
                <Select
                  value={levels || "any"}
                  onValueChange={(val) =>
                    setLevels(val === "any" ? undefined : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquiera</SelectItem>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid grid-cols-1 gap-1 border-r pr-2">
                        {["1", "2", "3", "4", "5"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {["1+", "2+", "3+", "4+", "5+"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </div>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              )}
            </div>

            {/* Antigüedad */}
            {cv.antiguedad && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Antigüedad
                </Label>
                <Select
                  value={antiguedad || "any"}
                  onValueChange={(val) =>
                    setAntiguedad(val === "any" ? undefined : val)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="No indicado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">No indicado</SelectItem>
                    <SelectItem value="0 (Nueva)">Nueva</SelectItem>
                    <SelectItem value="1-5">1-5 años</SelectItem>
                    <SelectItem value="6-10">6-10 años</SelectItem>
                    <SelectItem value="11-20">11-20 años</SelectItem>
                    <SelectItem value="21-50">21-50 años</SelectItem>
                    <SelectItem value="Más de 50">Más de 50 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* m² Terreno y Construcción */}
            <div className="flex flex-row gap-4">
              <div>
                {" "}
                <Label className="text-xs font-medium text-muted-foreground">
                  m² Terreno Mín.
                </Label>
                <Input
                  type="text"
                  placeholder="0"
                  value={landAreaMin || ""}
                  onChange={(e) =>
                    setLandAreaMin(
                      parseInt(resetNumber(e.target.value)) || undefined,
                    )
                  }
                  className="h-10"
                />
              </div>
              <div>
                {" "}
                <Label className="text-xs font-medium text-muted-foreground">
                  m² Terreno Max.
                </Label>
                <Input
                  type="text"
                  placeholder="0"
                  value={landAreaMax || ""}
                  onChange={(e) =>
                    setLandAreaMax(
                      parseInt(resetNumber(e.target.value)) || undefined,
                    )
                  }
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  m² Constr. Mín.
                </Label>
                <Input
                  type="text"
                  placeholder="0"
                  value={constructionAreaMin || ""}
                  onChange={(e) =>
                    setConstructionAreaMin(
                      parseInt(resetNumber(e.target.value)) || undefined,
                    )
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  m² Constr. Max.
                </Label>
                <Input
                  type="text"
                  placeholder="0"
                  value={constructionAreaMax || ""}
                  onChange={(e) =>
                    setConstructionAreaMax(
                      parseInt(resetNumber(e.target.value)) || undefined,
                    )
                  }
                  className="h-10"
                />
              </div>
            </div>

            {/* Frente / Fondo (terrenos) */}
            {cv.frenteFondo && (
              <div className="flex flex-row gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Frente (m) mín.
                  </Label>
                  <Input
                    type="text"
                    placeholder="0"
                    value={anchoTerrenoMin || ""}
                    onChange={(e) =>
                      setAnchoTerrenoMin(
                        parseInt(resetNumber(e.target.value)) || undefined,
                      )
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Fondo (m) mín.
                  </Label>
                  <Input
                    type="text"
                    placeholder="0"
                    value={largoTerrenoMin || ""}
                    onChange={(e) =>
                      setLargoTerrenoMin(
                        parseInt(resetNumber(e.target.value)) || undefined,
                      )
                    }
                    className="h-10"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Amenidades */}
        {hasPropertyTypeSelected && cv.amenidades && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Amenidades
            </Label>
            <div className="flex flex-wrap gap-2">
              {AMENIDADES.map((a) => {
                const active = amenidades.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenidad(a)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted",
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtros especializados por tipo */}
        {hasPropertyTypeSelected && <TypeSpecificFilters type={type} />}

        {/* Botón Guardar */}
        <div className="pt-4">
          <Button
            // 'group' es indispensable aquí para que el MarqueeText detecte el hover del botón
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white border border-input shadow-sm transition-all group overflow-hidden"
            onClick={onSaveClick}
          >
            <div className="flex items-center justify-center w-full max-w-full px-2">
              <Bookmark className="w-5 h-5 mr-3 flex-shrink-0" />

              {/* El contenedor del Marquee debe tener un ancho flexible pero limitado */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <MarqueeText className="font-semibold text-center" speed={12}>
                  Avísame si encuentras algo
                </MarqueeText>
              </div>
            </div>
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
