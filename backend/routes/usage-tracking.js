const express = require('express');

const router = express.Router();

// Get usage analytics
router.get('/', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter;
    switch (period) {
      case '1d':
        dateFilter = 'timestamp >= NOW() - INTERVAL \'1 day\'';
        break;
      case '7d':
        dateFilter = 'timestamp >= NOW() - INTERVAL \'7 days\'';
        break;
      case '30d':
        dateFilter = 'timestamp >= NOW() - INTERVAL \'30 days\'';
        break;
      case '90d':
        dateFilter = 'timestamp >= NOW() - INTERVAL \'90 days\'';
        break;
      default:
        dateFilter = 'timestamp >= NOW() - INTERVAL \'7 days\'';
    }

    // Get total usage stats
    const { rows: totalStats } = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_requests,
        COUNT(CASE WHEN success = false THEN 1 END) as failed_requests,
        AVG(response_time) as avg_response_time,
        SUM(cost) as total_cost
      FROM usage_logs 
      WHERE ${dateFilter}
    `);

    // Get daily usage breakdown
    const { rows: dailyUsage } = await pool.query(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as requests,
        COUNT(CASE WHEN success = true THEN 1 END) as successful,
        COUNT(CASE WHEN success = false THEN 1 END) as failed,
        AVG(response_time) as avg_response_time,
        SUM(cost) as cost
      FROM usage_logs 
      WHERE ${dateFilter}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    // Get company-wise usage
    const { rows: companyUsage } = await pool.query(`
      SELECT 
        c.name as company_name,
        c.email as company_email,
        COUNT(ul.*) as total_requests,
        COUNT(CASE WHEN ul.success = true THEN 1 END) as successful_requests,
        COUNT(CASE WHEN ul.success = false THEN 1 END) as failed_requests,
        AVG(ul.response_time) as avg_response_time,
        SUM(ul.cost) as total_cost,
        c.current_usage,
        c.daily_limit,
        c.cost_per_extra_call
      FROM companies c
      LEFT JOIN usage_logs ul ON c.id = ul.company_id AND ${dateFilter}
      GROUP BY c.id, c.name, c.email, c.current_usage, c.daily_limit, c.cost_per_extra_call
      ORDER BY total_requests DESC
    `);

    // Get endpoint usage
    const { rows: endpointUsage } = await pool.query(`
      SELECT 
        endpoint,
        COUNT(*) as requests,
        COUNT(CASE WHEN success = true THEN 1 END) as successful,
        COUNT(CASE WHEN success = false THEN 1 END) as failed,
        AVG(response_time) as avg_response_time
      FROM usage_logs 
      WHERE ${dateFilter}
      GROUP BY endpoint
      ORDER BY requests DESC
    `);

    // Get recent activity
    const { rows: recentActivity } = await pool.query(`
      SELECT 
        ul.timestamp,
        c.name as company_name,
        ul.endpoint,
        ul.response_time,
        ul.success,
        ul.ip_address
      FROM usage_logs ul
      JOIN companies c ON ul.company_id = c.id
      WHERE ${dateFilter}
      ORDER BY ul.timestamp DESC
      LIMIT 50
    `);

    res.json({
      stats: {
        ...totalStats[0],
        logs: recentActivity,
      },
      company_summary: companyUsage,
      daily_usage: dailyUsage,
      endpoint_usage: endpointUsage,
    });

  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    res.status(500).json({ error: 'Failed to fetch usage analytics' });
  }
});

// Get company-specific usage
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { period = '7d' } = req.query;
    
    let dateFilter;
    switch (period) {
      case '1d':
        dateFilter = 'timestamp >= NOW() - INTERVAL \'1 day\'';
        break;
      case '7d':
        dateFilter = 'timestamp >= NOW() - INTERVAL \'7 days\'';
        break;
      case '30d':
        dateFilter = 'timestamp >= NOW() - INTERVAL \'30 days\'';
        break;
      default:
        dateFilter = 'timestamp >= NOW() - INTERVAL \'7 days\'';
    }

    // Get company info
    const { rows: companyInfo } = await pool.query(
      'SELECT * FROM companies WHERE id = $1',
      [companyId]
    );

    if (companyInfo.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get company usage stats
    const { rows: usageStats } = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_requests,
        COUNT(CASE WHEN success = false THEN 1 END) as failed_requests,
        AVG(response_time) as avg_response_time,
        SUM(cost) as total_cost
      FROM usage_logs 
      WHERE company_id = $1 AND ${dateFilter}
    `, [companyId]);

    // Get daily breakdown
    const { rows: dailyBreakdown } = await pool.query(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as requests,
        COUNT(CASE WHEN success = true THEN 1 END) as successful,
        COUNT(CASE WHEN success = false THEN 1 END) as failed,
        AVG(response_time) as avg_response_time,
        SUM(cost) as cost
      FROM usage_logs 
      WHERE company_id = $1 AND ${dateFilter}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    // Get recent requests
    const { rows: recentRequests } = await pool.query(`
      SELECT 
        timestamp,
        endpoint,
        response_time,
        success,
        error_message,
        ip_address,
        user_agent
      FROM usage_logs 
      WHERE company_id = $1 AND ${dateFilter}
      ORDER BY timestamp DESC
      LIMIT 100
    `);

    res.json({
      company: companyInfo[0],
      usage_stats: usageStats[0],
      daily_breakdown: dailyBreakdown,
      recent_requests: recentRequests
    });

  } catch (error) {
    console.error('Error fetching company usage:', error);
    res.status(500).json({ error: 'Failed to fetch company usage' });
  }
});

module.exports = router;
