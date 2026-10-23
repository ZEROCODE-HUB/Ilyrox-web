import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, FileText, Scale, Shield, Users, MessageSquare, Mail, Lock, Gavel, PenTool, Banknote, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import TermsContent from "@/assets/docs/TermsAndConditions.md?raw";
import PrivacyContent from "@/assets/docs/PrivacyPolicy.md?raw";
import CommunityGuidelinesContent from "@/assets/docs/CommunityGuidelines.md?raw";
import EstandaresSeguridadInfantilContent from "@/assets/docs/EstandaresSeguridadInfantil.md?raw";
import AutorizacionPreferenciasContactoContent from "@/assets/docs/AutorizacionPreferenciasContacto.md?raw";
import AvisoPrivacidadSimplificadoContent from "@/assets/docs/AvisoPrivacidadSimplificado.md?raw";
import CondicionesCompraSuscripcionesReembolsosContent from "@/assets/docs/CondicionesCompraSuscripcionesReembolsos.md?raw";
import ContratoInstructorCreadorContent from "@/assets/docs/ContratoInstructorCreador.md?raw";
import AcuerdoTratamientoDatosContent from "@/assets/docs/AcuerdoTratamientoDatos.md?raw";
import PoliticaPropiedadIntelectualContent from "@/assets/docs/PoliticaPropiedadIntelectual.md?raw";

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: LegalDocumentType;
}

type LegalDocumentType = 
  | "terms"
  | "privacy"
  | "community-guidelines"
  | "estandares-seguridad-infantil"
  | "autorizacion-preferencias-contacto"
  | "aviso-privacidad-simplificado"
  | "condiciones-compra-suscripciones-reembolsos"
  | "contrato-instructor-creador"
  | "acuerdo-tratamiento-datos"
  | "politica-propiedad-intelectual";

const DOCUMENTS: Record<LegalDocumentType, { title: string; content: string; icon: React.ReactNode; description: string }> = {
  terms: {
    title: "Términos y Condiciones de Uso",
    content: TermsContent,
    icon: <FileText className="h-5 w-5" />,
    description: "Condiciones generales de uso de la plataforma, servicios, leads, CRM, IA, cursos, pagos y propiedad intelectual."
  },
  privacy: {
    title: "Política de Privacidad Integral",
    content: PrivacyContent,
    icon: <Shield className="h-5 w-5" />,
    description: "Tratamiento de datos personales, finalidades, consentimientos, transferencias, derechos ARCO, seguridad y conservación."
  },
  "community-guidelines": {
    title: "Community Guidelines",
    content: CommunityGuidelinesContent,
    icon: <Users className="h-5 w-5" />,
    description: "Reglas de contenido, conducta, cursos, reseñas, leads, moderación y sanciones en la comunidad ILYROX."
  },
  "estandares-seguridad-infantil": {
    title: "Estándares de Seguridad Infantil",
    content: EstandaresSeguridadInfantilContent,
    icon: <Lock className="h-5 w-5" />,
    description: "Prevención, reporte y respuesta frente a explotación y abuso sexual infantil. Solo mayores de 18 años."
  },
  "autorizacion-preferencias-contacto": {
    title: "Autorización y Preferencias de Contacto",
    content: AutorizacionPreferenciasContactoContent,
    icon: <Mail className="h-5 w-5" />,
    description: "WhatsApp, correo, SMS, llamadas y notificaciones. Comunicaciones necesarias vs promocionales, consentimientos y bajas."
  },
  "aviso-privacidad-simplificado": {
    title: "Aviso de Privacidad Simplificado",
    content: AvisoPrivacidadSimplificadoContent,
    icon: <FileText className="h-5 w-5" />,
    description: "Versión resumida para recabación electrónica: datos, finalidades necesarias/opcionales, transferencia de leads, derechos ARCO."
  },
  "condiciones-compra-suscripciones-reembolsos": {
    title: "Condiciones de Compra, Suscripciones y Reembolsos",
    content: CondicionesCompraSuscripcionesReembolsosContent,
    icon: <Banknote className="h-5 w-5" />,
    description: "Información pre-contratación, suscripciones (aviso 5 días, cancelación inmediata), reembolsos, derecho de revocación LFPC."
  },
  "contrato-instructor-creador": {
    title: "Contrato de Instructor / Creador",
    content: ContratoInstructorCreadorContent,
    icon: <PenTool className="h-5 w-5" />,
    description: "Relación independiente, licencia de contenido, modelo económico 80/20, liquidaciones, reservas 180 días, continuidad para compradores."
  },
  "acuerdo-tratamiento-datos": {
    title: "Acuerdo de Tratamiento de Datos (DPA)",
    content: AcuerdoTratamientoDatosContent,
    icon: <Layers className="h-5 w-5" />,
    description: "Profesional = responsable CRM, ILYROX = encargado. Subencargados, seguridad, confidencialidad, derechos ARCO, incidentes."
  },
  "politica-propiedad-intelectual": {
    title: "Política de Propiedad Intelectual / Notice & Takedown",
    content: PoliticaPropiedadIntelectualContent,
    icon: <Gavel className="h-5 w-5" />,
    description: "Proceso de aviso y retiro, contra-aviso (15 días hábiles), infractores reincidentes, marcas e imagen."
  },
};

const DOCUMENT_ORDER: LegalDocumentType[] = [
  "terms",
  "privacy",
  "community-guidelines",
  "estandares-seguridad-infantil",
  "autorizacion-preferencias-contacto",
  "aviso-privacidad-simplificado",
  "condiciones-compra-suscripciones-reembolsos",
  "contrato-instructor-creador",
  "acuerdo-tratamiento-datos",
  "politica-propiedad-intelectual",
];

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  onClose,
  initialDocument = "terms",
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocumentType>(initialDocument);
  const [isScrolled, setIsScrolled] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveDoc(initialDocument);
    setIsScrolled(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [initialDocument]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 20);
  };

  const currentDoc = DOCUMENTS[activeDoc];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  {currentDoc.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{currentDoc.title}</h2>
                  <p className="text-xs text-slate-500">{currentDoc.description}</p>
                </div>
              </div>

              {/* Document Switcher */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                  aria-label="Seleccionar documento"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentDoc.title}</span>
                  {tocOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {/* TOC Dropdown */}
                {tocOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute sm:relative right-0 top-full mt-1 w-72 sm:w-80 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-20"
                  >
                    {DOCUMENT_ORDER.map((docKey) => {
                      const doc = DOCUMENTS[docKey];
                      const isActive = docKey === activeDoc;
                      return (
                        <button
                          key={docKey}
                          onClick={() => {
                            setActiveDoc(docKey);
                            setTocOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isActive
                              ? "bg-primary/5 text-primary font-medium"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <div className={cn("p-1.5 rounded-lg", isActive ? "bg-primary/10" : "bg-slate-100")}>
                            {doc.icon}
                          </div>
                          <span className="text-sm truncate">{doc.title}</span>
                          {isActive && <span className="ml-auto text-xs text-primary font-medium">Actual</span>}
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scroll indicator */}
            {isScrolled && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[70px] z-10 animate-bounce">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <ChevronDown className="h-3 w-3 text-primary" />
                </div>
              </div>
            )}

            {/* Body */}
            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 md:p-8"
            >
              <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-primary hover:prose-a:text-primary/80 prose-hr:border-slate-200 prose-table:text-slate-700 prose-th:text-slate-900 prose-blockquote:text-slate-600 prose-blockquote:border-primary/40 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentDoc.content}</ReactMarkdown>
              </article>

              {/* Bottom padding for scroll comfort */}
              <div className="h-16" />
            </div>

            {/* Footer with version info */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Scale className="h-3.5 w-3.5" />
                <span>Versión vigente publicada en ilyrox.com/legal</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import { useRef } from "react";