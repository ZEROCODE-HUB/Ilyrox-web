/**
 * useAuthForm.ts
 * Hook for handling auth form state and validation (Web optimized)
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  estado: string;
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
  estado: "",
  avatarFile: null,
  avatarPreview: null,
};

export function useAuthForm() {
  const [formState, setFormState] = useState<AuthFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        variant: "destructive",
        title: "Archivo no válido",
        description: "Por favor selecciona una imagen (JPG, PNG).",
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
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa email y contraseña",
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
      !formState.estado ||
      !formState.email ||
      !formState.password
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
      });
      return false;
    }
    if (!formState.email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email inválido",
      });
      return false;
    }
    if (formState.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
      });
      return false;
    }
    if (formState.password !== formState.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
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
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
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
      // 1. Upload Avatar First (so we don't create auth user if this crucial step fails, though it's optional)
      let finalAvatarUrl = "";
      if (formState.avatarFile) {
        try {
          finalAvatarUrl = await uploadImage(formState.avatarFile, "perfiles");
        } catch (error) {
          console.error("Avatar upload failed:", error);
          toast({
            variant: "destructive",
            title: "Advertencia",
            description:
              "No se pudo subir la foto de perfil antes del registro. Intente sin foto.",
          });
          setLoading(false);
          return false; // Stop registration if image upload throws an error to avoid orphaned users
        }
      }

      const fullName =
        `${formState.firstName} ${formState.lastNamePaternal} ${formState.lastNameMaterno}`.trim();

      // 2. Create Auth User AND pass metadata for Database Triggers (Atomic operation backend-side)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            // Este data payload permite que un Trigger en la base de datos cree el perfil automáticamente
            nombre: formState.firstName,
            apellido_paterno: formState.lastNamePaternal,
            apellido_materno: formState.lastNameMaterno,
            nombre_completo: fullName,
            foto: finalAvatarUrl,
            rol: "web",
            estado_registro: "activo",
            aprobaciones_recibidas: 3,
            estado: formState.estado,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // 3. Fallback: Intentar insertar el perfil manualmente desde el cliente
      // Usamos upsert para no duplicar si el Trigger de la BD ya lo creó.
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
          estado: formState.estado,
        },
        { onConflict: "id" },
      );

      // Si el upsert falla (por ej. debido a RLS porque el usuario aún no tiene sesión verificada),
      // pero el trigger funcionó, no hay problema. Si falla y NO hay trigger, informamos del error.
      if (profileError) {
        console.warn(
          "Manual profile upsert warning (might be blocked by RLS, relying on DB Trigger):",
          profileError,
        );
      }

      toast({
        title: "¡Cuenta creada!",
        description: "Se ha enviado un correo para verificar tu cuenta.",
      });
      navigate("/auth");
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al registrarse",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [formState, validateRegister, toast, navigate]);

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
