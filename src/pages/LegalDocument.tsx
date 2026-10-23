import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollRestoration } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import AvisoPrivacidadSimplificado from "@/assets/docs/AvisoPrivacidadSimplificado.md?raw";
import CondicionesCompraSuscripcionesReembolsos from "@/assets/docs/CondicionesCompraSuscripcionesReembolsos.md?raw";
import AutorizacionPreferenciasContacto from "@/assets/docs/AutorizacionPreferenciasContacto.md?raw";
import EstandaresSeguridadInfantil from "@/assets/docs/EstandaresSeguridadInfantil.md?raw";
import ContratoInstructorCreador from "@/assets/docs/ContratoInstructorCreador.md?raw";
import AcuerdoTratamientoDatos from "@/assets/docs/AcuerdoTratamientoDatos.md?raw";
import PoliticaPropiedadIntelectual from "@/assets/docs/PoliticaPropiedadIntelectual.md?raw";
import CommunityGuidelines from "@/assets/docs/CommunityGuidelines.md?raw";

interface LegalDocumentProps {
  title: string;
  markdownPath: string;
}

const DOCUMENTS: Record<string, string> = {
  "AvisoPrivacidadSimplificado.md": AvisoPrivacidadSimplificado,
  "CondicionesCompraSuscripcionesReembolsos.md": CondicionesCompraSuscripcionesReembolsos,
  "AutorizacionPreferenciasContacto.md": AutorizacionPreferenciasContacto,
  "EstandaresSeguridadInfantil.md": EstandaresSeguridadInfantil,
  "ContratoInstructorCreador.md": ContratoInstructorCreador,
  "AcuerdoTratamientoDatos.md": AcuerdoTratamientoDatos,
  "PoliticaPropiedadIntelectual.md": PoliticaPropiedadIntelectual,
  "CommunityGuidelines.md": CommunityGuidelines,
};

const LegalDocument = ({ title, markdownPath }: LegalDocumentProps) => {
  const content = DOCUMENTS[markdownPath] || "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollRestoration />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
        </header>
        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-hr:border-border prose-table:text-foreground/80 prose-th:text-foreground prose-blockquote:text-foreground/70 prose-blockquote:border-primary/40">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default LegalDocument;