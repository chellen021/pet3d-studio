import { describe, expect, it } from "vitest";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://awxfzihqptxtfuwlagwh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

describe("Supabase Connection", () => {
  it("should connect to Supabase with service role key", async () => {
    // Skip if no service key
    if (!supabaseServiceKey) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set, skipping test");
      return;
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test connection by querying print_sizes table
    const { data, error } = await supabaseAdmin
      .from('print_sizes')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should have print_sizes data available", async () => {
    if (!supabaseServiceKey) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set, skipping test");
      return;
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabaseAdmin
      .from('print_sizes')
      .select('*')
      .order('sort_order');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
    
    // Verify first print size has expected structure
    const firstSize = data![0];
    expect(firstSize).toHaveProperty('name');
    expect(firstSize).toHaveProperty('price_usd');
  });
});
