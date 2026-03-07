import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConfigModal } from "./ConfigModal";
import { Badge } from "../ui/badge";
import { upperWord } from "@/utils/upperWord";

export function UserProfile() {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [openConfig, setOpenConfig] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    window.location.reload();
  };

  if (isLoading || !user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-white/10"
        >
          <Avatar
            uri={profile?.foto}
            name={profile?.full_name || "Usuario"}
            size={36}
            isWithBorder
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Avatar
                uri={profile?.foto}
                name={profile?.full_name || "Usuario"}
                size={40}
              />
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold leading-none truncate">
                  {profile?.full_name || "Usuario"}
                </p>
                <p className="text-[10px] leading-none text-muted-foreground mt-1 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            {profile?.rol && (
              <Badge
                variant="secondary"
                className="w-fit text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-none"
              >
                {upperWord(profile.rol)}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem onClick={() => setOpenConfig(true)}>
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ConfigModal
        open={openConfig}
        onOpenChange={setOpenConfig}
        profile={profile!}
      />
    </DropdownMenu>
  );
}
