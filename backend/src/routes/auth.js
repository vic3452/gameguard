/**
 * Auth Routes
 */
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { protect }   = require('../middleware/auth');
const { validate }  = require('../middleware/validate');

router.post('/register',    validate('register'),   ctrl.register);
router.post('/login',       validate('login'),      ctrl.login);
router.post('/verify-2fa',  validate('verify2FA'),  ctrl.verify2FA);
router.post('/enable-2fa',  protect,                ctrl.enable2FA);
router.post('/disable-2fa', protect,                ctrl.disable2FA);
router.get('/me',           protect,                ctrl.getMe);
router.post('/logout',      protect,                ctrl.logout);

module.exports = router;
