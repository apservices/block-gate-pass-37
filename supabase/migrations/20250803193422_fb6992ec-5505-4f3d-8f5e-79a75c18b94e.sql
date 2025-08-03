-- Create users_data table for user information
CREATE TABLE public.users_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  celular TEXT NOT NULL UNIQUE,
  aprovado BOOLEAN NOT NULL DEFAULT false,
  cartao_credito_token TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_data JSONB,
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create access_logs table for tracking user access
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_hora_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  gps_location JSONB,
  modelo_aparelho TEXT,
  marca_aparelho TEXT,
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table for ticket purchases
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  qtd_ingressos INTEGER NOT NULL CHECK (qtd_ingressos >= 1 AND qtd_ingressos <= 100),
  valor_total DECIMAL(10,2) NOT NULL,
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('PIX', 'CARTAO_AVISTA', 'CARTAO_2X', 'CARTAO_3X')),
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO')),
  possui_codigo_adm BOOLEAN NOT NULL DEFAULT false,
  codigo_usado TEXT,
  data_compra TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table for recurring ticket plans
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quantidade_tickets INTEGER NOT NULL CHECK (quantidade_tickets IN (10, 20, 30, 40, 50)),
  duracao_meses INTEGER NOT NULL CHECK (duracao_meses IN (3, 6, 12)),
  renovacao_automatica BOOLEAN NOT NULL DEFAULT true,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_renovacao TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'CANCELADO', 'PENDENTE')),
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('PIX', 'CARTAO_AVISTA', 'CARTAO_2X', 'CARTAO_3X')),
  valor_total DECIMAL(10,2) NOT NULL,
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_pending table for pending payments
CREATE TABLE public.financial_pending (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('COMPRA', 'ASSINATURA')),
  valor DECIMAL(10,2) NOT NULL,
  data_geracao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'QUITADO', 'VENCIDO')),
  visivel_somente_adm BOOLEAN NOT NULL DEFAULT true,
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_approval_codes table for administrative codes
CREATE TABLE public.admin_approval_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_pending ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_approval_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_data
CREATE POLICY "Users can view their own data" ON public.users_data 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON public.users_data 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user data" ON public.users_data 
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all user data" ON public.users_data 
FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for access_logs
CREATE POLICY "Admins can view all access logs" ON public.access_logs 
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert access logs" ON public.access_logs 
FOR INSERT WITH CHECK (true);

-- RLS Policies for tickets
CREATE POLICY "Users can view their own tickets" ON public.tickets 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" ON public.tickets 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" ON public.tickets 
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all tickets" ON public.tickets 
FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions 
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions 
FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for financial_pending
CREATE POLICY "Admins can view all pending finances" ON public.financial_pending 
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can create pending finances" ON public.financial_pending 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update pending finances" ON public.financial_pending 
FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for admin_approval_codes
CREATE POLICY "Admins can manage approval codes" ON public.admin_approval_codes 
FOR ALL USING (is_admin(auth.uid()));

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_data_updated_at
  BEFORE UPDATE ON public.users_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_pending_updated_at
  BEFORE UPDATE ON public.financial_pending
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_approval_codes_updated_at
  BEFORE UPDATE ON public.admin_approval_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial admin approval codes
INSERT INTO public.admin_approval_codes (codigo, descricao) VALUES 
('ADMIN2024', 'Código administrativo padrão'),
('SPECIAL01', 'Código para pagamentos especiais'),
('VIP2024', 'Código VIP para condições diferenciadas');