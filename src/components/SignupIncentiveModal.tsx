import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Gift, 
  Truck, 
  Star, 
  Percent,
  X,
  Sparkles
} from 'lucide-react';

const SignupIncentiveModal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Don't show if user is logged in
    if (user) {
      setIsOpen(false);
      return;
    }

    // Check if user has dismissed the modal recently
    const dismissedAt = localStorage.getItem('signup_modal_dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt);
      const hoursSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      // Show again after 24 hours
      if (hoursSinceDismiss < 24) {
        return;
      }
    }

    // Show modal after 5 seconds
    const timer = setTimeout(() => {
      if (!user) {
        setIsOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem('signup_modal_dismissed', Date.now().toString());
    setIsOpen(false);
  };

  const handleSignup = () => {
    setIsOpen(false);
    navigate('/auth');
  };

  const benefits = [
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description: 'Receba em até 30 minutos'
    },
    {
      icon: Percent,
      title: 'Ofertas Exclusivas',
      description: 'Descontos só para membros'
    },
    {
      icon: Star,
      title: 'Programa de Pontos',
      description: 'Acumule e troque por prêmios'
    },
    {
      icon: Gift,
      title: 'Primeira Compra',
      description: 'Frete grátis no 1º pedido'
    }
  ];

  if (user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 rounded-3xl">
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary-dark p-6 pb-10">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          
          {/* Close button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          >
            <X className="h-4 w-4 text-primary-foreground" />
          </button>

          {/* Icon */}
          <div className="relative flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-center text-2xl font-bold text-primary-foreground">
            Junte-se à Moonky! 🍺
          </DialogTitle>
          <DialogDescription className="text-center text-primary-foreground/80 mt-2">
            Crie sua conta e aproveite benefícios exclusivos
          </DialogDescription>
        </div>

        {/* Benefits */}
        <div className="p-6 pt-4 -mt-4 bg-background rounded-t-3xl">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="p-3 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <benefit.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-semibold text-sm">{benefit.title}</p>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleSignup}
              className="w-full h-12 text-base font-semibold rounded-xl shadow-lg"
            >
              Criar Conta Grátis
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDismiss}
              className="w-full h-10 text-sm text-muted-foreground hover:text-foreground"
            >
              Continuar sem conta
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Já tem conta?{' '}
            <button 
              onClick={handleSignup}
              className="text-primary font-medium hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupIncentiveModal;