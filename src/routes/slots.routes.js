const { Router } = require('express');
const ctrl = require('../controllers/slots.controller');
const requireFields = require('../middleware/requireFields');
const validateObjectId = require('../middleware/validateObjectId');
const { allow } = require('../middleware/authorize');

const router = Router();
router.get('/', allow('slots:view'), ctrl.list); // ?roomCode=&date=&hasSeats=true&page=&limit=
router.post('/', allow('slots:edit'), requireFields('roomCode', 'date', 'startHour'), ctrl.create);
router.get('/:id', allow('slots:view'), validateObjectId('id'), ctrl.getOne);

module.exports = router;
