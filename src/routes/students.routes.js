const { Router } = require('express');
const students = require('../controllers/students.controller');
const bookings = require('../controllers/bookings.controller');
const requireFields = require('../middleware/requireFields');
const validateObjectId = require('../middleware/validateObjectId');

const router = Router();
router.post('/', requireFields('regNo', 'name', 'email'), students.create);
router.get('/:regNo', students.getOne);

// bookings belong to a student
router.post('/:regNo/bookings', requireFields('slotId'), bookings.create);
router.get('/:regNo/bookings', bookings.list);
router.delete('/:regNo/bookings/:slotId', validateObjectId('slotId'), bookings.remove);

module.exports = router;
