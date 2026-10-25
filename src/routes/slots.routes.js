const { Router } = require('express');
const ctrl = require('../controllers/slots.controller');
const requireFields = require('../middleware/requireFields');
const validateObjectId = require('../middleware/validateObjectId');

const router = Router();
router.get('/', ctrl.list); // ?roomCode=&date=&hasSeats=true&page=&limit=
router.post('/', requireFields('roomCode', 'date', 'startHour'), ctrl.create);
router.get('/:id', validateObjectId('id'), ctrl.getOne);

module.exports = router;
