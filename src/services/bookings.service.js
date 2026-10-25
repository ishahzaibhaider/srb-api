// Booking rules live here. REST controllers AND GraphQL resolvers call these functions.
const mongoose = require('mongoose');
const Slot = require('../models/Slot');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const { getStudent } = require('./students.service');
const realtime = require('../realtime/socket');

function assertSlotId(slotId) {
  if (!slotId) throw ApiError.badRequest('slotId is required');
  if (!mongoose.isValidObjectId(slotId)) throw ApiError.badRequest(`'${slotId}' is not a valid slotId`);
}

async function toBookingView(booking, slot, roomName) {
  return {
    slotId: String(slot._id),
    roomCode: slot.roomCode,
    roomName: roomName ?? (await Room.findOne({ roomCode: slot.roomCode }))?.name ?? null,
    date: slot.date,
    startHour: slot.startHour,
    bookedAt: booking.createdAt
  };
}

async function bookSlot(regNo, slotId) {
  assertSlotId(slotId);
  const student = await getStudent(regNo); // 404 if the student does not exist
  if (!(await Slot.exists({ _id: slotId }))) throw ApiError.notFound(`Slot ${slotId} not found`);
  if (await Booking.exists({ regNo: student.regNo, slot: slotId })) {
    throw ApiError.conflict('You have already booked this slot', 'ALREADY_BOOKED');
  }

  // ONE atomic update: booked is increased only while booked < seats,
  // so two students can never both get the last seat.
  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, $expr: { $lt: ['$booked', '$seats'] } },
    { $inc: { booked: 1 } },
    { returnDocument: 'after' }
  );
  if (!slot) throw ApiError.conflict('No free seat in this slot', 'SLOT_FULL');

  let booking;
  try {
    booking = await Booking.create({ regNo: student.regNo, slot: slot._id });
  } catch (err) {
    await Slot.updateOne({ _id: slot._id }, { $inc: { booked: -1 } }); // give the seat back
    if (err.code === 11000) throw ApiError.conflict('You have already booked this slot', 'ALREADY_BOOKED');
    throw err;
  }

  realtime.slotUpdated(slot);
  return toBookingView(booking, slot);
}

async function listBookings(regNo) {
  const student = await getStudent(regNo);
  const bookings = await Booking.find({ regNo: student.regNo }).populate('slot');
  const live = bookings.filter(b => b.slot); // ignore bookings whose slot was removed
  const rooms = await Room.find({ roomCode: { $in: [...new Set(live.map(b => b.slot.roomCode))] } });
  const names = new Map(rooms.map(r => [r.roomCode, r.name]));
  const views = await Promise.all(live.map(b => toBookingView(b, b.slot, names.get(b.slot.roomCode) ?? null)));
  return views.sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour);
}

async function cancelBooking(regNo, slotId) {
  assertSlotId(slotId);
  const student = await getStudent(regNo);
  const booking = await Booking.findOneAndDelete({ regNo: student.regNo, slot: slotId });
  if (!booking) throw ApiError.notFound(`${student.regNo} has no booking for slot ${slotId}`);
  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, booked: { $gt: 0 } },
    { $inc: { booked: -1 } },
    { returnDocument: 'after' }
  );
  realtime.slotUpdated(slot);
}

module.exports = { bookSlot, listBookings, cancelBooking };
