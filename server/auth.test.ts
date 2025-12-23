import { describe, expect, it } from "vitest";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://awxfzihqptxtfuwlagwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eGZ6aWhxcHR4dGZ1d2xhZ3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTI5MTMsImV4cCI6MjA4MjAyODkxM30.3saG60SxTG8X4hc1Cu5IqAQEPxLfpKpODmT0aAjcWUs';

describe("Supabase Auth", () => {
  it("should be able to create a Supabase client with anon key", () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it("should have auth methods available", () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    expect(typeof supabase.auth.signUp).toBe('function');
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');
    expect(typeof supabase.auth.getSession).toBe('function');
  });

  it("should reject invalid credentials", async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'invalid@test.com',
      password: 'wrongpassword123',
    });

    // Should fail with invalid credentials
    expect(error).not.toBeNull();
    expect(data.user).toBeNull();
  });
});
