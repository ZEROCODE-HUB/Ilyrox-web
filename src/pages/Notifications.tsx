import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const notifications = [
    {
      id: 1,
      title: "Nueva propiedad disponible",
      message:
        "Se ha encontrado una nueva propiedad que coincide con tus criterios de búsqueda",
      time: "Hace 2 horas",
      unread: true,
    },
    {
      id: 2,
      title: "Precio actualizado",
      message:
        "El precio de la propiedad en Polanco ha sido reducido en $500,000 MXN",
      time: "Hace 1 día",
      unread: true,
    },
    {
      id: 3,
      title: "Tour virtual disponible",
      message: "Ya puedes hacer un tour virtual de la propiedad en Roma Norte",
      time: "Hace 2 días",
      unread: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="h-16 bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 h-full flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-primary">
              Notificaciones
            </span>
          </div>
          <div className="ml-auto">{user && <UserProfile />}</div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.unread ? "border-primary/20" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {notification.title}
                  </CardTitle>
                  {notification.unread && (
                    <Badge variant="default" className="ml-2">
                      Nuevo
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notification.time}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
