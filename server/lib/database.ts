import { supabaseAdmin, PetImage, Model3d, PrintSize, Order, Payment, SystemConfig, Profile } from './supabase';

// ============ Profiles ============
export async function getProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }
  return true;
}

// ============ Pet Images ============
export async function createPetImage(image: Omit<PetImage, 'id' | 'created_at'>): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from('pet_images')
    .insert(image)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating pet image:', error);
    return null;
  }
  return data.id;
}

export async function getPetImagesByUserId(userId: string): Promise<PetImage[]> {
  const { data, error } = await supabaseAdmin
    .from('pet_images')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pet images:', error);
    return [];
  }
  return data || [];
}

export async function getPetImageById(id: number): Promise<PetImage | null> {
  const { data, error } = await supabaseAdmin
    .from('pet_images')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching pet image:', error);
    return null;
  }
  return data;
}

export async function deletePetImage(id: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('pet_images')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting pet image:', error);
    return false;
  }
  return true;
}

// ============ 3D Models ============
export async function createModel3d(model: Omit<Model3d, 'id' | 'created_at' | 'updated_at'>): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from('models_3d')
    .insert(model)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating 3D model:', error);
    return null;
  }
  return data.id;
}

export async function getModel3dsByUserId(userId: string): Promise<Model3d[]> {
  const { data, error } = await supabaseAdmin
    .from('models_3d')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching 3D models:', error);
    return [];
  }
  return data || [];
}

export async function getModel3dById(id: number): Promise<Model3d | null> {
  const { data, error } = await supabaseAdmin
    .from('models_3d')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching 3D model:', error);
    return null;
  }
  return data;
}

export async function getModel3dByJobId(jobId: string): Promise<Model3d | null> {
  const { data, error } = await supabaseAdmin
    .from('models_3d')
    .select('*')
    .eq('job_id', jobId)
    .single();
  
  if (error) {
    console.error('Error fetching 3D model by job ID:', error);
    return null;
  }
  return data;
}

export async function updateModel3d(id: number, updates: Partial<Model3d>): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('models_3d')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating 3D model:', error);
    return false;
  }
  return true;
}

export async function deleteModel3d(id: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('models_3d')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting 3D model:', error);
    return false;
  }
  return true;
}

// ============ Print Sizes ============
export async function getAllPrintSizes(): Promise<PrintSize[]> {
  const { data, error } = await supabaseAdmin
    .from('print_sizes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching print sizes:', error);
    return [];
  }
  return data || [];
}

export async function getPrintSizeById(id: number): Promise<PrintSize | null> {
  const { data, error } = await supabaseAdmin
    .from('print_sizes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching print size:', error);
    return null;
  }
  return data;
}

// ============ Orders ============
export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert(order)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    return null;
  }
  return data.id;
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data || [];
}

export async function getOrderById(id: number): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();
  
  if (error) {
    console.error('Error fetching order by number:', error);
    return null;
  }
  return data;
}

export async function updateOrder(id: number, updates: Partial<Order>): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating order:', error);
    return false;
  }
  return true;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
  return data || [];
}

// ============ Payments ============
export async function createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert(payment)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating payment:', error);
    return null;
  }
  return data.id;
}

export async function getPaymentByOrderId(orderId: number): Promise<Payment | null> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching payment:', error);
    return null;
  }
  return data;
}

export async function getPaymentByPaypalOrderId(paypalOrderId: string): Promise<Payment | null> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('paypal_order_id', paypalOrderId)
    .single();
  
  if (error) {
    console.error('Error fetching payment by PayPal order ID:', error);
    return null;
  }
  return data;
}

export async function updatePayment(id: number, updates: Partial<Payment>): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('payments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating payment:', error);
    return false;
  }
  return true;
}

// ============ System Config ============
export async function getSystemConfig(key: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('system_config')
    .select('config_value')
    .eq('config_key', key)
    .single();
  
  if (error) {
    console.error('Error fetching system config:', error);
    return null;
  }
  return data?.config_value || null;
}

export async function setSystemConfig(key: string, value: string, description?: string, isEncrypted?: boolean): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('system_config')
    .upsert({
      config_key: key,
      config_value: value,
      description,
      is_encrypted: isEncrypted || false,
      updated_at: new Date().toISOString()
    }, { onConflict: 'config_key' });
  
  if (error) {
    console.error('Error setting system config:', error);
    return false;
  }
  return true;
}
