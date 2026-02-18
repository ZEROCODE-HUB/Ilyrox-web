import { Link } from "react-router-dom";
import { Home, Bell, Heart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
            <img src="/icon.png" alt="" className="w-10 h-10 object-contain " />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#41c4eb] to-[#41c4eb]/70 bg-clip-text text-transparent">
            ilyrox
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium hover:text-[#41c4eb] transition-colors"
          >
            Inicio
          </Link>
          {/* <Link
            to="/search"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Calculadora hipotecaria
          </Link>
          <Link
            to="/search"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Cómo funciona
          </Link> */}
        </nav>

        <div className="flex items-center gap-2">
          {/*<div className="hidden md:flex items-center gap-2">
             <Button variant="ghost" size="icon" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/saved">
                <Heart className="h-5 w-5" />
              </Link>
            </Button> 
            <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>*/}

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/search" className="w-full cursor-pointer">
                  Buscar propiedades
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/search" className="w-full cursor-pointer">
                  Calculadora hipotecaria
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/search" className="w-full cursor-pointer">
                  Cómo funciona
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="w-full cursor-pointer">
                  Notificaciones
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/saved" className="w-full cursor-pointer">
                  Guardados
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/auth" className="w-full cursor-pointer">
                  Mi cuenta
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
