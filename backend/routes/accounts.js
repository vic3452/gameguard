const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get all accounts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const result = await db.query(
            `SELECT id, platform, steam_id, display_name, avatar_url, linked_at, last_sync 
             FROM gaming_accounts 
             WHERE user_id = $1`,
            [req.user.userId]
        );

        res.json({
            accounts: result.rows
        });

    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

// Link demo account
router.post('/link-demo', authMiddleware, async (req, res) => {
    try {
        const { steamId, displayName } = req.body;
        const db = req.app.locals.db;

        const existing = await db.query(
            'SELECT id FROM gaming_accounts WHERE user_id = $1 AND platform = $2',
            [req.user.userId, 'steam']
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Steam account already linked' });
        }

        const result = await db.query(
            `INSERT INTO gaming_accounts 
             (user_id, platform, steam_id, display_name, avatar_url, linked_at) 
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
             RETURNING *`,
            [
                req.user.userId,
                'steam',
                steamId || `STEAM${Math.random().toString(36).substr(2, 9)}`,
                displayName || 'Demo Steam User',
                'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'
            ]
        );

        res.status(201).json({
            message: 'Steam account linked successfully',
            account: result.rows[0]
        });

    } catch (error) {
        console.error('Link account error:', error);
        res.status(500).json({ error: 'Failed to link account' });
    }
});

module.exports = router;
