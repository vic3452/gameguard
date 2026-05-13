const express = require('express');
const router  = express.Router();
const { getRiskScore } = require('../controllers/riskController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getRiskScore);
module.exports = router;
