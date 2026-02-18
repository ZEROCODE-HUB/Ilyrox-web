import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollRestoration } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import content from "@/assets/docs/PrivacyPolicy.md?raw";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollRestoration />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-hr:border-border prose-table:text-foreground/80 prose-th:text-foreground prose-blockquote:text-foreground/70 prose-blockquote:border-primary/40">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
