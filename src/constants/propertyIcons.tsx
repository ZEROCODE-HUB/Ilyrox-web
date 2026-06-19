/**
 * Iconos de características de propiedad, alineados con los del feed/detalle de
 * la app móvil (Ionicons/MaterialCommunityIcons) mapeados a su equivalente en
 * lucide-react. Centralizado para que cards y detalles usen el mismo set.
 */
import {
  Building2,
  Scan,
  Bed,
  Bath,
  Toilet,
  Car,
  Layers,
  MoveHorizontal,
  MoveVertical,
  Store,
  Crop,
  Signpost,
  Zap,
  Factory,
  Truck,
  Droplets,
  Leaf,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Sofa,
  PawPrint,
  MapPin,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import type { PropertyView } from "@/types/types";
import { getCamposVisibles, esComercialIndustrial } from "@/constants/propertyData";

export const PROPERTY_ICONS = {
  construccion: Building2,
  terreno: Scan,
  recamaras: Bed,
  banos: Bath,
  mediosBanos: Toilet,
  estacionamientos: Car,
  niveles: Layers,
  frente: MoveHorizontal,
  fondo: MoveVertical,
  ubicacionComercial: Store,
  esquina: Crop,
  avenida: Signpost,
  alturaLibre: MoveVertical,
  energia: Zap,
  ubicacionIndustrial: Factory,
  patioManiobras: Truck,
  agua: Droplets,
  riego: Droplets,
  usoTerreno: Leaf,
  electricidad: Zap,
  carretera: Signpost,
  gravamen: AlertTriangle,
  financiamiento: Banknote,
  amenidad: CheckCircle2,
  amueblado: Sofa,
  petFriendly: PawPrint,
  ubicacion: MapPin,
  antiguedad: Calendar,
} satisfies Record<string, LucideIcon>;

export interface PropertyStat {
  key: string;
  Icon: LucideIcon;
  label: string;
  value: string;
}

const hasNum = (v: unknown) => v != null && Number(v) > 0;
/** "Alta capacidad: más de 150 kVA" → "más de 150 kVA" */
const shortKva = (arr: string[]) =>
  arr.map((s) => (s.includes(":") ? s.split(":")[1].trim() : s)).join(", ");

/**
 * Construye los stats visibles de una propiedad según su tipo/subtipo,
 * replicando lo que muestra el feed móvil. Reutilizado por card y detalle.
 */
export function buildPropertyStats(p: PropertyView): PropertyStat[] {
  const cv = getCamposVisibles(p.subtipo || "", p.tipo);
  const stats: PropertyStat[] = [];

  if (cv.m2Construccion && hasNum(p.metros_cuadrados_construccion))
    stats.push({ key: "const", Icon: PROPERTY_ICONS.construccion, label: "Construcción", value: `${p.metros_cuadrados_construccion} m²` });
  if (cv.m2Terreno && hasNum(p.metros_cuadrados_terreno))
    stats.push({ key: "terr", Icon: PROPERTY_ICONS.terreno, label: "Terreno", value: `${p.metros_cuadrados_terreno} m²` });
  if (cv.recamaras && hasNum(p.habitaciones))
    stats.push({ key: "rec", Icon: PROPERTY_ICONS.recamaras, label: esComercialIndustrial(p.tipo) ? "Espacios" : "Recámaras", value: `${p.habitaciones}` });
  if (cv.banos && hasNum(p.banos))
    stats.push({ key: "banos", Icon: PROPERTY_ICONS.banos, label: "Baños", value: `${p.banos}` });
  if (cv.estacionamientos && hasNum(p.estacionamientos))
    stats.push({ key: "estac", Icon: PROPERTY_ICONS.estacionamientos, label: "Estac.", value: `${p.estacionamientos}` });
  if (cv.niveles && hasNum(p.pisos))
    stats.push({ key: "piso", Icon: PROPERTY_ICONS.niveles, label: "Niveles", value: `${p.pisos}` });

  // Frente / fondo (comercial o terreno)
  if (cv.frenteFondo) {
    const frente = p.frente_metros ?? p.ancho_terreno;
    if (hasNum(frente)) stats.push({ key: "frente", Icon: PROPERTY_ICONS.frente, label: "Frente", value: `${frente} m` });
    if (hasNum(p.largo_terreno)) stats.push({ key: "fondo", Icon: PROPERTY_ICONS.fondo, label: "Fondo", value: `${p.largo_terreno} m` });
  }

  // Comercial
  if (cv.comercial) {
    if (p.tipo_ubicacion_comercial) stats.push({ key: "ubc", Icon: PROPERTY_ICONS.ubicacionComercial, label: "Ubicación", value: p.tipo_ubicacion_comercial });
    if (p.en_esquina) stats.push({ key: "esq", Icon: PROPERTY_ICONS.esquina, label: "Esquina", value: "Sí" });
    if (p.sobre_avenida_principal) stats.push({ key: "av", Icon: PROPERTY_ICONS.avenida, label: "Av. principal", value: "Sí" });
  }

  // Industrial
  if (cv.industrial) {
    if (p.altura_libre_m) stats.push({ key: "alt", Icon: PROPERTY_ICONS.alturaLibre, label: "Altura libre", value: p.altura_libre_m });
    if (p.tipo_energia_kva?.length) stats.push({ key: "kva", Icon: PROPERTY_ICONS.energia, label: "Energía", value: shortKva(p.tipo_energia_kva) });
    if (p.ubicacion_industrial) stats.push({ key: "ubi", Icon: PROPERTY_ICONS.ubicacionIndustrial, label: "Ubicación", value: p.ubicacion_industrial });
    if (hasNum(p.patio_maniobras_m2)) stats.push({ key: "patio", Icon: PROPERTY_ICONS.patioManiobras, label: "Patio maniobras", value: `${p.patio_maniobras_m2} m²` });
  }

  // Agrícola
  if (cv.agricola) {
    if (p.tipo_agua?.length) stats.push({ key: "agua", Icon: PROPERTY_ICONS.agua, label: "Agua", value: p.tipo_agua.join(", ") });
    if (p.tipo_riego?.length) stats.push({ key: "riego", Icon: PROPERTY_ICONS.riego, label: "Riego", value: p.tipo_riego.join(", ") });
    if (p.uso_terreno?.length) stats.push({ key: "uso", Icon: PROPERTY_ICONS.usoTerreno, label: "Uso", value: p.uso_terreno.join(", ") });
    if (p.infra_electricidad) stats.push({ key: "luz", Icon: PROPERTY_ICONS.electricidad, label: "Electricidad", value: "Sí" });
    if (p.acceso_carretera) stats.push({ key: "carr", Icon: PROPERTY_ICONS.carretera, label: "Carretera", value: "Sí" });
  }

  return stats;
}

/** Resumen de comisión de la primera operación que comparte comisión. */
export function getCommissionLabel(p: PropertyView): string | null {
  const op = (p.operaciones || []).find((o) => o.comparte_comision);
  if (!op) return null;
  if (op.comision_porcentaje && op.comision_porcentaje > 0)
    return `${op.comision_porcentaje}% comisión`;
  if (op.comision_meses && op.comision_meses > 0)
    return `${op.comision_meses} ${op.comision_meses === 1 ? "mes" : "meses"} comisión`;
  if (op.comision_monto_fijo && op.comision_monto_fijo > 0)
    return `Comisión $${op.comision_monto_fijo.toLocaleString("es-MX")}`;
  return null;
}
