import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/services/notificationService";
import { NotificationList } from "@/components/Notifications/NotificationList";
import { useNotifications } from "@/contexts/NotificationContext";
import { PropertyDetail } from "@/components/PropertyDetails/PropertyDetail";
import { PropertyView } from "@/types/types";

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<PropertyView | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetails = (property: PropertyView) => {
    setSelectedProperty(property);
    setIsDetailOpen(true);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data || []);

      // Mark as read automatically when entering the page
      if (data && data.some((m: any) => m.estado === "pendiente")) {
        await notificationService.markAsRead(user.id);
        refreshNotifications(); // Update unread count in context
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="h-16 bg-card border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 h-full flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mr-2 rounded-full h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Bell className="h-5 w-5 text-primary hover:animate-bell-ring" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Notificaciones
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-px bg-border mx-2" />
            {user && <UserProfile />}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="p-2 rounded-lg w-fit flex items-center gap-2">
                <Bell className="h-10 w-10 text-primary hover:animate-bell-ring" />
                <p className="text-gray-600 font-medium border-b-2 border-primary pb-2 cursor-default">
                  Mantente al tanto de tus búsquedas y propiedades favoritas.
                </p>
              </div>
            </div>
          </div>

          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            onViewProperty={handleViewDetails}
          />
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  );
};

export default Notifications;
