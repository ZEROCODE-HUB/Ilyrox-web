import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Apple, Play, Users, Share2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

const APP_SCHEME =
  import.meta.env.VITE_APP_SCHEME ||
  "ilyroxapp://invite";
const APP_STORE_URL =
  import.meta.env.VITE_APP_STORE_URL ||
  "";
const GOOGLE_PLAY_URL =
  import.meta.env.VITE_GOOGLE_PLAY_URL ||
  "";
const INVITE_CODE_KEY = "ilyrox:invite_code";
const DEVICE_TOKEN_KEY = "ilyrox:device_token";

function getDeviceToken(): string {
  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (token) return token;
    token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
    return token;
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function extractCodeFromPath(pathname: string): string {
  // /invite/{codigo} o /invite/{codigo}?ref=... → extrae el segmento
  const match = pathname.match(/\/invite\/([^/?#]+)/i);
  if (match) return match[1].split("=")[0];
  return "";
}

const Invite = () => {
  const [code, setCode] = useState<string>("");
  const [checked, setChecked] = useState(false);
  const [appOpened, setAppOpened] = useState(false);
  const timerRef = useRef<number | null>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode =
      params.get("code") ||
      params.get("invite") ||
      params.get("ref") ||
      extractCodeFromPath(window.location.pathname) ||
      "";
    setCode(inviteCode);

    // Persistir el código para que la app lo tome al abrirse
    if (inviteCode) {
      try {
        localStorage.setItem(INVITE_CODE_KEY, inviteCode);
      } catch {
        /* ignore */
      }
    }

    // Guardar el dispositivo + código ref en la BD para asociar la invitación
    // cuando la app se abra por primera vez en este dispositivo.
    if (inviteCode) {
      const deviceToken = getDeviceToken();
      supabase
        .rpc("registrar_dispositivo_invitacion", {
          p_device_token: deviceToken,
          p_ref_code: inviteCode,
          p_plataforma: "web",
          p_user_agent: navigator.userAgent,
        })
        .then(({ error }) => {
          if (error) console.warn("[invite] no se pudo registrar el dispositivo:", error);
        });
    }

    // Marcar como abierta si la app toma el foco (la página queda en background)
    const markOpened = () => {
      if (document.hidden) {
        openedRef.current = true;
        setAppOpened(true);
        if (timerRef.current) window.clearTimeout(timerRef.current);
      }
    };
    document.addEventListener("visibilitychange", markOpened);

    // Intentar abrir la app si está instalada
    const tryOpenApp = () => {
      const deeplink = `${APP_SCHEME}${
        inviteCode ? `?type=invite&code=${encodeURIComponent(inviteCode)}` : ""
      }`;

      // Usar un iframe oculto en lugar de window.location: en iOS evita el
      // alert nativo de error cuando la app no está instalada.
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = deeplink;
      document.body.appendChild(iframe);

      // Si la app no responde, asumimos que no está instalada
      timerRef.current = window.setTimeout(() => {
        if (!openedRef.current) {
          setAppOpened(false);
          setChecked(true);
        }
      }, 1800);

      // Limpiar el iframe después del intento
      window.setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 2500);
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && inviteCode) {
      // Solo en móvil intentamos abrir la app directamente
      window.setTimeout(tryOpenApp, 300);
    } else {
      setChecked(true);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", markOpened);
    };
  }, []);

  const storeButtonsDisabled = !APP_STORE_URL && !GOOGLE_PLAY_URL;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-teal-600">
              Ilyrox
            </span>
          </Link>
          <span className="text-sm text-muted-foreground">
            Comunidad de asesores inmobiliarios
          </span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center text-center max-w-2xl">
        {/* Badge */}
        <Badge variant="secondary" className="mb-6 gap-1.5">
          <Users className="h-3.5 w-3.5" /> Invitación de un asesor
        </Badge>

        {/* Hero */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
          Únete a <span className="text-teal-600">Ilyrox</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Descargaste una comunidad.
        </p>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Un asesor inmobiliario te invitó a colaborar y compartir propiedades.
          Regístrate y entrarás directamente a su red.
        </p>

        {code && (
          <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-4 py-2 mb-8">
            <CheckCircle2 className="h-4 w-4" />
            Código de invitación detectado
          </div>
        )}

        {/* CTA / Descarga */}
        {!checked ? (
          <p className="text-muted-foreground animate-pulse mb-8">
            Abriendo la app...
          </p>
        ) : appOpened ? (
          <p className="text-teal-600 font-medium mb-8">
            ¡La app se está abriendo!
          </p>
        ) : (
          <Card className="w-full max-w-md mb-8 border-border/40 shadow-elegant">
            <CardContent className="pt-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  disabled={!APP_STORE_URL}
                  asChild={!!APP_STORE_URL}
                >
                  {APP_STORE_URL ? (
                    <a href={APP_STORE_URL} target="_blank" rel="noreferrer">
                      <Apple className="h-5 w-5" /> Descargar en App Store
                    </a>
                  ) : (
                    <span>
                      <Apple className="h-5 w-5" /> App Store (pronto)
                    </span>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  disabled={!GOOGLE_PLAY_URL}
                  asChild={!!GOOGLE_PLAY_URL}
                >
                  {GOOGLE_PLAY_URL ? (
                    <a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer">
                      <Play className="h-5 w-5" /> Google Play
                    </a>
                  ) : (
                    <span>
                      <Play className="h-5 w-5" /> Google Play (pronto)
                    </span>
                  )}
                </Button>
              </div>

              {storeButtonsDisabled && (
                <p className="text-xs text-muted-foreground">
                  La app estará disponible próximamente en App Store y Google
                  Play.
                </p>
              )}

              <div className="border-t border-border/40 pt-4 flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-teal-600" /> La colaboración
                  nunca tendrá costo
                </p>
                <p className="text-xs text-muted-foreground">
                  Publicar y compartir propiedades en Ilyrox siempre será gratis.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cómo funciona */}
        <div className="w-full max-w-md text-left">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Cómo funciona
          </h2>
          <ol className="space-y-3">
            {[
              "Instala Ilyrox desde App Store o Google Play.",
              "Abre la app con este enlace: tu invitación se detecta automáticamente.",
              "Completa tu registro y obtén la aprobación de la comunidad.",
              "Colabora, comparte propiedades y crece tu red.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ilyrox ·{" "}
          <Link to="/terms" className="hover:underline">
            Términos
          </Link>{" "}
          ·{" "}
          <Link to="/privacy" className="hover:underline">
            Privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Invite;