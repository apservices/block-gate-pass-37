import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Crown, Sparkles } from "lucide-react";
import { useFakeAuth } from "@/hooks/useFakeAuth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, loading, isAuthenticated } = useFakeAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cadastro temporário",
      description: "Para criar novas contas, conecte o Supabase. Use as credenciais de teste para entrar.",
      variant: "destructive",
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn(email, password);
    
    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Alice Gate Pass!",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Erro ao fazer login",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/20">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Crown className="h-16 w-16 text-primary drop-shadow-lg" />
              <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Alice Gate Pass
          </CardTitle>
          <CardDescription className="text-base">
            Experience Entertainment Beyond Imagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <div className="mb-4 p-3 bg-accent/20 rounded-lg border border-accent/40">
                <p className="text-sm text-center font-medium text-primary">Usuários de teste disponíveis:</p>
                <div className="text-xs text-muted-foreground mt-2 space-y-2">
                  <div className="border border-primary/20 rounded p-2">
                    <strong>👑 Admin - Alice:</strong><br />
                    <strong>Email:</strong> alice@gatepass.com<br />
                    <strong>Senha:</strong> 123456
                  </div>
                  <div className="border border-secondary/20 rounded p-2">
                    <strong>🎫 Cliente - João:</strong><br />
                    <strong>Email:</strong> joao@cliente.com<br />
                    <strong>Senha:</strong> 123456
                  </div>
                </div>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-center font-medium text-destructive">Modo de teste</p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Para criar novas contas, conecte o Supabase.<br />
                  Use as credenciais de teste para entrar.
                </p>
              </div>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled
                    placeholder="Disponível após conectar Supabase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    disabled
                    placeholder="Disponível após conectar Supabase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    placeholder="Disponível após conectar Supabase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled
                    placeholder="Disponível após conectar Supabase"
                  />
                </div>
                <Button type="submit" className="w-full" disabled>
                  Conectar Supabase primeiro
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;