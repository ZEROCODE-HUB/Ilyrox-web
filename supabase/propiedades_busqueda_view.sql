-- Vista de búsqueda de propiedades para la web i360.
-- Ampliada para exponer (además de los campos genéricos):
--   * campos especializados por tipo (comercial / industrial / agrícola)
--   * datos de comisión dentro de cada operación
--   * gravámenes y financiamientos (como amenidades)
-- CREATE OR REPLACE VIEW: se conservan las columnas previas EN EL MISMO ORDEN
-- y solo se añaden columnas nuevas al final. Las columnas escalares de `p.`
-- no requieren GROUP BY porque p.id (PK) ya está agrupado.

CREATE OR REPLACE VIEW public.propiedades_busqueda_view AS
 SELECT p.id,
    p.descripcion,
    p.tipo,
    p.subtipo,
    p.estado,
    p.municipio,
    p.colonia,
    p.calle,
    p.numero_exterior,
    p.numero_interior,
    p.pisos,
    p.latitud,
    p.longitud,
    p.metros_cuadrados_construccion,
    p.metros_cuadrados_terreno,
    p.habitaciones,
    p.banos,
    p.estacionamientos,
    p.amueblado,
    p.pet_friendly,
    p.antiguedad,
    p.fotos,
    p.videos,
    p.relevancia_score,
    p.created_at,
    p.deleted_at,
    p.codigo_propiedad,
    jsonb_agg(jsonb_build_object(
        'tipo', op.tipo_operacion,
        'precio', op.precio,
        'moneda', op.moneda,
        'periodo_renta', op.periodo_renta,
        'precio_usd', op.precio / COALESCE(cm.valor_en_usd, 1.0),
        'comision_tipo', op.comision_tipo,
        'comision_porcentaje', op.comision_porcentaje,
        'comision_monto_fijo', op.comision_monto_fijo,
        'comision_meses', op.comision_meses,
        'comparte_comision', op.comparte_comision,
        'porcentaje_comision_compartida', op.porcentaje_comision_compartida,
        'monto_comision_compartida', op.monto_comision_compartida,
        'condiciones_comision_compartida', op.condiciones_comision_compartida
    )) AS operaciones,
    min(op.precio / COALESCE(cm.valor_en_usd, 1.0)) AS precio_usd_normalizado,
    string_agg(DISTINCT op.tipo_operacion::text, ', '::text) AS tipo_operacion,
    f.id AS feed_item_id,
    f.likes_count,
    f.comentarios_count,
    ( SELECT array_agg(lfi.usuario_id::text) AS array_agg
           FROM likes_feed_items lfi
          WHERE lfi.feed_item_id = f.id) AS liked_by_users,
    ( SELECT array_agg(ca.nombre) AS array_agg
           FROM propiedad_amenidades pa
             JOIN catalogo_amenidades ca ON pa.amenidad_id = ca.id
          WHERE pa.propiedad_id = p.id) AS amenidades,
    perf.id AS asesor_id,
    perf.nombre_completo AS asesor_nombre,
    perf.email AS asesor_email,
    perf.celular AS asesor_telefono,
    perf.foto AS asesor_foto,
    perf.rol AS asesor_rol,
    min(op.precio / COALESCE(cm.valor_en_usd, 1.0)) FILTER (WHERE op.tipo_operacion::text ~~* '%venta%'::text) AS precio_usd_venta,
    min(op.precio / COALESCE(cm.valor_en_usd, 1.0)) FILTER (WHERE op.tipo_operacion::text ~~* '%renta%'::text) AS precio_usd_renta,
    p.pais,
    -- ===== Columnas nuevas (añadidas al final) =====
    -- Características físicas extra
    p.medios_banos,
    -- Comercial
    p.tipo_ubicacion_comercial,
    p.nivel_piso,
    p.sobre_avenida_principal,
    p.en_esquina,
    p.alta_visibilidad,
    p.alto_flujo_vehicular,
    p.frente_metros,
    -- Terreno (frente/fondo)
    p.ancho_terreno,
    p.largo_terreno,
    -- Industrial
    p.ubicacion_industrial,
    p.altura_libre_m,
    p.area_oficinas_m2,
    p.patio_maniobras_m2,
    p.tipo_energia_kva,
    -- Agrícola
    p.tipo_agua,
    p.concesion_agua,
    p.uso_terreno,
    p.tipo_riego,
    p.infra_electricidad,
    p.infra_camino_acceso,
    p.infra_cercado,
    p.acceso_carretera,
    p.acceso_camiones,
    -- Gravámenes (institución + monto) y financiamientos aceptados
    ( SELECT jsonb_agg(jsonb_build_object('institucion', ci.nombre, 'monto', pg.monto, 'notas', pg.notas))
           FROM propiedad_gravamenes pg
             LEFT JOIN catalogo_instituciones_financieras ci ON pg.institucion_id = ci.id
          WHERE pg.propiedad_id = p.id AND COALESCE(pg.activo, true) = true) AS gravamenes,
    ( SELECT array_agg(ctf.nombre)
           FROM propiedad_financiamientos pf
             JOIN catalogo_tipos_financiamiento ctf ON pf.tipo_financiamiento_id = ctf.id
          WHERE pf.propiedad_id = p.id) AS financiamientos,
    max(op.comision_porcentaje) FILTER (WHERE op.tipo_operacion::text ~~* '%venta%'::text) AS comision_venta_pct,
    max(op.comision_meses) FILTER (WHERE op.tipo_operacion::text ~~* '%renta%'::text) AS comision_renta_meses
   FROM propiedades p
     JOIN operaciones_propiedad op ON p.id = op.propiedad_id
     LEFT JOIN configuracion_monedas cm ON op.moneda::text = cm.codigo::text
     LEFT JOIN feed_items f ON f.tipo_contenido::text = 'propiedad'::text AND f.contenido_id::text = p.id::text
     LEFT JOIN perfiles perf ON p.created_by = perf.id
  WHERE p.deleted_at IS NULL AND p.tipo_contrato IS NULL AND p.precio_contrato IS NULL
  GROUP BY p.id, f.id, f.likes_count, f.comentarios_count, perf.id, perf.nombre_completo, perf.email, perf.celular, perf.foto, perf.rol;
