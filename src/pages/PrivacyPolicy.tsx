import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollRestoration } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollRestoration />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Política de Privacidad
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
              1. Introducción
            </h2>
            <p>
              En ilyrox ("nosotros", "nuestro" o "la Empresa"), respetamos su
              privacidad y estamos comprometidos a protegerla mediante el
              cumplimiento de esta política.
            </p>
            <p>
              Esta política describe los tipos de información que podemos
              recopilar de usted o que usted puede proporcionar cuando visita
              nuestro sitio web o utiliza nuestra aplicación móvil, y nuestras
              prácticas para recopilar, usar, mantener, proteger y divulgar esa
              información.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. Información que recopilamos
            </h2>
            <p>
              Recopilamos varios tipos de información de y sobre los usuarios de
              nuestro Sitio, incluyendo información:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Por la cual se le puede identificar personalmente, como nombre,
                dirección postal, dirección de correo electrónico o número de
                teléfono ("información personal");
              </li>
              <li>
                Sobre su conexión a internet, el equipo que utiliza para acceder
                a nuestro Sitio y detalles de uso.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. Cómo usamos su información
            </h2>
            <p>
              Usamos la información que recopilamos sobre usted o que usted nos
              proporciona, incluyendo cualquier información personal:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Para presentarle nuestro Sitio y su contenido.</li>
              <li>
                Para proporcionarle información, productos o servicios que nos
                solicite.
              </li>
              <li>
                Para cumplir con cualquier otro propósito para el cual usted la
                proporcione.
              </li>
              <li>
                Para notificarle sobre cambios en nuestro Sitio o cualquier
                producto o servicio que ofrezcamos o proporcionemos a través de
                él.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Seguridad de los datos
            </h2>
            <p>
              Hemos implementado medidas diseñadas para proteger su información
              personal contra pérdidas accidentales y contra el acceso, uso,
              alteración y divulgación no autorizados. Toda la información que
              nos proporciona se almacena en nuestros servidores seguros detrás
              de cortafuegos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              5. Cambios en nuestra política de privacidad
            </h2>
            <p>
              Es nuestra política publicar cualquier cambio que hagamos en
              nuestra política de privacidad en esta página. Si hacemos cambios
              materiales en la forma en que tratamos la información personal de
              nuestros usuarios, se lo notificaremos a través de un aviso en la
              página de inicio del Sitio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              6. Información de contacto
            </h2>
            <p>
              Para hacer preguntas o comentarios sobre esta política de
              privacidad y nuestras prácticas de privacidad, contáctenos en:
              contacto@ilyrox.com
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
