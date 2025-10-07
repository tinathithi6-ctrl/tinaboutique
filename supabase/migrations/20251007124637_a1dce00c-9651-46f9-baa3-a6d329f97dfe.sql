-- Add e-commerce fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{
  "street": "",
  "city": "",
  "postal_code": "",
  "country": ""
}'::jsonb,
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{
  "street": "",
  "city": "",
  "postal_code": "",
  "country": ""
}'::jsonb;

-- Update the handle_new_user function to include phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;