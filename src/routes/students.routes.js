const { Router } = require('express');
const students = require('../controllers/students.controller');
const bookings = require('../controllers/bookings.controller');
const requireFields = require('../middleware/requireFields');
const validateObjectId = require('../middleware/validateObjectId');
const { allow, allowOwnRegNo } = require('../middleware/authorize');

const router = Router();
router.post('/', allow('students:edit'), requireFields('regNo', 'name', 'email'), students.create);
router.get('/:regNo', allowOwnRegNo, students.getOne);

// bookings belong to a student: own regNo for students, any regNo for staff/admin
router.post('/:regNo/bookings', allowOwnRegNo, requireFields('slotId'), bookings.create);
router.get('/:regNo/bookings', allowOwnRegNo, bookings.list);
router.delete('/:regNo/bookings/:slotId', allowOwnRegNo, validateObjectId('slotId'), bookings.remove);

module.exports = router;
