/**
 * LegalDocumentModal - visor de documentos legales (popup).
 *
 * Usa el Dialog de Radix: al abrirse desde otro diálogo (registro del home, solicitud de info,
 * configuración) queda ENCIMA y es el único activo, sin segundo popup suelto ni bloqueos de foco.
 * Documentos: los 5 vigentes (Términos, Privacidad, Comunidad, Seguridad Infantil y Preferencias
 * de Contacto) + el Aviso Simplificado, que solo se abre desde los formularios.
 */
import { useEffect, useRef, useState } from "react";
import { FileText, Scale, Shield, Users, Mail, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import TermsContent from "@/assets/docs/TermsAndConditions.md?raw";
import PrivacyContent from "@/assets/docs/PrivacyPolicy.md?raw";
import CommunityGuidelinesContent from "@/assets/docs/CommunityGuidelines.md?raw";
import EstandaresSeguridadInfantilContent from "@/assets/docs/EstandaresSeguridadInfantil.md?raw";
import AutorizacionPreferenciasContactoContent from "@/assets/docs/AutorizacionPreferenciasContacto.md?raw";
import AvisoPrivacidadSimplificadoContent from "@/assets/docs/AvisoPrivacidadSimplificado.md?raw";

export type LegalDocumentType =
  | "terms"
  | "privacy"
  | "community-guidelines"
  | "estandares-seguridad-infantil"
  | "autorizacion-preferencias-contacto"
  | "aviso-privacidad-simplificado";

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Acepta también "contact" (alias antiguo de autorizacion-preferencias-contacto). */
  initialDocument?: LegalDocumentType | "contact";
}

const DOCUMENTS: Record<LegalDocumentType, { title: string; version: string; content: string; icon: React.ReactNode }> = {
  terms: { title: "Términos y Condiciones", version: "2.2", content: TermsContent, icon: <FileText className="h-5 w-5" /> },
  privacy: { title: "Política de Privacidad", version: "10.2", content: PrivacyContent, icon: <Shield className="h-5 w-5" /> },
  "community-guidelines": { title: "Normas de la Comunidad", version: "2.1", content: CommunityGuidelinesContent, icon: <Users className="h-5 w-5" /> },
  "estandares-seguridad-infantil": { title: "Estándares de Seguridad Infantil", version: "2.2", content: EstandaresSeguridadInfantilContent, icon: <Lock className="h-5 w-5" /> },
  "autorizacion-preferencias-contacto": { title: "Autorización y Preferencias de Contacto", version: "1.2", content: AutorizacionPreferenciasContactoContent, icon: <Mail className="h-5 w-5" /> },
  "aviso-privacidad-simplificado": { title: "Aviso de Privacidad Simplificado", version: "1.1", content: AvisoPrivacidadSimplificadoContent, icon: <FileText className="h-5 w-5" /> },
};

// Los 5 documentos que se pueden elegir en el selector (el Aviso Simplificado solo se abre desde formularios).
const DOCUMENT_ORDER: LegalDocumentType[] = [
  "terms",
  "privacy",
  "community-guidelines",
  "estandares-seguridad-infantil",
  "autorizacion-preferencias-contacto",
];

const resolveDoc = (d: LegalDocumentType | "contact" | undefined): LegalDocumentType => {
  if (d === "contact") return "autorizacion-preferencias-contacto";
  return d && DOCUMENTS[d] ? d : "terms";
};

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  onClose,
  initialDocument = "terms",
}) => {
  const resolved = resolveDoc(initialDocument);
  const [activeDoc, setActiveDoc] = useState<LegalDocumentType>(resolved);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setActiveDoc(resolved);
  }, [isOpen, resolved]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeDoc, isOpen]);

  const currentDoc = DOCUMENTS[activeDoc];
  const options = DOCUMENT_ORDER.includes(activeDoc) ? DOCUMENT_ORDER : [...DOCUMENT_ORDER, activeDoc];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="z-[200] w-[calc(100%-2rem)] max-w-5xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col bg-white rounded-2xl"
        overlayClassName="z-[200] bg-black/70"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 p-5 pr-12 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">{currentDoc.icon}</div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-slate-900 tracking-tight">
                {currentDoc.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Versión {currentDoc.version}
              </DialogDescription>
            </div>
          </div>
          <select
            aria-label="Seleccionar documento"
            value={activeDoc}
            onChange={(e) => setActiveDoc(e.target.value as LegalDocumentType)}
            className="w-full sm:w-80 px-3 py-2 text-sm text-slate-700 bg-slate-50 rounded-xl border border-slate-200"
          >
            {options.map((key) => (
              <option key={key} value={key}>
                {DOCUMENTS[key].title}
              </option>
            ))}
          </select>
        </div>

        {/* Body */}
        <div ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 md:p-8">
          <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-primary hover:prose-a:text-primary/80 prose-hr:border-slate-200 prose-table:text-slate-700 prose-th:text-slate-900 prose-blockquote:text-slate-600 prose-blockquote:border-primary/40 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentDoc.content}</ReactMarkdown>
          </article>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Scale className="h-3.5 w-3.5" />
            <span>{currentDoc.title} · versión {currentDoc.version}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
          >
            Entendido
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
