-- Create store settings table
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Store info
  store_name text NOT NULL DEFAULT 'Moonky',
  store_description text,
  store_logo_url text,
  phone text,
  whatsapp text,
  email text,
  address text,
  opening_hours jsonb DEFAULT '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "22:00"}, "sunday": {"open": "08:00", "close": "22:00"}}'::jsonb,
  
  -- Appearance
  primary_color text DEFAULT '#3834ED',
  secondary_color text,
  default_theme text DEFAULT 'light',
  
  -- Business rules
  minimum_order_value numeric DEFAULT 30,
  delivery_fee numeric DEFAULT 0,
  free_delivery_threshold numeric,
  delivery_cep text DEFAULT '48970-000',
  delivery_city text DEFAULT 'SENHOR DO BONFIM',
  delivery_state text DEFAULT 'BA',
  
  -- Social media
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Store settings are viewable by everyone"
ON public.store_settings
FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Admins can update store settings"
ON public.store_settings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Only admins can insert
CREATE POLICY "Admins can insert store settings"
ON public.store_settings
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Add trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.store_settings (store_name) VALUES ('Moonky');