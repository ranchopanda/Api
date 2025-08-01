import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const companyId = pathParts[pathParts.length - 1];

    switch (req.method) {
      case 'GET':
        // Fetch all companies
        const { data: companies, error: fetchError } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        return new Response(JSON.stringify(companies || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'POST':
        // Create new company
        const createData = await req.json();
        
        // Generate API key
        const apiKey = 'pk_' + crypto.randomUUID().replace(/-/g, '').substring(0, 32);
        // Store the API key directly (not hashed) for simplicity
        // In production, you might want to hash this for security

        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({
            name: createData.name,
            email: createData.email,
            api_key_hash: apiKey, // Store the actual key for now
            gemini_key_encrypted: createData.gemini_key,
            daily_limit: createData.daily_limit || 100,
            rate_limit_per_minute: createData.rate_limit_per_minute || 60,
            cost_per_extra_call: createData.cost_per_extra_call || 0.10,
            expiry_date: createData.expiry_date || null,
            status: 'active',
            current_usage: 0,
            reset_date: new Date().toISOString(),
            api_key_revoked: false,
            api_key_created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Return company data with API key (only shown once)
        return new Response(JSON.stringify({
          ...newCompany,
          api_key: apiKey
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        // Update existing company
        const updateData = await req.json();
        const updateFields: any = {
          name: updateData.name,
          email: updateData.email,
          daily_limit: updateData.daily_limit,
          rate_limit_per_minute: updateData.rate_limit_per_minute,
          cost_per_extra_call: updateData.cost_per_extra_call,
          expiry_date: updateData.expiry_date || null,
          api_key_revoked: updateData.api_key_revoked !== undefined ? updateData.api_key_revoked : false,
          updated_at: new Date().toISOString()
        };

        // Only update Gemini key if provided
        if (updateData.gemini_key) {
          updateFields.gemini_key_encrypted = updateData.gemini_key;
        }

        const { data: updatedCompany, error: updateError } = await supabase
          .from('companies')
          .update(updateFields)
          .eq('id', companyId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return new Response(JSON.stringify(updatedCompany), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        // Delete company
        const { error: deleteError } = await supabase
          .from('companies')
          .delete()
          .eq('id', companyId);

        if (deleteError) {
          throw deleteError;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in companies-management function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});