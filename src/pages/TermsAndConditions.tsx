import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollRestoration } from "react-router-dom";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollRestoration />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Términos y Condiciones
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/80">
          <p className="text-lg leading-relaxed">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar este sitio web y sus servicios relacionados,
              usted acepta estar sujeto a estos Términos y Condiciones. Si no
              está de acuerdo con alguna parte de estos términos, no podrá
              acceder al servicio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. Uso del Servicio
            </h2>
            <p>
              Se le concede una licencia limitada, no exclusiva e intransferible
              para acceder y utilizar el servicio estrictamente de acuerdo con
              estos términos.
            </p>
            <p>Como condición de su uso del Sitio, usted garantiza que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tiene al menos 18 años de edad;</li>
              <li>
                Posee la autoridad legal para crear una obligación legal
                vinculante;
              </li>
              <li>
                Utilizará este Sitio de acuerdo con estos Términos de Uso;
              </li>
              <li>
                Toda la información suministrada por usted en este Sitio es
                verdadera, precisa, actual y completa.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. Cuentas de Usuario
            </h2>
            <p>
              Cuando crea una cuenta con nosotros, debe proporcionarnos
              información que sea precisa, completa y actual en todo momento. El
              incumplimiento de lo anterior constituye una violación de los
              Términos, lo que puede resultar en la terminación inmediata de su
              cuenta en nuestro Servicio.
            </p>
            <p>
              Usted es responsable de salvaguardar la contraseña que utiliza
              para acceder al Servicio y de cualquier actividad o acción bajo su
              contraseña.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Propiedad Intelectual
            </h2>
            <p>
              El Servicio y su contenido original, características y
              funcionalidad son y seguirán siendo propiedad exclusiva de ilyrox
              y sus licenciantes. El Servicio está protegido por derechos de
              autor, marcas registradas y otras leyes tanto de México como de
              países extranjeros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              5. Enlaces a Otros Sitios Web
            </h2>
            <p>
              Nuestro Servicio puede contener enlaces a sitios web o servicios
              de terceros que no son propiedad ni están controlados por ilyrox.
            </p>
            <p>
              ilyrox no tiene control ni asume responsabilidad alguna por el
              contenido, las políticas de privacidad o las prácticas de sitios
              web o servicios de terceros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              6. Limitación de Responsabilidad
            </h2>
            <p>
              En ningún caso ilyrox, ni sus directores, empleados, socios,
              agentes, proveedores o afiliados, serán responsables de daños
              indirectos, incidentales, especiales, consecuentes o punitivos,
              incluyendo, sin limitación, pérdida de beneficios, datos, uso,
              buena voluntad u otras pérdidas intangibles, resultantes de su
              acceso o uso o la imposibilidad de acceder o usar el Servicio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              7. Ley Aplicable
            </h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes
              de México, sin tener en cuenta sus disposiciones sobre conflictos
              de leyes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              8. Cambios
            </h2>
            <p>
              Nos reservamos el derecho, a nuestra sola discreción, de modificar
              o reemplazar estos Términos en cualquier momento. Si una revisión
              es material, intentaremos proporcionar un aviso de al menos 30
              días antes de que entren en vigor los nuevos términos.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
