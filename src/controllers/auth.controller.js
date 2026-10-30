const authService = require('../services/auth.service');
const User = require('../models/User');

exports.register = async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ data: user });          // toJSON removes the password hash
};

exports.login = async (req, res) => {
  res.json(await authService.login(req.body));
};

exports.me = async (req, res) => {
  res.json({ data: await User.findById(req.user.id) });
};
