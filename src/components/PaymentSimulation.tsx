import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Home, CheckCircle } from 'lucide-react';

interface PaymentSimulationProps {
  isOpen: boolean;
  onClose: () => void;
  propertyPrice?: number;
}

interface FormData {
  purchaseStatus: string;
  propertyValue: number;
  savings: number;
  state: string;
  monthlyIncome: number;
  loanTerm: number;
  employmentStatus: string;
  useInfonavitFovissste: string;
  hasActiveDebts: string;
  governmentBenefit: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const mexicanStates = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato',
  'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
  'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

export const PaymentSimulation: React.FC<PaymentSimulationProps> = ({ isOpen, onClose, propertyPrice = 200000 }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    purchaseStatus: '',
    propertyValue: propertyPrice,
    savings: 0,
    state: '',
    monthlyIncome: 50000,
    loanTerm: 15,
    employmentStatus: '',
    useInfonavitFovissste: '',
    hasActiveDebts: '',
    governmentBenefit: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  const handleNext = () => {
    if (currentStep < 12) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setCurrentStep(1);
    setFormData({
      purchaseStatus: '',
      propertyValue: propertyPrice,
      savings: 0,
      state: '',
      monthlyIncome: 50000,
      loanTerm: 15,
      employmentStatus: '',
      useInfonavitFovissste: '',
      hasActiveDebts: '',
      governmentBenefit: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    });
    onClose();
  };

  const calculateMonthlyPayment = () => {
    const loanAmount = formData.propertyValue - formData.savings;
    const years = formData.loanTerm;
    const monthlyRate = 0.08 / 12; // 8% annual rate
    const numPayments = years * 12;
    
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return Math.round(monthlyPayment);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              ¿En qué estado se encuentra el proceso de compra?
            </h2>
            <div className="space-y-3">
              {[
                'Estoy buscando inmueble',
                'Quiero hacer una oferta',
                'Ya aparté un inmueble',
                'Solo quiero información'
              ].map((option) => (
                <Button
                  key={option}
                  variant={formData.purchaseStatus === option ? "default" : "outline"}
                  className="w-full p-4 h-auto text-left justify-start"
                  onClick={() => setFormData({...formData, purchaseStatus: option})}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              ¿Cuál es el valor aproximado del inmueble que te interesa?
            </h2>
            <div className="space-y-4">
              <Label>Costo del inmueble a comprar</Label>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold">${formData.propertyValue.toLocaleString()}</span>
                <span className="text-muted-foreground">MXN</span>
              </div>
              <Slider
                value={[formData.propertyValue]}
                onValueChange={(value) => setFormData({...formData, propertyValue: value[0]})}
                min={100000}
                max={10000000}
                step={50000}
                className="w-full"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              ¿Con qué cantidad de ahorro cuentas para dar de enganche para la compra del inmueble?
            </h2>
            <p className="text-center text-sm md:text-base text-muted-foreground mb-4 md:mb-6 px-2">
              Lo ideal es considerar el 17% del valor del inmueble (10% para el enganche y 7% para gastos notariales)
            </p>
            <div className="space-y-4">
              <Label>Ahorros</Label>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold">${formData.savings.toLocaleString()}</span>
                <span className="text-muted-foreground">MXN</span>
              </div>
              <Slider
                value={[formData.savings]}
                onValueChange={(value) => setFormData({...formData, savings: value[0]})}
                min={0}
                max={Math.floor(formData.propertyValue * 0.5)}
                step={10000}
                className="w-full"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              ¿En qué estado de México te gustaría comprar un inmueble?
            </h2>
            <div className="space-y-4">
              <Label>Estados</Label>
              <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {mexicanStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              ¿Podrías indicarnos cuáles son tus ingresos mensuales netos (libres de impuestos) para poder calcular la cuota de tu hipoteca?
            </h2>
            <div className="space-y-4">
              <Label htmlFor="monthlyIncome">Ingresos mensuales netos (MXN)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="Ej: 25000"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({...formData, monthlyIncome: parseInt(e.target.value) || 0})}
                  className="pl-8 text-lg"
                  min={0}
                  step={1000}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Ingresa tus ingresos mensuales después de impuestos
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              ¿Cuánto tiempo te gustaría tener para pagar el crédito?
            </h2>
            <div className="space-y-4">
              <Label>Plazo del crédito</Label>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl md:text-3xl font-bold">{formData.loanTerm}</span>
                <span className="text-muted-foreground">año{formData.loanTerm !== 1 ? 's' : ''}</span>
              </div>
              <Slider
                value={[formData.loanTerm]}
                onValueChange={(value) => setFormData({...formData, loanTerm: value[0]})}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>1 año</span>
                <span>20 años</span>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              ¿Cuál es tu situación salarial actual?
            </h2>
            <div className="space-y-2 md:space-y-3">
              {[
                'Empleado público (gobierno)',
                'Empleado privado con Infonavit',
                'Jubilado o pensionado',
                'Persona con ingresos mixtos',
                'Sin comprobante de ingresos / economía informal',
                'Empresario con persona moral',
                'Extranjero residente en México'
              ].map((option) => (
                <Button
                  key={option}
                  variant={formData.employmentStatus === option ? "default" : "outline"}
                  className="w-full p-3 md:p-4 h-auto text-left justify-start text-sm md:text-base"
                  onClick={() => setFormData({...formData, employmentStatus: option})}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              ¿Deseas usar tu Infonavit o Fovissste?
            </h2>
            <div className="space-y-3">
              {['Sí', 'No'].map((option) => (
                <Button
                  key={option}
                  variant={formData.useInfonavitFovissste === option ? "default" : "outline"}
                  className="w-full p-4 h-auto text-left justify-start"
                  onClick={() => setFormData({...formData, useInfonavitFovissste: option})}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              ¿Tienes actualmente algún crédito activo o deudas relevantes?
            </h2>
            <div className="space-y-3">
              {['Sí', 'No'].map((option) => (
                <Button
                  key={option}
                  variant={formData.hasActiveDebts === option ? "default" : "outline"}
                  className="w-full p-4 h-auto text-left justify-start"
                  onClick={() => setFormData({...formData, hasActiveDebts: option})}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              ¿Has utilizado algún beneficio gubernamental en el pasado para la compra de una vivienda?
            </h2>
            <div className="space-y-3">
              {['Sí', 'No'].map((option) => (
                <Button
                  key={option}
                  variant={formData.governmentBenefit === option ? "default" : "outline"}
                  className="w-full p-4 h-auto text-left justify-start"
                  onClick={() => setFormData({...formData, governmentBenefit: option})}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">
              Ahora completemos unos datos sobre ti...
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">Nombre (s)</Label>
                <Input
                  id="firstName"
                  placeholder="Nombre (s)"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
                {!formData.firstName && <p className="text-sm text-red-500 mt-1">Este campo es requerido</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select defaultValue="MX" onValueChange={(value) => console.log('Country:', value)}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MX">🇲🇽 MX +52</SelectItem>
                      <SelectItem value="US">🇺🇸 US +1</SelectItem>
                      <SelectItem value="ES">🇪🇸 ES +34</SelectItem>
                      <SelectItem value="CO">🇨🇴 CO +57</SelectItem>
                      <SelectItem value="AR">🇦🇷 AR +54</SelectItem>
                      <SelectItem value="CL">🇨🇱 CL +56</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    placeholder="(00)0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-4 px-2">
                Al continuar aceptas haber leído el <span className="text-primary underline">Aviso de Privacidad</span> y los{' '}
                <span className="text-primary underline">Términos y Condiciones</span> de Clau.
              </p>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 px-2">¡Felicidades!</h2>
            <p className="text-lg md:text-xl text-white/80 mb-6 px-2">Tienes un crédito pre-aprobado</p>
            <div className="text-6xl font-bold text-white mb-2">
              ${calculateMonthlyPayment().toLocaleString()}
            </div>
            <p className="text-xl text-white/80 mb-8">Pago mensual aproximado</p>
            <p className="text-white/80 mb-8">
              Nos pondremos en contacto contigo a la brevedad.
            </p>
            <Button 
              onClick={handleFinish}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Acelerar el proceso de aprobación
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl w-[92vw] sm:w-[90vw] md:w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto p-4 sm:p-6 ${currentStep === 12 ? 'bg-gradient-to-br from-teal-500 to-purple-600' : ''}`}>
        {currentStep !== 12 && (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Crédito para Comprar inmueble
            </DialogTitle>
            <div className="w-full bg-secondary rounded-full h-1 mt-4">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 12) * 100}%` }}
              />
            </div>
          </DialogHeader>
        )}

        <div className="py-4 md:py-6 px-2">
          {renderStep()}
        </div>

        {currentStep !== 12 && (
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="h-10 w-10 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !formData.purchaseStatus) ||
                (currentStep === 4 && !formData.state) ||
                (currentStep === 5 && formData.monthlyIncome <= 0) ||
                (currentStep === 7 && !formData.employmentStatus) ||
                (currentStep === 8 && !formData.useInfonavitFovissste) ||
                (currentStep === 9 && !formData.hasActiveDebts) ||
                (currentStep === 10 && !formData.governmentBenefit) ||
                (currentStep === 11 && !formData.firstName)
              }
              className="flex items-center gap-2"
            >
              Continuar
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};