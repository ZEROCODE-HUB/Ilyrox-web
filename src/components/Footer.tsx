import { Link } from "react-router-dom";
import {
  Home,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <img
                  src="/icon.png"
                  alt=""
                  className="w-10 h-10 object-contain "
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#41c4eb] to-[#41c4eb]/70 bg-clip-text text-transparent">
                ilyrox
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Tu aliado confiable para encontrar la propiedad de tus sueños con
              las mejores opciones de financiamiento.
            </p>
            {/* <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Facebook className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            </div> */}
          </div>

          {/* Servicios */}
          <div>
            <h3 className="font-semibold mb-4">Servicios</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/search"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Buscar propiedades
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Calculadora hipotecaria
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/search"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Acerca de nosotros
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/search"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cómo funciona
                </Link>
              </li> */}
              <li>
                <Link
                  to="/search"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>ayuda@ilyrox.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+52 (55) 1234-5678</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Ciudad de México, México</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 ilyrox. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link
                to="/search"
                className="hover:text-primary transition-colors"
              >
                Términos y Condiciones
              </Link>
              <Link
                to="/search"
                className="hover:text-primary transition-colors"
              >
                Aviso de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
