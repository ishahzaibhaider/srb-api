const { Router } = require('express');
const ctrl = require('../controllers/rooms.controller');
const requireFields = require('../middleware/requireFields');

const router = Router();
router.get('/', ctrl.list);
router.post('/', requireFields('roomCode', 'name', 'building', 'seats'), ctrl.create);
router.get('/:roomCode', ctrl.getOne);
router.put('/:roomCode', requireFields('name', 'building', 'seats'), ctrl.replace);
router.patch('/:roomCode', requireFields(), ctrl.update);
router.delete('/:roomCode', ctrl.remove);

module.exports = router;
