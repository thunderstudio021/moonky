import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Política de Privacidade</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Informações Coletadas</h2>
          <p className="text-muted-foreground leading-relaxed">
            Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone e endereço de entrega ao criar sua conta e realizar pedidos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Uso das Informações</h2>
          <p className="text-muted-foreground leading-relaxed">
            Utilizamos suas informações para: processar e entregar pedidos, enviar atualizações sobre seus pedidos, melhorar nossos serviços e entrar em contato quando necessário.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Compartilhamento de Dados</h2>
          <p className="text-muted-foreground leading-relaxed">
            Não vendemos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para processar pagamentos ou realizar entregas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Segurança</h2>
          <p className="text-muted-foreground leading-relaxed">
            Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado, alteração ou destruição.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Utilizamos cookies e tecnologias similares para melhorar sua experiência, lembrar suas preferências e manter você conectado à sua conta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Seus Direitos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Você tem direito de acessar, corrigir ou excluir suas informações pessoais. Para exercer esses direitos, entre em contato conosco através dos canais disponíveis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Alterações na Política</h2>
          <p className="text-muted-foreground leading-relaxed">
            Podemos atualizar esta política periodicamente. Recomendamos que você revise esta página regularmente para se manter informado sobre como protegemos suas informações.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Contato</h2>
          <p className="text-muted-foreground leading-relaxed">
            Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através dos canais disponíveis no aplicativo.
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

export default PrivacyPolicy;