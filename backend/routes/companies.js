const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// Generate API key
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Get all companies
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, daily_limit, current_usage, status, created_at, updated_at, rate_limit_per_minute, api_key_revoked, cost_per_extra_call, expiry_date, api_key_hash, api_key_actual FROM companies ORDER BY created_at DESC'
    );
    
    // For personal use, return the actual API keys
    const companiesWithFullKeys = rows.map(company => ({
      ...company,
      api_key: company.api_key_actual || company.api_key_hash || null
    }));
    
    res.json(companiesWithFullKeys);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Create new company
router.post('/', async (req, res) => {
  try {
    const { name, email, gemini_key, daily_limit, cost_per_extra_call, rate_limit_per_minute, expiry_date } = req.body;

    if (!name || !email || !gemini_key) {
      return res.status(400).json({ error: 'Name, email, and Gemini key are required' });
    }

    const apiKey = generateApiKey();
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Handle empty expiry_date
    const expiryDate = expiry_date && expiry_date.trim() !== '' ? expiry_date : null;

    const { rows } = await pool.query(
      `INSERT INTO companies (name, email, api_key_hash, api_key_actual, gemini_key_encrypted, daily_limit, cost_per_extra_call, rate_limit_per_minute, expiry_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, name, email, daily_limit, cost_per_extra_call, rate_limit_per_minute, status, created_at`,
      [name, email, apiKeyHash, apiKey, gemini_key, daily_limit || 100, cost_per_extra_call || 0.10, rate_limit_per_minute || 60, expiryDate]
    );

    res.json({
      ...rows[0],
      api_key: apiKey // Only return API key on creation
    });
  } catch (error) {
    console.error('Error creating company:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Company with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create company' });
    }
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, gemini_key, daily_limit, cost_per_extra_call, rate_limit_per_minute, status, expiry_date } = req.body;

    // Handle empty expiry_date
    const expiryDate = expiry_date && expiry_date.trim() !== '' ? expiry_date : null;

    const { rows } = await pool.query(
      `UPDATE companies 
       SET name = $1, email = $2, gemini_key_encrypted = $3, daily_limit = $4, cost_per_extra_call = $5, 
           rate_limit_per_minute = $6, status = $7, expiry_date = $8, updated_at = $9
       WHERE id = $10 
       RETURNING id, name, email, daily_limit, cost_per_extra_call, rate_limit_per_minute, status, created_at, updated_at`,
      [name, email, gemini_key, daily_limit, cost_per_extra_call, rate_limit_per_minute, status, expiryDate, new Date().toISOString(), id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM companies WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Revoke API key
router.post('/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'UPDATE companies SET api_key_revoked = true, updated_at = $1 WHERE id = $2',
      [new Date().toISOString(), id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// Reset usage
router.post('/:id/reset-usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'UPDATE companies SET current_usage = 0, reset_date = $1, updated_at = $2 WHERE id = $3',
      [new Date().toISOString(), new Date().toISOString(), id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Usage reset successfully' });
  } catch (error) {
    console.error('Error resetting usage:', error);
    res.status(500).json({ error: 'Failed to reset usage' });
  }
});

// Generate new API key
router.post('/:id/regenerate-api-key', async (req, res) => {
  try {
    const { id } = req.params;
    const newApiKey = generateApiKey();
    const apiKeyHash = crypto.createHash('sha256').update(newApiKey).digest('hex');

    const { rowCount } = await pool.query(
      'UPDATE companies SET api_key_hash = $1, api_key_actual = $2, updated_at = $3 WHERE id = $4',
      [apiKeyHash, newApiKey, new Date().toISOString(), id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ 
      message: 'API key regenerated successfully',
      api_key: newApiKey
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
});

// Get actual API key for testing (only for development)
router.get('/:id/api-key', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }

    const { rows } = await pool.query(
      'SELECT api_key_hash FROM companies WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // For testing purposes, we'll generate a test API key that matches the hash
    const testApiKey = '24d816d605247bde849f68867077b56d62c3958bf05664ce555296af06f1d10f';
    const testHash = crypto.createHash('sha256').update(testApiKey).digest('hex');
    
    if (rows[0].api_key_hash === testHash) {
      res.json({ 
        api_key: testApiKey,
        message: 'Test API key retrieved (for development only)'
      });
    } else {
      res.json({ 
        api_key: 'Use regenerate endpoint to get new API key',
        message: 'API key hash does not match test key'
      });
    }
  } catch (error) {
    console.error('Error getting API key:', error);
    res.status(500).json({ error: 'Failed to get API key' });
  }
});

module.exports = router; 