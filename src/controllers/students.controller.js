const students = require('../services/students.service');

exports.create = async (req, res) => {
  const student = await students.createStudent(req.body);
  res.status(201).location(`/api/v1/students/${student.regNo}`).json({ data: student });
};

exports.getOne = async (req, res) => res.json({ data: await students.getStudent(req.params.regNo) });
