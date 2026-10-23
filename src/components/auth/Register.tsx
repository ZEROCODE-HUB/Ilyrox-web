import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, Eye, EyeOff, User as UserIcon, X, Shield, FileText, Users, Globe, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { resetNumber } from "@/utils/resetNumber";
import { useToast } from "@/hooks/use-toast";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_MEXICO } from "@/constants/MexLocations/estados";
import { LegalDocumentModal } from "./LegalDocumentModal";
import { Checkbox } from "@/components/ui/checkbox";
import { PrivacyNoticeBlock } from "@/components/legal/PrivacyNoticeBlock";

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalDocToShow, setLegalDocToShow] = useState<"terms" | "privacy" | "aviso-privacidad-simplificado">("terms");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Legal checkboxes state
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [readPrivacy, setReadPrivacy] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [acknowledgedPublicProfile, setAcknowledgedPublicProfile] = useState(false);

  const {
    formState,
    loading,
    updateField,
    handleAvatarSelect,
    clearAvatar,
    handleRegister,
    resetForm,
  } = useAuthForm();

  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { id, value } = e.target;
    if (id === "phone") {
      value = resetNumber(value).slice(0, 10);
    }
    updateField(id as any, value);
  };

  const handleEstadoChange = (value: string) => {
    updateField("estado", value);
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarSelect(file);
  };

  const validateLegalCheckboxes = (): boolean => {
    if (!acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes aceptar los Términos y Condiciones de ILYROX",
      });
      return false;
    }
    if (!readPrivacy) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes confirmar haber leído la Política de Privacidad",
      });
      return false;
    }
    if (!confirmedAge) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes confirmar que tienes 18 años o más",
      });
      return false;
    }
    if (!acknowledgedPublicProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes confirmar qué información de tu perfil será pública",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLegalCheckboxes()) return;
    const success = await handleRegister();
    if (success) {
      navigate("/");
      resetForm();
      setAcceptedTerms(false);
      setReadPrivacy(false);
      setConfirmedAge(false);
      setAcknowledgedPublicProfile(false);
    }
  };

  const openLegalModal = (doc: "terms" | "privacy" | "aviso-privacidad-simplificado") => {
    setLegalDocToShow(doc);
    setShowLegalModal(true);
  };

  return (
    <>
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
          <CardDescription>Completa el formulario para comenzar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                {formState.avatarPreview ? (
                  <img
                    src={formState.avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              {formState.avatarPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-sm"
                  onClick={clearAvatar}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Label className="text-xs text-muted-foreground">
              Foto de perfil (Opcional)
            </Label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onAvatarChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">
              Nombre(s) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={formState.firstName}
              onChange={handleInputChange}
              placeholder="Juan"
              required
              className="h-11"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastNamePaternal">
                Apellido Paterno <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastNamePaternal"
                value={formState.lastNamePaternal}
                onChange={handleInputChange}
                placeholder="Pérez"
                required
                className="h-11"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastNameMaterno">
                Apellido Materno <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastNameMaterno"
                value={formState.lastNameMaterno}
                onChange={handleInputChange}
                placeholder="García"
                required
                className="h-11"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formState.estado}
              onValueChange={handleEstadoChange}
              required
              disabled={loading}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona tu estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_MEXICO.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Número de teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="text"
              placeholder="5512345678"
              value={formState.phone}
              onChange={handleInputChange}
              required
              className="h-11"
              disabled={loading}
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formState.email}
              onChange={handleInputChange}
              required
              className="h-11"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formState.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="h-11 pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmar contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formState.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={6}
                className="h-11 pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Aviso de Privacidad Simplificado - Onboarding */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm text-slate-700">
              <p className="font-medium">
                Aviso de Privacidad Simplificado
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Consulta el aviso resumido en{" "}
                <span
                  className="text-primary hover:underline cursor-pointer"
                  onClick={() => openLegalModal("aviso-privacidad-simplificado")}
                >
                  este popup
                </span>
                .
              </p>
            </div>
          </div>

          {/* Legal Checkboxes & Profile Publicity */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            {/* 1. Términos y Condiciones */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Checkbox
                id="acceptedTerms"
                checked={acceptedTerms}
                onCheckedChange={setAcceptedTerms}
                disabled={loading}
                className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div className="flex-1 text-sm text-slate-700">
                <Label htmlFor="acceptedTerms" className="font-medium cursor-pointer">
                  Acepto los <span className="text-primary hover:underline cursor-pointer" onClick={() => openLegalModal("terms")}>Términos y Condiciones de ILYROX</span>
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">Obligatorio. Reglas de uso, leads, CRM, IA, cursos, pagos y propiedad intelectual.</p>
              </div>
            </div>

            {/* 2. Política de Privacidad */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Checkbox
                id="readPrivacy"
                checked={readPrivacy}
                onCheckedChange={setReadPrivacy}
                disabled={loading}
                className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div className="flex-1 text-sm text-slate-700">
                <Label htmlFor="readPrivacy" className="font-medium cursor-pointer">
                  He leído la <span className="text-primary hover:underline cursor-pointer" onClick={() => openLegalModal("privacy")}>Política de Privacidad</span>
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">Obligatorio. Tratamiento de datos, finalidades, consentimientos, transferencias, derechos ARCO y seguridad.</p>
              </div>
            </div>

            {/* 3. Confirmación de mayoría de edad */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <Checkbox
                id="confirmedAge"
                checked={confirmedAge}
                onCheckedChange={setConfirmedAge}
                disabled={loading}
                className="mt-0.5 h-4.5 w-4.5 rounded border-amber-300 text-amber-700 focus:ring-amber-600"
              />
              <div className="flex-1 text-sm text-slate-700">
                <Label htmlFor="confirmedAge" className="font-medium cursor-pointer">
                  Confirmo que tengo 18 años o más
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">Obligatorio. ILYROX está dirigido exclusivamente a personas mayores de edad.</p>
              </div>
            </div>

            {/* 4. Confirmación de perfil público */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="mt-0.5 flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 text-sm text-slate-700">
                <p className="font-medium">Información pública de tu perfil</p>
                <p className="text-xs text-slate-600 mt-1">
                  Al registrarte, la siguiente información será <strong>visible públicamente</strong> en tu perfil profesional y en fichas que publiques:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 mt-1.5 space-y-1">
                  <li>Nombre completo y foto de perfil</li>
                  <li>Estado y ocupación (ej. "Agente Inmobiliario")</li>
                  <li>Biografía (si la completas)</li>
                  <li>Fichas de inmuebles que publiques (precio, ubicación, fotos, descripción)</li>
                  <li>Reseñas que recibas y des</li>
                  <li>Cursos que publiques como Instructor</li>
                </ul>
                <p className="text-xs text-slate-500 mt-2">
                  Tu teléfono, email, CRM, mensajes privados y datos fiscales <strong>nunca</strong> se publican.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="acknowledgedPublicProfile"
                    checked={acknowledgedPublicProfile}
                    onCheckedChange={setAcknowledgedPublicProfile}
                    disabled={loading}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="acknowledgedPublicProfile" className="font-medium cursor-pointer text-sm">
                    Entiendo y acepto qué información será pública
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
      </CardContent>
    </Card>

    <LegalDocumentModal
      isOpen={showLegalModal}
      onClose={() => setShowLegalModal(false)}
      initialDocument={legalDocToShow}
    />
    </>
  );
};
