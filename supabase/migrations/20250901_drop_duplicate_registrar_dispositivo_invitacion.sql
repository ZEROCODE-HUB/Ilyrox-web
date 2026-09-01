-- Migration: 20250901_drop_duplicate_registrar_dispositivo_invitacion
-- Descripción: Elimina la versión de 4 parámetros de registrar_dispositivo_invitacion
--              ya que existe una versión de 12 parámetros que la cubre completamente.
--              Esto resuelve el error PGRST203 de PostgREST (sobrecarga de funciones ambigua).

DROP FUNCTION IF EXISTS public.registrar_dispositivo_invitacion(text, text, text, text);
