import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { useNotifications } from "@/contexts/NotificationContext";

export function useNotificationsQuery(userId?: string) {
  const { refreshNotifications } = useNotifications();
  const queryClient = useQueryClient();

  // Query to fetch all notifications
  const notificationsQuery = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await notificationService.getNotifications(userId);
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Mutation to mark as read
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      return await notificationService.markAsRead(userId);
    },
    onSuccess: () => {
      // Refresh count in context
      refreshNotifications();
      // Optionally invalidate query to update local list status if needed
      // Actually we might want to update the local list status optimistically
      queryClient.setQueryData(["notifications", userId], (oldData: any[]) => {
        if (!oldData) return [];
        return oldData.map((n) => ({ ...n, estado: "visto" }));
      });
    },
  });

  return {
    ...notificationsQuery,
    markAsRead: markAsReadMutation.mutate,
  };
}
