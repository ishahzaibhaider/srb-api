const rooms = require('../services/rooms.service');

// Express 5 forwards rejected promises to the error handler, so no try/catch is needed here
exports.list = async (req, res) => res.json({ data: await rooms.listRooms() });

exports.getOne = async (req, res) => res.json({ data: await rooms.getRoom(req.params.roomCode) });

exports.create = async (req, res) => {
  const room = await rooms.createRoom(req.body);
  res.status(201).location(`/api/v1/rooms/${room.roomCode}`).json({ data: room });
};

exports.replace = async (req, res) => res.json({ data: await rooms.replaceRoom(req.params.roomCode, req.body) });

exports.update = async (req, res) => res.json({ data: await rooms.updateRoom(req.params.roomCode, req.body) });

exports.remove = async (req, res) => {
  await rooms.deleteRoom(req.params.roomCode);
  res.status(204).end();
};
