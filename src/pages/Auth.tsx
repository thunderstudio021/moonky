import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import moonkyLogo from '@/assets/moonky-logo.png';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const Auth = () => {
  const { settings } = useStoreSettings();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    city: settings?.delivery_city || 'SENHOR DO BONFIM',
    state: settings?.delivery_state || 'BA',
    zipCode: settings?.delivery_cep || '48970-000',
  });

  // Update formData when settings load
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        city: settings.delivery_city || prev.city,
        state: settings.delivery_state || prev.state,
        zipCode: settings.delivery_cep || prev.zipCode
      }));
    }
  }, [settings]);

  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const totalSteps = 4;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim() || !formData.email.trim()) {
          toast({
            title: 'Dados incompletos',
            description: 'Preencha nome completo e email.',
            variant: 'destructive',
          });
          return false;
        }
        if (!formData.email.includes('@')) {
          toast({
            title: 'Email inválido',
            description: 'Digite um email válido.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.password.trim() || !formData.confirmPassword.trim()) {
          toast({
            title: 'Dados incompletos',
            description: 'Preencha senha e confirmação.',
            variant: 'destructive',
          });
          return false;
        }
        if (formData.password.length < 6) {
          toast({
            title: 'Senha muito curta',
            description: 'A senha deve ter no mínimo 6 caracteres.',
            variant: 'destructive',
          });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Senhas não coincidem',
            description: 'As senhas digitadas não são iguais.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 3:
        if (!formData.phone.trim()) {
          toast({
            title: 'Dados incompletos',
            description: 'Preencha o telefone.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 4:
        const missingAddressFields = [];
        if (!formData.street.trim()) missingAddressFields.push("Rua");
        if (!formData.number.trim()) missingAddressFields.push("Número");
        if (!formData.neighborhood.trim()) missingAddressFields.push("Bairro");
        
        if (missingAddressFields.length > 0) {
          toast({
            title: 'Dados incompletos',
            description: `Preencha: ${missingAddressFields.join(", ")}`,
            variant: 'destructive',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Erro no login',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Login realizado com sucesso!',
            description: 'Bem-vindo de volta à Moonky',
          });
        }
      } else {
        // Validate final step before submitting
        if (!validateStep(4)) {
          setLoading(false);
          return;
        }

        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.fullName,
          {
            phone: formData.phone,
            address: {
              street: formData.street,
              number: formData.number,
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode
            }
          }
        );
        
        if (error) {
          toast({
            title: 'Erro no cadastro',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Cadastro realizado!',
            description: 'Bem-vindo à Moonky!',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetSteps = () => {
    setCurrentStep(1);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
      phone: '',
      street: '',
      number: '',
      neighborhood: '',
      city: settings?.delivery_city || 'SENHOR DO BONFIM',
      state: settings?.delivery_state || 'BA',
      zipCode: settings?.delivery_cep || '48970-000',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <img 
              src={moonkyLogo} 
              alt="Moonky - Drink Delivery" 
              className="h-16 w-auto mx-auto"
            />
          </Link>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="text-center pb-4">
            <CardTitle>{isLogin ? 'Fazer Login' : 'Criar Conta'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Entre na sua conta para continuar' 
                : `Passo ${currentStep} de ${totalSteps}`}
            </CardDescription>
            
            {/* Progress Indicator - Only show for signup */}
            {!isLogin && (
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      step <= currentStep 
                        ? 'bg-primary' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                /* LOGIN FORM */
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processando...' : 'Entrar'}
                  </Button>
                </>
              ) : (
                /* SIGNUP FORM - MULTI STEP */
                <>
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Seu nome completo"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Password */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-10 pr-10"
                            minLength={6}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Digite a senha novamente"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="pl-10"
                            minLength={6}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Phone */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Usaremos para entrar em contato sobre suas entregas
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Address */}
                  {currentStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Endereço de Entrega</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <Label htmlFor="street" className="text-sm">Rua *</Label>
                            <Input
                              id="street"
                              placeholder="Nome da rua"
                              value={formData.street}
                              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="number" className="text-sm">Número *</Label>
                            <Input
                              id="number"
                              placeholder="123"
                              value={formData.number}
                              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="neighborhood" className="text-sm">Bairro *</Label>
                            <Input
                              id="neighborhood"
                              placeholder="Bairro"
                              value={formData.neighborhood}
                              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="city" className="text-sm">Cidade</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              readOnly
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state" className="text-sm">UF</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              readOnly
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="zipCode" className="text-sm">CEP</Label>
                            <Input
                              id="zipCode"
                              value={formData.zipCode}
                              readOnly
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-2 pt-2">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                    )}
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1"
                      >
                        Próximo
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              
              <div className="text-center text-sm">
                {isLogin ? (
                  <>
                    Não tem uma conta?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => {
                        setIsLogin(false);
                        resetSteps();
                      }}
                    >
                      Criar conta
                    </Button>
                  </>
                ) : (
                  <>
                    Já tem uma conta?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => {
                        setIsLogin(true);
                        resetSteps();
                      }}
                    >
                      Fazer login
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/">
            <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground">
              ← Voltar para a loja
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;