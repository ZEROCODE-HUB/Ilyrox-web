import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logoIcon from "@/assets/logo-3601.png";

/**
 * Footer común del sitio. Va siempre fuera de los paneles de mapa/filtros, en el flujo normal
 * de la página, y por encima (z-30) de cualquier panel lateral.
 * Legal: solo los 5 documentos vigentes (Términos, Privacidad, Comunidad, Seguridad Infantil y
 * Preferencias de Contacto).
 */
const LEGAL_LINKS = [
  { to: "/terms", label: "Términos y Condiciones" },
  { to: "/privacy", label: "Política de Privacidad" },
  { to: "/legal/community-guidelines", label: "Normas de la Comunidad" },
  { to: "/legal/estandares-seguridad-infantil", label: "Estándares de Seguridad Infantil" },
  { to: "/legal/autorizacion-preferencias-contacto", label: "Autorización y Preferencias de Contacto" },
];

export const Footer = () => {
  return (
    <footer className="relative z-30 w-full shrink-0 border-t bg-background">
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo y descripción */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3 group">
                <img src={logoIcon} alt="ilyrox" className="w-10 h-10 object-contain rounded-lg" />
                <span className="text-xl font-bold bg-gradient-to-r from-[#41c4eb] to-[#41c4eb]/70 bg-clip-text text-transparent">
                  ilyrox
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Plataforma y red profesional inmobiliaria.
              </p>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:ayuda@ilyrox.com" className="hover:text-primary transition-colors">ayuda@ilyrox.com</a>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:privacidad@ilyrox.com" className="hover:text-primary transition-colors">privacidad@ilyrox.com</a>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="tel:+528136798047" className="hover:text-primary transition-colors">+52 81 3679 8047</a>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Aguascalientes, Aguascalientes, México</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t text-sm text-muted-foreground text-center md:text-left">
            <p>© {new Date().getFullYear()} ILYROX TECHNOLOGIES, S.A.P.I. DE C.V. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
