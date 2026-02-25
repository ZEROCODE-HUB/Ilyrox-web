import { useParams, useNavigate } from "react-router-dom";
import { useProperty } from "@/hooks/useProperty";
import { PropertyDetailContent } from "@/components/PropertyDetails/PropertyDetailContent";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import logo360 from "@/assets/logo-360.png";
import { Link } from "react-router-dom";
import { upperWord } from "@/utils/upperWord";

const PropertyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, isLoading, error } = useProperty(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">
            Cargando propiedad...
          </p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="bg-red-50 text-red-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <ChevronLeft className="h-10 w-10 rotate-180" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Propiedad no encontrada
          </h1>
          <p className="text-slate-500 text-lg">
            Lo sentimos, no pudimos encontrar la propiedad que buscas. Es
            posible que el enlace haya expirado o sea incorrecto.
          </p>
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header simplificado para la vista de propiedad */}
      <header className="bg-navbar sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10 rounded-full h-10 w-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Link to="/" className="flex items-center">
              <img src={logo360} alt="360" className="h-10 lg:h-12 w-auto" />
            </Link>
          </div>

          <div className="hidden sm:block">
            <h2 className="text-white font-bold text-xl truncate max-w-[300px] lg:max-w-md">
              {upperWord(property.tipo)} en {property.municipio}
            </h2>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full px-6"
          >
            Explorar más
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 ring-1 ring-slate-900/5">
          <PropertyDetailContent property={property} />
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="mt-16 text-center text-slate-400 text-sm">
        <p>© 2026 360 Propiedades - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default PropertyPage;
