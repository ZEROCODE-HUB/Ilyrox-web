import { useState, useEffect } from "react";

import { Property } from "@/types/property";
import { useExchangeRate } from "./useExchangeRate";

export interface PropertyFilters {
  tipoPropiedad: string;
  subtipo: string;
  precioMin: string;
  precioMax: string;
  moneda: "MXN" | "USD";
  operacion: "venta" | "renta" | ""; // Permitir vacío
  locationFilter: {
    estado: string;
    municipio: string;
    colonias: string[];
  };
  habitaciones: string;
  banos: string;
  estacionamientos: string;
  antiguedad: string;
  niveles: string;
  m2TerrenoMin: string;
  m2ConstruccionMin: string;
  comisionMin: string;
  comisionMax: string;
}

export interface GeofenceBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export const usePropertyFilters = (
  properties: Property[],
  geofenceBounds?: GeofenceBounds | null,
) => {
  const { convertPrice } = useExchangeRate();

  const [filters, setFilters] = useState<PropertyFilters>({
    tipoPropiedad: "",
    subtipo: "",
    precioMin: "",
    precioMax: "",
    moneda: "MXN",
    operacion: "", // ← VACÍO por defecto, no filtrar
    locationFilter: {
      estado: "",
      municipio: "",
      colonias: [],
    },
    habitaciones: "",
    banos: "",
    estacionamientos: "",
    antiguedad: "",
    niveles: "",
    m2TerrenoMin: "",
    m2ConstruccionMin: "",
    comisionMin: "",
    comisionMax: "",
  });

  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(properties);

  useEffect(() => {
    const filtered = properties.filter((p, index) => {
      const anyP = p as any;

      // Validar status/estado de forma robusta
      const rawStatus = (p as any).status || (p as any).estado;
      if (rawStatus) {
        const s = String(rawStatus).toLowerCase().trim();
        // Excluir si es vendida o suspendida (o cualquier cosa que no sea publicada/disponible)
        if (s === "vendida" || s === "suspendida" || s === "baja") {
          return false;
        }
        // Opcional: Ser estricto y solo permitir "publicada" / "disponible"
        // Si el sistema usa otros estados intermedios que deban verse, ajustar aquí.
        // Por seguridad, si dice "vendida", adiós.
      }

      // Geocerca por coordenadas si está definida.
      // Si hay un filtro de ubicación explícito (municipio/colonia), desactivamos la geocerca
      // porque los bounds de Google suelen ser muy restrictivos para zonas industriales periféricas.
      const hasNamedLocationFilter = !!(
        filters.locationFilter.estado ||
        filters.locationFilter.colonias.length > 0
      );

      if (geofenceBounds && !hasNamedLocationFilter) {
        const lat = p.coordinates?.lat ?? anyP.latitud;
        const lng = p.coordinates?.lng ?? anyP.longitud;
        const valid =
          lat != null &&
          lng != null &&
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= geofenceBounds.minLat &&
          lat <= geofenceBounds.maxLat &&
          lng >= geofenceBounds.minLng &&
          lng <= geofenceBounds.maxLng;
        if (!valid) {
          return false;
        }
      }

      // FILTRO DE OPERACIÓN - Solo aplicar si hay filtro
      if (filters.operacion) {
        // Una propiedad puede tener múltiples operaciones (venta Y renta)
        // Necesitamos buscar si ALGUNA de sus operaciones coincide con el filtro
        let hasMatchingOperation = false;

        // El array en la BD se llama operaciones_propiedad
        const operaciones = anyP.operaciones_propiedad || anyP.operaciones;

        // Primero revisar si tiene el array de operaciones
        if (operaciones && Array.isArray(operaciones)) {
          hasMatchingOperation = operaciones.some((op: any) => {
            const tipoOp = op?.tipo_operacion;
            if (!tipoOp) return false;

            // Normalizar: convertir a minúsculas y traducir de inglés a español
            const lower = String(tipoOp).toLowerCase();
            let normalized = lower;

            // Solo hacer replace si NO está ya en español
            if (lower === "sale") {
              normalized = "venta";
            } else if (lower === "rent") {
              normalized = "renta";
            }
            // Si ya es "venta" o "renta", no hacer nada

            return normalized === filters.operacion.toLowerCase();
          });
        } else {
          // Fallback: revisar campos individuales por compatibilidad
          const rawOperacion = anyP.operacion || anyP.operation;
          if (rawOperacion) {
            const pOperacion = String(rawOperacion)
              .toLowerCase()
              .replace("sale", "venta")
              .replace("rent", "renta");

            hasMatchingOperation =
              pOperacion === filters.operacion.toLowerCase();
          }
        }

        // Si no encontró ninguna operación que coincida, filtrar la propiedad
        if (!hasMatchingOperation) {
          return false;
        }
      }

      // Filtro de estado
      if (filters.locationFilter.estado) {
        const pEstado = (anyP.estado || p.location?.state || "")
          .toString()
          .trim()
          .toLowerCase();
        const fEstado = filters.locationFilter.estado
          .toString()
          .trim()
          .toLowerCase();
        if (pEstado !== fEstado) {
          return false;
        }
      }

      // Filtro de municipio (Ignorado por petición del usuario)
      /*
      if (filters.locationFilter.municipio) {
        ...
      }
      */

      // Filtro de colonias (Array)
      if (
        filters.locationFilter.colonias &&
        filters.locationFilter.colonias.length > 0
      ) {
        const pColonia = (anyP.colonia || p.location?.colony || "")
          .toString()
          .trim()
          .toLowerCase();

        const isMatch = filters.locationFilter.colonias.some(
          (fColonia) => pColonia === fColonia.toString().trim().toLowerCase(),
        );

        if (!isMatch) {
          return false;
        }
      }

      if (
        filters.tipoPropiedad &&
        p.type?.toString().toLowerCase() !== filters.tipoPropiedad.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.subtipo &&
        anyP.subtipo?.toString().toLowerCase() !== filters.subtipo.toLowerCase()
      ) {
        return false;
      }

      // FILTRADO DE PRECIO CON CONVERSIÓN DE MONEDA
      // Si hay filtro de operación, usar el precio de esa operación específica
      // (una propiedad puede tener precio de venta Y precio de renta)
      let pPrice = p.price || 0;
      let pCurrency: "MXN" | "USD" = p.currency || "MXN";

      // El array en la BD se llama operaciones_propiedad
      const operaciones = anyP.operaciones_propiedad || anyP.operaciones;

      // Si hay operaciones múltiples y un filtro de operación, buscar el precio correcto
      if (filters.operacion && operaciones && Array.isArray(operaciones)) {
        const matchingOp = operaciones.find((op: any) => {
          const tipoOp = op?.tipo_operacion;
          if (!tipoOp) return false;

          // Normalizar: convertir a minúsculas y traducir de inglés a español
          const lower = String(tipoOp).toLowerCase();
          let normalized = lower;

          // Solo hacer replace si NO está ya en español
          if (lower === "sale") {
            normalized = "venta";
          } else if (lower === "rent") {
            normalized = "renta";
          }

          return normalized === filters.operacion.toLowerCase();
        });

        // Si encontramos la operación que coincide con el filtro, usar su precio
        if (matchingOp) {
          pPrice = matchingOp.precio || 0;
          pCurrency = matchingOp.moneda || "MXN";
        }
      }

      // Convertir el precio de la propiedad a la moneda del filtro
      let finalPrice = pPrice;
      if (pCurrency !== filters.moneda) {
        finalPrice = convertPrice(
          pPrice,
          pCurrency as "MXN" | "USD",
          filters.moneda,
        );
      }

      const minP = parseFloat(filters.precioMin.replace(/,/g, "")) || 0;
      const maxP = parseFloat(filters.precioMax.replace(/,/g, "")) || Infinity;

      const passesPrice = finalPrice >= minP && finalPrice <= maxP;

      if (!passesPrice) {
        return false;
      }

      if (filters.habitaciones && filters.habitaciones !== "No indicado") {
        const beds = p.features?.beds || 0;
        if (
          filters.habitaciones === "Más" ||
          filters.habitaciones.includes("Más")
        ) {
          if (beds < 5) return false;
        } else {
          const hMin = parseInt(filters.habitaciones);
          if (!isNaN(hMin) && beds < hMin) return false;
        }
      }

      if (filters.banos && filters.banos !== "No indicado") {
        const baths = p.features?.baths || 0;
        if (filters.banos === "Más" || filters.banos.includes("Más")) {
          if (baths < 5) return false;
        } else {
          const bMin = parseInt(filters.banos);
          if (!isNaN(bMin) && baths < bMin) return false;
        }
      }

      if (
        filters.estacionamientos &&
        filters.estacionamientos !== "No indicado"
      ) {
        const parking = p.features?.parking || 0;
        if (
          filters.estacionamientos === "Más" ||
          filters.estacionamientos.includes("Más")
        ) {
          if (parking < 5) return false;
        } else {
          const pMin = parseInt(filters.estacionamientos);
          if (!isNaN(pMin) && parking < pMin) return false;
        }
      }

      if (
        filters.antiguedad &&
        filters.antiguedad !== "No indicado" &&
        (p as any).antiguedad
      ) {
        if ((p as any).antiguedad !== filters.antiguedad) return false;
      }

      if (filters.m2TerrenoMin) {
        const land = p.features?.landSqft || 0;
        if (land < parseFloat(filters.m2TerrenoMin.replace(/,/g, "")))
          return false;
      }

      if (filters.m2ConstruccionMin) {
        const constr = p.features?.constructionSqft || 0;
        if (constr < parseFloat(filters.m2ConstruccionMin.replace(/,/g, "")))
          return false;
      }

      if (
        filters.niveles &&
        filters.niveles !== "No indicado" &&
        (p as any).niveles
      ) {
        if ((p as any).niveles !== filters.niveles) return false;
      }

      // Filtro de comisión porcentaje
      if (filters.comisionMin || filters.comisionMax) {
        const operacionesArr = anyP.operaciones_propiedad || anyP.operaciones;
        let passesComision = false;

        if (operacionesArr && Array.isArray(operacionesArr)) {
          // Si hay filtro de operación, buscamos esa. Si no, revisamos si ALGUNA cumple.
          const opsToCheck = filters.operacion
            ? operacionesArr.filter((op: any) => {
                const tipoOp = String(op?.tipo_operacion || "").toLowerCase();
                const norm =
                  tipoOp === "sale"
                    ? "venta"
                    : tipoOp === "rent"
                      ? "renta"
                      : tipoOp;
                return norm === filters.operacion.toLowerCase();
              })
            : operacionesArr;

          passesComision = opsToCheck.some((op: any) => {
            // Debe ser tipo porcentaje o mixto para tener un porcentaje válido
            const esTipoPorcentaje =
              op?.comision_tipo === "porcentaje" ||
              op?.comision_tipo === "mixto";

            if (!esTipoPorcentaje || op?.comision_porcentaje == null) {
              return false;
            }

            const val = op.comision_porcentaje;
            const cMin = parseFloat(filters.comisionMin) || 0;
            const cMax = parseFloat(filters.comisionMax) || Infinity;

            return val >= cMin && val <= cMax;
          });
        }

        if (!passesComision) return false;
      }

      return true;
    });

    setFilteredProperties(filtered);
  }, [properties, filters, geofenceBounds]);

  const updateFilter = <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateLocationFilter = (
    location: PropertyFilters["locationFilter"],
  ) => {
    setFilters((prev) => ({ ...prev, locationFilter: location }));
  };

  const clearFilters = (
    newLocationFilter?: PropertyFilters["locationFilter"],
  ) => {
    setFilters((prev) => ({
      tipoPropiedad: "",
      subtipo: "",
      precioMin: "",
      precioMax: "",
      moneda: "MXN",
      operacion: "",
      locationFilter: newLocationFilter || prev.locationFilter, // KEEP LOCATION or use new one
      habitaciones: "",
      banos: "",
      estacionamientos: "",
      antiguedad: "",
      niveles: "",
      m2TerrenoMin: "",
      m2ConstruccionMin: "",
      comisionMin: "",
      comisionMax: "",
    }));
  };

  const hasActiveFilters =
    filters.tipoPropiedad !== "" ||
    filters.subtipo !== "" ||
    filters.precioMin !== "" ||
    filters.precioMax !== "" ||
    filters.habitaciones !== "" ||
    filters.banos !== "" ||
    filters.estacionamientos !== "" ||
    filters.antiguedad !== "" ||
    filters.niveles !== "" ||
    filters.m2TerrenoMin !== "" ||
    filters.m2ConstruccionMin !== "" ||
    filters.operacion !== "" ||
    filters.comisionMin !== "" ||
    filters.comisionMax !== "" ||
    !!(
      filters.locationFilter.estado ||
      filters.locationFilter.colonias.length > 0
    );

  return {
    filters,
    filteredProperties,
    updateFilter,
    updateLocationFilter,
    clearFilters,
    hasActiveFilters,
  };
};
