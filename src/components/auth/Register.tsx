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
import { Camera, Eye, EyeOff, User as UserIcon, X } from "lucide-react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { resetNumber } from "@/utils/resetNumber";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_MEXICO } from "@/constants/MexLocations/estados";

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    formState,
    loading,
    updateField,
    handleAvatarSelect,
    clearAvatar,
    handleRegister,
    resetForm,
  } = useAuthForm();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleRegister();
    if (success) {
      navigate("/");
      resetForm();
    }
  };

  return (
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
  );
};
