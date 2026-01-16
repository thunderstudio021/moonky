-- Create ticket_sales table to track online ticket purchases
CREATE TABLE public.ticket_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_sales ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own ticket sales"
ON public.ticket_sales FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ticket sales"
ON public.ticket_sales FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all ticket sales"
ON public.ticket_sales FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can update ticket sales"
ON public.ticket_sales FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Enable realtime for ticket_sales
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_sales;

-- Trigger to update updated_at
CREATE TRIGGER update_ticket_sales_updated_at
BEFORE UPDATE ON public.ticket_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();