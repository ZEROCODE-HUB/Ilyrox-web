import { upperWord } from "@/utils/upperWord";
import { SkeletonCard } from "../shared/SkeletonCard";
import { NotificationItem } from "./NotificationItem";
import { BellOff, Search, Bell } from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface NotificationListProps {
  notifications: any[];
  isLoading: boolean;
  onViewProperty: (property: any) => void;
}

export const NotificationList = ({
  notifications,
  isLoading,
  onViewProperty,
}: NotificationListProps) => {
  if (isLoading) {
    return (
      <>
        <div className="space-y-6">
          <Card className="flex flex-col h-full border-border bg-card">
            <CardContent className="px-4 pt-4 pb-0 flex flex-col gap-3">
              <Skeleton className="h-10 w-2/4" />
            </CardContent>
            <CardContent className="px-4 pt-4 pb-0 flex flex-col gap-3 mb-5">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="justify-center grid grid-cols-2 gap-4 mt-5">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-muted p-6 rounded-full">
          <BellOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold">No tienes notificaciones</h3>
          <p className="text-muted-foreground">
            Te avisaremos cuando encontremos nuevas propiedades para ti.
          </p>
        </div>
      </div>
    );
  }

  // Group notifications by busqueda_id
  const groupedNotifications = notifications.reduce(
    (acc: any, notification) => {
      const busquedaId = notification.busqueda_id || "sin-busqueda";
      if (!acc[busquedaId]) {
        acc[busquedaId] = {
          busqueda: notification.busqueda_detalle,
          matches: [],
        };
      }
      acc[busquedaId].matches.push(notification);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-12">
      {Object.entries(groupedNotifications).map(
        ([busquedaId, group]: [string, any]) => (
          <div key={busquedaId} className="space-y-6">
            {/* Header de la sección (Búsqueda Guardada) */}
            {group.busqueda ? (
              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">
                    Búsqueda:{" "}
                    {upperWord(group.busqueda.tipo_propiedad) || "Cualquiera"}{" "}
                    en {group.busqueda.estado}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-white/50 p-3 rounded-xl border border-border/50">
                  {group.busqueda.colonias && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground/70">
                        📍 Colonias:
                      </span>{" "}
                      {group.busqueda.colonias.join(", ")}
                    </div>
                  )}
                  {group.busqueda.tipo_operacion && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground/70">
                        💼 Operación:
                      </span>{" "}
                      {upperWord(group.busqueda.tipo_operacion)}
                    </div>
                  )}
                  {(group.busqueda.precio_min || group.busqueda.precio_max) && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground/70">
                        💰 Precio:
                      </span>
                      {group.busqueda.moneda}{" "}
                      {new Intl.NumberFormat("es-MX").format(
                        group.busqueda.precio_min || 0,
                      )}{" "}
                      -{" "}
                      {new Intl.NumberFormat("es-MX").format(
                        group.busqueda.precio_max || 0,
                      )}
                    </div>
                  )}
                  {group.busqueda.habitaciones && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground/70">
                        🛏️ Hab:
                      </span>{" "}
                      {group.busqueda.habitaciones}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="bg-muted p-2 rounded-lg">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg text-muted-foreground">
                  Otras Notificaciones
                </h3>
              </div>
            )}

            {/* Grid de Propiedades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.matches.map((notification: any) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onViewProperty={onViewProperty}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
};
