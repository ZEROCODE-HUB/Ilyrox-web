import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Bell, Heart } from "lucide-react";
import { UserProfile } from "./UserProfile";
import { SearchAndSort } from "./SearchAndSort";
import { ZoneSearch } from "./ZoneSearch";
import { Filter } from "lucide-react";
import logo360 from "@/assets/logo-360.png";
import { getCurrentLocation } from "@/utils/geolocation";
import { useState } from "react";
import { UserLocation } from "@/types/property";
import { useFilterStore } from "@/stores/useFilterStore";
import { sileo } from "sileo";

interface MobileHeaderProps {
  user: any;
  onLogin: () => void;
  setUserLocation: (loc: UserLocation | null) => void;
  setCenterLocation: (loc: [number, number]) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export const MobileHeader = ({
  user,
  onLogin,
  setUserLocation,
  setCenterLocation,
  setShowFilters,
}: MobileHeaderProps) => {
  const navigate = useNavigate();
  const setRadiusKm = useFilterStore((s) => s.setRadiusKm);

  const handleLocationSearch = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setCenterLocation([location.lat, location.lng]);
      setRadiusKm(5);
      sileo.success({
        title: "Ubicación detectada",
        description: "Mostrando propiedades cercanas a tu ubicación.",
        position: "top-right",
      });
    } catch {
      sileo.error({
        title: "Error de ubicación",
        description:
          "No se pudo obtener tu ubicación. Verifica los permisos del navegador.",
        position: "top-right",
      });
    }
  };

  return (
    <div className="md:hidden">
      <div className="px-3 py-3 flex items-center justify-between gap-2">
        <Link
          to="/"
          className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="flex items-end">
            <div className="flex flex-col items-center mr-0.5">
              <img src={logo360} alt="360" className="h-[60px] w-auto" />
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (!!user ? navigate("/notifications") : onLogin())}
            className="h-9 w-9 hover:bg-white/10 transition-colors"
          >
            <Bell className="h-5 w-5 text-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => (!!user ? navigate("/saved") : onLogin())}
            className="h-9 w-9 hover:bg-white/10 transition-colors"
          >
            <Heart className="h-5 w-5 text-white" />
          </Button>

          {!!user ? (
            <UserProfile />
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="bg-white text-navbar hover:bg-white/90 font-medium px-3 h-9 text-sm shadow-md"
            >
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>

      <div className="px-3 pb-3 space-y-3">
        <SearchAndSort onLocationSearch={handleLocationSearch} />
        <ZoneSearch />
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        >
          <Filter className="h-4 w-4 mr-2" />
          Más filtros
        </Button>
      </div>
    </div>
  );
};
