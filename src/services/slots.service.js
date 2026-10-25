const mongoose = require('mongoose');
const Room = require('../models/Room');
const Slot = require('../models/Slot');
const ApiError = require('../utils/ApiError');

const SORT = { date: 1, startHour: 1, roomCode: 1 };

async function createSlot({ roomCode, date, startHour }) {
  const code = String(roomCode).trim().toUpperCase();
  const room = await Room.findOne({ roomCode: code });
  if (!room) throw ApiError.notFound(`Room ${code} not found`);
  // seats are copied from the room at creation time
  return Slot.create({ roomCode: room.roomCode, date, startHour, seats: room.seats, booked: 0 });
}

async function getSlot(id) {
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest(`'${id}' is not a valid slot id`);
  const slot = await Slot.findById(id);
  if (!slot) throw ApiError.notFound(`Slot ${id} not found`);
  return slot;
}

function toPositiveInt(value, name, fallback, max) {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > max) throw ApiError.badRequest(`${name} must be an integer between 1 and ${max}`);
  return n;
}

async function listSlots({ roomCode, date, hasSeats, page, limit } = {}) {
  const filter = {};
  if (roomCode) filter.roomCode = String(roomCode).trim().toUpperCase();
  if (date) filter.date = String(date);
  if (hasSeats !== undefined && hasSeats !== '') {
    if (!['true', 'false', true, false].includes(hasSeats)) throw ApiError.badRequest('hasSeats must be true or false');
    if (hasSeats === 'true' || hasSeats === true) filter.$expr = { $lt: ['$booked', '$seats'] };
  }
  const p = toPositiveInt(page, 'page', 1, 100000);
  const l = toPositiveInt(limit, 'limit', 10, 100);

  const [data, total] = await Promise.all([
    Slot.find(filter).sort(SORT).skip((p - 1) * l).limit(l),
    Slot.countDocuments(filter)
  ]);
  return { data, page: p, limit: l, total, totalPages: Math.ceil(total / l) };
}

async function listForRoom(roomCode, date) {
  const filter = { roomCode };
  if (date) filter.date = date;
  return Slot.find(filter).sort(SORT);
}

module.exports = { createSlot, getSlot, listSlots, listForRoom };
