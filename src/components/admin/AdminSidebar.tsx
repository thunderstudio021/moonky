import {
  Package,
  ShoppingCart,
  Users,
  BarChart,
  Home,
  Tag,
  Layers,
  TrendingUp,
  CreditCard,
  Image as ImageIcon,
  CalendarCheck,
  Calculator,
  Ticket,
  Settings,
  Store,
  Megaphone,
  ClipboardList,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Menu sections organized by category
const menuSections = [
  {
    id: "operacional",
    label: "Operacional",
    icon: Store,
    items: [
      { value: "overview", label: "Visão Geral", icon: BarChart },
      { value: "cashregister", label: "Caixa", icon: Calculator },
      { value: "salesreport", label: "Relatórios", icon: TrendingUp },
    ],
  },
  {
    id: "reservas-eventos",
    label: "Reservas & Eventos",
    icon: CalendarCheck,
    items: [
      { value: "reservations", label: "Reservas", icon: CalendarCheck },
      { value: "events", label: "Ingressos", icon: Ticket },
    ],
  },
  {
    id: "catalogo",
    label: "Catálogo",
    icon: Package,
    items: [
      { value: "products", label: "Produtos", icon: Package },
      { value: "brands", label: "Marcas", icon: Tag },
      { value: "categories", label: "Categorias", icon: Layers },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    items: [
      { value: "banners", label: "Banners", icon: ImageIcon },
      { value: "coupons", label: "Cupons", icon: CreditCard },
    ],
  },
  {
    id: "gestao",
    label: "Gestão",
    icon: ClipboardList,
    items: [
      { value: "orders", label: "Pedidos", icon: ShoppingCart },
      { value: "users", label: "Usuários", icon: Users },
    ],
  },
  {
    id: "sistema",
    label: "Sistema",
    icon: Settings,
    items: [
      { value: "settings", label: "Configurações", icon: Settings },
    ],
  },
];

export const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const navigate = useNavigate();
  
  // Find which section contains the active tab and keep it open
  const getActiveSectionId = () => {
    for (const section of menuSections) {
      if (section.items.some(item => item.value === activeTab)) {
        return section.id;
      }
    }
    return "operacional";
  };

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const activeSectionId = getActiveSectionId();
    return { [activeSectionId]: true };
  });

  useEffect(() => {
    const activeSectionId = getActiveSectionId();
    setOpenSections(prev => ({ ...prev, [activeSectionId]: true }));
  }, [activeTab]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <Sidebar className="border-r border-border/50 bg-card">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-border/50 px-4 bg-gradient-to-r from-primary/5 to-transparent">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/")}
          className="mr-3 rounded-full hover:bg-primary/10 transition-colors"
        >
          <Home className="w-5 h-5 text-primary" />
        </Button>
        <img 
          src="/moonky-logo.png" 
          alt="Moonky" 
          className="h-8 w-auto"
        />
      </div>
      
      <SidebarContent className="px-2 py-4">
        {menuSections.map((section) => {
          const SectionIcon = section.icon;
          const isOpen = openSections[section.id] ?? false;
          const hasActiveItem = section.items.some(item => item.value === activeTab);
          
          return (
            <Collapsible
              key={section.id}
              open={isOpen}
              onOpenChange={() => toggleSection(section.id)}
            >
              <SidebarGroup className="mb-1">
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                      "hover:bg-accent/50 group",
                      hasActiveItem && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        hasActiveItem ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <SectionIcon className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        "font-medium text-sm",
                        hasActiveItem ? "text-primary" : "text-foreground"
                      )}>
                        {section.label}
                      </span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                      )} 
                    />
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <SidebarGroupContent className="mt-1 ml-2 pl-4 border-l-2 border-border/50">
                    <SidebarMenu>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.value;
                        
                        return (
                          <SidebarMenuItem key={item.value}>
                            <SidebarMenuButton
                              onClick={() => setActiveTab(item.value)}
                              className={cn(
                                "relative transition-all duration-200 rounded-lg my-0.5",
                                "hover:bg-accent/70",
                                isActive && [
                                  "bg-primary text-primary-foreground shadow-md",
                                  "hover:bg-primary/90",
                                  "before:absolute before:-left-[18px] before:top-1/2 before:-translate-y-1/2",
                                  "before:w-1 before:h-6 before:bg-primary before:rounded-full"
                                ]
                              )}
                            >
                              <Icon className={cn(
                                "w-4 h-4",
                                isActive ? "text-primary-foreground" : "text-muted-foreground"
                              )} />
                              <span className={cn(
                                "text-sm",
                                isActive ? "font-semibold" : "font-medium"
                              )}>
                                {item.label}
                              </span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
      
      {/* Footer */}
      <div className="mt-auto border-t border-border/50 p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">Painel de Controle</p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

// Export menu items for use in header title
export const getMenuItemLabel = (value: string): string => {
  for (const section of menuSections) {
    const item = section.items.find(i => i.value === value);
    if (item) return item.label;
  }
  return "Painel";
};

