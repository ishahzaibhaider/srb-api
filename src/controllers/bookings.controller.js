const bookings = require('../services/bookings.service');

exports.create = async (req, res) => {
  const booking = await bookings.bookSlot(req.params.regNo, req.body?.slotId);
  res.status(201).json({ data: booking });
};

exports.list = async (req, res) => res.json({ data: await bookings.listBookings(req.params.regNo) });

exports.remove = async (req, res) => {
  await bookings.cancelBooking(req.params.regNo, req.params.slotId);
  res.status(204).end();
};
