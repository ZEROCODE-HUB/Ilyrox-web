import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import authImage from "@/assets/auth-real-estate.jpg";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

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
            <img src="/icon.png" alt="" className="w-10 h-10 object-contain" />
            <span className="text-3xl font-bold text-foreground">ilyrox</span>
          </Link>

          {/* Header Text */}
          <div className="text-center space-y-2 mb-6">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 mb-3 hover:opacity-90 transition-opacity"
            >
              <img
                src="/icon.png"
                alt=""
                className="w-10 h-10 object-contain"
              />
              <span className="hidden lg:block text-3xl font-bold text-foreground">
                ilyrox
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
            <a href="/terms" className="text-primary hover:underline">
              Términos de servicio
            </a>{" "}
            y{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Política de privacidad
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
