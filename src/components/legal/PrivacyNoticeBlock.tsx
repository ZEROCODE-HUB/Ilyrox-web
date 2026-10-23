import { Link } from "react-router-dom";
import {
  Building2,
  Database,
  Shield,
  Users,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FormContext = 
  | "onboarding"
  | "lead_form"
  | "instructor_signup"
  | "checkout"
  | "crm";

interface PrivacyNoticeBlockProps {
  context: FormContext;
  professionalsCount?: "one" | "multiple";
  isSubscription?: boolean;
  className?: string;
}

const DATA_CATEGORY_LABELS: Record<string, string> = {
  identificacion: "Nombre, apellidos, foto de perfil",
  contacto: "Teléfono, correo electrónico",
  perfil_profesional: "Ocupación, experiencia, especialidad, estado",
  ubicacion: "Estado, ubicación general",
  tecnicos: "IP, dispositivo, logs, identificadores técnicos",
  interes_lead: "Inmueble/servicio de interés, presupuesto, plazo, mensaje",
  mensaje: "Comentarios adicionales",
  fiscales: "RFC, constancia de situación fiscal, domicilio fiscal",
  bancarios: "Cuenta bancaria o método de liquidación",
  cursos: "Cursos publicados, materiales, precios",
  pago_tokenizado: "Referencia de pago (tokenizado, sin datos completos de tarjeta)",
  facturacion: "Datos de facturación, uso CFDI",
};

const NECESSARY_PURPOSE_LABELS: Record<string, string> = {
  cuentas: "Crear, autenticar, administrar y proteger tu cuenta",
  perfiles_fichas: "Operar perfiles, fichas, búsquedas, networking",
  seguridad_fraude: "Prevenir fraude, seguridad, cumplimiento legal",
  obligaciones_legales: "Cumplir obligaciones fiscales, contractuales, de consumo",
  atender_solicitud: "Atender tu solicitud de información o contacto",
  transferir_profesional: "Transferir tu solicitud a profesional(es) para que te contacten",
  validar_identidad: "Validar tu identidad y representación profesional",
  publicar_cursos: "Publicar y distribuir tus Cursos en la plataforma",
  cobro_liquidacion: "Procesar cobros, liquidaciones y facturación",
  antifraude: "Prevención de fraude y contracargos",
  procesar_compra: "Procesar tu compra y dar acceso al Curso/servicio",
  acceso_curso: "Habilitar y mantener acceso al contenido adquirido",
  facturar: "Emitir comprobantes fiscales (CFDI)",
  liquidar_instructor: "Liquidar al Instructor correspondiente",
};

const OPTIONAL_PURPOSE_LABELS: Record<string, string> = {
  promociones: "Enviar promociones, novedades, Cursos, eventos u ofertas",
  audiencias_publicitarias: "Crear audiencias publicitarias y medir campañas",
  testimonios: "Usar testimonios, nombre, imagen o contenido en campañas externas",
  datos_compradores: "Acceder a datos de compradores para soporte académico",
  suscripcion_recurrente: "Cobro recurrente automático (suscripciones)",
};

const CONTEXT_CONFIG: Record<FormContext, {
  title: string;
  subtitle: string;
  dataCategories: string[];
  necessaryPurposes: string[];
  optionalPurposes: string[];
  showTransferLeads: boolean;
  showWhatsAppConsent: boolean;
  showSubscriptionNotice: boolean;
}> = {
  onboarding: {
    title: "Aviso de Privacidad Simplificado — Registro",
    subtitle: "Al crear tu cuenta, tratamos los siguientes datos:",
    dataCategories: ["identificacion", "contacto", "perfil_profesional", "ubicacion", "tecnicos"],
    necessaryPurposes: ["cuentas", "perfiles_fichas", "seguridad_fraude", "obligaciones_legales"],
    optionalPurposes: ["promociones", "audiencias_publicitarias", "testimonios"],
    showTransferLeads: false,
    showWhatsAppConsent: true,
    showSubscriptionNotice: false,
  },
  lead_form: {
    title: "Aviso de Privacidad Simplificado — Solicitud de información",
    subtitle: "Al solicitar información, tratamos los siguientes datos:",
    dataCategories: ["identificacion", "contacto", "interes_lead", "mensaje"],
    necessaryPurposes: ["atender_solicitud", "transferir_profesional", "seguridad_fraude", "obligaciones_legales"],
    optionalPurposes: ["promociones", "audiencias_publicitarias"],
    showTransferLeads: true,
    showWhatsAppConsent: false,
    showSubscriptionNotice: false,
  },
  instructor_signup: {
    title: "Aviso de Privacidad Simplificado — Alta de Instructor",
    subtitle: "Al registrarte como Instructor, tratamos los siguientes datos:",
    dataCategories: ["identificacion", "contacto", "perfil_profesional", "fiscales", "bancarios", "cursos", "tecnicos"],
    necessaryPurposes: ["validar_identidad", "publicar_cursos", "cobro_liquidacion", "facturar", "antifraude", "obligaciones_legales"],
    optionalPurposes: ["promociones", "audiencias_publicitarias", "datos_compradores"],
    showTransferLeads: false,
    showWhatsAppConsent: false,
    showSubscriptionNotice: false,
  },
  checkout: {
    title: "Aviso de Privacidad Simplificado — Compra",
    subtitle: "Al realizar una compra, tratamos los siguientes datos:",
    dataCategories: ["identificacion", "contacto", "pago_tokenizado", "facturacion", "cursos"],
    necessaryPurposes: ["procesar_compra", "acceso_curso", "facturar", "liquidar_instructor", "antifraude", "obligaciones_legales"],
    optionalPurposes: ["promociones", "audiencias_publicitarias", "suscripcion_recurrente"],
    showTransferLeads: false,
    showWhatsAppConsent: false,
    showSubscriptionNotice: true,
  },
  crm: {
    title: "Aviso de Privacidad — CRM Profesional",
    subtitle: "Como responsable de tus contactos, tú determinas las finalidades. ILYROX actúa como encargado técnico:",
    dataCategories: ["identificacion", "contacto", "perfil_profesional", "interes_lead", "mensaje", "tecnicos"],
    necessaryPurposes: ["crm_operacion", "crm_seguridad", "crm_respaldo", "crm_derechos"],
    optionalPurposes: [],
    showTransferLeads: false,
    showWhatsAppConsent: false,
    showSubscriptionNotice: false,
  },
};

export function PrivacyNoticeBlock({
  context,
  professionalsCount = "multiple",
  isSubscription = false,
  className,
}: PrivacyNoticeBlockProps) {
  const config = CONTEXT_CONFIG[context];
  const isMultiple = professionalsCount === "multiple";

  return (
    <div className={cn("p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm", className)}>
      {/* 1. Responsable */}
      <div className="flex items-start gap-3 mb-4">
        <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-slate-700">
          <p className="font-semibold">{config.title}</p>
          <p className="mt-1 text-xs text-slate-600">{config.subtitle}</p>
          <div className="mt-2 text-xs text-slate-600 space-y-0.5">
            <p><strong>Responsable:</strong> ILYROX TECHNOLOGIES, S.A.P.I. DE C.V.</p>
            <p><strong>RFC:</strong> ITE2608279M7</p>
            <p><strong>Domicilio:</strong> Aguascalientes, Ags.</p>
            <p><strong>Notificaciones:</strong> Juan Morales 1319, Col. Hacienda los Morales, San Nicolás de los Garza, NL, C.P. 66495</p>
            <p><strong>Contacto privacidad:</strong> <a href="mailto:privacidad@ilyrox.com" className="text-primary hover:underline">privacidad@ilyrox.com</a></p>
          </div>
        </div>
      </div>

      {/* 2. Categorías de datos */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
          <Database className="h-4 w-4 text-primary" />
          Datos que recabamos en este formulario
        </div>
        <ul className="space-y-1 list-disc list-inside text-slate-600">
          {config.dataCategories.map((cat) => (
            <li key={cat}>{DATA_CATEGORY_LABELS[cat] || cat}</li>
          ))}
        </ul>
      </div>

      {/* 3. Finalidades necesarias */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
          <Shield className="h-4 w-4 text-green-600" />
          Finalidades necesarias (no requieren consentimiento adicional)
        </div>
        <ul className="space-y-1 list-disc list-inside text-slate-600">
          {config.necessaryPurposes.map((p) => (
            <li key={p}>{NECESSARY_PURPOSE_LABELS[p] || p}</li>
          ))}
        </ul>
      </div>

      {/* 4. Finalidades opcionales */}
      {config.optionalPurposes.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
            <Users className="h-4 w-4 text-amber-600" />
            Finalidades opcionales (requieren tu consentimiento)
          </div>
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            {config.optionalPurposes.map((p) => (
              <li key={p}>{OPTIONAL_PURPOSE_LABELS[p] || p}</li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-1">
            Rechazar estas finalidades no impide el uso básico del servicio.
          </p>
        </div>
      )}

      {/* 5. Transferencia de Leads */}
      {config.showTransferLeads && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Transferencia de tu solicitud a profesional(es)</p>
              <p>
                Tus datos se compartirán con <strong>{isMultiple ? "uno o más" : "uno"}</strong> 
                profesional(es) seleccionado(s) para que te contacten y atiendan tu solicitud.
              </p>
              <p className="mt-1">
                Requerimos tu elección expresa: <strong>ACEPTA / NO ACEPTA</strong> (ver checkboxes abajo).
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Si eliges "NO ACEPTA", ILYROX no transferirá tus datos con base en consentimiento; 
                ello no afecta otras funciones que no dependan de dicha transferencia.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Suscripciones recurrentes */}
      {config.showSubscriptionNotice && isSubscription && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Suscripción con cobro recurrente</p>
              <p>Se informará de forma clara la periodicidad, monto y fecha de cobro antes de contratar.</p>
              <p className="mt-1">Se recabará tu consentimiento expreso e informado para el cobro recurrente.</p>
              <p className="mt-1">Aviso de renovación automática con al menos <strong>5 días naturales</strong> de anticipación.</p>
              <p className="mt-1">Podrás cancelar la renovación sin penalización y el servicio de forma inmediata.</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. WhatsApp específico */}
      {config.showWhatsAppConsent && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-start gap-2">
            <Mail className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">Comunicaciones por WhatsApp</p>
              <p>Si autorizas recibir mensajes por WhatsApp, se solicitará consentimiento específico separado.</p>
              <p className="text-xs text-green-600 mt-1">Podrás darte de baja en cualquier momento respondiendo "BAJA", "STOP" o "NO QUIERO MENSAJES".</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. Derechos ARCO */}
      <div className="mb-4 pt-3 border-t border-slate-200">
        <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Tus derechos (ARCO)
        </div>
        <p className="text-sm text-slate-600 mb-1">
          Acceso, rectificación, cancelación, oposición, revocación, limitación del uso/divulgación:
        </p>
        <a 
          href="mailto:privacidad@ilyrox.com" 
          className="text-primary hover:underline text-sm flex items-center gap-1 inline-block"
        >
          <Mail className="h-3.5 w-3.5" />
          privacidad@ilyrox.com
        </a>
        <p className="text-xs text-slate-500 mt-1">
          También puedes ejercerlos mediante los controles de la App, Sitio o en los propios mensajes (baja).
        </p>
      </div>

      {/* 9. Enlace a Aviso Integral */}
      <div className="pt-3 border-t border-slate-200">
        <Link
          to={context === "onboarding" ? "/privacy" : "/privacy"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1 inline-flex"
        >
          <FileText className="h-4 w-4" />
          Consultar Política de Privacidad Integral completa
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export type { FormContext };