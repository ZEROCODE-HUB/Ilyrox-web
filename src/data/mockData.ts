import { Property, Advisor } from '@/types/property';

export const mockAdvisors: Advisor[] = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@inmobiliaria.com',
    phone: '+52 55 1234 5678',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b9a0105c?w=400&h=400&fit=crop&crop=face',
    title: 'Asesora Inmobiliaria Senior'
  },
  {
    id: '2',
    name: 'Carlos Méndez',
    email: 'carlos.mendez@inmobiliaria.com',
    phone: '+52 55 8765 4321',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    title: 'Especialista en Propiedades Comerciales'
  },
  {
    id: '3',
    name: 'María López',
    email: 'maria.lopez@inmobiliaria.com',
    phone: '+52 55 5555 6666',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    title: 'Asesora Inmobiliaria'
  }
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Casa Moderna en Zona Residencial',
    description: 'Hermosa casa de dos plantas con acabados de lujo, jardín amplio y cochera para 2 autos. Ubicada en zona tranquila y segura.',
    type: 'Habitacional',
    subtype: 'Casa',
    price: 3500000,
    location: {
      address: 'Av. Las Palmas 123, Col. Jardines',
      city: 'Guadalajara',
      state: 'Jalisco',
      lat: 20.6597,
      lng: -103.3496
    },
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    furnished: false,
    petFriendly: true,
    age: 2,
    amenities: ['Jardín', 'Terraza', 'Cochera'],
    financing: ['Bancario', 'Infonavit'],
    lien: false,
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
    ],
    advisor: mockAdvisors[0],
    featured: true
  },
  {
    id: '2',
    title: 'Departamento Ejecutivo Centro',
    description: 'Departamento completamente amueblado en el corazón de la ciudad. Perfecto para ejecutivos y profesionistas.',
    type: 'Habitacional',
    subtype: 'Departamento',
    price: 2200000,
    location: {
      address: 'Torre Ejecutiva, Av. Chapultepec 456',
      city: 'Guadalajara',
      state: 'Jalisco',
      lat: 20.6736,
      lng: -103.3370
    },
    area: 85,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    furnished: true,
    petFriendly: false,
    age: 1,
    amenities: ['Gimnasio', 'Alberca', 'Seguridad 24/7'],
    financing: ['Bancario', 'Propio'],
    lien: false,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&h=600&fit=crop'
    ],
    advisor: mockAdvisors[1],
    featured: true
  },
  {
    id: '3',
    title: 'Terreno Comercial Estratégico',
    description: 'Excelente terreno para desarrollo comercial, ubicado sobre avenida principal con alto flujo vehicular.',
    type: 'Comercial',
    subtype: 'Terreno',
    price: 8500000,
    location: {
      address: 'Av. López Mateos 789',
      city: 'Zapopan',
      state: 'Jalisco',
      lat: 20.7214,
      lng: -103.3919
    },
    area: 500,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    furnished: false,
    petFriendly: true,
    age: 0,
    amenities: ['Acceso a servicios', 'Zona comercial'],
    financing: ['Bancario', 'Propio'],
    lien: false,
    images: [
      'https://images.unsplash.com/photo-1551836022-8b2858c9c69b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&h=600&fit=crop'
    ],
    advisor: mockAdvisors[2]
  },
  {
    id: '4',
    title: 'Casa Familiar con Alberca',
    description: 'Amplia casa familiar con alberca, jardín grande y excelente ubicación cerca de escuelas y centros comerciales.',
    type: 'Habitacional',
    subtype: 'Casa',
    price: 4200000,
    location: {
      address: 'Privada Los Cedros 321, Fracc. Santa Fe',
      city: 'Tlaquepaque',
      state: 'Jalisco',
      lat: 20.6401,
      lng: -103.2893
    },
    area: 220,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    furnished: false,
    petFriendly: true,
    age: 5,
    amenities: ['Alberca', 'Jardín', 'Terraza', 'Quincho'],
    financing: ['Bancario', 'Infonavit', 'Fovissste'],
    lien: false,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&h=600&fit=crop'
    ],
    advisor: mockAdvisors[0]
  },
  {
    id: '5',
    title: 'Departamento de Lujo Vista Panorámica',
    description: 'Exclusivo departamento con vista panorámica de la ciudad, acabados de primera y amenidades de lujo.',
    type: 'Habitacional',
    subtype: 'Departamento',
    price: 5800000,
    location: {
      address: 'Torre Milenio, Av. Providencia 567',
      city: 'Guadalajara',
      state: 'Jalisco',
      lat: 20.6759,
      lng: -103.3524
    },
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    furnished: true,
    petFriendly: false,
    age: 1,
    amenities: ['Gimnasio', 'Alberca', 'Spa', 'Terraza', 'Concierge'],
    financing: ['Bancario', 'Propio'],
    lien: false,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
    ],
    advisor: mockAdvisors[1],
    featured: true
  }
];

export const AMENITIES_OPTIONS = [
  'Alberca',
  'Gimnasio', 
  'Áreas verdes',
  'Seguridad 24/7',
  'Terraza',
  'Jardín',
  'Quincho',
  'Spa',
  'Concierge',
  'Salón de eventos',
  'Cancha de tenis',
  'Cancha de fútbol',
  'Playground',
  'Estacionamiento de visitas'
];

export const FINANCING_OPTIONS = [
  'Bancario',
  'Infonavit',
  'Fovissste',
  'Propio',
  'Aportación'
];