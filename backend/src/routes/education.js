const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/educationController');
const { protect } = require('../middleware/auth');
router.get('/threats',      protect, ctrl.getThreats);
router.get('/threats/:id',  protect, ctrl.getThreat);
router.get('/tips',         protect, ctrl.getTips);
router.get('/glossary',     protect, ctrl.getGlossary);
module.exports = router;
