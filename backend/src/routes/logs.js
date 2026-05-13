const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/logController');
const { protect } = require('../middleware/auth');
router.get('/',       protect, ctrl.getLogs);
router.get('/stats',  protect, ctrl.getLogStats);
module.exports = router;
