// Inserts sample data: 4 rooms, 14 slots, 3 students. Run with: npm run seed
const mongoose = require('mongoose');
const { mongoUri } = require('../src/config/env');
const Room = require('../src/models/Room');
const Slot = require('../src/models/Slot');
const Student = require('../src/models/Student');
const Booking = require('../src/models/Booking');

const rooms = [
  { roomCode: 'ROOM-01', name: 'Quiet Room A', building: 'Library', seats: 4 },
  { roomCode: 'ROOM-02', name: 'Group Room B', building: 'Library', seats: 6 },
  { roomCode: 'ROOM-03', name: 'Discussion Pod', building: 'CS Block', seats: 2 },
  { roomCode: 'ROOM-04', name: 'Tiny Pod', building: 'CS Block', seats: 1 }
];

const slotPlan = [
  ['ROOM-01', '2026-11-02', [8, 10, 12, 14, 16]],
  ['ROOM-01', '2026-11-03', [8, 10]],
  ['ROOM-02', '2026-11-02', [10, 14]],
  ['ROOM-02', '2026-11-03', [12]],
  ['ROOM-03', '2026-11-02', [12, 16]],
  ['ROOM-04', '2026-11-02', [8, 10]]
];

const students = [
  { regNo: 'FA23-BCS-045', name: 'Ayesha Khan', email: 'ayesha.khan@student.comsats.edu.pk' },
  { regNo: 'FA23-BAI-050', name: 'Syed Shahzaib Haider Rizvi', email: 'fa23-bai-050@student.comsats.edu.pk' },
  { regNo: 'FA23-BSE-012', name: 'Omar Farooq', email: 'omar.farooq@student.comsats.edu.pk' }
];

async function seed() {
  await Promise.all([Room.deleteMany(), Slot.deleteMany(), Student.deleteMany(), Booking.deleteMany()]);
  await Promise.all([Room.syncIndexes(), Slot.syncIndexes(), Student.syncIndexes(), Booking.syncIndexes()]);

  await Room.insertMany(rooms);
  const seatsOf = Object.fromEntries(rooms.map(r => [r.roomCode, r.seats]));
  const slots = slotPlan.flatMap(([roomCode, date, hours]) =>
    hours.map(startHour => ({ roomCode, date, startHour, seats: seatsOf[roomCode], booked: 0 })));
  await Slot.insertMany(slots);
  await Student.insertMany(students);

  console.log(`Seeded ${rooms.length} rooms, ${slots.length} slots, ${students.length} students`);
}

if (require.main === module) {
  mongoose.connect(mongoUri)
    .then(seed)
    .then(() => mongoose.disconnect())
    .catch(err => { console.error(err.message); process.exit(1); });
}

module.exports = seed;
