import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Calculator, Shield, TrendingUp, MapPin, CheckCircle } from 'lucide-react';
import heroImage from '@/assets/landing-hero.jpg';
import feature1 from '@/assets/landing-feature-1.jpg';
import feature2 from '@/assets/landing-feature-2.jpg';
import feature3 from '@/assets/landing-feature-3.jpg';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/50" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-background">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            Encuentra tu hogar <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              con el mejor financiamiento
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-background/90 animate-fade-in">
            Descubre miles de propiedades y obtén tu crédito pre-aprobado en minutos. 
            Tu camino hacia el hogar de tus sueños empieza aquí.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button size="lg" className="text-lg px-8 py-6 shadow-elegant" asChild>
              <Link to="/search">
                <Home className="mr-2 h-5 w-5" />
                Buscar propiedades
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-background/10 backdrop-blur-sm border-background/20 hover:bg-background/20 text-background" asChild>
              <Link to="/search">
                <Calculator className="mr-2 h-5 w-5" />
                Calcular hipoteca
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por qué elegir <span className="text-primary">Clau</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simplificamos el proceso de compra de tu propiedad con tecnología de vanguardia 
              y asesoría personalizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border/40 hover:border-primary/50 transition-all hover:shadow-elegant">
              <CardContent className="pt-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Miles de propiedades</h3>
                <p className="text-sm text-muted-foreground">
                  Encuentra el inmueble perfecto en las mejores ubicaciones de México
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:border-primary/50 transition-all hover:shadow-elegant">
              <CardContent className="pt-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Simulador inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Calcula tu hipoteca en segundos y conoce tu capacidad de compra
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:border-primary/50 transition-all hover:shadow-elegant">
              <CardContent className="pt-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Proceso seguro</h3>
                <p className="text-sm text-muted-foreground">
                  Protegemos tu información con los más altos estándares de seguridad
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:border-primary/50 transition-all hover:shadow-elegant">
              <CardContent className="pt-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Mejores tasas</h3>
                <p className="text-sm text-muted-foreground">
                  Accede a las tasas de interés más competitivas del mercado
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cómo funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En solo tres pasos simples puedes encontrar tu hogar ideal
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                1
              </div>
              <CardContent className="pt-6">
                <img 
                  src={feature1} 
                  alt="Busca tu propiedad ideal" 
                  className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                />
                <h3 className="font-semibold text-xl mb-3">Busca tu propiedad ideal</h3>
                <p className="text-muted-foreground">
                  Explora miles de propiedades con filtros inteligentes para encontrar 
                  exactamente lo que buscas.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                2
              </div>
              <CardContent className="pt-6">
                <img 
                  src={feature2} 
                  alt="Obtén tu pre-aprobación" 
                  className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                />
                <h3 className="font-semibold text-xl mb-3">Obtén tu pre-aprobación</h3>
                <p className="text-muted-foreground">
                  Completa un formulario simple y recibe tu crédito pre-aprobado en minutos, 
                  sin complicaciones.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                3
              </div>
              <CardContent className="pt-6">
                <img 
                  src={feature3} 
                  alt="Cierra tu compra" 
                  className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                />
                <h3 className="font-semibold text-xl mb-3">Cierra tu compra</h3>
                <p className="text-muted-foreground">
                  Te acompañamos en todo el proceso hasta que recibas las llaves de tu nuevo hogar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Beneficios exclusivos
              </h2>
              <p className="text-lg text-muted-foreground">
                Lo que hace de Clau tu mejor opción para comprar casa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Sin enganche inicial en propiedades seleccionadas',
                'Tasas de interés desde 8.5% anual',
                'Plazos flexibles de 1 a 20 años',
                'Asesoría gratuita con expertos hipotecarios',
                'Aprobación rápida en menos de 24 horas',
                'Compatibilidad con Infonavit y Fovissste'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para encontrar tu hogar ideal?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Miles de familias ya confiaron en nosotros. Únete y descubre lo fácil que es 
            comprar la casa de tus sueños.
          </p>
          <Button size="lg" className="bg-background text-primary hover:bg-background/90 text-lg px-8 py-6" asChild>
            <Link to="/search">
              Comenzar ahora
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
