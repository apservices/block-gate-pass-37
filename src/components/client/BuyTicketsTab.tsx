import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart, CreditCard, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const BuyTicketsTab = () => {
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [showAdminCode, setShowAdminCode] = useState(false);
  const { toast } = useToast();

  const TICKET_PRICE = 90.00;
  const totalValue = quantity * TICKET_PRICE;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyTickets = () => {
    if (quantity < 1 || quantity > 100) {
      toast({
        title: "Quantidade inválida",
        description: "Selecione entre 1 e 100 ingressos",
        variant: "destructive",
      });
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      toast({
        title: "Selecione uma forma de pagamento",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Compra processada!",
      description: `${quantity} ingresso(s) - Total: ${formatCurrency(totalValue)}`,
    });

    // Reset form
    setQuantity(1);
    setShowPayment(false);
    setPaymentMethod(null);
    setShowAdminCode(false);
    setAdminCode("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateInstallment = (times: number) => {
    const interest = totalValue * 0.06; // 6% total interest
    const totalWithInterest = totalValue + interest;
    return totalWithInterest / times;
  };

  if (showPayment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowPayment(false)}>
            ← Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Finalizar Compra</h2>
            <p className="text-muted-foreground">Complete seu pagamento</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Resumo do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Ingressos ({quantity}x)</span>
              <span>{formatCurrency(TICKET_PRICE)} cada</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Button
                variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('pix')}
                className="h-16 justify-start gap-4"
              >
                <QrCode className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">PIX</div>
                  <div className="text-sm text-muted-foreground">Pagamento instantâneo</div>
                </div>
              </Button>

              <Button
                variant={paymentMethod === 'credit' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('credit')}
                className="h-16 justify-start gap-4"
              >
                <CreditCard className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Cartão de Crédito</div>
                  <div className="text-sm text-muted-foreground">À vista ou parcelado</div>
                </div>
              </Button>
            </div>

            {paymentMethod === 'credit' && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold">Opções de Parcelamento</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span>À vista</span>
                    <Badge variant="secondary">{formatCurrency(totalValue)}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span>2x (com juros)</span>
                    <Badge variant="outline">{formatCurrency(calculateInstallment(2))}/mês</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span>3x (com juros)</span>
                    <Badge variant="outline">{formatCurrency(calculateInstallment(3))}/mês</Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="adminCode"
                checked={showAdminCode}
                onChange={(e) => setShowAdminCode(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="adminCode" className="text-sm">
                Tenho código de aprovação administrativa
              </Label>
            </div>

            {showAdminCode && (
              <div className="space-y-2">
                <Label htmlFor="code">Código de Aprovação</Label>
                <Input
                  id="code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Digite o código especial"
                />
              </div>
            )}

            <Button onClick={handlePayment} className="w-full" size="lg">
              Finalizar Pagamento - {formatCurrency(totalValue)}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Comprar Ingressos</h2>
        <p className="text-muted-foreground">Garante já seu lugar no evento!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Ingressos Disponíveis
          </CardTitle>
          <CardDescription>
            Evento exclusivo com segurança blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Valor por ingresso</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {formatCurrency(TICKET_PRICE)}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade de ingressos</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="text-center w-20"
                  min="1"
                  max="100"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 100}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Máximo: 100 ingressos por compra
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({quantity}x)</span>
                <span>{formatCurrency(quantity * TICKET_PRICE)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalValue)}</span>
              </div>
            </div>

            <Button onClick={handleBuyTickets} className="w-full" size="lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Comprar {quantity} Ingresso{quantity > 1 ? 's' : ''}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyTicketsTab;