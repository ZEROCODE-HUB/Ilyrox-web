import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "zustand/shallow";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type OperationType = "venta" | "renta" | "todas";
export type Currency = "MXN" | "USD";

export interface FilterState {
  // Location
  estadoMexico: string;
  colonias: string[];
  municipios: string[];

  // Price
  priceMin: number | undefined;
  priceMax: number | undefined;
  currency: Currency | "MXN";

  // Operation
  operationType: OperationType;

  // Property type
  type: string | undefined;
  subtype: string[];

  // Features
  bedrooms: string | undefined;
  bathrooms: string | undefined;
  parking: string | undefined;
  levels: string | undefined;

  // Area
  landAreaMin: number | undefined;
  constructionAreaMin: number | undefined;
  landAreaMax: number | undefined;
  constructionAreaMax: number | undefined;

  // Search
  searchTerm: string;

  // Radius
  radiusKm: number;
}

export interface FilterActions {
  // Individual setters
  setEstadoMexico: (estado: string) => void;
  setColonias: (colonias: string[]) => void;
  toggleColonia: (colonia: string, municipio?: string) => void;
  removeColonia: (colonia: string) => void;
  setMunicipios: (municipios: string[]) => void;
  toggleMunicipio: (municipio: string, estado?: string) => void;
  removeMunicipio: (municipio: string) => void;

  setPriceMin: (value: number | undefined) => void;
  setPriceMax: (value: number | undefined) => void;
  setCurrency: (currency: Currency) => void;

  setOperationType: (op: OperationType) => void;

  setType: (type: string | undefined) => void;
  setSubtype: (subtype: string[]) => void;
  toggleSubtype: (subtype: string) => void;

  setBedrooms: (n: string | undefined) => void;
  setBathrooms: (n: string | undefined) => void;
  setParking: (n: string | undefined) => void;
  setLevels: (n: string | undefined) => void;

  setLandAreaMin: (n: number | undefined) => void;
  setConstructionAreaMin: (n: number | undefined) => void;
  setLandAreaMax: (n: number | undefined) => void;
  setConstructionAreaMax: (n: number | undefined) => void;

  setSearchTerm: (term: string) => void;

  setRadiusKm: (radius: number) => void;

  // Bulk
  resetFilters: () => void;
}

export type FilterStore = FilterState & FilterActions;

// ──────────────────────────────────────────────
// Initial state
// ──────────────────────────────────────────────

const initialState: FilterState = {
  estadoMexico: "",
  colonias: [],
  municipios: [],

  priceMin: undefined,
  priceMax: undefined,
  currency: "MXN",

  operationType: "todas",

  type: undefined,
  subtype: [],

  bedrooms: undefined,
  bathrooms: undefined,
  parking: undefined,
  levels: undefined,

  landAreaMin: undefined,
  constructionAreaMin: undefined,
  landAreaMax: undefined,
  constructionAreaMax: undefined,

  searchTerm: "",

  radiusKm: 0,
};

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useFilterStore = create<FilterStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    // ── Location ──────────────────────────────
    setEstadoMexico: (estado) =>
      set((s) => {
        // Si el estado es el mismo, no hacemos nada (evita resetear colonias/municipios al añadir más)
        if (s.estadoMexico === estado && estado !== "") return s;
        
        return {
          estadoMexico: estado,
          colonias: [],    // Reset colonias on state change
          municipios: [],  // Reset municipios on state change
        };
      }),

    setColonias: (colonias) => set({ colonias }),

    toggleColonia: (colonia, municipio) =>
      set((s) => {
        if (municipio) {
          const identifier = `${colonia} (${municipio})`;
          return {
            colonias: s.colonias.includes(identifier)
              ? s.colonias.filter((c) => c !== identifier)
              : [...s.colonias, identifier],
          };
        } else {
          // Si no hay municipio (click desde pastilla),
          // quitamos TODAS las colonias que coincidan con ese nombre
          const hasAny = s.colonias.some(
            (c) => c === colonia || c.startsWith(`${colonia} (`),
          );
          if (hasAny) {
            return {
              colonias: s.colonias.filter(
                (c) => c !== colonia && !c.startsWith(`${colonia} (`),
              ),
            };
          } else {
            return {
              colonias: [...s.colonias, colonia],
            };
          }
        }
      }),

    removeColonia: (colonia) =>
      set((s) => ({
        colonias: s.colonias.filter((c) => c !== colonia),
      })),

    setMunicipios: (municipios) => set({ municipios }),

    toggleMunicipio: (municipio) =>
      set((s) => ({
        municipios: s.municipios.includes(municipio)
          ? s.municipios.filter((m) => m !== municipio)
          : [...s.municipios, municipio],
      })),

    removeMunicipio: (municipio) =>
      set((s) => ({
        municipios: s.municipios.filter((m) => m !== municipio),
      })),

    // ── Price ─────────────────────────────────
    setPriceMin: (value) => set({ priceMin: value }),
    setPriceMax: (value) => set({ priceMax: value }),
    setCurrency: (currency) => set({ currency }),

    // ── Operation ─────────────────────────────
    setOperationType: (op) => set({ operationType: op }),

    // ── Property type ─────────────────────────
    setType: (type) => set({ type, subtype: [] }),
    setSubtype: (subtype) => set({ subtype }),
    toggleSubtype: (sub) =>
      set((s) => ({
        subtype: s.subtype.includes(sub)
          ? s.subtype.filter((t) => t !== sub)
          : [...s.subtype, sub],
      })),

    // ── Features ──────────────────────────────
    setBedrooms: (n) => set({ bedrooms: n }),
    setBathrooms: (n) => set({ bathrooms: n }),
    setParking: (n) => set({ parking: n }),
    setLevels: (n) => set({ levels: n }),

    // ── Area ──────────────────────────────────
    setLandAreaMin: (n) => set({ landAreaMin: n }),
    setConstructionAreaMin: (n) => set({ constructionAreaMin: n }),
    setLandAreaMax: (n) => set({ landAreaMax: n }),
    setConstructionAreaMax: (n) => set({ constructionAreaMax: n }),

    // ── Search ────────────────────────────────
    setSearchTerm: (term) => set({ searchTerm: term }),

    setRadiusKm: (radius) => set({ radiusKm: radius }),

    // ── Reset ─────────────────────────────────
    resetFilters: () => set((state) => ({ ...initialState })),
  })),
);

// ──────────────────────────────────────────────
// Selectors (prevents re-renders when unrelated state changes)
// ──────────────────────────────────────────────

export const useEstadoMexico = () => useFilterStore((s) => s.estadoMexico);

export const useColonias = () => useFilterStore((s) => s.colonias);

export const useMunicipios = () => useFilterStore((s) => s.municipios);

export const usePriceRange = () =>
  useFilterStore(
    useShallow((s) => ({
      priceMin: s.priceMin,
      priceMax: s.priceMax,
      currency: s.currency,
    })),
  );

export const useOperationType = () => useFilterStore((s) => s.operationType);

export const usePropertyType = () =>
  useFilterStore(useShallow((s) => ({ type: s.type, subtype: s.subtype })));

export const useFeatures = () =>
  useFilterStore(
    useShallow((s) => ({
      bedrooms: s.bedrooms,
      bathrooms: s.bathrooms,
      parking: s.parking,
      levels: s.levels,
    })),
  );

export const useAreaFilters = () =>
  useFilterStore(
    useShallow((s) => ({
      landAreaMin: s.landAreaMin,
      constructionAreaMin: s.constructionAreaMin,
      landAreaMax: s.landAreaMax,
      constructionAreaMax: s.constructionAreaMax,
    })),
  );

export const useSearchTerm = () => useFilterStore((s) => s.searchTerm);

export const useRadiusKm = () => useFilterStore((s) => s.radiusKm);

/** Build the queryKey-friendly snapshot of all filters */
export const useFilterSnapshot = () =>
  useFilterStore(
    useShallow((s) => ({
      estadoMexico: s.estadoMexico,
      colonias: s.colonias,
      municipios: s.municipios,
      priceMin: s.priceMin,
      priceMax: s.priceMax,
      currency: s.currency,
      operationType: s.operationType,
      type: s.type,
      subtype: s.subtype,
      bedrooms: s.bedrooms,
      bathrooms: s.bathrooms,
      parking: s.parking,
      levels: s.levels,
      landAreaMin: s.landAreaMin,
      constructionAreaMin: s.constructionAreaMin,
      landAreaMax: s.landAreaMax,
      constructionAreaMax: s.constructionAreaMax,
      searchTerm: s.searchTerm,
      radiusKm: s.radiusKm,
    })),
  );
