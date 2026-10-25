const { Router } = require('express');

const router = Router();
router.use('/rooms', require('./rooms.routes'));
router.use('/slots', require('./slots.routes'));
router.use('/students', require('./students.routes'));

module.exports = router;
