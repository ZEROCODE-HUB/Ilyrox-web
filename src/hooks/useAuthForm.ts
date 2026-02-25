/**
 * useAuthForm.ts
 * Hook for handling auth form state and validation (Web optimized)
 */

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/services/uploadService";
import { sileo } from "sileo";

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
      sileo.error({
        title: "Archivo no válido",
        description: "Por favor selecciona una imagen (JPG, PNG).",
        position: "top-center",
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
      sileo.error({
        title: "Error",
        description: "Por favor ingresa email y contraseña",
        position: "top-center",
      });
      return false;
    }
    return true;
  }, [formState]);

  const validateRegister = useCallback(() => {
    if (
      !formState.firstName ||
      !formState.lastNamePaternal ||
      !formState.lastNameMaterno ||
      !formState.email ||
      !formState.password
    ) {
      sileo.error({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        position: "top-center",
      });
      return false;
    }
    if (!formState.email.includes("@")) {
      sileo.error({
        title: "Error",
        description: "Email inválido",
        position: "top-center",
      });
      return false;
    }
    if (formState.password.length < 6) {
      sileo.error({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        position: "top-center",
      });
      return false;
    }
    if (formState.password !== formState.confirmPassword) {
      sileo.error({
        title: "Error",
        description: "Las contraseñas no coinciden",
        position: "top-center",
      });
      return false;
    }
    return true;
  }, [formState]);

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
      sileo.error({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        position: "top-center",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [formState, validateLogin]);

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
          sileo.error({
            title: "Advertencia",
            description:
              "No se pudo subir la foto de perfil, pero se continuará con el registro.",
            position: "top-center",
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
        sileo.error({
          title: "Advertencia",
          description: "Usuario creado, pero hubo un error al crear el perfil.",
          position: "top-center",
        });
      }

      return true;
    } catch (error: any) {
      sileo.error({
        title: "Error",
        description: error.message || "Ocurrió un error al registrarse",
        position: "top-center",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [formState, validateRegister]);

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
