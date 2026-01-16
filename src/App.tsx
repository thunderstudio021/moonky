import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CouponProvider } from "@/contexts/CouponContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DynamicThemeProvider } from "@/components/DynamicThemeProvider";
import LoadingScreen from "@/components/LoadingScreen";
import AddressBar from "@/components/AddressBar";
import OrderNotificationProvider from "@/components/OrderNotificationProvider";
import SignupIncentiveModal from "@/components/SignupIncentiveModal";
import Index from "./pages/Index";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Offers from "./pages/Offers";
import Admin from "./pages/Admin";
import BrandProducts from "./pages/BrandProducts";
import Favorites from "./pages/Favorites";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente que renderiza o AddressBar condicionalmente
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Páginas onde NÃO mostrar a barra de endereço
  const hideAddressBarRoutes = ['/auth', '/admin'];
  const shouldShowAddressBar = !hideAddressBarRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowAddressBar && (
        <div className="sticky top-0 z-[60]">
          <AddressBar />
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

const App = () => (
  <Suspense fallback={<LoadingScreen />}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="moonky-theme">
        <DynamicThemeProvider>
          <AuthProvider>
            <CouponProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <OrderNotificationProvider />
                    <SignupIncentiveModal />
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:id" element={<OrderDetails />} />
                        <Route path="/offers" element={<Offers />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/events/:id" element={<EventDetails />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/brand/:brandName" element={<BrandProducts />} />
                        <Route path="/terms" element={<TermsOfUse />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </CouponProvider>
          </AuthProvider>
        </DynamicThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </Suspense>
);

export default App;
