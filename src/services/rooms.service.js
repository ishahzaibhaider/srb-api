const Room = require('../models/Room');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');

const EDITABLE = ['name', 'building', 'seats'];

const normalise = code => String(code ?? '').trim().toUpperCase();

function pick(data, fields) {
  const out = {};
  for (const f of fields) if (data[f] !== undefined) out[f] = data[f];
  return out;
}

// roomCode is the identity of a room: it can be repeated in the body, but never changed
function assertRoomCodeUnchanged(roomCode, data) {
  if (data.roomCode !== undefined && normalise(data.roomCode) !== roomCode) {
    throw ApiError.unprocessable('roomCode cannot be changed after the room is created', 'ROOMCODE_IMMUTABLE');
  }
}

async function listRooms() {
  return Room.find().sort({ roomCode: 1 });
}

async function getRoom(roomCode) {
  const code = normalise(roomCode);
  const room = await Room.findOne({ roomCode: code });
  if (!room) throw ApiError.notFound(`Room ${code} not found`);
  return room;
}

async function createRoom(data) {
  return Room.create(pick(data, ['roomCode', ...EDITABLE]));
}

// PUT: replace every editable field
async function replaceRoom(roomCode, data) {
  const room = await getRoom(roomCode);
  assertRoomCodeUnchanged(room.roomCode, data);
  room.set(pick(data, EDITABLE));
  return room.save();
}

// PATCH: change only the fields that were sent
async function updateRoom(roomCode, data) {
  const room = await getRoom(roomCode);
  assertRoomCodeUnchanged(room.roomCode, data);
  const changes = pick(data, EDITABLE);
  if (Object.keys(changes).length === 0) {
    throw ApiError.badRequest(`Send at least one of: ${EDITABLE.join(', ')}`);
  }
  room.set(changes);
  return room.save();
}

async function deleteRoom(roomCode) {
  const room = await getRoom(roomCode);
  if (await Slot.exists({ roomCode: room.roomCode, booked: { $gt: 0 } })) {
    throw ApiError.conflict('Room has slots with bookings; cancel them first', 'ROOM_HAS_BOOKINGS');
  }
  const slotIds = (await Slot.find({ roomCode: room.roomCode }, '_id')).map(s => s._id);
  await Booking.deleteMany({ slot: { $in: slotIds } });
  await Slot.deleteMany({ roomCode: room.roomCode });
  await room.deleteOne();
}

module.exports = { listRooms, getRoom, createRoom, replaceRoom, updateRoom, deleteRoom };
