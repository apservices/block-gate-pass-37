import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Crown, LogOut, Sparkles, Ticket, QrCode, CreditCard, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TicketsTab from "@/components/dashboard/TicketsTab";
import AccessTab from "@/components/dashboard/AccessTab";
import SubscriptionsTab from "@/components/dashboard/SubscriptionsTab";
import AdminTab from "@/components/dashboard/AdminTab";
import UserManagementTab from "@/components/dashboard/UserManagementTab";
import BuyTicketsTab from "@/components/client/BuyTicketsTab";
import SubscriptionPlansTab from "@/components/client/SubscriptionPlansTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, isAuthenticated, isApproved } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !isApproved) {
      navigate("/auth");
    }
  }, [isAuthenticated, isApproved, navigate]);

  const handleSignOut = () => {
    signOut();
    toast({
      title: "Logout realizado",
      description: `Até logo, ${user?.nome_completo || user?.email}!`,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Interface para clientes
  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Crown className="h-10 w-10 text-primary" />
                <Sparkles className="h-3 w-3 text-accent absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Alice Gate Pass
                </h1>
                <p className="text-sm text-muted-foreground">Portal do Cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.nome_completo || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="buy-tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="buy-tickets" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Ticket className="h-4 w-4" />
                Comprar Ingressos
              </TabsTrigger>
              <TabsTrigger value="subscription-plans" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CreditCard className="h-4 w-4" />
                Planos de Assinatura
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy-tickets" className="mt-6">
              <BuyTicketsTab />
            </TabsContent>

            <TabsContent value="subscription-plans" className="mt-6">
              <SubscriptionPlansTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Interface para administradores
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Crown className="h-10 w-10 text-primary" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Alice Gate Pass
              </h1>
              <p className="text-sm text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.nome_completo || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="tickets" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Ticket className="h-4 w-4" />
              Ingressos
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <QrCode className="h-4 w-4" />
              Acessos
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="h-4 w-4" />
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-6">
            <TicketsTab userId={user.id} />
          </TabsContent>

          <TabsContent value="access" className="mt-6">
            <AccessTab userId={user.id} />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6">
            <SubscriptionsTab userId={user.id} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="admin" className="mt-6">
            <AdminTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;