import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const companyId = url.searchParams.get('company_id')
    const period = url.searchParams.get('period') || '7d' // 7d, 30d, 90d

    // Get usage statistics
    let dateFilter = new Date()
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90)
        break
    }

    let query = supabase
      .from('usage_logs')
      .select(`
        *,
        companies (
          name,
          email,
          daily_limit,
          current_usage
        )
      `)
      .gte('timestamp', dateFilter.toISOString())
      .order('timestamp', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data: usageLogs, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate statistics
    const stats = {
      total_requests: usageLogs?.length || 0,
      successful_requests: usageLogs?.filter(log => log.success).length || 0,
      failed_requests: usageLogs?.filter(log => !log.success).length || 0,
      average_response_time: usageLogs?.reduce((sum, log) => sum + (log.response_time || 0), 0) / (usageLogs?.length || 1),
      total_cost: usageLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0,
      logs: usageLogs || []
    }

    // Get company usage summary
    const { data: companySummary, error: summaryError } = await supabase
      .from('companies')
      .select('id, name, email, daily_limit, current_usage, status')
      .order('current_usage', { ascending: false })

    if (summaryError) {
      return new Response(JSON.stringify({ error: summaryError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      stats,
      company_summary: companySummary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in usage-tracking:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})