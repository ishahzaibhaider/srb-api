const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');

async function createStudent({ regNo, name, email }) {
  return Student.create({ regNo, name, email });
}

async function getStudent(regNo) {
  const code = String(regNo ?? '').trim().toUpperCase();
  const student = await Student.findOne({ regNo: code });
  if (!student) throw ApiError.notFound(`Student ${code} not found`);
  return student;
}

module.exports = { createStudent, getStudent };
