const express = require('express');
const router = express.Router();

// Middleware to protect cron routes
const checkCronSecret = (req, res, next) => {
  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.post('/reset-daily-usage', checkCronSecret, async (req, res) => {
  console.log('Cron job: Resetting daily usage...');
  try {
    await global.pool.query('UPDATE companies SET current_usage = 0');
    console.log('Daily usage reset successfully.');
    res.status(200).json({ message: 'Daily usage reset successfully.' });
  } catch (error) {
    console.error('Error resetting daily usage:', error);
    res.status(500).json({ error: 'Failed to reset daily usage.' });
  }
});

module.exports = router;
