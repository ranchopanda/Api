import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
}

interface ComplaintData {
  company_id: string
  issue_type: 'api_failure' | 'billing' | 'rate_limit' | 'other'
  description: string
  admin_response?: string
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const complaintId = pathParts[pathParts.length - 1]

    switch (req.method) {
      case 'GET':
        if (complaintId && complaintId !== 'complaints-management') {
          // Get single complaint
          const { data: complaint, error } = await supabase
            .from('complaints')
            .select(`
              *,
              companies (
                name,
                email
              )
            `)
            .eq('id', complaintId)
            .single()

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify(complaint), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get all complaints
          const status = url.searchParams.get('status')
          const companyId = url.searchParams.get('company_id')
          
          let query = supabase
            .from('complaints')
            .select(`
              *,
              companies (
                name,
                email
              )
            `)
            .order('created_at', { ascending: false })

          if (status) {
            query = query.eq('status', status)
          }

          if (companyId) {
            query = query.eq('company_id', companyId)
          }

          const { data: complaints, error } = await query

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify(complaints), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'POST':
        const newComplaintData: ComplaintData = await req.json()
        
        if (!newComplaintData.company_id || !newComplaintData.issue_type || !newComplaintData.description) {
          return new Response(JSON.stringify({ error: 'Company ID, issue type, and description are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: newComplaint, error: createError } = await supabase
          .from('complaints')
          .insert(newComplaintData)
          .select()
          .single()

        if (createError) {
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify(newComplaint), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'PUT':
        if (!complaintId || complaintId === 'complaints-management') {
          return new Response(JSON.stringify({ error: 'Complaint ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updateData: Partial<ComplaintData> = await req.json()
        
        // If resolving complaint, add resolved timestamp
        if (updateData.status === 'resolved' || updateData.status === 'closed') {
          updateData.resolved_at = new Date().toISOString()
        }

        const { data: updatedComplaint, error: updateError } = await supabase
          .from('complaints')
          .update(updateData)
          .eq('id', complaintId)
          .select()
          .single()

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify(updatedComplaint), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response('Method not allowed', { 
          status: 405, 
          headers: corsHeaders 
        })
    }

  } catch (error) {
    console.error('Error in complaints-management:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})