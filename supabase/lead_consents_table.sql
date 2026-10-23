-- ============================================================================
-- TABLA: lead_consents
-- Registro de evidencia de consentimientos para formularios de captación de leads
-- Cumple: LFPDPPP, Checklist Legal §4, §19, Política Privacidad §8, §9
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lead_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencia a la solicitud de información
  solicitud_id UUID NOT NULL REFERENCES public.solicitudes_info(id) ON DELETE CASCADE,
  
  -- Consentimientos obligatorios
  attend_request BOOLEAN NOT NULL DEFAULT FALSE,           -- "Autorizo a ILYROX a atender mi solicitud"
  transfer_to_professionals BOOLEAN,                       -- ACEPTA/NO ACEPTA transferencia a profesional(es) — NULL si no aplica
  privacy_policy_read BOOLEAN NOT NULL DEFAULT FALSE,      -- "He leído el Aviso de Privacidad Simplificado"
  
  -- Consentimiento opcional
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,        -- "Deseo recibir promociones" (NO pre-marcado)
  
  -- Trazabilidad y evidencia probatoria (Checklist §3)
  aviso_version VARCHAR(50) NOT NULL DEFAULT 'v1.1-2026-09-28',  -- Versión del aviso mostrado
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),            -- Timestamp UTC de aceptación
  ip_hash VARCHAR(64),                                     -- Hash SHA-256 de la IP (no IP directa)
  user_agent TEXT,                                         -- User agent del navegador
  form_context VARCHAR(50) NOT NULL DEFAULT 'property_inquiry', -- Contexto: property_inquiry, course_interest, etc.
  professionals_count VARCHAR(20) NOT NULL DEFAULT 'multiple', -- "one" | "multiple" (para texto "uno"/"uno o más")
  
  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_lead_consents_solicitud_id ON public.lead_consents(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_lead_consents_accepted_at ON public.lead_consents(accepted_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_consents_form_context ON public.lead_consents(form_context);

-- ============================================================================
-- RLS (Row Level Security)
-- Solo roles admin/legal pueden leer los consentimientos
-- Los usuarios NO pueden ver sus propios consentimientos directamente (privacidad)
-- ============================================================================

ALTER TABLE public.lead_consents ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins y legal team pueden leer
CREATE POLICY "Legal team can read lead consents" ON public.lead_consents
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'legal', 'service_role')
  );

-- Política: Service role puede insertar (desde edge functions o backend)
CREATE POLICY "Service role can insert lead consents" ON public.lead_consents
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Política: Service role puede actualizar
CREATE POLICY "Service role can update lead consents" ON public.lead_consents
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_lead_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_lead_consents_updated_at ON public.lead_consents;
CREATE TRIGGER trigger_update_lead_consents_updated_at
  BEFORE UPDATE ON public.lead_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_lead_consents_updated_at();

-- ============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.lead_consents IS 
'Evidencia de consentimientos para formularios de leads (Checklist Legal §4, §19). 
Registra: attend_request, transfer_to_professionals (ACEPTA/NO ACEPTA), privacy_policy_read, marketing_consent.
Incluye trazabilidad: versión aviso, timestamp, IP hash, user agent, contexto formulario.';

COMMENT ON COLUMN public.lead_consents.attend_request IS 
'Obligatorio. Usuario autoriza a ILYROX a atender su solicitud. Checkbox no pre-marcado.';

COMMENT ON COLUMN public.lead_consents.transfer_to_professionals IS 
'Obligatorio cuando la ley exige consentimiento para transferir. 
TRUE = ACEPTA transferencia a "uno o más" profesional(es). 
FALSE = NO ACEPTA (datos no salen de ILYROX). 
NULL = No aplica (ej. formulario sin transferencia).';

COMMENT ON COLUMN public.lead_consents.privacy_policy_read IS 
'Obligatorio. Usuario confirma haber leído el Aviso de Privacidad Simplificado.';

COMMENT ON COLUMN public.lead_consents.marketing_consent IS 
'Opcional. NO pre-marcado. Rechazar no impide uso básico ni envío de solicitud.';

COMMENT ON COLUMN public.lead_consents.ip_hash IS 
'Hash SHA-256 de la IP del usuario (no IP directa). Para trazabilidad sin exponer dato personal.';

COMMENT ON COLUMN public.lead_consents.professionals_count IS 
'"one" | "multiple". Determina si el aviso dice "uno" o "uno o más" profesional(es).';

-- ============================================================================
-- ACTUALIZAR TABLA solicitudes_info PARA SOPORTAR ESTADO SIN TRANSFERIR
-- ============================================================================

-- Agregar columnas si no existen
ALTER TABLE public.solicitudes_info 
ADD COLUMN IF NOT EXISTS transfer_consent BOOLEAN,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;

-- Comentario
COMMENT ON COLUMN public.solicitudes_info.transfer_consent IS 
'TRUE = usuario aceptó transferencia a profesional(es). 
FALSE = usuario NO aceptó (estado "nuevo_sin_transferir"). 
NULL = no se preguntó (formularios legacy).';

COMMENT ON COLUMN public.solicitudes_info.marketing_consent IS 
'Usuario aceptó recibir comunicaciones promocionales.';

-- ============================================================================
-- VISTA PARA AUDITORÍA LEGAL
-- ============================================================================

CREATE OR REPLACE VIEW public.v_lead_consents_audit AS
SELECT 
  lc.id,
  lc.solicitud_id,
  si.propiedad_id,
  si.nombre AS lead_nombre,
  si.email AS lead_email,
  si.telefono AS lead_telefono,
  si.estado AS solicitud_estado,
  lc.attend_request,
  lc.transfer_to_professionals,
  lc.privacy_policy_read,
  lc.marketing_consent,
  lc.aviso_version,
  lc.accepted_at,
  lc.ip_hash,
  lc.form_context,
  lc.professionals_count,
  lc.user_agent
FROM public.lead_consents lc
JOIN public.solicitudes_info si ON si.id = lc.solicitud_id
ORDER BY lc.accepted_at DESC;

-- Permisos en la vista
GRANT SELECT ON public.v_lead_consents_audit TO authenticated;
REVOKE ALL ON public.v_lead_consents_audit FROM anon;

-- ============================================================================
-- FUNCIÓN HELPER: Hash de IP (para usar en edge function)
-- ============================================================================

-- CREATE OR REPLACE FUNCTION public.hash_ip(ip TEXT) RETURNS TEXT AS $$
-- BEGIN
--   RETURN encode(digest(ip, 'sha256'), 'hex');
-- END;
-- $$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;