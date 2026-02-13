import { useState, useEffect } from "react";
import { PropertyFilters as FilterType } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Building2, Factory, FolderOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ESTADOS_MEXICO,
  CIUDADES_POR_ESTADO,
  MUNICIPIOS_POR_CIUDAD,
  COLONIAS_POR_MUNICIPIO,
} from "@/constants/locations";

interface SimplifiedFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
  onCancel?: () => void;
}

// Subtipos por tipo de propiedad (Matching constants/propertyData structure roughly)
const subtiposPorTipo: Record<string, { value: string; label: string }[]> = {
  Habitacional: [
    { value: "Casa (Fracc. Abierto)", label: "Casa (Fracc. Abierto)" },
    { value: "Casa en Condominio", label: "Casa en Condominio" },
    { value: "Casa de campo/Descanso", label: "Casa de Campo/Descanso" },
    { value: "Departamento", label: "Departamentos" },
    { value: "Quinta", label: "Quinta" },
    { value: "Rancho", label: "Rancho" },
    { value: "Terreno", label: "Terreno" },
    { value: "Villa", label: "Villa" },
  ],
  Comercial: [
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
  Industrial: [
    { value: "Bodega Industrial", label: "Bodega Industrial" },
    { value: "Nave Industrial", label: "Nave Industrial" },
    { value: "Terreno Industrial", label: "Terreno Industrial" },
  ],
  Agricola: [
    { value: "Rancho agrícola", label: "Rancho" },
    { value: "Terreno Agrícola", label: "Terreno Agrícola" },
    { value: "Granja", label: "Granja" },
    { value: "Invernadero", label: "Invernadero" },
  ],
};

export function SimplifiedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
  onCancel,
}: SimplifiedFiltersProps) {
  // Local state for UI responsiveness, can sync with props if needed
  // Using props directly for controlled component behavior is better if parent manages state well.
  // But let's use local state for complex forms to avoid stutter if updates are slow,
  // though here updates are likely fast. Let's sync with filters prop.

  const [selectedEstado, setSelectedEstado] = useState<string>(
    filters.state || "",
  );
  const [selectedCiudad, setSelectedCiudad] = useState<string>(""); // Not in filters explicitly but needed for hierarchy
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>(
    filters.municipality || "",
  );
  const [selectedColonia, setSelectedColonia] = useState<string>(
    filters.colony || "",
  );

  const [priceMin, setPriceMin] = useState<string>(
    filters.priceMin?.toString() || "",
  );
  const [priceMax, setPriceMax] = useState<string>(
    filters.priceMax?.toString() || "",
  );

  const [operationType, setOperationType] = useState<
    "todas" | "venta" | "renta"
  >(filters.operationType || "todas");

  const [currency, setCurrency] = useState<"MXN" | "USD">("MXN");

  // Update logic
  // Helper to update parent filters
  const updateFilters = (newFilters: Partial<FilterType>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  // Sync state with props when props change (e.g. Cleared externally)
  useEffect(() => {
    setSelectedEstado(filters.state || "");
    setSelectedMunicipio(filters.municipality || "");
    setSelectedColonia(filters.colony || "");
    setPriceMin(filters.priceMin?.toString() || "");
    setPriceMax(filters.priceMax?.toString() || "");
    setOperationType(filters.operationType || "todas");
    setCurrency(filters.currency || "MXN");
  }, [filters]);

  const handlePriceMinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setPriceMin(numericValue);
    updateFilters({
      priceMin: numericValue ? parseInt(numericValue) : undefined,
    });
  };

  const handlePriceMaxChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setPriceMax(numericValue);
    updateFilters({
      priceMax: numericValue ? parseInt(numericValue) : undefined,
    });
  };

  const handleCurrencyChange = (newCurrency: "MXN" | "USD") => {
    setCurrency(newCurrency);
    updateFilters({ currency: newCurrency });
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const num = parseInt(value);
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Hierarchy Data
  const ciudadesDisponibles = selectedEstado
    ? CIUDADES_POR_ESTADO[selectedEstado] || []
    : [];
  const municipiosDisponibles = selectedCiudad
    ? MUNICIPIOS_POR_CIUDAD[selectedCiudad] || []
    : [];
  const coloniasDisponibles = selectedMunicipio
    ? COLONIAS_POR_MUNICIPIO[selectedMunicipio] || []
    : [];

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
      icon: <FolderOpen className="w-5 h-5" />,
    },
  ];

  const subtiposDisponibles = filters.type
    ? subtiposPorTipo[filters.type] || []
    : [];

  const hasPropertyTypeSelected = !!filters.type;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 px-5 py-5 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="font-bold text-lg text-foreground">Filtros</h3>
          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-info hover:text-info/80 hover:underline transition-colors"
          >
            Limpiar todo
          </button>
        </div>

        {/* Tipo de Operación */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tipo de Operación
          </Label>
          <div className="flex gap-2">
            {[
              { value: "todas", label: "Todas" },
              { value: "venta", label: "Venta" },
              { value: "renta", label: "Renta" },
            ].map((option) => {
              const isSelected = operationType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const val = option.value as "todas" | "venta" | "renta";
                    setOperationType(val);
                    updateFilters({ operationType: val });
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? "border-2 border-primary text-foreground bg-background"
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
              <button
                type="button"
                onClick={() => handleCurrencyChange("MXN")}
                className={`px-3 py-1 text-xs font-medium transition-all ${
                  currency === "MXN"
                    ? "bg-primary/10 text-primary border-r border-input"
                    : "bg-background text-muted-foreground hover:bg-muted border-r border-input"
                }`}
              >
                MXN
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange("USD")}
                className={`px-3 py-1 text-xs font-medium transition-all ${
                  currency === "USD"
                    ? "bg-primary/10 text-primary"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                USD
              </button>
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
                value={priceMin ? formatCurrency(priceMin) : ""}
                onChange={(e) => handlePriceMinChange(e.target.value)}
                className="h-11 bg-background border-input text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Máximo ({currency})
              </Label>
              <Input
                type="text"
                placeholder="Sin límite"
                value={priceMax ? formatCurrency(priceMax) : ""}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
                className="h-11 bg-background border-input text-sm"
              />
            </div>
          </div>
        </div>

        {/* Ubicación - Cascading Dropdowns */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-foreground">
            Ubicación
          </Label>

          {/* Estado */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Estado <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedEstado}
              onValueChange={(value) => {
                setSelectedEstado(value);
                setSelectedCiudad("");
                setSelectedMunicipio("");
                setSelectedColonia("");
                // Update filters
                updateFilters({
                  state: value,
                  municipality: undefined,
                  colony: undefined,
                });
              }}
            >
              <SelectTrigger className="h-11 bg-background border-input">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                {ESTADOS_MEXICO.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ciudad - visible when Estado is selected */}
          {selectedEstado && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Ciudad <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCiudad}
                onValueChange={(value) => {
                  setSelectedCiudad(value);
                  setSelectedMunicipio("");
                  setSelectedColonia("");
                  // Note: 'city' is not in standard filters but useful for drilldown.
                  // We don't filter by city usually if we have municipality
                }}
              >
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {ciudadesDisponibles.map((ciudad) => (
                    <SelectItem key={ciudad} value={ciudad}>
                      {ciudad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Municipio - visible when Ciudad is selected */}
          {selectedCiudad && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Municipio <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedMunicipio}
                onValueChange={(value) => {
                  setSelectedMunicipio(value);
                  setSelectedColonia("");
                  updateFilters({ municipality: value, colony: undefined });
                }}
              >
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder="Selecciona un municipio" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {municipiosDisponibles.map((municipio) => (
                    <SelectItem key={municipio} value={municipio}>
                      {municipio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Colonia - visible when Municipio is selected */}
          {selectedMunicipio && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Colonia
              </Label>
              <Select
                value={selectedColonia}
                onValueChange={(value) => {
                  setSelectedColonia(value);
                  updateFilters({ colony: value });
                }}
              >
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue
                    placeholder={
                      coloniasDisponibles.length > 0
                        ? "Selecciona una colonia"
                        : "No hay colonias disponibles"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {coloniasDisponibles.length > 0 ? (
                    coloniasDisponibles.map((colonia) => (
                      <SelectItem key={colonia} value={colonia}>
                        {colonia}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No hay colonias disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tipo de Propiedad */}
        <div className="space-y-3 ">
          <Label className="text-sm font-semibold text-foreground">
            Tipo de Propiedad
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {propertyTypes.map((type) => {
              const isSelected = filters.type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    const newType = isSelected ? undefined : type.value;
                    updateFilters({
                      type: newType,
                      subtype: undefined,
                    });
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                    isSelected
                      ? "border-primary text-foreground bg-primary/5"
                      : "border-input text-muted-foreground bg-background hover:border-primary/50"
                  }`}
                >
                  <span className="text-xl mb-1">{type.icon}</span>
                  <span className="text-center leading-tight">
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subtipo - visible when property type is selected */}
          {filters.type && subtiposDisponibles.length > 0 && (
            <div className="space-y-1.5 mt-4">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Subtipo
              </Label>
              <Select
                value={filters.subtype || ""}
                onValueChange={(value) => {
                  updateFilters({ subtype: value });
                }}
              >
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder="Selecciona un subtipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {subtiposDisponibles.map((subtipo) => (
                    <SelectItem key={subtipo.value} value={subtipo.value}>
                      {subtipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Characteristics sections - only visible when property type is selected */}
        {hasPropertyTypeSelected && (
          <>
            <div className="border-t border-border my-2" />
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-foreground">
                Características
              </Label>

              {/* Espacios/Recámaras */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {filters.type === "Comercial" ||
                  filters.type === "Industrial" ||
                  filters.type === "Agricola"
                    ? "Espacios"
                    : "Recámaras"}
                </Label>
                <Select
                  value={filters.bedrooms?.toString() || "any"}
                  onValueChange={(value) =>
                    updateFilters({
                      bedrooms: value === "any" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="h-11 bg-background border-input">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <SelectItem value="any">Cualquiera</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Baños */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Baños
                </Label>
                <Select
                  value={filters.bathrooms?.toString() || "any"}
                  onValueChange={(value) =>
                    updateFilters({
                      bathrooms: value === "any" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="h-11 bg-background border-input">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <SelectItem value="any">Cualquiera</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estacionamiento */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Estacionamiento
              </Label>
              <Select
                value={filters.parking?.toString() || "any"}
                onValueChange={(value) =>
                  updateFilters({
                    parking: value === "any" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="any">Cualquiera</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Niveles */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Niveles
              </Label>
              <Select
                value={filters.levels?.toString() || "any"}
                onValueChange={(value) =>
                  updateFilters({
                    levels: value === "any" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="any">Cualquiera</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Antigüedad */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Antigüedad
              </Label>
              <Select
                value={filters.age?.toString() || "any"}
                onValueChange={(value) =>
                  updateFilters({ age: value === "any" ? undefined : value })
                }
              >
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="any">Cualquiera</SelectItem>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="1-5">1-5 años</SelectItem>
                  <SelectItem value="6-10">6-10 años</SelectItem>
                  <SelectItem value="11-20">11-20 años</SelectItem>
                  <SelectItem value="20+">Más de 20 años</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* m² Terreno y Construcción */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  m² Terreno Mín.
                </Label>
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.landAreaMin || ""}
                  onChange={(e) =>
                    updateFilters({
                      landAreaMin: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="h-11 bg-background border-input text-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  m² Constr. Mín.
                </Label>
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.constructionAreaMin || ""}
                  onChange={(e) =>
                    updateFilters({
                      constructionAreaMin:
                        parseInt(e.target.value) || undefined,
                    })
                  }
                  className="h-11 bg-background border-input text-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-border bg-muted/30 p-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-12 text-sm font-medium bg-background border-input hover:bg-accent"
          >
            Cerrar
          </Button>
          <Button
            onClick={onApplyFilters}
            className="h-12 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
