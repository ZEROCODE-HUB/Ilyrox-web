/**
 * useAuthForm.ts
 * Hook for handling auth form state and validation (Web optimized)
 */

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/services/uploadService";
import { useToast } from "@/hooks/use-toast";

export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaterno: string;
  avatarFile: File | null;
  avatarPreview: string | null;
}

const initialFormState: AuthFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastNamePaternal: "",
  lastNameMaterno: "",
  avatarFile: null,
  avatarPreview: null,
};

export function useAuthForm() {
  const [formState, setFormState] = useState<AuthFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateField = useCallback(
    <K extends keyof AuthFormState>(field: K, value: AuthFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormState(initialFormState);
  }, []);

  const handleAvatarSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo no válido",
        description: "Por favor selecciona una imagen (JPG, PNG).",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormState((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const clearAvatar = () => {
    setFormState((prev) => ({
      ...prev,
      avatarFile: null,
      avatarPreview: null,
    }));
  };

  const validateLogin = useCallback(() => {
    if (!formState.email || !formState.password) {
      toast({
        title: "Error",
        description: "Por favor ingresa email y contraseña",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [formState, toast]);

  const validateRegister = useCallback(() => {
    if (
      !formState.firstName ||
      !formState.lastNamePaternal ||
      !formState.lastNameMaterno ||
      !formState.email ||
      !formState.password
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return false;
    }
    if (!formState.email.includes("@")) {
      toast({
        title: "Error",
        description: "Email inválido",
        variant: "destructive",
      });
      return false;
    }
    if (formState.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return false;
    }
    if (formState.password !== formState.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [formState, toast]);

  const handleLogin = useCallback(async (): Promise<boolean> => {
    if (!validateLogin()) return false;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [formState, validateLogin, toast]);

  const handleRegister = useCallback(async (): Promise<boolean> => {
    if (!validateRegister()) return false;

    setLoading(true);
    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // 2. Upload Avatar using uploadService
      let finalAvatarUrl = "";
      if (formState.avatarFile) {
        try {
          // Use the uploadService as requested
          finalAvatarUrl = await uploadImage(formState.avatarFile, "perfiles");
        } catch (error) {
          console.error("Avatar upload failed:", error);
          toast({
            title: "Advertencia",
            description:
              "No se pudo subir la foto de perfil, pero se continuará con el registro.",
            variant: "destructive", // Using destructive to catch attention, or we could use default
          });
          // Continue without avatar
        }
      }

      // 3. Insert Profile
      const fullName =
        `${formState.firstName} ${formState.lastNamePaternal} ${formState.lastNameMaterno}`.trim();

      const { error: profileError } = await supabase.from("perfiles").upsert(
        {
          id: authData.user.id,
          email: formState.email,
          nombre: formState.firstName,
          apellido_paterno: formState.lastNamePaternal,
          apellido_materno: formState.lastNameMaterno,
          nombre_completo: fullName,
          foto: finalAvatarUrl,
          rol: "web",
          estado_registro: "activo",
          aprobaciones_recibidas: 3,
        },
        { onConflict: "id" },
      );

      if (profileError) {
        console.error("Profile creation error:", profileError);
        toast({
          title: "Advertencia",
          description: "Usuario creado, pero hubo un error al crear el perfil.",
          variant: "destructive",
        });
      }

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al registrarse",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [formState, validateRegister, toast]);

  return {
    formState,
    loading,
    updateField,
    resetForm,
    handleAvatarSelect,
    clearAvatar,
    handleLogin,
    handleRegister,
    setFormState,
  };
}
