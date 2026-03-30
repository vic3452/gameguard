require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:8000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(helmet()); 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session required for Passport-Steam
app.use(session({
    secret: process.env.SESSION_SECRET || 'gameguard_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8000",
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Context setup
app.locals.db = pool;
app.locals.io = io;

// Socket.io connection handling
io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/steam', require('./routes/steam'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/alerts', require('./routes/alerts'));

// Start server
server.listen(PORT, () => {
    console.log(`
🚀 GameGuard Production-Ready Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:${PORT}
🛡 Security: Helmet, RateLimit, Cookies
🔌 Real-time: Socket.io Active
🎮 Auth: Steam OpenID Integrated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

module.exports = app;
