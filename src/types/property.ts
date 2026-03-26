export type Property = {
  id: string;
  code?: string;
  title: string;
  description?: string;
  createdAt?: string;
  price: number;
  currency: "USD" | "MXN";
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  lien?: boolean;
  age?: number;
  ageMin?: number;
  ageMax?: number;
  financing?: string[];
  distance?: number;
  featured?: boolean;
  location: {
    address: string;
    country: string;
    state: string;
    city: string;
    municipio?: string;
    colony: string;
    zip?: string;
  };
  coordinates?: { lat: number; lng: number };
  images: string[];
  features: {
    beds: number;
    baths: number;
    halfBaths?: number;
    parking?: number;
    floors?: number;
    floorLevel?: number;
    constructionSqft: number;
    landSqft: number;
    yearBuilt?: number;
    maintenanceFee?: number;
  };
  amenities: string[];
  type: PropertyType;
  subtype: string;
  operation: "Sale" | "Rent";
  status: "Publicada" | "Suspendida" | "Rentada" | "Reservada" | "Vendida";
  commission?: CommissionDetails;
  legal?: LegalDetails;
  longitud?: string;
  latitud?: string;
  municipio?: string;
  ciudad?: string;
  subtipo?: string;
  codigo_propiedad?: string;
  nombre_propietario?: string;
  email_propietario?: string;
};

export type PropertyType =
  | "habitacional"
  | "comercial"
  | "industrial"
  | "agricola";

export type CommissionDetails = {
  shared: boolean;
  percentage?: number;
  condition?: string;
};

export type LegalDetails = {
  hasEncumbrance: boolean;
  institution?: string;
};

export interface Advisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  title: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  comments: string;
  propertyId: string;
  budget?: string;
  timeframe?: string;
}

export interface PropertyFilters {
  type?: string;
  subtype?: string | string[];
  location?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  area?: number;
  bedrooms?: string;
  bathrooms?: string;
  parking?: string;
  levels?: string;
  age?: string;
  landAreaMin?: number;
  landAreaMax?: number;
  constructionAreaMin?: number;
  constructionAreaMax?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  ageMin?: number;
  ageMax?: number;
  amenities?: string[];
  financing?: string[];
  lien?: boolean;
  operationType?: "venta" | "renta" | "todas";
  state?: string | string[];
  municipality?: string;
  colony?: string;
  colonias?: string[];
  currency?: "MXN" | "USD";
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}
