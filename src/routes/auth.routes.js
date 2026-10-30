const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const requireFields = require('../middleware/requireFields');
const requireAuth = require('../middleware/requireAuth');

const router = Router();
router.post('/register', requireFields('name', 'email', 'password', 'regNo'), ctrl.register);
router.post('/login', requireFields('email', 'password'), ctrl.login);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
