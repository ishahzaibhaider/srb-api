// Socket.IO: boards join a Socket.IO room named after a roomCode and get live seat counts.
// The REST API (and GraphQL) still do the booking; the services call slotUpdated() afterwards.
const { Server } = require('socket.io');
const Room = require('../models/Room');
const slotsService = require('../services/slots.service');
const { adminKey } = require('../config/env');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer);

  // ---- default namespace: room boards ----
  io.on('connection', socket => {
    socket.on('join:room', async (roomCode, ack) => {
      if (typeof ack !== 'function') return;
      try {
        const code = String(roomCode ?? '').trim().toUpperCase();
        const room = await Room.findOne({ roomCode: code });
        if (!room) return ack({ ok: false, error: `Room ${code || '(empty)'} not found` });
        if (socket.data.roomCode && socket.data.roomCode !== code) socket.leave(socket.data.roomCode);
        socket.join(code); // join first, then read the snapshot, so no update is missed
        socket.data.roomCode = code;
        const slots = await slotsService.listForRoom(code);
        ack({ ok: true, room: room.toJSON(), slots: slots.map(toBoardSlot) });
      } catch (err) {
        console.error(err);
        ack({ ok: false, error: 'Could not load the room' });
      }
    });
  });

  // ---- /admin namespace: needs the adminKey from .env ----
  const admin = io.of('/admin');
  admin.use((socket, next) => {
    const key = socket.handshake.auth?.adminKey;
    if (!adminKey || key !== adminKey) return next(new Error('Invalid admin key: connection refused'));
    next();
  });
  admin.on('connection', socket => {
    socket.on('announce', (message, ack) => {
      const text = String(message ?? '').trim().slice(0, 300);
      if (!text) return ack?.({ ok: false, error: 'Announcement is empty' });
      io.emit('announcement', { message: text, at: new Date().toISOString() }); // every board
      ack?.({ ok: true, delivered: io.of('/').sockets.size });
    });
  });

  return io;
}

function toBoardSlot(slot) {
  return {
    slotId: String(slot._id), date: slot.date, startHour: slot.startHour,
    seats: slot.seats, booked: slot.booked, seatsLeft: slot.seats - slot.booked
  };
}

// Called after a booking is made or cancelled: only boards of that room receive it
function slotUpdated(slot) {
  if (!io || !slot) return;
  io.to(slot.roomCode).emit('slot:updated', { slotId: String(slot._id), seatsLeft: slot.seats - slot.booked });
}

module.exports = { initSocket, slotUpdated };
