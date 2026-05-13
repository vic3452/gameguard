/**
 * GAMEGUARD - Main Server Entry Point
 * Initializes Express app, connects to MongoDB, starts cron jobs
 */

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { startCronJobs } = require('./utils/cronJobs');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  startCronJobs();

  app.listen(PORT, () => {
    console.log(`\n🛡️  GAMEGUARD Backend running on port ${PORT}`);
    console.log(`📡  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗  API Base: http://localhost:${PORT}/api\n`);
  });
};

start();
