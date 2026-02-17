const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get alerts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = req.app.locals.db;

        const result = await db.query(
            `SELECT a.*, ga.display_name, ga.platform 
             FROM alerts a
             JOIN gaming_accounts ga ON a.account_id = ga.id
             WHERE a.user_id = $1
             ORDER BY a.created_at DESC`,
            [req.user.userId]
        );

        res.json({
            alerts: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// Create demo alert
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

        const alertTypes = ['new_ip', 'new_location', 'new_device', 'impossible_travel'];
        const severities = ['low', 'medium', 'high'];

        const details = {
            ip: '192.168.1.100',
            location: 'London, UK',
            device: 'Windows 10 Chrome',
            message: 'Suspicious activity detected'
        };

        const result = await db.query(
            `INSERT INTO alerts 
             (user_id, account_id, alert_type, severity, status, details)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                req.user.userId,
                account.rows[0].id,
                alertTypes[Math.floor(Math.random() * alertTypes.length)],
                severities[Math.floor(Math.random() * severities.length)],
                'pending',
                JSON.stringify(details)
            ]
        );

        res.status(201).json({
            message: 'Demo alert created',
            alert: result.rows[0]
        });

    } catch (error) {
        console.error('Create demo alert error:', error);
        res.status(500).json({ error: 'Failed to create alert' });
    }
});

// Update alert
router.patch('/:alertId', authMiddleware, async (req, res) => {
    try {
        const { alertId } = req.params;
        const { status } = req.body;
        const db = req.app.locals.db;

        const result = await db.query(
            `UPDATE alerts 
             SET status = $1, acknowledged_at = CURRENT_TIMESTAMP 
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [status, alertId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json({
            message: 'Alert updated successfully',
            alert: result.rows[0]
        });

    } catch (error) {
        console.error('Update alert error:', error);
        res.status(500).json({ error: 'Failed to update alert' });
    }
});

module.exports = router;
