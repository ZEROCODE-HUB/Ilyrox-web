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
      {/* Aviso de Privacidad Simplificado (compacto) */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="flex-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Aviso de Privacidad Simplificado:</span> usaremos tus datos
          para crear y proteger tu cuenta y operar tu perfil.{" "}
          <button type="button" className={linkClass} onClick={() => setDoc("aviso-privacidad-simplificado")}>
            Ver aviso
          </button>{" "}
          ·{" "}
          <button type="button" className={linkClass} onClick={() => setDoc("privacy")}>
            Política completa
          </button>
        </p>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/50">
        {/* 1. Términos y Condiciones */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Checkbox
            id="acceptedTerms"
            checked={formState.acceptedTerms}
            onCheckedChange={(v) => updateField("acceptedTerms", v === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 text-sm text-slate-700">
            <Label htmlFor="acceptedTerms" className="font-medium cursor-pointer">
              Acepto los{" "}
              <button type="button" className={linkClass} onClick={() => setDoc("terms")}>
                Términos y Condiciones de ILYROX
              </button>{" "}
              <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">Obligatorio.</p>
          </div>
        </div>

        {/* 2. Política de Privacidad */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Checkbox
            id="acceptedPrivacy"
            checked={formState.acceptedPrivacy}
            onCheckedChange={(v) => updateField("acceptedPrivacy", v === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 text-sm text-slate-700">
            <Label htmlFor="acceptedPrivacy" className="font-medium cursor-pointer">
              He leído la{" "}
              <button type="button" className={linkClass} onClick={() => setDoc("privacy")}>
                Política de Privacidad
              </button>{" "}
              <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">Obligatorio.</p>
          </div>
        </div>

        {/* 3. Mayoría de edad */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <Checkbox
            id="acceptedAge"
            checked={formState.acceptedAge}
            onCheckedChange={(v) => updateField("acceptedAge", v === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 text-sm text-slate-700">
            <Label htmlFor="acceptedAge" className="font-medium cursor-pointer">
              Confirmo que tengo 18 años o más <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              Obligatorio. ILYROX está dirigido exclusivamente a personas mayores de edad.
            </p>
          </div>
        </div>

        {/* 4. Información pública (informativo, igual que en la app móvil) */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-xs text-slate-600">
            <p className="font-medium text-slate-700">Información pública de tu perfil</p>
            <p className="mt-1">
              Serán <strong>visibles públicamente</strong>: tu nombre y foto, estado y ocupación, biografía (si la
              completas), y los inmuebles, publicaciones, reels y reseñas que publiques.
            </p>
            <p className="mt-1">
              Tu teléfono, correo, mensajes privados y datos fiscales <strong>nunca</strong> se publican.
            </p>
          </div>
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
