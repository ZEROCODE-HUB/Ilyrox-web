import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
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

interface DeviceFingerprint {
  ip?: string | null;
  asn?: string | null;
  timezone?: string | null;
  pais?: string | null;
  region?: string | null;
  ciudad?: string | null;
  locale?: string | null;
}

function detectOs(): string | null {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/windows/i.test(ua)) return "windows";
  if (/mac os/i.test(ua)) return "macos";
  if (/linux/i.test(ua)) return "linux";
  return null;
}

async function getDeviceFingerprint(): Promise<DeviceFingerprint> {
  const fingerprint: DeviceFingerprint = {
    locale: navigator.language || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
  };
  try {
    const res = await fetch("https://ip-api.com/json/?fields=query,as,timezone,country,regionName,city", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      fingerprint.ip = data?.query ?? null;
      fingerprint.asn = data?.as ?? null;
      fingerprint.timezone = data?.timezone ?? fingerprint.timezone;
      fingerprint.pais = data?.country ?? null;
      fingerprint.region = data?.regionName ?? null;
      fingerprint.ciudad = data?.city ?? null;
    }
  } catch {
    // si falla ip-api, intentamos solo la IP con ipify
    try {
      const res = await fetch("https://api.ipify.org?format=json", {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        fingerprint.ip = data?.ip ?? null;
      }
    } catch {
      /* ignore */
    }
  }
  return fingerprint;
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
        // Cookie de respaldo en el dominio: persiste aunque se borre el
        // localStorage y es legible si el usuario vuelve a la landing.
        document.cookie = `ilyrox_invite_code=${encodeURIComponent(
          inviteCode,
        )}; path=/; max-age=${60 * 60 * 24 * 7}`;
      } catch {
        /* ignore */
      }

      // Copiar el link de invitación al portapapeles del dispositivo. El
      // portapapeles es del sistema operativo y sobrevive a la instalación de
      // la app: al abrir la app por primera vez desde el icono, la app lo lee
      // y detecta el código de invitación sin necesidad de tocar el link de nuevo.
      const fullInviteUrl = `${window.location.origin}${window.location.pathname}`;
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(fullInviteUrl).catch(() => {});
        } else {
          const ta = document.createElement("textarea");
          ta.value = fullInviteUrl;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
      } catch {
        /* ignore */
      }
    }

    // Guardar el dispositivo + código ref en la BD para asociar la invitación
    // cuando la app se abra por primera vez en este dispositivo. Se guarda el
    // fingerprint completo (IP, ASN, OS, timezone, país, región, ciudad,
    // locale) para que la app pueda hacer un match ponderado.
    if (inviteCode) {
      const deviceToken = getDeviceToken();
      (async () => {
        const fp = await getDeviceFingerprint();
        const os = detectOs();
        supabase
          .rpc("registrar_dispositivo_invitacion", {
            p_device_token: deviceToken,
            p_ref_code: inviteCode,
            p_plataforma: "web",
            p_user_agent: navigator.userAgent,
            p_ip: fp.ip,
            p_asn: fp.asn,
            p_os: os,
            p_timezone: fp.timezone,
            p_pais: fp.pais,
            p_region: fp.region,
            p_ciudad: fp.ciudad,
            p_locale: fp.locale,
          })
          .then(({ error }) => {
            if (error) console.warn("[invite] no se pudo registrar el dispositivo:", error);
          });
      })();
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

  const handleActionClick = () => {
    // Si hay URL de store configurada, prioriza redirigir
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const targetUrl = isIOS ? APP_STORE_URL : GOOGLE_PLAY_URL;

    if (targetUrl) {
      window.open(targetUrl, "_blank");
    } else {
      // Fallback a deeplink si se presiona el botón manualmente
      const deeplink = `${APP_SCHEME}${
        code ? `?type=invite&code=${encodeURIComponent(code)}` : ""
      }`;
      window.location.href = deeplink;
    }
  };

  // Google Play soporta el parámetro `referrer` para rastrear el origen de la
  // descarga. Aquí adjuntamos el device_token para que quede registrado en la
  // instalación de Android.
  const googlePlayUrlWithReferrer = (() => {
    if (!GOOGLE_PLAY_URL) return "";
    const sep = GOOGLE_PLAY_URL.includes("?") ? "&" : "?";
    return `${GOOGLE_PLAY_URL}${sep}referrer=ilyrox_${encodeURIComponent(
      getDeviceToken(),
    )}`;
  })();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans selection:bg-sky-100">
      {/* Contenido Principal / Hero */}
      <main className="container mx-auto px-6 py-10 max-w-6xl flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Lado Izquierdo: Textos y Botón */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {code && (
              <Badge variant="secondary" className="mb-4 gap-1.5 bg-sky-50 text-[#007B99] border-sky-200">
                <CheckCircle2 className="h-4 w-4" /> Código de invitación detectado
              </Badge>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A192F] leading-[1.1] mb-2">
              Te busca <br /> propiedades
            </h1>
            
            <p className="text-3xl sm:text-4xl font-extrabold text-[#007B99] mb-4">
              24/7 <span className="text-[#0A192F] text-2xl sm:text-3xl font-bold">para tus clientes</span>
            </p>

            <div className="w-10 h-1 bg-[#007B99] mb-6 rounded-full" />

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] mb-4">
              Únete a <span className="text-[#007B99]">ILYROX</span>
            </h2>

            <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed max-w-md">
              Llena una sola vez lo que busca tu cliente y recibe{" "}
              <span className="text-[#007B99] font-semibold">alertas</span> cuando aparezcan nuevas opciones.
            </p>

            {/* CTA Button / Estados de carga */}
            {!checked ? (
              <p className="text-[#007B99] animate-pulse font-medium mb-6">
                Abriendo la app...
              </p>
            ) : appOpened ? (
              <p className="text-[#007B99] font-semibold mb-6">
                ¡La app se está abriendo!
              </p>
            ) : (
              <button
                onClick={handleActionClick}
                className="bg-[#007B99] hover:bg-[#00647D] text-white font-bold text-lg px-8 py-3.5 rounded-lg transition-colors shadow-md mb-6"
              >
                Probar ILYROX
              </button>
            )}
          </div>

<<<<<<< HEAD
          {/* Lado Derecho: Preview Mockup del Móvil */}
          <img src={'celular_ilyrox.webp'} className="w-full h-auto lg:col-span-6 max-w-[350px] mx-auto"></img>
=======
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
                    <a href={googlePlayUrlWithReferrer} target="_blank" rel="noreferrer">
                      <Play className="h-5 w-5" /> Google Play
                    </a>
                  ) : (
                    <span>
                      <Play className="h-5 w-5" /> Google Play (pronto)
                    </span>
                  )}
                </Button>
              </div>
>>>>>>> eb21ef182402bc2c0017e6a18fb2356a325facc3

        </div>
      </main>

      {/* Sección Inferior: 3 Columnas Informativas */}
      <section className="border-t border-slate-200 bg-slate-50/50 py-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            <div className="pt-6 md:pt-0 md:px-6 flex flex-col items-center justify-between">
              <h3 className="text-xl font-black text-[#0A192F] mb-3 leading-tight">
                Busca dibujando<br />zonas en el mapa
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                Encuentra propiedades exactamente donde busca tu cliente.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:px-6 flex flex-col items-center justify-between">
              <h3 className="text-xl font-black text-[#0A192F] mb-3 leading-tight">
                Red profesional<br />de asesores
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                Comparte ideas, experiencias, sube videos y publicaciones.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:px-6 flex flex-col items-center justify-between">
              <h3 className="text-xl font-black text-[#0A192F] mb-3 leading-tight">
                Comunidad<br />verificada
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                Solo ingresan asesores aprobados por la comunidad.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 bg-white">
        <div className="container mx-auto px-4 text-center text-xs text-slate-500">
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