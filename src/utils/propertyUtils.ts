import { Property, PropertyFilters } from "@/types/property";

/**
 * Filtra las propiedades según los criterios especificados
 */
export function filterProperties(
  properties: Property[],
  filters: PropertyFilters,
  searchTerm: string = "",
): Property[] {
  return properties.filter((property) => {
    // Filtro por búsqueda de texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        property.title.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.location.address.toLowerCase().includes(searchLower) ||
        property.location.city.toLowerCase().includes(searchLower) ||
        property.location.state.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Filtro por tipo
    if (filters.type && property.type !== filters.type) return false;

    // Filtro por subtipo
    if (filters.subtype) {
      if (Array.isArray(filters.subtype)) {
        if (
          filters.subtype.length > 0 &&
          !filters.subtype.includes(property.subtype)
        ) {
          return false;
        }
      } else if (property.subtype !== filters.subtype) {
        return false;
      }
    }

    // Filtro por ubicación
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      const matchesLocation =
        property.location.address.toLowerCase().includes(locationLower) ||
        property.location.city.toLowerCase().includes(locationLower) ||
        property.location.state.toLowerCase().includes(locationLower);

      if (!matchesLocation) return false;
    }

    // Filtro por rango de precios
    if (filters.priceMin && property.price < filters.priceMin) return false;
    if (filters.priceMax && property.price > filters.priceMax) return false;

    // Filtro por área
    if (filters.areaMin && property.area < filters.areaMin) return false;
    if (filters.areaMax && property.area > filters.areaMax) return false;

    // Filtro por habitaciones
    if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;

    // Filtro por baños
    if (filters.bathrooms && property.bathrooms < filters.bathrooms)
      return false;

    // Filtro por estacionamientos
    if (filters.parking && property.parking < filters.parking) return false;

    // Filtro por amoblado
    if (
      filters.furnished !== undefined &&
      property.furnished !== filters.furnished
    )
      return false;

    // Filtro por pet-friendly
    if (
      filters.petFriendly !== undefined &&
      property.petFriendly !== filters.petFriendly
    )
      return false;

    // Filtro por gravamen
    if (filters.lien !== undefined && property.lien !== filters.lien)
      return false;

    // Filtro por antigüedad
    if (filters.ageMin && property.age < filters.ageMin) return false;
    if (filters.ageMax && property.age > filters.ageMax) return false;

    // Filtro por amenidades
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((amenity) =>
        property.amenities.includes(amenity),
      );
      if (!hasAllAmenities) return false;
    }

    // Filtro por financiamiento
    if (filters.financing && filters.financing.length > 0) {
      const hasAnyFinancing = filters.financing.some((financing) =>
        property.financing.includes(financing),
      );
      if (!hasAnyFinancing) return false;
    }

    return true;
  });
}

/**
 * Ordena las propiedades según el criterio especificado
 */
export function sortProperties(
  properties: Property[],
  sortBy: string,
  sortOrder: "asc" | "desc",
): Property[] {
  const sorted = [...properties].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "price":
        aValue = a.price;
        bValue = b.price;
        break;
      case "area":
        aValue = a.area;
        bValue = b.area;
        break;
      case "bedrooms":
        aValue = a.bedrooms;
        bValue = b.bedrooms;
        break;
      case "age":
        aValue = a.age;
        bValue = b.age;
        break;
      case "distance":
        aValue = a.distance || Infinity;
        bValue = b.distance || Infinity;
        break;
      case "relevance":
      default:
        // Para relevancia, priorizar propiedades destacadas y luego por precio
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        aValue = a.price;
        bValue = b.price;
        break;
    }

    if (typeof aValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  return sorted;
}

/**
 * Formatea el precio en pesos mexicanos
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formatea el precio de manera compacta
 */
export function formatCompactPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(price);
}

/**
 * Formatea un número o string numérico con separadores de miles (comas)
 * para su uso en campos de entrada.
 */
export function formatPriceInput(price: number | string): string {
  if (price === "" || price === undefined || price === null) return "";

  // Eliminar cualquier cosa que no sea número
  const value = String(price).replace(/[^\d]/g, "");
  if (!value) return "";

  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseInt(value));
}

/**
 * Convierte un string formateado con comas (y opcionalmente $) a un número puro
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  // Eliminar símbolos de moneda, espacios y comas
  const cleanValue = value.replace(/[$,\s]/g, "");
  return Number(cleanValue) || 0;
}
