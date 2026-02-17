import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { useAuthForm } from "@/hooks/useAuthForm";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthPopup({ isOpen, onClose }: AuthPopupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    formState,
    loading,
    updateField,
    handleAvatarSelect,
    clearAvatar,
    handleLogin,
    handleRegister,
    resetForm,
    setFormState,
  } = useAuthForm();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    updateField(id as any, value);
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await handleLogin();
      if (success) {
        onClose();
        resetForm();
      }
    } else {
      const success = await handleRegister();
      if (success) {
        onClose();
        resetForm();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <img
              src="/Logo.jpeg"
              alt="Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {isLogin ? "Bienvenido a ilyrox" : "Únete a ilyrox"}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin
              ? "Ingresa a tu cuenta para continuar"
              : "Crea tu cuenta para guardar propiedades y recibir notificaciones"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 px-1">
          {!isLogin && (
            <>
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
                <Label htmlFor="firstName">Nombre(s)</Label>
                <Input
                  id="firstName"
                  value={formState.firstName}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastNamePaternal">Apellido Paterno</Label>
                  <Input
                    id="lastNamePaternal"
                    value={formState.lastNamePaternal}
                    onChange={handleInputChange}
                    placeholder="Apellido"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastNameMaterno">Apellido Materno</Label>
                  <Input
                    id="lastNameMaterno"
                    value={formState.lastNameMaterno}
                    onChange={handleInputChange}
                    placeholder="Apellido"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formState.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formState.password}
                onChange={handleInputChange}
                required
                minLength={6}
                disabled={loading}
                className="pr-10"
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

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formState.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  disabled={loading}
                  className="pr-10"
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
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md mt-2"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Iniciando sesión..."
                : "Creando cuenta..."
              : isLogin
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetForm();
              }}
              className="text-sm text-primary hover:underline font-medium"
              disabled={loading}
            >
              {isLogin
                ? "¿No tienes cuenta? Regístrate aquí"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
