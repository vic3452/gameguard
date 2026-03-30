const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const jwt = require('jsonwebtoken');
const router = express.Router();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';

passport.use(new SteamStrategy({
    returnURL: `${BACKEND_URL}/api/auth/steam/return`,
    realm: BACKEND_URL,
    apiKey: process.env.STEAM_API_KEY
  },
  async (identifier, profile, done) => {
    try {
        // identifier is the full OpenID URL, profile contains steamid
        profile.identifier = identifier;
        return done(null, profile);
    } catch (err) {
        return done(err);
    }
  }
));

// Initial steam auth request
router.get('/', passport.authenticate('steam'));

// Steam auth return/callback
router.get('/return', 
  passport.authenticate('steam', { failureRedirect: `${FRONTEND_URL}/login?error=steam_failed`, session: false }),
  async (req, res) => {
    try {
        const db = req.app.locals.db;
        const steamId = req.user.id;
        const displayName = req.user.displayName;
        const avatarUrl = req.user.photos[2].value; // Large avatar

        // 1. Check if user exists with this steam ID
        let userResult = await db.query('SELECT * FROM users WHERE email = $1', [`steam_${steamId}@gameguard.steam`]);
        
        let user;
        if (userResult.rows.length === 0) {
            // Create new user for this steam account
            const newUser = await db.query(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
                [`steam_${steamId}@gameguard.steam`, 'STEAM_AUTH_NO_PASSWORD']
            );
            user = newUser.rows[0];
        } else {
            user = userResult.rows[0];
        }

        // 2. Link or Update Gaming Account
        await db.query(
            `INSERT INTO gaming_accounts (user_id, platform, steam_id, display_name, avatar_url)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, platform) 
             DO UPDATE SET display_name = $4, avatar_url = $5`,
            [user.id, 'steam', steamId, displayName, avatarUrl]
        );

        // 3. Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Set HttpOnly Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 5. Redirect back to frontend dashboard
        res.redirect(`${FRONTEND_URL}/dashboard?auth=success`);

    } catch (error) {
        console.error('Steam Auth Finalize Error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  }
);

module.exports = router;
