const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get activities
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { limit = 50 } = req.query;

        const result = await db.query(
            `SELECT a.*, ga.display_name, ga.platform 
             FROM activities a
             JOIN gaming_accounts ga ON a.account_id = ga.id
             WHERE ga.user_id = $1
             ORDER BY a.created_at DESC
             LIMIT $2`,
            [req.user.userId, limit]
        );

        res.json({
            activities: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// Create demo activity
router.post('/demo', authMiddleware, async (req, res) => {
    try {
        const db = req.app.locals.db;

        const account = await db.query(
            'SELECT id FROM gaming_accounts WHERE user_id = $1 LIMIT 1',
            [req.user.userId]
        );

        if (account.rows.length === 0) {
            return res.status(400).json({ error: 'No gaming account linked' });
        }

        const demoData = [
            { ip: '192.168.1.1', country: 'Kenya', city: 'Nairobi' },
            { ip: '10.0.0.1', country: 'USA', city: 'New York' },
            { ip: '172.16.0.1', country: 'UK', city: 'London' },
            { ip: '192.168.2.1', country: 'Kenya', city: 'Mombasa' }
        ];

        const randomData = demoData[Math.floor(Math.random() * demoData.length)];

        const result = await db.query(
            `INSERT INTO activities 
             (account_id, activity_type, ip_address, country, city, device_info, is_suspicious)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                account.rows[0].id,
                'login',
                randomData.ip,
                randomData.country,
                randomData.city,
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                Math.random() > 0.7
            ]
        );

        res.status(201).json({
            message: 'Demo activity created',
            activity: result.rows[0]
        });

    } catch (error) {
        console.error('Create demo activity error:', error);
        res.status(500).json({ error: 'Failed to create activity' });
    }
});

module.exports = router;
