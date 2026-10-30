const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');

const router = Router();
router.use('/auth', require('./auth.routes'));        // register / login are public

// everything below needs a valid token (401 otherwise); roles are checked per route (403)
router.use(requireAuth);
router.use('/rooms', require('./rooms.routes'));
router.use('/slots', require('./slots.routes'));
router.use('/students', require('./students.routes'));

module.exports = router;
