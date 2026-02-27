import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { notificationService } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  const checkNotifications = async () => {
    if (!user) return;

    try {
      const data = await notificationService.getNotifications(user.id);
      const pending = data.filter((m: any) => m.estado === "pendiente");

      setUnreadCount(pending.length);

      if (pending.length > 0) {
        toast({
          title: "Nueva actualización",
          description:
            "Se encontraron nuevas propiedades que coinciden con tus búsquedas.",
        });
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  useEffect(() => {
    if (user) {
      checkNotifications();

      // Optional: Set up an interval or real-time subscription here
      // const interval = setInterval(checkNotifications, 1000 * 60 * 5); // every 5 mins
      // return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  const refreshNotifications = async () => {
    if (!user) return;
    const data = await notificationService.getNotifications(user.id);
    const pending = data.filter((m: any) => m.estado === "pendiente");
    setUnreadCount(pending.length);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
