import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ContactForm } from "@/types/property";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Wallet,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

type Step = "budget" | "timeframe" | "comments";

export function InfoModal({ isOpen, onClose, propertyId }: InfoModalProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    comments: "",
    budget: "",
    timeframe: "",
    propertyId: propertyId || "",
  });

  const [progressTab, setProgressTab] = useState<Step>("budget");

  const steps: Step[] = ["budget", "timeframe", "comments"];
  const currentStepIndex = steps.indexOf(progressTab);

  // Load from localStorage on mount (initial load)
  useEffect(() => {
    const savedInfo = localStorage.getItem("i360_contact_info");
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setContactForm((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          budget: parsed.budget || prev.budget,
          timeframe: parsed.timeframe || prev.timeframe,
        }));
      } catch (e) {
        console.error("Error reading cached contact info:", e);
      }
    }
  }, []);

  // Sync with profile whenever modal opens and update propertyId
  useEffect(() => {
    if (isOpen) {
      setContactForm((prev) => ({
        ...prev,
        propertyId: propertyId,
        ...(profile
          ? {
              name: profile.full_name || prev.name,
              email: profile.email || prev.email,
              phone: profile.celular || prev.phone,
            }
          : {}),
      }));
    }
  }, [isOpen, profile, propertyId]);

  // Save changes to localStorage for future use (excluding comments)
  useEffect(() => {
    const dataToSave = {
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      budget: contactForm.budget,
      timeframe: contactForm.timeframe,
    };
    if (Object.values(dataToSave).some((val) => val !== "")) {
      localStorage.setItem("i360_contact_info", JSON.stringify(dataToSave));
    }
  }, [
    contactForm.name,
    contactForm.email,
    contactForm.phone,
    contactForm.budget,
    contactForm.timeframe,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactForm.budget || !contactForm.timeframe) {
      toast({
        variant: "destructive",
        title: "Información incompleta",
        description: "Por favor selecciona tu presupuesto y plazo de compra.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullMessage = `Presupuesto: ${contactForm.budget}
Plazo: ${contactForm.timeframe}
Comentarios: ${contactForm.comments || "Sin comentarios adicionales"}`;

      const { error } = await supabase.from("solicitudes_info").insert({
        propiedad_id: propertyId,
        solicitante_id: user?.id || null,
        nombre: contactForm.name,
        telefono: contactForm.phone,
        email: contactForm.email,
        mensaje: fullMessage,
        origen: "Web",
        estado: "nuevo",
      });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description:
          "Gracias por tu interés. Uno de nuestros asesores te contactarán pronto.",
      });

      // Clear only property-specific data (comments)
      setContactForm((prev) => ({
        ...prev,
        comments: "",
      }));
      onClose();
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const optionsBudget = [
    { value: "Menos de $1 Millón", label: "Menos de $1 Millón" },
    { value: "$1 - $2M", label: "$1 - $2M" },
    { value: "$2 - $4M", label: "$2 - $4M" },
    { value: "$4 - $7M", label: "$4 - $7M" },
    { value: "$7 - $10M", label: "$7 - $10M" },
    { value: "$10 - $15M", label: "$10 - $15M" },
    { value: "$15 - $30M", label: "$15 - $30M" },
    { value: "Más de $30M", label: "Más de $30M" },
    { value: "No indicado", label: "Prefiero no decirlo" },
  ];

  const optionsTimeframe = [
    { value: "Inmediato (0–3 meses)", label: "Inmediato (0–3 meses)" },
    { value: "Corto plazo (3–6 meses)", label: "Corto plazo (3–6 meses)" },
    {
      value: "Mediano plazo (6–12 meses)",
      label: "Mediano plazo (6–12 meses)",
    },
    { value: "Solo estoy comparando", label: "Solo estoy comparando" },
  ];

  const nextStep = () => {
    if (progressTab === "budget" && contactForm.budget) {
      setProgressTab("timeframe");
    } else if (progressTab === "timeframe" && contactForm.timeframe) {
      setProgressTab("comments");
    }
  };

  const prevStep = () => {
    if (progressTab === "timeframe") {
      setProgressTab("budget");
    } else if (progressTab === "comments") {
      setProgressTab("timeframe");
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const direction = currentStepIndex > steps.indexOf(progressTab) ? -1 : 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar información"
      size="md"
    >
      <div className="p-0 flex flex-col h-full max-h-[85vh]">
        {/* Progress and Navigation Header */}
        <div className="px-6 py-2 border-b bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={progressTab === "budget" || isSubmitting}
              className={cn(
                "gap-1 hover:bg-white transition-all",
                progressTab === "budget" && "opacity-0 pointer-events-none",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>

            <div className="flex items-center gap-2">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx <= currentStepIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-slate-200",
                  )}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextStep}
              disabled={
                progressTab === "comments" ||
                isSubmitting ||
                (progressTab === "budget" && !contactForm.budget) ||
                (progressTab === "timeframe" && !contactForm.timeframe)
              }
              className={cn(
                "gap-1 hover:bg-white transition-all text-primary font-medium",
                progressTab === "comments" && "opacity-0 pointer-events-none",
              )}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-center text-muted-foreground font-medium">
            Completa estos pasos para recibir la información completa y agendar
            visita.
          </p>
          <p className="text-sm text-center text-muted-foreground font-medium">
            {progressTab === "budget" && "Presupuesto aproximado"}
            {progressTab === "timeframe" && "Plazo de interés"}
            {progressTab === "comments" && "Tus datos de contacto"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="relative flex-1 overflow-y-auto p-6 scrollbar-thin">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={progressTab}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="space-y-6"
              >
                {progressTab === "budget" && (
                  <div className="space-y-4">
                    <Label className="text-slate-700 font-semibold flex items-center gap-2 text-base">
                      <Wallet className="h-5 w-5 text-primary" />
                      ¿Cuál es tu presupuesto aproximado?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {optionsBudget.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={
                            contactForm.budget === option.value
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "h-auto py-4 px-4 text-sm font-medium transition-all duration-200 border-2",
                            contactForm.budget === option.value
                              ? "border-primary bg-primary text-white shadow-md ring-2 ring-primary/20"
                              : "border-slate-100 hover:border-primary/50 hover:bg-primary/5 text-slate-600",
                            option.value === "No indicado" && "col-span-2 mt-2",
                          )}
                          onClick={() => {
                            setContactForm((prev) => ({
                              ...prev,
                              budget: option.value,
                            }));
                            setTimeout(nextStep, 300);
                          }}
                        >
                          {option.label}
                          {contactForm.budget === option.value && (
                            <CheckCircle2 className="ml-2 h-4 w-4 shrink-0" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {progressTab === "timeframe" && (
                  <div className="space-y-4">
                    <Label className="text-slate-700 font-semibold flex items-center gap-2 text-base">
                      <Clock className="h-5 w-5 text-primary" />
                      ¿En qué plazo planeas comprar o rentar?
                    </Label>
                    <div className="space-y-3">
                      {optionsTimeframe.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={
                            contactForm.timeframe === option.value
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "w-full justify-between h-auto py-4 px-6 text-sm font-medium transition-all duration-200 border-2 text-left",
                            contactForm.timeframe === option.value
                              ? "border-primary bg-primary text-white shadow-md ring-2 ring-primary/20"
                              : "border-slate-100 hover:border-primary/50 hover:bg-primary/5 text-slate-600",
                          )}
                          onClick={() => {
                            setContactForm((prev) => ({
                              ...prev,
                              timeframe: option.value,
                            }));
                            setTimeout(nextStep, 300);
                          }}
                        >
                          {option.label}
                          {contactForm.timeframe === option.value && (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {progressTab === "comments" && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-slate-700 font-semibold flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-primary" />
                        Nombre completo
                      </Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                        placeholder="Ej: Juan Pérez"
                        className="h-11 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-slate-700 font-semibold flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4 text-primary" />
                          Correo
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                          placeholder="juan@ejemplo.com"
                          className="h-11 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-slate-700 font-semibold flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4 text-primary" />
                          Teléfono
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          required
                          placeholder="55 1234 5678"
                          className="h-11 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="comments"
                        className="text-slate-700 font-semibold flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Comentarios adicionales
                      </Label>
                      <Textarea
                        id="comments"
                        value={contactForm.comments}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            comments: e.target.value,
                          }))
                        }
                        placeholder="¿Buscas algo en específico?"
                        rows={3}
                        className="border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-6 border-t bg-slate-50/50">
            {progressTab === "comments" ? (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 border-slate-200 hover:bg-white transition-colors"
                  disabled={isSubmitting}
                >
                  Cerrar
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mi solicitud"}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Paso {currentStepIndex + 1} de {steps.length}
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
