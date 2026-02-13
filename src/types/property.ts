export interface Property {
  id: string;
  title: string;
  description: string;
  operationType: "venta" | "renta";
  type: "Habitacional" | "Comercial" | "Industrial" | "Otros";
  subtype: "Casa" | "Departamento" | "Terreno";
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  area: number; // metros cuadrados
  bedrooms: number;
  bathrooms: number;
  parking: number;
  furnished: boolean;
  petFriendly: boolean;
  age: number; // años
  amenities: string[];
  financing: string[];
  lien: boolean; // gravamen
  images: string[];
  videos?: string[];
  advisor: Advisor;
  distance?: number; // distancia del usuario en km
  featured?: boolean;

  // Feed Item Data
  feedItemId?: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean; // Usuario actual dio like
  currency?: string;
}

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
}

export interface PropertyFilters {
  type?: string;
  subtype?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  levels?: number;
  age?: string;
  landAreaMin?: number;
  constructionAreaMin?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  ageMin?: number;
  ageMax?: number;
  amenities?: string[];
  financing?: string[];
  lien?: boolean;
  operationType?: "venta" | "renta" | "todas";
  state?: string;
  municipality?: string;
  colony?: string;
  currency?: "MXN" | "USD";
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}
