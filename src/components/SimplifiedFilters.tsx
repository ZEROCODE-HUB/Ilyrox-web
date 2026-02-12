import { useState } from 'react';
import { PropertyFilters as FilterType } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, Building2, Factory, FolderOpen, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimplifiedFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
  onCancel?: () => void;
}

// Mock data for locations - Cascading: Estado → Ciudad → Municipio → Colonia
const estados = [
  { value: 'aguascalientes', label: 'Aguascalientes' },
  { value: 'baja-california', label: 'Baja California' },
  { value: 'baja-california-sur', label: 'Baja California del Sur' },
  { value: 'campeche', label: 'Campeche' },
  { value: 'chiapas', label: 'Chiapas' },
  { value: 'chihuahua', label: 'Chihuahua' },
  { value: 'cdmx', label: 'Ciudad de México (CDMX)' },
  { value: 'coahuila', label: 'Coahuila de Zaragoza' },
  { value: 'colima', label: 'Colima' },
  { value: 'durango', label: 'Durango' },
  { value: 'estado-de-mexico', label: 'Estado de México' },
  { value: 'guanajuato', label: 'Guanajuato' },
  { value: 'guerrero', label: 'Guerrero' },
  { value: 'hidalgo', label: 'Hidalgo' },
  { value: 'jalisco', label: 'Jalisco' },
  { value: 'michoacan', label: 'Michoacán de Ocampo' },
  { value: 'morelos', label: 'Morelos' },
  { value: 'nayarit', label: 'Nayarit' },
  { value: 'nuevo-leon', label: 'Nuevo León' },
  { value: 'oaxaca', label: 'Oaxaca' },
  { value: 'puebla', label: 'Puebla' },
  { value: 'queretaro', label: 'Querétaro' },
  { value: 'quintana-roo', label: 'Quintana Roo' },
  { value: 'san-luis-potosi', label: 'San Luis Potosí' },
  { value: 'sinaloa', label: 'Sinaloa' },
  { value: 'sonora', label: 'Sonora' },
  { value: 'tabasco', label: 'Tabasco' },
  { value: 'tamaulipas', label: 'Tamaulipas' },
  { value: 'tlaxcala', label: 'Tlaxcala' },
  { value: 'veracruz', label: 'Veracruz de Ignacio de la Llave' },
  { value: 'yucatan', label: 'Yucatán' },
  { value: 'zacatecas', label: 'Zacatecas' },
];

const ciudadesPorEstado: Record<string, { value: string; label: string }[]> = {
  'sinaloa': [
    { value: 'culiacan', label: 'Culiacán' },
    { value: 'mazatlan', label: 'Mazatlán' },
    { value: 'los-mochis', label: 'Los Mochis' },
  ],
  'nuevo-leon': [
    { value: 'monterrey', label: 'Monterrey' },
    { value: 'san-pedro', label: 'San Pedro Garza García' },
    { value: 'santa-catarina', label: 'Santa Catarina' },
  ],
  'jalisco': [
    { value: 'guadalajara', label: 'Guadalajara' },
    { value: 'zapopan', label: 'Zapopan' },
    { value: 'tlaquepaque', label: 'Tlaquepaque' },
  ],
  'cdmx': [
    { value: 'cdmx-ciudad', label: 'Ciudad de México' },
  ],
};

const municipiosPorCiudad: Record<string, { value: string; label: string }[]> = {
  'culiacan': [
    { value: 'culiacan-centro', label: 'Culiacán' },
    { value: 'navolato', label: 'Navolato' },
  ],
  'mazatlan': [
    { value: 'mazatlan-centro', label: 'Mazatlán' },
  ],
  'monterrey': [
    { value: 'monterrey-centro', label: 'Monterrey' },
    { value: 'guadalupe', label: 'Guadalupe' },
  ],
  'san-pedro': [
    { value: 'san-pedro-centro', label: 'San Pedro Garza García' },
  ],
  'guadalajara': [
    { value: 'guadalajara-centro', label: 'Guadalajara' },
    { value: 'zapopan-muni', label: 'Zapopan' },
  ],
  'cdmx-ciudad': [
    { value: 'benito-juarez', label: 'Benito Juárez' },
    { value: 'coyoacan', label: 'Coyoacán' },
    { value: 'miguel-hidalgo', label: 'Miguel Hidalgo' },
  ],
};

const coloniasPorMunicipio: Record<string, { value: string; label: string }[]> = {
  'culiacan-centro': [
    { value: 'centro', label: 'Centro' },
    { value: 'chapultepec', label: 'Chapultepec' },
    { value: 'las-quintas', label: 'Las Quintas' },
  ],
  'monterrey-centro': [
    { value: 'del-valle', label: 'Del Valle' },
    { value: 'cumbres', label: 'Cumbres' },
  ],
  'san-pedro-centro': [
    { value: 'del-valle-sp', label: 'Del Valle' },
    { value: 'fuentes-del-valle', label: 'Fuentes del Valle' },
  ],
  'benito-juarez': [
    { value: 'del-valle-cdmx', label: 'Del Valle' },
    { value: 'narvarte', label: 'Narvarte' },
    { value: 'roma-sur', label: 'Roma Sur' },
  ],
};

const characteristics = [
  { key: 'furnished', label: 'Amueblado' },
  { key: 'petFriendly', label: 'Pet Friendly' },
  { key: 'parking', label: 'Estacionamiento' },
  { key: 'garden', label: 'Jardín' },
];

// Subtipos por tipo de propiedad
const subtiposPorTipo: Record<string, { value: string; label: string }[]> = {
  'Habitacional': [
    { value: 'casa-fracc-abierto', label: 'Casa (Fracc. Abierto)' },
    { value: 'casa-condominio', label: 'Casa en Condominio' },
    { value: 'casa-campo', label: 'Casa de Campo/Descanso' },
    { value: 'departamento', label: 'Departamentos' },
    { value: 'quinta', label: 'Quinta' },
    { value: 'rancho-hab', label: 'Rancho' },
    { value: 'terreno-hab', label: 'Terreno' },
    { value: 'villa', label: 'Villa' },
  ],
  'Comercial': [
    { value: 'bodega-comercial', label: 'Bodega Comercial' },
    { value: 'casa-uso-comercial', label: 'Casa con Uso de Suelo Comercial' },
    { value: 'edificio', label: 'Edificio' },
    { value: 'huerta', label: 'Huerta' },
    { value: 'local-comercial', label: 'Local Comercial' },
    { value: 'local-centro-comercial', label: 'Local en Centro Comercial' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'terreno-comercial', label: 'Terreno Comercial' },
  ],
  'Industrial': [
    { value: 'bodega-industrial', label: 'Bodega Industrial' },
    { value: 'nave-industrial', label: 'Nave Industrial' },
    { value: 'terreno-industrial', label: 'Terreno Industrial' },
  ],
  'Agricola': [
    { value: 'rancho-agr', label: 'Rancho' },
    { value: 'terreno-agr', label: 'Terreno Agrícola' },
    { value: 'huerta-agr', label: 'Huerta' },
  ],
};

export function SimplifiedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
  onCancel
}: SimplifiedFiltersProps) {
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [selectedCiudad, setSelectedCiudad] = useState<string>('');
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('');
  const [selectedColonia, setSelectedColonia] = useState<string>('');
  const [selectedSubtipo, setSelectedSubtipo] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>(filters.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState<string>(filters.priceMax?.toString() || '');
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([]);
  const [operationType, setOperationType] = useState<'todas' | 'venta' | 'renta'>('todas');
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN');

  // Get available options based on selections
  const ciudadesDisponibles = selectedEstado ? ciudadesPorEstado[selectedEstado] || [] : [];
  const municipiosDisponibles = selectedCiudad ? municipiosPorCiudad[selectedCiudad] || [] : [];
  const coloniasDisponibles = selectedMunicipio ? coloniasPorMunicipio[selectedMunicipio] || [] : [];

  const updateFilter = (key: keyof FilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handlePriceMinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPriceMin(numericValue);
    updateFilter('priceMin', numericValue ? parseInt(numericValue) : undefined);
  };

  const handlePriceMaxChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPriceMax(numericValue);
    updateFilter('priceMax', numericValue ? parseInt(numericValue) : undefined);
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    const num = parseInt(value);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const toggleCharacteristic = (key: string) => {
    setSelectedCharacteristics(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    
    // Update corresponding filter
    if (key === 'furnished') {
      updateFilter('furnished', !filters.furnished);
    } else if (key === 'petFriendly') {
      updateFilter('petFriendly', !filters.petFriendly);
    } else if (key === 'parking') {
      updateFilter('parking', filters.parking ? undefined : 1);
    }
  };

  const propertyTypes = [
    { value: 'Habitacional', label: 'Habitacional', icon: Home },
    { value: 'Comercial', label: 'Comercial', icon: Building2 },
    { value: 'Industrial', label: 'Industrial', icon: Factory },
    { value: 'Agricola', label: 'Agrícola', icon: FolderOpen },
  ];

  // Get available subtipos based on selected property type
  const subtiposDisponibles = filters.type ? subtiposPorTipo[filters.type] || [] : [];

  const bedroomOptions = [1, 2, 3, 4, '5+'];
  const bathroomOptions = [1, 2, 3, 4, '5+'];
  
  // Check if a property type is selected to show characteristics
  const hasPropertyTypeSelected = !!filters.type;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 px-5 py-5">
        
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
              { value: 'todas', label: 'Todas' },
              { value: 'venta', label: 'Venta' },
              { value: 'renta', label: 'Renta' },
            ].map((option) => {
              const isSelected = operationType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOperationType(option.value as 'todas' | 'venta' | 'renta')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isSelected 
                      ? 'border-2 border-primary text-foreground bg-background' 
                      : 'border border-input text-muted-foreground bg-background hover:border-primary/50'
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
            <Label className="text-sm font-semibold text-foreground">Rango de Precio</Label>
            <div className="flex rounded-lg border border-input overflow-hidden">
              <button
                type="button"
                onClick={() => setCurrency('MXN')}
                className={`px-3 py-1 text-xs font-medium transition-all ${
                  currency === 'MXN' 
                    ? 'bg-primary/10 text-primary border-r border-input' 
                    : 'bg-background text-muted-foreground hover:bg-muted border-r border-input'
                }`}
              >
                MXN
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 text-xs font-medium transition-all ${
                  currency === 'USD' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-background text-muted-foreground hover:bg-muted'
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
                value={priceMin ? formatCurrency(priceMin) : ''}
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
                value={priceMax ? formatCurrency(priceMax) : ''}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
                className="h-11 bg-background border-input text-sm"
              />
            </div>
          </div>
        </div>

        {/* Ubicación - Cascading Dropdowns */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-foreground">Ubicación</Label>
          
          {/* Estado */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Estado <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedEstado} onValueChange={(value) => {
              setSelectedEstado(value);
              setSelectedCiudad('');
              setSelectedMunicipio('');
              setSelectedColonia('');
              updateFilter('location', value);
            }}>
              <SelectTrigger className="h-11 bg-background border-input">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                {estados.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
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
              <Select value={selectedCiudad} onValueChange={(value) => {
                setSelectedCiudad(value);
                setSelectedMunicipio('');
                setSelectedColonia('');
              }}>
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {ciudadesDisponibles.map((ciudad) => (
                    <SelectItem key={ciudad.value} value={ciudad.value}>
                      {ciudad.label}
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
              <Select value={selectedMunicipio} onValueChange={(value) => {
                setSelectedMunicipio(value);
                setSelectedColonia('');
              }}>
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder="Selecciona un municipio" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {municipiosDisponibles.map((municipio) => (
                    <SelectItem key={municipio.value} value={municipio.value}>
                      {municipio.label}
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
              <Select value={selectedColonia} onValueChange={setSelectedColonia}>
                <SelectTrigger className="h-11 bg-background border-input">
                  <SelectValue placeholder={coloniasDisponibles.length > 0 ? "Selecciona una colonia" : "No hay colonias disponibles"} />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {coloniasDisponibles.length > 0 ? (
                    coloniasDisponibles.map((colonia) => (
                      <SelectItem key={colonia.value} value={colonia.value}>
                        {colonia.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No hay colonias disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tipo de Propiedad */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">Tipo de Propiedad</Label>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type) => {
              const isSelected = filters.type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    const newType = isSelected ? undefined : type.value;
                    setSelectedSubtipo('');
                    onFiltersChange({
                      ...filters,
                      type: newType,
                      subtype: undefined
                    });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected 
                      ? 'border-2 border-primary text-foreground bg-background' 
                      : 'border border-input text-muted-foreground bg-background hover:border-primary/50'
                  }`}
                >
                  {type.label}
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
              <Select value={selectedSubtipo} onValueChange={(value) => {
                setSelectedSubtipo(value);
                updateFilter('subtype', value);
              }}>
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
            {/* Separador visual */}
            <div className="border-t border-border my-2" />
            
            {/* Características Header */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-foreground">Características</Label>
              
              {/* Espacios/Recámaras - dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {filters.type === 'Comercial' || filters.type === 'Industrial' || filters.type === 'Agricola' ? 'Espacios' : 'Recámaras'}
                </Label>
                <Select 
                  value={filters.bedrooms?.toString() || 'any'} 
                  onValueChange={(value) => updateFilter('bedrooms', value === 'any' ? undefined : parseInt(value))}
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

              {/* Baños - dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Baños</Label>
                <Select 
                  value={filters.bathrooms?.toString() || 'any'} 
                  onValueChange={(value) => updateFilter('bathrooms', value === 'any' ? undefined : parseInt(value))}
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

            {/* Estacionamiento - dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Estacionamiento</Label>
              <Select 
                value={filters.parking?.toString() || 'any'} 
                onValueChange={(value) => updateFilter('parking', value === 'any' ? undefined : parseInt(value))}
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

            {/* Niveles - dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Niveles</Label>
              <Select 
                value={filters.levels?.toString() || 'any'} 
                onValueChange={(value) => updateFilter('levels', value === 'any' ? undefined : parseInt(value))}
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

            {/* Antigüedad - dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Antigüedad</Label>
              <Select 
                value={filters.age?.toString() || 'any'} 
                onValueChange={(value) => updateFilter('age', value === 'any' ? undefined : value)}
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
                <Label className="text-xs font-medium text-muted-foreground">m² Terreno Mín.</Label>
                <Input 
                  type="number"
                  placeholder="Mínimo"
                  value={filters.landAreaMin || ''}
                  onChange={(e) => updateFilter('landAreaMin', parseInt(e.target.value) || undefined)}
                  className="h-11 bg-background border-input text-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">m² Constr. Mín.</Label>
                <Input 
                  type="number"
                  placeholder="Mínimo"
                  value={filters.constructionAreaMin || ''}
                  onChange={(e) => updateFilter('constructionAreaMin', parseInt(e.target.value) || undefined)}
                  className="h-11 bg-background border-input text-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-border bg-muted/30 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="h-12 text-sm font-medium bg-background border-input hover:bg-accent"
          >
            Cancelar
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
