const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Hash the password to compare with stored hash
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Query the admin from the database
    const { rows } = await pool.query(
      'SELECT id, email, name, role, password_hash FROM admins WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = rows[0];

    // Verify password
    if (admin.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login timestamp
    await pool.query(
      'UPDATE admins SET last_login = $1 WHERE id = $2',
      [new Date().toISOString(), admin.id]
    );

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        name: admin.name, 
        role: admin.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify admin token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if admin still exists in database
    const { rows } = await pool.query(
      'SELECT id, email, name, role FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    res.json({
      valid: true,
      admin: rows[0]
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const { rows } = await pool.query(
      'SELECT id, email, name, role, created_at, last_login FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Change admin password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get current admin
    const { rows } = await pool.query(
      'SELECT id, password_hash FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Verify current password
    const currentPasswordHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (rows[0].password_hash !== currentPasswordHash) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

    // Update password
    await pool.query(
      'UPDATE admins SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, decoded.id]
    );

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Create admin (super admin only)
router.post('/create', async (req, res) => {
  try {
    const { email, password, name, role = 'admin' } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if current admin is super admin
    const { rows: currentAdmin } = await pool.query(
      'SELECT role FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (currentAdmin.length === 0 || currentAdmin[0].role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can create new admins' });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Hash password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Create new admin
    const { rows: newAdmin } = await pool.query(
      `INSERT INTO admins (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role, created_at`,
      [email.toLowerCase(), passwordHash, name, role]
    );

    res.json({
      message: 'Admin created successfully',
      admin: newAdmin[0]
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Admin with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create admin' });
    }
  }
});

module.exports = router; 