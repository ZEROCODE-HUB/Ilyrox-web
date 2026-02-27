import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { savePropertyService } from "@/services/savePropertyService";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

export const useSavedProperties = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: savedIds = [], isLoading } = useQuery({
    queryKey: ["savedPropertyIds", user?.id],
    queryFn: () => savePropertyService.getSavedPropertyIds(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async ({
      id,
      intendedState,
    }: {
      id: string;
      intendedState: boolean;
    }) => {
      // If intendedState is true, we want to save. If false, we want to remove.
      if (intendedState) {
        await savePropertyService.saveProperty(id);
        return { type: "added", id };
      } else {
        await savePropertyService.removeProperty(id);
        return { type: "removed", id };
      }
    },
    onMutate: async ({ id, intendedState }) => {
      // Cancelar consultas en curso
      await queryClient.cancelQueries({
        queryKey: ["savedPropertyIds", user?.id],
      });

      // Guardar estado anterior
      const previousSavedIds = queryClient.getQueryData<string[]>([
        "savedPropertyIds",
        user?.id,
      ]);

      // Actualización optimista
      queryClient.setQueryData<string[]>(
        ["savedPropertyIds", user?.id],
        (old = []) => {
          if (intendedState) {
            // Add if not present
            return old.includes(id) ? old : [...old, id];
          } else {
            // Remove if present
            return old.filter((savedId) => savedId !== id);
          }
        },
      );

      return { previousSavedIds };
    },
    onError: (err, newTodo, context) => {
      // Revertir cambio en caso de error
      queryClient.setQueryData(
        ["savedPropertyIds", user?.id],
        context?.previousSavedIds,
      );
      toast({
        title: "Error",
        description: "No se pudo actualizar guardados.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      if (data.type === "added") {
        toast({
          title: "Propiedad guardada",
          description: "La propiedad se ha guardado en tu lista.",
        });
      } else {
        toast({
          title: "Eliminado de guardados",
          description: "La propiedad se ha eliminado de tu lista.",
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["savedPropertyIds", user?.id],
      });
      // Invalidar también la lista completa de propiedades guardadas si existe esa query
      queryClient.invalidateQueries({
        queryKey: ["savedProperties", user?.id],
      });
    },
  });

  const isSaved = (propertyId: string) => savedIds.includes(propertyId);

  return {
    savedIds,
    isSaved,
    toggleSave: toggleSaveMutation.mutate,
    isLoading,
  };
};
