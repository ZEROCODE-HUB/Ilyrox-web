import { useState } from "react";
import { PropertyFilters as FilterType } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { AMENITIES_OPTIONS, FINANCING_OPTIONS } from "@/data/mockData";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PropertyFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClearFilters: () => void;
}

export function PropertyFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([
    filters.priceMin || 0,
    filters.priceMax || 10000000,
  ]);
  const [areaRange, setAreaRange] = useState([
    filters.areaMin || 0,
    filters.areaMax || 1000,
  ]);
  const [ageRange, setAgeRange] = useState([
    filters.ageMin || 0,
    filters.ageMax || 50,
  ]);

  const updateFilter = (key: keyof FilterType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    updateFilter("amenities", newAmenities);
  };

  const toggleFinancing = (financing: string) => {
    const currentFinancing = filters.financing || [];
    const newFinancing = currentFinancing.includes(financing)
      ? currentFinancing.filter((f) => f !== financing)
      : [...currentFinancing, financing];
    updateFilter("financing", newFinancing);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(price);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (
      filters.subtype &&
      (Array.isArray(filters.subtype)
        ? filters.subtype.length > 0
        : !!filters.subtype)
    )
      count++;
    if (filters.location) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.areaMin || filters.areaMax) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.parking) count++;
    if (filters.furnished !== undefined) count++;
    if (filters.petFriendly !== undefined) count++;
    if (filters.ageMin || filters.ageMax) count++;
    if (filters.amenities?.length) count++;
    if (filters.financing?.length) count++;
    if (filters.lien !== undefined) count++;
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Tipo y Subtipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Propiedad</Label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    updateFilter("type", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="habitacional">Habitacional</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="agricola">Agrícola</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { value: "Casa", label: "Casa" },
                    { value: "Departamento", label: "Departamento" },
                    { value: "Terreno", label: "Terreno" },
                  ].map((sub) => {
                    const isSelected = Array.isArray(filters.subtype)
                      ? filters.subtype.includes(sub.value)
                      : filters.subtype === sub.value;

                    return (
                      <div
                        key={sub.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`subtype-${sub.value}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const currentSubtypes = Array.isArray(
                              filters.subtype,
                            )
                              ? filters.subtype
                              : filters.subtype
                                ? [filters.subtype]
                                : [];
                            const newSubtypes = checked
                              ? [...currentSubtypes, sub.value]
                              : currentSubtypes.filter((s) => s !== sub.value);
                            updateFilter(
                              "subtype",
                              newSubtypes.length > 0 ? newSubtypes : undefined,
                            );
                          }}
                        />
                        <Label
                          htmlFor={`subtype-${sub.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {sub.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input
                placeholder="Ciudad, estado o dirección"
                value={filters.location || ""}
                onChange={(e) =>
                  updateFilter("location", e.target.value || undefined)
                }
              />
            </div>

            {/* Rango de Precios */}
            <div className="space-y-2">
              <Label>Rango de Precios</Label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value);
                    updateFilter("priceMin", value[0]);
                    updateFilter("priceMax", value[1]);
                  }}
                  max={10000000}
                  min={0}
                  step={100000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Área */}
            <div className="space-y-2">
              <Label>Metros Cuadrados</Label>
              <div className="px-2">
                <Slider
                  value={areaRange}
                  onValueChange={(value) => {
                    setAreaRange(value);
                    updateFilter("areaMin", value[0]);
                    updateFilter("areaMax", value[1]);
                  }}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{areaRange[0]} m²</span>
                  <span>{areaRange[1]} m²</span>
                </div>
              </div>
            </div>

            {/* Habitaciones, Baños, Estacionamientos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Habitaciones</Label>
                <Select
                  value={filters.bedrooms?.toString() || "all"}
                  onValueChange={(value) =>
                    updateFilter(
                      "bedrooms",
                      value === "all" ? undefined : parseInt(value),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquiera</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Baños</Label>
                <Select
                  value={filters.bathrooms?.toString() || "all"}
                  onValueChange={(value) =>
                    updateFilter(
                      "bathrooms",
                      value === "all" ? undefined : parseInt(value),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquiera</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estacionamientos</Label>
                <Select
                  value={filters.parking?.toString() || "all"}
                  onValueChange={(value) =>
                    updateFilter(
                      "parking",
                      value === "all" ? undefined : parseInt(value),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquiera</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Características especiales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furnished"
                  checked={filters.furnished === true}
                  onCheckedChange={(checked) =>
                    updateFilter(
                      "furnished",
                      checked === true ? true : undefined,
                    )
                  }
                />
                <Label htmlFor="furnished">Amoblado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="petFriendly"
                  checked={filters.petFriendly === true}
                  onCheckedChange={(checked) =>
                    updateFilter(
                      "petFriendly",
                      checked === true ? true : undefined,
                    )
                  }
                />
                <Label htmlFor="petFriendly">Pet-friendly</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lien"
                  checked={filters.lien === false}
                  onCheckedChange={(checked) =>
                    updateFilter("lien", checked === true ? false : undefined)
                  }
                />
                <Label htmlFor="lien">Sin gravamen</Label>
              </div>
            </div>

            {/* Antigüedad */}
            <div className="space-y-2">
              <Label>Antigüedad (años)</Label>
              <div className="px-2">
                <Slider
                  value={ageRange}
                  onValueChange={(value) => {
                    setAgeRange(value);
                    updateFilter("ageMin", value[0]);
                    updateFilter("ageMax", value[1]);
                  }}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{ageRange[0]} años</span>
                  <span>{ageRange[1]} años</span>
                </div>
              </div>
            </div>

            {/* Amenidades */}
            <div className="space-y-2">
              <Label>Amenidades</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={filters.amenities?.includes(amenity) || false}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Financiamiento */}
            <div className="space-y-2">
              <Label>Tipo de Financiamiento</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {FINANCING_OPTIONS.map((financing) => (
                  <div key={financing} className="flex items-center space-x-2">
                    <Checkbox
                      id={`financing-${financing}`}
                      checked={filters.financing?.includes(financing) || false}
                      onCheckedChange={() => toggleFinancing(financing)}
                    />
                    <Label
                      htmlFor={`financing-${financing}`}
                      className="text-sm"
                    >
                      {financing}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
