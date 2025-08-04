const express = require('express');

const router = express.Router();

// Get all complaints
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        c.id,
        c.issue_type,
        c.description,
        c.status,
        c.admin_response,
        c.created_at,
        c.resolved_at,
        comp.name as company_name,
        comp.email as company_email
      FROM complaints c
      JOIN companies comp ON c.company_id = comp.id
    `;
    
    const params = [];
    
    if (status && status !== 'all') {
      query += ' WHERE c.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Create new complaint
router.post('/', async (req, res) => {
  try {
    const { company_id, issue_type, description } = req.body;

    if (!company_id || !issue_type || !description) {
      return res.status(400).json({ error: 'Company ID, issue type, and description are required' });
    }

    // Validate issue type
    const validIssueTypes = ['api_failure', 'billing', 'rate_limit', 'other'];
    if (!validIssueTypes.includes(issue_type)) {
      return res.status(400).json({ error: 'Invalid issue type' });
    }

    // Check if company exists
    const { rows: companies } = await pool.query(
      'SELECT id, name FROM companies WHERE id = $1',
      [company_id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO complaints (company_id, issue_type, description) 
       VALUES ($1, $2, $3) 
       RETURNING id, issue_type, description, status, created_at`,
      [company_id, issue_type, description]
    );

    res.json({
      ...rows[0],
      company_name: companies[0].name
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Update complaint status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_response } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let query = 'UPDATE complaints SET status = $1, updated_at = $2';
    const params = [status, new Date().toISOString()];

    if (admin_response) {
      query += ', admin_response = $3';
      params.push(admin_response);
    }

    if (status === 'resolved' || status === 'closed') {
      query += ', resolved_at = $' + (params.length + 1);
      params.push(new Date().toISOString());
    }

    query += ' WHERE id = $' + (params.length + 1);
    params.push(id);

    const { rows } = await pool.query(
      query + ' RETURNING id, issue_type, description, status, admin_response, created_at, resolved_at',
      params
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// Delete complaint
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM complaints WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

// Get complaint statistics
router.get('/stats', async (req, res) => {
  try {
    const { rows: stats } = await pool.query(`
      SELECT 
        COUNT(*) as total_complaints,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_complaints,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_complaints,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_complaints,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_complaints,
        COUNT(CASE WHEN issue_type = 'api_failure' THEN 1 END) as api_failure_count,
        COUNT(CASE WHEN issue_type = 'billing' THEN 1 END) as billing_count,
        COUNT(CASE WHEN issue_type = 'rate_limit' THEN 1 END) as rate_limit_count,
        COUNT(CASE WHEN issue_type = 'other' THEN 1 END) as other_count
      FROM complaints
    `);

    // Get complaints by company
    const { rows: companyStats } = await pool.query(`
      SELECT 
        c.name as company_name,
        COUNT(comp.*) as total_complaints,
        COUNT(CASE WHEN comp.status = 'open' THEN 1 END) as open_complaints,
        COUNT(CASE WHEN comp.status = 'resolved' THEN 1 END) as resolved_complaints
      FROM companies c
      LEFT JOIN complaints comp ON c.id = comp.company_id
      GROUP BY c.id, c.name
      HAVING COUNT(comp.*) > 0
      ORDER BY total_complaints DESC
    `);

    // Get recent complaints
    const { rows: recentComplaints } = await pool.query(`
      SELECT 
        comp.id,
        comp.issue_type,
        comp.status,
        comp.created_at,
        c.name as company_name
      FROM complaints comp
      JOIN companies c ON comp.company_id = c.id
      ORDER BY comp.created_at DESC
      LIMIT 10
    `);

    res.json({
      stats: stats[0],
      company_stats: companyStats,
      recent_complaints: recentComplaints
    });

  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    res.status(500).json({ error: 'Failed to fetch complaint statistics' });
  }
});

module.exports = router; 