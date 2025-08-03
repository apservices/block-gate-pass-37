import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Check, X, Users, CreditCard, AlertTriangle } from "lucide-react";

interface UserWithData {
  id: string;
  email: string;
  nome_completo: string;
  celular: string;
  aprovado: boolean;
  data_cadastro: string;
  ticketsPurchased: number;
  totalPaid: number;
  totalPending: number;
  daysOverdue: number;
}

const UserManagementTab = () => {
  const [users, setUsers] = useState<UserWithData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from('users_data')
        .select('*');

      if (usersError) throw usersError;

      // Process the data 
      const processedUsers = usersData?.map(user => {
        // For now, set default values - will be updated when ticket system is fully implemented
        const ticketsPurchased = 0;
        const totalPaid = 0;
        const totalPending = 0;
        const daysOverdue = 0;

        return {
          id: user.id,
          email: user.email,
          nome_completo: user.nome_completo,
          celular: user.celular,
          aprovado: user.aprovado,
          data_cadastro: user.data_cadastro,
          ticketsPurchased,
          totalPaid,
          totalPending,
          daysOverdue
        };
      }) || [];

      setUsers(processedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.celular.includes(searchTerm) ||
      user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users_data')
        .update({ aprovado: true })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário aprovado",
        description: "O usuário foi aprovado com sucesso!",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao aprovar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users_data')
        .update({ aprovado: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Aprovação removida",
        description: "A aprovação do usuário foi removida.",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao remover aprovação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Users className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
          <CardDescription>
            Gerencie cadastros, aprovações e histórico financeiro dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por email, celular ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Celular</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ingressos</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Pendente</TableHead>
                  <TableHead>Dias Atraso</TableHead>
                  <TableHead>Cobrança</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome_completo}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.celular}</TableCell>
                    <TableCell>
                      <Badge variant={user.aprovado ? "default" : "secondary"}>
                        {user.aprovado ? "Aprovado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.ticketsPurchased}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(user.totalPaid)}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {formatCurrency(user.totalPending)}
                    </TableCell>
                    <TableCell>
                      {user.daysOverdue > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {user.daysOverdue} dias
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.totalPending > 0 && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Cobrar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!user.aprovado ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveUser(user.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectUser(user.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementTab;