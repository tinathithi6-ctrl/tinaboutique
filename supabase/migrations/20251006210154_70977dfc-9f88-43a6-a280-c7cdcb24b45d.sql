-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price decimal(10,2) NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url text,
  stock integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create order_items table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create wishlist table
CREATE TABLE public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- RLS Policies for products (public read)
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (is_active = true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for cart_items
CREATE POLICY "Users can view their own cart items"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for order_items
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- RLS Policies for wishlist
CREATE POLICY "Users can view their own wishlist"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for products
CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for cart_items
CREATE TRIGGER set_updated_at_cart_items
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for orders
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Robes', 'robes', 'Collection de robes élégantes'),
  ('Manteaux', 'manteaux', 'Manteaux et vestes pour toutes saisons'),
  ('Sacs', 'sacs', 'Sacs à main et accessoires'),
  ('Accessoires', 'accessoires', 'Bijoux et accessoires de mode');

-- Insert sample products
INSERT INTO public.products (name, slug, description, price, category_id, image_url, stock) VALUES
  (
    'Robe Élégante',
    'robe-elegante',
    'Robe élégante parfaite pour toutes occasions',
    299.99,
    (SELECT id FROM public.categories WHERE slug = 'robes'),
    '/placeholder.svg',
    15
  ),
  (
    'Manteau d''Hiver',
    'manteau-hiver',
    'Manteau chaud et confortable pour l''hiver',
    499.99,
    (SELECT id FROM public.categories WHERE slug = 'manteaux'),
    '/placeholder.svg',
    8
  ),
  (
    'Sac à Main Luxe',
    'sac-main-luxe',
    'Sac à main en cuir véritable',
    399.99,
    (SELECT id FROM public.categories WHERE slug = 'sacs'),
    '/placeholder.svg',
    12
  ),
  (
    'Collier Élégant',
    'collier-elegant',
    'Collier avec finition dorée',
    89.99,
    (SELECT id FROM public.categories WHERE slug = 'accessoires'),
    '/placeholder.svg',
    25
  );