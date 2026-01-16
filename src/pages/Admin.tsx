import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { 
  Package, 
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Tag,
  Layers,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  BarChart
} from "lucide-react";
import { ReservationManagement } from "@/components/admin/ReservationManagement";
import { CashRegister } from "@/components/admin/CashRegister";
import { SalesReport } from "@/components/admin/SalesReport";
import { BannerManagement } from "@/components/admin/BannerManagement";
import { EventManagement } from "@/components/admin/EventManagement";
import { StoreSettings } from "@/components/admin/StoreSettings";
import { CouponManagement } from "@/components/admin/CouponManagement";
import { AdminSidebar, getMenuItemLabel } from "@/components/admin/AdminSidebar";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  // Filter states for products
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    is_on_sale: false,
    category_id: "",
    brand_id: "",
    stock: "",
    image_url: "",
    alcohol_content: "",
    volume_ml: ""
  });

  const [brandForm, setBrandForm] = useState({
    name: "",
    logo_url: ""
  });

  const [categoryForm, setCategoryForm] = useState({
    name: ""
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load brands and categories for product form
      const { data: brandsData } = await supabase
        .from("brands")
        .select("*")
        .order("name");
      if (brandsData) setBrands(brandsData);

      const { data: categoriesData } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");
      if (categoriesData) setProductCategories(categoriesData);

      if (activeTab === "products" || activeTab === "overview") {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(`
            *,
            brands(id, name),
            product_categories(id, name)
          `)
          .order("created_at", { ascending: false });
        
        if (productsError) {
          console.error('Error loading products:', productsError);
        }
        if (productsData) setProducts(productsData);
      }

      if (activeTab === "orders" || activeTab === "overview") {
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (ordersError) {
          console.error('Error loading orders:', ordersError);
        }
        
        if (ordersData && ordersData.length > 0) {
          // Fetch profiles for each order
          const userIds = [...new Set(ordersData.map(order => order.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);
          
          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
          
          const ordersWithProfiles = ordersData.map(order => ({
            ...order,
            profiles: profilesMap.get(order.user_id) || null
          }));
          
          setOrders(ordersWithProfiles);

          // Fetch order items for product performance
          const orderIds = ordersData.map(order => order.id);
          const { data: orderItemsData } = await supabase
            .from("order_items")
            .select("*")
            .in("order_id", orderIds);
          
          if (orderItemsData) setOrderItems(orderItemsData);
        } else {
          setOrders([]);
          setOrderItems([]);
        }
      }

      if (activeTab === "users" || activeTab === "overview") {
        const { data: usersData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (usersData) setUsers(usersData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      setLoading(true);
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
        stock: parseInt(productForm.stock),
        category_id: productForm.category_id || null,
        brand_id: productForm.brand_id || null,
        alcohol_content: productForm.alcohol_content ? parseFloat(productForm.alcohol_content) : null,
        volume_ml: productForm.volume_ml ? parseInt(productForm.volume_ml) : null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;
        
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        sale_price: "",
        is_on_sale: false,
        category_id: "",
        brand_id: "",
        stock: "",
        image_url: "",
        alcohol_content: "",
        volume_ml: ""
      });
      loadData();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Erro ao salvar produto",
        description: error.message || "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Produto ativado" : "Produto desativado",
        description: `O produto foi ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Produto removido",
        description: "O produto foi removido com sucesso.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao remover produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      sale_price: product.sale_price?.toString() || "",
      is_on_sale: product.is_on_sale || false,
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      stock: product.stock?.toString() || "0",
      image_url: product.image_url || "",
      alcohol_content: product.alcohol_content?.toString() || "",
      volume_ml: product.volume_ml?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  // Brand management
  const handleSaveBrand = async () => {
    try {
      setLoading(true);
      if (editingBrand) {
        const { error } = await supabase
          .from("brands")
          .update(brandForm)
          .eq("id", editingBrand.id);
        if (error) throw error;
        toast({ title: "Marca atualizada" });
      } else {
        const { error } = await supabase
          .from("brands")
          .insert([brandForm]);
        if (error) throw error;
        toast({ title: "Marca criada" });
      }
      setIsBrandDialogOpen(false);
      setEditingBrand(null);
      setBrandForm({ name: "", logo_url: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar marca",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta marca?")) return;
    try {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Marca removida" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao remover marca",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Category management
  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      if (editingCategory) {
        const { error } = await supabase
          .from("product_categories")
          .update(categoryForm)
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast({ title: "Categoria atualizada" });
      } else {
        const { error } = await supabase
          .from("product_categories")
          .insert([categoryForm]);
        if (error) throw error;
        toast({ title: "Categoria criada" });
      }
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar categoria",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      const { error } = await supabase.from("product_categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Categoria removida" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao remover categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status do pedido foi atualizado.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // menuItems removed - now handled by AdminSidebar component

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center px-6 shadow-sm">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold">
                  {getMenuItemLabel(activeTab)}
                </h2>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6 bg-muted/30">

            {/* Cash Register Tab */}
            {activeTab === "cashregister" && <CashRegister />}

            {/* Sales Report Tab */}
            {activeTab === "salesreport" && <SalesReport />}

            {/* Banners Tab */}
            {activeTab === "banners" && <BannerManagement />}

            {/* Events/Tickets Tab */}
            {activeTab === "events" && <EventManagement />}

            {/* Coupons Tab */}
            {activeTab === "coupons" && <CouponManagement />}

            {/* Settings Tab */}
            {activeTab === "settings" && <StoreSettings />}

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                {/* Financial KPIs */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Receita Total
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total de vendas realizadas
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pedidos
                      </CardTitle>
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {orders.filter(o => o.status === 'pending').length} pendentes
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Ticket Médio
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(orders.length > 0 
                          ? orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) / orders.length
                          : 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Valor médio por pedido
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Usuários
                      </CardTitle>
                      <Users className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600">
                        {users.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total de usuários cadastrados
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Sales Over Time Chart */}
                  <Card className="shadow-md border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Vendas nos Últimos 30 Dias
                      </CardTitle>
                      <CardDescription>Evolução diária da receita</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={(() => {
                          const last30Days = Array.from({ length: 30 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (29 - i));
                            return date.toISOString().split('T')[0];
                          });
                          
                          return last30Days.map(date => {
                            const dayOrders = orders.filter(order => 
                              order.created_at?.startsWith(date)
                            );
                            const revenue = dayOrders.reduce((sum, order) => 
                              sum + parseFloat(order.total || 0), 0
                            );
                            
                            return {
                              date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                              receita: revenue,
                              pedidos: dayOrders.length
                            };
                          });
                        })()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: any) => {
                              if (typeof value === 'number') {
                                return new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(value);
                              }
                              return value;
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="receita" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="Receita"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Order Status Chart */}
                  <Card className="shadow-md border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Status dos Pedidos
                      </CardTitle>
                      <CardDescription>Distribuição por status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Pendente', value: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
                              { name: 'Processando', value: orders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
                              { name: 'Em Entrega', value: orders.filter(o => o.status === 'shipped').length, color: '#8b5cf6' },
                              { name: 'Entregue', value: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
                              { name: 'Cancelado', value: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Pendente', value: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
                              { name: 'Processando', value: orders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
                              { name: 'Em Entrega', value: orders.filter(o => o.status === 'shipped').length, color: '#8b5cf6' },
                              { name: 'Entregue', value: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
                              { name: 'Cancelado', value: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
                            ].filter(item => item.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Products Performance Chart */}
                <Card className="shadow-md border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Performance de Produtos
                    </CardTitle>
                    <CardDescription>Top 10 produtos por receita real de vendas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <RechartsBarChart
                        data={(() => {
                          const productSales: Record<string, { name: string; revenue: number; quantity: number }> = {};
                          
                          // Calculate real sales from order_items
                          orderItems.forEach(item => {
                            const product = products.find(p => p.id === item.product_id);
                            const productName = product?.name || item.product_id;
                            const displayName = productName.length > 20 ? productName.substring(0, 20) + '...' : productName;
                            
                            if (!productSales[item.product_id]) {
                              productSales[item.product_id] = {
                                name: displayName,
                                revenue: 0,
                                quantity: 0
                              };
                            }
                            productSales[item.product_id].revenue += parseFloat(item.total_price || 0);
                            productSales[item.product_id].quantity += item.quantity || 0;
                          });

                          return Object.values(productSales)
                            .sort((a, b) => b.revenue - a.revenue)
                            .slice(0, 10);
                        })()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: any, name: string) => {
                            if (name === 'revenue') {
                              return [new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(value), 'Receita'];
                            }
                            return [value, 'Quantidade'];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Receita" />
                        <Bar dataKey="quantity" fill="hsl(var(--chart-2))" name="Unidades Vendidas" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Quick Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Produtos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{products.length}</div>
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Ativos:</span>
                          <span className="font-medium text-green-600">
                            {products.filter(p => p.active && !p.deleted).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Em oferta:</span>
                          <span className="font-medium text-amber-600">
                            {products.filter(p => p.is_on_sale).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Clientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{users.length}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Total de usuários cadastrados
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Categorias & Marcas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {productCategories.length + brands.length}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Categorias:</span>
                          <span className="font-medium">{productCategories.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Marcas:</span>
                          <span className="font-medium">{brands.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Reservations Tab */}
            {activeTab === "reservations" && (
              <ReservationManagement />
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold">Gerenciar Produtos</h3>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="shadow-sm" onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      description: "",
                      price: "",
                      sale_price: "",
                      is_on_sale: false,
                      category_id: "",
                      brand_id: "",
                      stock: "",
                      image_url: "",
                      alcohol_content: "",
                        volume_ml: ""
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do produto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Preço Normal (R$)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock">Estoque</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          id="is_on_sale"
                          type="checkbox"
                          checked={productForm.is_on_sale}
                          onChange={(e) => setProductForm({...productForm, is_on_sale: e.target.checked})}
                          className="w-4 h-4 rounded border-input"
                        />
                        <Label htmlFor="is_on_sale" className="cursor-pointer">Produto em oferta</Label>
                      </div>
                      {productForm.is_on_sale && (
                        <div className="grid gap-2">
                          <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
                          <Input
                            id="sale_price"
                            type="number"
                            step="0.01"
                            value={productForm.sale_price}
                            onChange={(e) => setProductForm({...productForm, sale_price: e.target.value})}
                            placeholder="Preço promocional"
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Categoria</Label>
                        <div className="flex gap-2">
                          <Select 
                            value={productForm.category_id}
                            onValueChange={(value) => setProductForm({...productForm, category_id: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {productCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(null);
                              setCategoryForm({ name: "" });
                              setIsCategoryDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="brand">Marca</Label>
                        <div className="flex gap-2">
                          <Select
                            value={productForm.brand_id}
                            onValueChange={(value) => setProductForm({...productForm, brand_id: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setEditingBrand(null);
                              setBrandForm({ name: "", logo_url: "" });
                              setIsBrandDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="alcohol">Teor Alcoólico (%)</Label>
                        <Input
                          id="alcohol"
                          type="number"
                          step="0.1"
                          value={productForm.alcohol_content}
                          onChange={(e) => setProductForm({...productForm, alcohol_content: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="volume">Volume (ml)</Label>
                        <Input
                          id="volume"
                          type="number"
                          value={productForm.volume_ml}
                          onChange={(e) => setProductForm({...productForm, volume_ml: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Imagem do Produto</Label>
                      <ImageUpload
                        currentImageUrl={productForm.image_url}
                        onImageUploaded={(url) => setProductForm({...productForm, image_url: url})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProduct} disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
                  </Dialog>
                </div>

                {/* Search and Filters */}
                <Card className="shadow-sm border-border mb-4">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <Label htmlFor="search" className="text-sm mb-2 block">Buscar Produto</Label>
                        <Input
                          id="search"
                          placeholder="Nome do produto..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand-filter" className="text-sm mb-2 block">Marca</Label>
                        <Select value={selectedBrandFilter} onValueChange={setSelectedBrandFilter}>
                          <SelectTrigger id="brand-filter">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as marcas</SelectItem>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category-filter" className="text-sm mb-2 block">Categoria</Label>
                        <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                          <SelectTrigger id="category-filter">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {productCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {(productSearchTerm || selectedBrandFilter !== "all" || selectedCategoryFilter !== "all") && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Filtros ativos:</span>
                        {productSearchTerm && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setProductSearchTerm("")}
                            className="h-7"
                          >
                            Busca: {productSearchTerm} ✕
                          </Button>
                        )}
                        {selectedBrandFilter !== "all" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedBrandFilter("all")}
                            className="h-7"
                          >
                            Marca ✕
                          </Button>
                        )}
                        {selectedCategoryFilter !== "all" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedCategoryFilter("all")}
                            className="h-7"
                          >
                            Categoria ✕
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagem</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : (() => {
                      // Filter products based on search and filters
                      const filteredProducts = products.filter((product) => {
                        const matchesSearch = !productSearchTerm || 
                          product.name.toLowerCase().includes(productSearchTerm.toLowerCase());
                        const matchesBrand = selectedBrandFilter === "all" || 
                          product.brand_id === selectedBrandFilter;
                        const matchesCategory = selectedCategoryFilter === "all" || 
                          product.category_id === selectedCategoryFilter;
                        
                        return matchesSearch && matchesBrand && matchesCategory;
                      });

                      if (filteredProducts.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Nenhum produto encontrado
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-16 h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.product_categories?.name || '-'}</TableCell>
                          <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleProductActive(product.id, product.active)}
                                title={product.active ? 'Desativar produto' : 'Ativar produto'}
                              >
                                {product.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                  </Table>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Brands Tab */}
            {activeTab === "brands" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Gerenciar Marcas</h3>
                  <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="shadow-sm" onClick={() => {
                        setEditingBrand(null);
                        setBrandForm({ name: "", logo_url: "" });
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Marca
                      </Button>
                    </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBrand ? "Editar Marca" : "Nova Marca"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="brand-name">Nome</Label>
                      <Input
                        id="brand-name"
                        value={brandForm.name}
                        onChange={(e) => setBrandForm({...brandForm, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Logo</Label>
                      <ImageUpload
                        currentImageUrl={brandForm.logo_url}
                        onImageUploaded={(url) => setBrandForm({...brandForm, logo_url: url})}
                        bucketName="brand-logos"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsBrandDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveBrand} disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Salvar
                    </Button>
                  </div>
                  </DialogContent>
                  </Dialog>
                </div>

                <Card className="shadow-md border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : brands.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nenhuma marca cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                              {brand.logo_url ? (
                                <img 
                                  src={brand.logo_url} 
                                  alt={brand.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs">Logo</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingBrand(brand);
                                setBrandForm({ name: brand.name, logo_url: brand.logo_url || "" });
                                setIsBrandDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBrand(brand.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  </Table>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Gerenciar Categorias</h3>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="shadow-sm" onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: "" });
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Categoria
                      </Button>
                    </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category-name">Nome</Label>
                      <Input
                        id="category-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveCategory} disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Salvar
                    </Button>
                  </div>
                  </DialogContent>
                  </Dialog>
                </div>

                <Card className="shadow-md border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : productCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nenhuma categoria cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      productCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCategory(category);
                                setCategoryForm({ name: category.name });
                                setIsCategoryDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  </Table>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4">Gerenciar Pedidos</h3>
                <Card className="shadow-md border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum pedido encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>{order.profiles?.full_name || 'N/A'}</TableCell>
                          <TableCell>R$ {parseFloat(order.total_amount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="processing">Processando</SelectItem>
                                <SelectItem value="shipped">Enviado</SelectItem>
                                <SelectItem value="delivered">Entregue</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  </Table>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4">Gerenciar Usuários</h3>
                <Card className="shadow-md border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  </Table>
                </CardContent>
              </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
