-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Pet images policies
CREATE POLICY "Users can view own images" ON pet_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own images" ON pet_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own images" ON pet_images FOR DELETE USING (auth.uid() = user_id);

-- Models policies
CREATE POLICY "Users can view own models" ON models_3d FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own models" ON models_3d FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own models" ON models_3d FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own models" ON models_3d FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert payments" ON payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

-- Print sizes - public read
CREATE POLICY "Anyone can view print sizes" ON print_sizes FOR SELECT TO anon, authenticated USING (is_active = true);

-- System config - only for service role
CREATE POLICY "Service role can access config" ON system_config FOR ALL TO service_role USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
