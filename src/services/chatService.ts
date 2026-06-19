import { supabase } from "@/lib/supabase";

/**
 * Servicio de contacto/chat. Replica la lógica de la app móvil:
 *   - Una conversación por par de usuarios + propiedad.
 *   - usuario1_id/usuario2_id ordenados de forma estable para evitar duplicados.
 *   - El primer mensaje crea la conversación (getOrCreate) e inserta en `mensajes`.
 * Así, un mensaje enviado desde la web le llega al asesor en su app móvil.
 */

/** Busca una conversación existente entre dos usuarios para una propiedad. */
async function findConversation(
  a: string,
  b: string,
  propertyId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("conversaciones")
    .select("id")
    .or(
      `and(usuario1_id.eq.${a},usuario2_id.eq.${b}),and(usuario1_id.eq.${b},usuario2_id.eq.${a})`,
    )
    .eq("propiedad_id", propertyId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("findConversation error:", error);
    return null;
  }
  return data?.id ?? null;
}

/** Devuelve la conversación existente o crea una nueva. */
async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string,
  propertyId: string,
): Promise<string | null> {
  const existing = await findConversation(currentUserId, otherUserId, propertyId);
  if (existing) return existing;

  // Orden estable de los IDs (igual que el móvil) para garantizar unicidad.
  const [u1, u2] = [currentUserId, otherUserId].sort();
  const { data, error } = await supabase
    .from("conversaciones")
    .insert({ usuario1_id: u1, usuario2_id: u2, propiedad_id: propertyId })
    .select("id")
    .single();

  if (error) {
    console.error("createConversation error:", error);
    return null;
  }
  return data.id;
}

/**
 * Inicia el contacto con el asesor enviando el primer mensaje.
 * @returns el id de la conversación, o null si falló.
 */
export async function contactarAsesor(params: {
  currentUserId: string;
  asesorId: string;
  propertyId: string;
  mensaje: string;
}): Promise<string | null> {
  const { currentUserId, asesorId, propertyId, mensaje } = params;
  if (currentUserId === asesorId) {
    throw new Error("No puedes contactarte a ti mismo.");
  }

  const conversationId = await getOrCreateConversation(
    currentUserId,
    asesorId,
    propertyId,
  );
  if (!conversationId) return null;

  const { error: msgError } = await supabase.from("mensajes").insert({
    conversacion_id: conversationId,
    emisor_id: currentUserId,
    contenido: mensaje.trim(),
    tipo: "texto",
    metadata: { destinatario_id: asesorId, propiedad_id: propertyId },
  });
  if (msgError) {
    console.error("sendMessage error:", msgError);
    return null;
  }

  // Actualiza el preview de la conversación (igual que el móvil).
  await supabase
    .from("conversaciones")
    .update({
      ultimo_mensaje_preview: mensaje.trim().slice(0, 100),
      ultimo_mensaje_en: new Date().toISOString(),
    })
    .eq("id", conversationId);

  return conversationId;
}
