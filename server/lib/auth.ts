import { Request } from 'express';
import { supabaseAdmin, Profile } from './supabase';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: 'user' | 'admin';
}

/**
 * Extract and verify Supabase JWT from request
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.['sb-access-token']) {
      token = req.cookies['sb-access-token'];
    }
    
    if (!token) {
      return null;
    }
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    // Get profile from database
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return {
      id: user.id,
      email: user.email || null,
      name: profile?.name || user.email?.split('@')[0] || null,
      role: profile?.role || 'user',
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request): Promise<AuthUser> {
  return new Promise(async (resolve, reject) => {
    const user = await getAuthUser(req);
    if (!user) {
      reject(new Error('Unauthorized'));
    } else {
      resolve(user);
    }
  });
}
