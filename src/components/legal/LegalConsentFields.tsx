/**
 * LegalConsentFields - bloque legal ÚNICO del registro web (página /auth y popup del home).
 *
 * - 3 casillas obligatorias, sin marcar: Términos, Política de Privacidad leída, 18+.
 * - Confirmación clara de qué información del perfil y contenido será pública (informativa).
 * - Aviso de Privacidad Simplificado con enlace al documento.
 * El estado vive en useAuthForm (acceptedTerms / acceptedPrivacy / acceptedAge), que además
 * bloquea el registro si falta alguna: ningún formulario puede saltarse la aceptación.
 */
import { useState } from "react";
import { Shield, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  LegalDocumentModal,
  type LegalDocumentType,
} from "@/components/auth/LegalDocumentModal";
import type { AuthFormState } from "@/hooks/useAuthForm";

interface LegalConsentFieldsProps {
  formState: Pick<AuthFormState, "acceptedTerms" | "acceptedPrivacy" | "acceptedAge">;
  updateField: <K extends "acceptedTerms" | "acceptedPrivacy" | "acceptedAge">(
    field: K,
    value: boolean,
  ) => void;
  disabled?: boolean;
}

export function LegalConsentFields({ formState, updateField, disabled }: LegalConsentFieldsProps) {
  const [doc, setDoc] = useState<LegalDocumentType | null>(null);

  // Los enlaces son botones (no <span> dentro del Label): abrir el documento no marca la casilla.
  const linkClass = "text-primary hover:underline font-medium";

  return (
    <>
      {/* Aviso de Privacidad Simplificado EN el formulario (punto de recolección), en una caja con scroll
          propio para no alargar el registro. El texto integral se abre aparte. */}
      <section
        aria-label="Aviso de Privacidad Simplificado"
        className="rounded-xl border border-slate-200 bg-slate-50"
      >
        <div
          tabIndex={0}
          className="max-h-36 overflow-y-auto custom-scrollbar p-3 text-xs text-slate-600 space-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Shield className="h-4 w-4 text-primary flex-shrink-0" />
            Aviso de Privacidad Simplificado
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Responsable:</strong> ILYROX TECHNOLOGIES, S.A.P.I. DE C.V.
            </li>
            <li>
              <strong>Usamos tus datos para</strong> crear y proteger tu cuenta, operar tu perfil, fichas, mensajes y
              herramientas, publicar tu contenido y prevenir fraude.
            </li>
            <li>
              <strong>Promociones y publicidad</strong> son opcionales: no se activan con este registro y puedes
              oponerte o retirarlos cuando quieras.
            </li>
            <li>
              <strong>Derechos ARCO</strong> y revocación:{" "}
              <a className={linkClass} href="mailto:privacidad@ilyrox.com">
                privacidad@ilyrox.com
              </a>
            </li>
          </ul>
          <p>
            Consulta la{" "}
            <button type="button" className={linkClass} onClick={() => setDoc("privacy")}>
              Política de Privacidad completa
            </button>
            .
          </p>
        </div>
      </section>

      {/* Información pública (informativo, igual que en la app móvil) */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-xs text-slate-600">
          <p className="font-medium text-slate-700">Información pública de tu perfil</p>
          <p className="mt-1">
            Serán <strong>visibles públicamente</strong> (app, sitio web y buscadores): tu nombre y foto, estado y
            ocupación, biografía (si la completas), y los inmuebles, publicaciones, reels y reseñas que publiques.
            Tu teléfono o correo pueden mostrarse como medio de contacto; ILYROX puede reemplazarlos por formularios o
            botones de contacto. Tus mensajes privados y los datos privados de tu CRM <strong>no</strong> se hacen
            públicos.
          </p>
        </div>
      </div>

      {/* Casillas obligatorias, sin marcar */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="acceptedTerms"
            checked={formState.acceptedTerms}
            onCheckedChange={(v) => updateField("acceptedTerms", v === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label htmlFor="acceptedTerms" className="text-sm font-normal leading-snug text-slate-700 cursor-pointer">
            Acepto los{" "}
            <button type="button" className={linkClass} onClick={() => setDoc("terms")}>
              Términos y Condiciones de ILYROX
            </button>{" "}
            <span className="text-red-500">*</span>
          </Label>
        </div>

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="acceptedPrivacy"
            checked={formState.acceptedPrivacy}
            onCheckedChange={(v) => updateField("acceptedPrivacy", v === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label htmlFor="acceptedPrivacy" className="text-sm font-normal leading-snug text-slate-700 cursor-pointer">
            He leído la{" "}
            <button type="button" className={linkClass} onClick={() => setDoc("privacy")}>
              Política de Privacidad
            </button>{" "}
            <span className="text-red-500">*</span>
          </Label>
        </div>

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="acceptedAge"
            checked={formState.acceptedAge}
            onCheckedChange={(v) => updateField("acceptedAge", v === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label htmlFor="acceptedAge" className="text-sm font-normal leading-snug text-slate-700 cursor-pointer">
            Confirmo que tengo 18 años o más <span className="text-red-500">*</span>
          </Label>
        </div>
      </div>

      <LegalDocumentModal
        isOpen={doc !== null}
        onClose={() => setDoc(null)}
        initialDocument={doc ?? "terms"}
      />
    </>
  );
}
