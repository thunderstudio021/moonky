-- Add age restriction display toggle to store settings
ALTER TABLE public.store_settings 
ADD COLUMN show_age_restriction boolean DEFAULT true;