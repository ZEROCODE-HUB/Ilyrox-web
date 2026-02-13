export type propiedades = {
  id: string;
  tipo?: string;
  subtipo?: string;
  metros_cuadrados_construccion?: number;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
  amueblado?: boolean;
  pet_friendly?: boolean;
  antiguedad?: number;
  caracteristicas_especificas?: string[];
  descripcion_planta_baja?: string;
  descripcion_planta_alta?: string;
  monto_enganche?: number;
  fotos?: string[];
  videos?: string[];
  created_by?: string;
  created_at?: string;
  activo?: boolean;
  search_vector?: string;
  pisos?: number;
  latitud?: number;
  longitud?: number;
  relevancia_score?: number;
  vistas_count?: number;
  compartidas_count?: number;
  embedding?: string;
  ciudad?: string;
  municipio?: string;
  codigo_propiedad?: string;
  easybroker_id?: string;
  es_easybroker?: boolean;
  easybroker_updated_at?: string;
  fecha_venta?: string;
  metros_cuadrados_terreno?: number;
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  colonia?: string;
  deleted_at?: string;
  modified_by?: string;
  updated_at?: string;
  status?: string;
  descripcion?: string;
  estado?: string;
  operaciones_propiedad?: operaciones_propiedad[];
};

export type operaciones_propiedad = {
  id: string;
  propiedad_id: string;
  tipo_operacion: string;
  precio: number;
  moneda: string;
  periodo_renta: string;
  comision_tipo: string;
  comision_porcentaje: number;
  comision_monto_fijo: number;
  comparte_comision: boolean;
  porcentaje_comision_compartida: number;
  monto_comision_compartida: number;
  condiciones_comision_compartida: string;
  activa: boolean;
  vigente_desde: string;
  vigente_hasta: string;
  create_at: string;
  update_at: string;
};

export type feed_items = {
  id: string;
  tipo_contenido: string;
  contenido_id: string;
  publicado_por: string;
  vistas_count: number;
  likes_count: number;
  comentarios_count: number;
  compartidos_count: number;
  guardados_count: number;
  engagement_score: number;
  tiempo_visualizacion_promedio?: number;
  reportes_count: number;
  estado_moderacion: string;
  visibilidad: string;
  publicado_en: string;
  deleted_at?: string;
  created_at: string;
};

export type comentarios = {
  id: string;
  feed_item_id: string;
  publicado_por: string;
  contenido: string;
  imagenes?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  parent_comentario_id?: string;
  nivel_anidacion: number;
};

export type likes_comentarios = {
  id: string;
  comentario_id: string;
  usuario_id: string;
  created_at: string;
  deleted_at?: string;
};

export type likes_feed_items = {
  id: string;
  feed_item_id: string;
  usuario_id: string;
  created_at: string;
  deleted_at?: string;
};

export type perfiles = {
  id: string;
  nombre: string;
  rol: string;
  created_at: string;
  apellido_materno: string;
  apellido_paterno: string;
  prefijo_celular: string;
  celular: string;
  pais: string;
  estado: string;
  anos_experiencia: number;
  ocupacion: string;
  otro_ocupacion?: string;
  modalidad: string;
  nombre_inmobiliaria: string;
  curso_certificacion: string;
  email: string;
  foto: string;
  nombre_completo: string;
  estado_registro: string;
  aprobaciones_recibidas: number;
  aprobaciones_requeridas: number;
  activado_en: string;
  deleted_at: string;
  biografia: string;
  sitio_web: string;
  calificacion_promedio: number;
  total_calificaciones: number;
  total_recomendaciones_positivas: number;
  total_recomendaciones_negativas: number;
  updated_at: string;
};

// Interface extension based on View_propiedades_busqueda
export interface PropertyView extends propiedades {
  // Operations
  operaciones?: {
    tipo: string;
    precio: number;
    moneda: string;
    periodo_renta?: string;
    precio_usd: number;
  }[];
  tipo_operacion?: string; // Will contain comma separated types from VIEW
  precio_original?: number;
  moneda_original?: string;
  precio_usd_normalizado?: number;

  // Feed
  feed_item_id?: string;
  likes_count?: number;
  comentarios_count?: number;
  liked_by_users?: string[]; // array of user ids

  // Advisor (flattened from perfiles)
  asesor_id?: string;
  asesor_nombre?: string;
  asesor_email?: string;
  asesor_telefono?: string;
  asesor_foto?: string;
  asesor_rol?: string;

  // Computed / Helper
  isLiked?: boolean;
  amenidades?: string[];
}
