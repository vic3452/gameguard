const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/threatController');
const { protect } = require('../middleware/auth');
router.get('/',           protect, ctrl.getSimulations);
router.post('/:type/run', protect, ctrl.runSimulation);
module.exports = router;
