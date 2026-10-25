const slots = require('../services/slots.service');

exports.create = async (req, res) => {
  const slot = await slots.createSlot(req.body);
  res.status(201).location(`/api/v1/slots/${slot._id}`).json({ data: slot });
};

exports.getOne = async (req, res) => res.json({ data: await slots.getSlot(req.params.id) });

exports.list = async (req, res) => res.json(await slots.listSlots(req.query));
