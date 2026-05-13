const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/alertController');
const { protect } = require('../middleware/auth');
router.get('/',              protect, ctrl.getAlerts);
router.patch('/read-all',    protect, ctrl.markAllRead);
router.patch('/:id/read',    protect, ctrl.markRead);
router.delete('/:id',        protect, ctrl.deleteAlert);
module.exports = router;
