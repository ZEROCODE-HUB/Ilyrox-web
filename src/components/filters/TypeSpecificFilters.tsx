/**
 * Filtros especializados por tipo de propiedad (comercial / industrial /
 * agrícola), espejo de los filtros de la app móvil. Se muestran sólo cuando el
 * tipo seleccionado lo amerita.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { resetNumber } from "@/utils/resetNumber";
import {
  TIPOS_UBICACION_COMERCIAL,
  TIPOS_UBICACION_INDUSTRIAL,
  ALTURAS_LIBRES,
  TIPOS_ENERGIA_KVA,
  TIPOS_AGUA,
  USOS_TERRENO,
  TIPOS_RIEGO,
} from "@/constants/propertyData";
import {
  useFilterStore,
  useComercialFilters,
  useIndustrialFilters,
  useAgricolaFilters,
} from "@/stores/useFilterStore";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-xs font-medium text-muted-foreground">{children}</Label>
);

// Botón tipo "pill" para selección simple o múltiple.
function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-lg text-xs font-medium transition-all border text-left",
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

const toggleInArray = (arr: string[] | undefined, value: string): string[] => {
  const list = arr || [];
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
};

export function TypeSpecificFilters({ type }: { type?: string }) {
  const comercial = useComercialFilters();
  const industrial = useIndustrialFilters();
  const agricola = useAgricolaFilters();
  const { setComercialFilters, setIndustrialFilters, setAgricolaFilters } =
    useFilterStore();

  if (type === "comercial") {
    const switches: {
      key:
        | "sobreAvenidaPrincipal"
        | "enEsquina"
        | "altaVisibilidad"
        | "altoFlujoVehicular";
      label: string;
    }[] = [
      { key: "sobreAvenidaPrincipal", label: "Sobre Avenida Principal" },
      { key: "enEsquina", label: "En Esquina" },
      { key: "altaVisibilidad", label: "Alta Visibilidad" },
      { key: "altoFlujoVehicular", label: "Alto Flujo Vehicular" },
    ];
    const ubic = comercial.tipoUbicacion || [];
    return (
      <div className="space-y-4 pt-2">
        <Label className="text-sm font-semibold text-foreground">
          Características comerciales
        </Label>

        <div className="space-y-2">
          <SectionLabel>Tipo de Ubicación</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {TIPOS_UBICACION_COMERCIAL.map((u) => (
              <Pill
                key={u}
                active={ubic.includes(u)}
                onClick={() =>
                  setComercialFilters({ tipoUbicacion: toggleInArray(ubic, u) })
                }
              >
                {u}
              </Pill>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <SectionLabel>Frente mínimo (m)</SectionLabel>
            <Input
              type="text"
              placeholder="ej. 10"
              value={comercial.frenteMin ?? ""}
              onChange={(e) =>
                setComercialFilters({
                  frenteMin: parseInt(resetNumber(e.target.value)) || undefined,
                })
              }
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <SectionLabel>Nivel / Piso</SectionLabel>
            <Input
              type="text"
              placeholder="ej. 2"
              value={comercial.nivel ?? ""}
              onChange={(e) =>
                setComercialFilters({
                  nivel: resetNumber(e.target.value) || undefined,
                })
              }
              className="h-10"
            />
          </div>
        </div>

        <div>
          <SectionLabel>Características de Ubicación</SectionLabel>
          <div className="divide-y rounded-lg border">
            {switches.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <span className="text-sm text-foreground">{s.label}</span>
                <Switch
                  checked={!!comercial[s.key]}
                  onCheckedChange={(v) => setComercialFilters({ [s.key]: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "industrial") {
    return (
      <div className="space-y-4 pt-2">
        <Label className="text-sm font-semibold text-foreground">
          Características industriales
        </Label>
        <div className="space-y-2">
          <SectionLabel>Ubicación</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {TIPOS_UBICACION_INDUSTRIAL.map((u) => (
              <Pill
                key={u}
                active={(industrial.ubicacion || []).includes(u)}
                onClick={() =>
                  setIndustrialFilters({
                    ubicacion: toggleInArray(industrial.ubicacion, u),
                  })
                }
              >
                {u}
              </Pill>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <SectionLabel>Altura libre</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {ALTURAS_LIBRES.map((a) => (
              <Pill
                key={a}
                active={industrial.alturaLibre === a}
                onClick={() =>
                  setIndustrialFilters({
                    alturaLibre: industrial.alturaLibre === a ? undefined : a,
                  })
                }
              >
                {a}
              </Pill>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <SectionLabel>Energía (kVA)</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {TIPOS_ENERGIA_KVA.map((e) => (
              <Pill
                key={e}
                active={(industrial.energiaKva || []).includes(e)}
                onClick={() =>
                  setIndustrialFilters({
                    energiaKva: toggleInArray(industrial.energiaKva, e),
                  })
                }
              >
                {e}
              </Pill>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <SectionLabel>Área oficinas mín. (m²)</SectionLabel>
            <Input
              type="text"
              placeholder="0"
              value={industrial.areaOficinasMin || ""}
              onChange={(e) =>
                setIndustrialFilters({
                  areaOficinasMin:
                    parseInt(resetNumber(e.target.value)) || undefined,
                })
              }
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <SectionLabel>Patio maniobras mín. (m²)</SectionLabel>
            <Input
              type="text"
              placeholder="0"
              value={industrial.patioManiobrasMin || ""}
              onChange={(e) =>
                setIndustrialFilters({
                  patioManiobrasMin:
                    parseInt(resetNumber(e.target.value)) || undefined,
                })
              }
              className="h-10"
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === "agricola") {
    const checks: {
      key:
        | "concesionAgua"
        | "electricidad"
        | "caminoAcceso"
        | "cercado"
        | "pieCarretera"
        | "accesCamiones";
      label: string;
    }[] = [
      { key: "concesionAgua", label: "Concesión de agua" },
      { key: "electricidad", label: "Electricidad" },
      { key: "caminoAcceso", label: "Camino de acceso" },
      { key: "cercado", label: "Cercado" },
      { key: "pieCarretera", label: "A pie de carretera" },
      { key: "accesCamiones", label: "Acceso camiones" },
    ];
    const multis: {
      key: "tiposAgua" | "usoTerreno" | "tipoRiego";
      label: string;
      options: readonly string[];
    }[] = [
      { key: "tiposAgua", label: "Fuente de agua", options: TIPOS_AGUA },
      { key: "usoTerreno", label: "Uso de terreno", options: USOS_TERRENO },
      { key: "tipoRiego", label: "Riego", options: TIPOS_RIEGO },
    ];
    return (
      <div className="space-y-4 pt-2">
        <Label className="text-sm font-semibold text-foreground">
          Características agrícolas
        </Label>
        {multis.map((m) => (
          <div key={m.key} className="space-y-2">
            <SectionLabel>{m.label}</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {m.options.map((o) => (
                <Pill
                  key={o}
                  active={(agricola[m.key] || []).includes(o)}
                  onClick={() =>
                    setAgricolaFilters({
                      [m.key]: toggleInArray(agricola[m.key], o),
                    })
                  }
                >
                  {o}
                </Pill>
              ))}
            </div>
          </div>
        ))}
        <div>
          <SectionLabel>Infraestructura y acceso</SectionLabel>
          <div className="divide-y rounded-lg border">
            {checks.map((c) => (
              <div
                key={c.key}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <span className="text-sm text-foreground">{c.label}</span>
                <Switch
                  checked={!!agricola[c.key]}
                  onCheckedChange={(v) => setAgricolaFilters({ [c.key]: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
