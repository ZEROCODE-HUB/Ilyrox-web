import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Home, Search, Zap } from "lucide-react";
import { PropertyCard } from "../PropertyCard";

interface NotificationItemProps {
  notification: any;
  onViewProperty: (property: any) => void;
}

export const NotificationItem = ({
  notification,
  onViewProperty,
}: NotificationItemProps) => {
  const isUnread = notification.estado === "pendiente";
  const propiedad = notification.propiedades;

  const getIcon = () => {
    switch (notification.tipo_match) {
      case "precio":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "nuevo":
        return <Home className="h-5 w-5 text-primary" />;
      default:
        return <Search className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 border border-border shadow-sm flex flex-col h-full",
        isUnread ? "bg-primary/5 ring-1 ring-primary/20" : "bg-card",
      )}
    >
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl",
                isUnread ? "bg-primary/20" : "bg-muted",
              )}
            >
              {getIcon()}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-bold truncate">
                {notification.tipo_match === "nuevo"
                  ? "Propiedad Nueva"
                  : notification.tipo_match === "precio"
                    ? "Cambio de Precio"
                    : "Sugerencia"}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {notification?.tipo_match === "coincidencia" ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0 border-none cursor-default">
                Coincidencia
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="text-[10px] px-2 py-0 cursor-default"
              >
                Similar
              </Badge>
            )}
            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <div className="flex-1">
          {notification.detalle && typeof notification.detalle === "string" && (
            <p className="text-xs text-muted-foreground mb-4 italic">
              "{notification.detalle}"
            </p>
          )}

          {propiedad && (
            <div className="mt-2 scale-90 origin-top transform -mb-10">
              <PropertyCard
                property={
                  {
                    ...propiedad,
                    operaciones: Array.isArray(propiedad.operaciones)
                      ? propiedad.operaciones
                      : [],
                  } as any
                }
                onViewDetails={onViewProperty}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
