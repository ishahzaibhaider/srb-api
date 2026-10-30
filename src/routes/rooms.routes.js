const { Router } = require('express');
const ctrl = require('../controllers/rooms.controller');
const requireFields = require('../middleware/requireFields');
const { allow } = require('../middleware/authorize');

const router = Router();
router.get('/', allow('rooms:view'), ctrl.list);
router.post('/', allow('rooms:edit'), requireFields('roomCode', 'name', 'building', 'seats'), ctrl.create);
router.get('/:roomCode', allow('rooms:view'), ctrl.getOne);
router.put('/:roomCode', allow('rooms:edit'), requireFields('name', 'building', 'seats'), ctrl.replace);
router.patch('/:roomCode', allow('rooms:edit'), requireFields(), ctrl.update);
router.delete('/:roomCode', allow('rooms:delete'), ctrl.remove);

module.exports = router;
