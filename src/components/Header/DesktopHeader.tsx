import { Link, useNavigate } from "react-router-dom";
import { SearchAndSort } from "./SearchAndSort";
import { ZoneSearch } from "./ZoneSearch";
import logo360 from "@/assets/logo-360.png";
import { Bell, Heart, Home } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { UserProfile } from "./UserProfile";
import { Button } from "../ui/button";
import { getCurrentLocation } from "@/utils/geolocation";
import { UserLocation } from "@/types/property";
import { useFilterStore } from "@/stores/useFilterStore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DesktopHeaderProps {
  user: any;
  onLogin: () => void;
  setShowRentSellPopup: (show: boolean) => void;
  isAuthLoading: boolean;
  setUserLocation: (loc: UserLocation | null) => void;
  setCenterLocation: (loc: [number, number]) => void;
}

export const DesktopHeader = ({
  user,
  onLogin,
  setShowRentSellPopup,
  isAuthLoading,
  setUserLocation,
  setCenterLocation,
}: DesktopHeaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const setRadiusKm = useFilterStore((s) => s.setRadiusKm);

  const handleLocationSearch = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setCenterLocation([location.lat, location.lng]);
      setRadiusKm(5);
      toast({
        title: "Ubicación detectada",
        description: "Buscando propiedades cerca de ti.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de ubicación",
        description: "No se pudo obtener tu ubicación actual.",
      });
    }
  };

  return (
    <div className="hidden md:block">
      <div className="px-[30px] pt-2 pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* Espaciador Izquierdo para mantener simetría (opcional, igual al ancho del bloque derecho) */}
          <div className="flex-shrink-0 hidden xl:block w-[360px]"></div>

          {/* Centro - Logo + Búsqueda y ZoneSearch debajo */}
          <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0 pt-2">
            <div className="flex items-center gap-4 w-full justify-center lg:pl-10">
              <Link
                to="/"
                className="flex-shrink-0 hover:opacity-90 transition-opacity"
              >
                <img
                  src={logo360}
                  alt="360"
                  className="h-16 lg:h-14 w-12 lg:w-12 object-contain hover:scale-110 transition-transform pr-2"
                />
              </Link>
              <div className="w-full max-w-2xl">
                <SearchAndSort
                  onLocationSearch={handleLocationSearch}
                  onFocus={() => {}}
                />
              </div>
            </div>

            <div className="w-full flex justify-center">
              <ZoneSearch />
            </div>
          </div>

          {/* Derecha - Perfil y Acciones */}
          <div className="flex-shrink-0 w-[360px] flex flex-col items-end gap-2.5 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() =>
                    !!user ? navigate("/notifications") : onLogin()
                  }
                  className="p-2 bg-white/5 hover:bg-white/15 hover:scale-110 transition-all duration-200 rounded-full group border border-white/5"
                  title="Notificaciones"
                >
                  <Bell className="h-9 w-9 text-white" strokeWidth={1.5} />
                </button>

                <button
                  onClick={() => (!!user ? navigate("/saved") : onLogin())}
                  className="p-2 bg-white/5 hover:bg-white/15 hover:scale-110 transition-all duration-200 rounded-full group border border-white/5"
                  title="Favoritos"
                >
                  <Heart className="h-9 w-9 text-white" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex items-center">
                {user ? (
                  isAuthLoading ? (
                    <Skeleton className="h-10 w-10 rounded-full" />
                  ) : (
                    <UserProfile />
                  )
                ) : (
                  <Button
                    onClick={() => navigate("/auth")}
                    className="bg-white text-navbar hover:bg-white/95 font-bold px-7 h-11 shadow-xl rounded-full transition-all hover:-translate-y-0.5 active:scale-95"
                  >
                    Iniciar sesión
                  </Button>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (user) setShowRentSellPopup(true);
                else onLogin();
              }}
              className="flex items-center gap-2 text-white/50 hover:text-white text-base font-medium transition-all group mr-1"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="underline-offset-4 decoration-white/10 group-hover:underline group-hover:decoration-white/100">
                Quiero rentar / vender mi inmueble
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
