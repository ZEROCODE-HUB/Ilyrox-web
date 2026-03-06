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
  bedrooms: number | undefined;
  bathrooms: number | undefined;
  parking: number | undefined;
  levels: number | undefined;

  // Area
  landAreaMin: number | undefined;
  constructionAreaMin: number | undefined;

  // Search
  searchTerm: string;

  // Radius
  radiusKm: number;
}

export interface FilterActions {
  // Individual setters
  setEstadoMexico: (estado: string) => void;
  setColonias: (colonias: string[]) => void;
  toggleColonia: (colonia: string) => void;
  removeColonia: (colonia: string) => void;

  setPriceMin: (value: number | undefined) => void;
  setPriceMax: (value: number | undefined) => void;
  setCurrency: (currency: Currency) => void;

  setOperationType: (op: OperationType) => void;

  setType: (type: string | undefined) => void;
  setSubtype: (subtype: string[]) => void;
  toggleSubtype: (subtype: string) => void;

  setBedrooms: (n: number | undefined) => void;
  setBathrooms: (n: number | undefined) => void;
  setParking: (n: number | undefined) => void;
  setLevels: (n: number | undefined) => void;

  setLandAreaMin: (n: number | undefined) => void;
  setConstructionAreaMin: (n: number | undefined) => void;

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
      set({
        estadoMexico: estado,
        colonias: [], // Reset colonias on state change
      }),

    setColonias: (colonias) => set({ colonias }),

    toggleColonia: (colonia) =>
      set((s) => ({
        colonias: s.colonias.includes(colonia)
          ? s.colonias.filter((c) => c !== colonia)
          : [...s.colonias, colonia],
      })),

    removeColonia: (colonia) =>
      set((s) => ({
        colonias: s.colonias.filter((c) => c !== colonia),
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
      searchTerm: s.searchTerm,
      radiusKm: s.radiusKm,
    })),
  );
