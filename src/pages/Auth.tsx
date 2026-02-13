import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";
import authImage from "@/assets/auth-real-estate.jpg";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";

const Auth = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={authImage}
          alt="Propiedades inmobiliarias modernas"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Right Side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <Link
            to="/"
            className="flex lg:hidden items-center justify-center gap-2 mb-6 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-foreground">i360</span>
          </Link>

          {/* Header Text */}
          <div className="text-center space-y-2 mb-6">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 mb-3 hover:opacity-90 transition-opacity"
            >
              <div className="hidden lg:flex w-12 h-12 bg-primary rounded-full items-center justify-center shadow-lg">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <span className="hidden lg:block text-3xl font-bold text-foreground">
                i360
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Encuentra tu propiedad ideal
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Accede a las mejores oportunidades inmobiliarias
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-base">
                Iniciar sesión
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-base">
                Registrarse
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Login />
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <Register />
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground">
            Al continuar, aceptas nuestros{" "}
            <button className="text-primary hover:underline">
              Términos de servicio
            </button>{" "}
            y{" "}
            <button className="text-primary hover:underline">
              Política de privacidad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
