import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const TermsOfUse = () => {
  const navigate = useNavigate();
  const { settings } = useStoreSettings();

  const deliveryArea = settings?.delivery_city && settings?.delivery_state 
    ? `${settings.delivery_city} - ${settings.delivery_state}` 
    : 'nossa área de cobertura';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Termos de Uso</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Aceitação dos Termos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ao acessar e utilizar o aplicativo {settings?.store_name || 'Moonky'}, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Restrição de Idade</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-destructive">A venda de bebidas alcoólicas é proibida para menores de 18 anos.</strong> Ao utilizar nosso aplicativo e realizar compras, você declara ter 18 anos ou mais. Reservamo-nos o direito de solicitar documento de identificação no momento da entrega.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Uso do Serviço</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nosso serviço de delivery está disponível dentro da área de cobertura em {deliveryArea}. Os pedidos estão sujeitos à disponibilidade de estoque e horário de funcionamento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Preços e Pagamentos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Os preços exibidos incluem todos os impostos aplicáveis. Aceitamos pagamento via PIX, cartão de crédito/débito e dinheiro na entrega. Reservamo-nos o direito de alterar preços sem aviso prévio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Entregas</h2>
          <p className="text-muted-foreground leading-relaxed">
            O prazo de entrega estimado é informado no momento do pedido. Não nos responsabilizamos por atrasos causados por fatores externos como trânsito, condições climáticas ou informações incorretas de endereço fornecidas pelo cliente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Cancelamentos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Pedidos podem ser cancelados enquanto estiverem com status "Pendente". Após a confirmação e início do preparo, o cancelamento pode não ser possível.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Responsabilidades</h2>
          <p className="text-muted-foreground leading-relaxed">
            O consumo de bebidas alcoólicas é de responsabilidade exclusiva do comprador. Não incentivamos o consumo excessivo e recomendamos que, se beber, não dirija.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Contato</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para dúvidas ou reclamações, entre em contato através dos canais disponíveis em nosso aplicativo.
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t">
          Última atualização: Dezembro de 2024
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default TermsOfUse;