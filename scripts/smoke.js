// Smoke test: logs in first, then checks authentication (401) and the role rules (403).
// Start the API first (npm start or npm run dev:memory), then run: npm run smoke
// BASE can be changed: BASE=http://localhost:4000 npm run smoke
const BASE = process.env.BASE || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || require('../src/config/env').adminPassword;

let failed = 0;

async function call(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body && JSON.stringify(body) });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

function check(label, res, expected) {
  const ok = res.status === expected;
  if (!ok) failed++;
  const note = res.body?.error ? `  (${res.body.error.message})` : '';
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${res.status}  ${label}${ok ? '' : `  -> expected ${expected}`}${note}`);
  return res;
}

async function login(email, password) {
  const res = await call('POST', '/api/v1/auth/login', { body: { email, password } });
  if (res.status !== 200) throw new Error(`Login failed for ${email}: ${res.status}`);
  return res.body.token;
}

async function main() {
  console.log(`Smoke test against ${BASE}\n`);

  // ---- 1. Register and login ----
  const n = String(Date.now()).slice(-3);
  const newStudent = { name: 'New Student', email: `new.student.${Date.now()}@gmail.com`, password: 'Secret@123', regNo: `SP26-BCS-${n}` };
  const reg = check('register a new student', await call('POST', '/api/v1/auth/register', { body: { ...newStudent, role: 'admin' } }), 201);
  console.log(`      role = ${reg.body.data?.role}, password in response = ${'password' in (reg.body.data || {})}`);
  check('register the same email again', await call('POST', '/api/v1/auth/register', { body: newStudent }), 409);
  check('login with a wrong password', await call('POST', '/api/v1/auth/login', { body: { email: newStudent.email, password: 'wrong-pass' } }), 401);
  check('login with an unknown email', await call('POST', '/api/v1/auth/login', { body: { email: 'nobody@gmail.com', password: 'whatever1' } }), 401);

  const student1 = await login('fa23-bai-050@student.comsats.edu.pk', 'Student@123');  // FA23-BAI-050
  const student2 = await login('ayesha.khan@student.comsats.edu.pk', 'Student@123');   // FA23-BCS-045
  const staff = await login('staff@srb.edu.pk', 'Staff@1234');
  const admin = await login('admin@srb.edu.pk', ADMIN_PASSWORD);
  console.log('      logged in: student 1 (FA23-BAI-050), student 2 (FA23-BCS-045), staff, admin');

  const me = check('GET /auth/me with the token', await call('GET', '/api/v1/auth/me', { token: student1 }), 200);
  console.log(`      me = ${me.body.data.name} (${me.body.data.role}, ${me.body.data.regNo})`);
  check('GET /auth/me without a token', await call('GET', '/api/v1/auth/me'), 401);
  check('GET /auth/me with a fake token', await call('GET', '/api/v1/auth/me', { token: 'abc.def.ghi' }), 401);

  // ---- 2. Roles: rooms and slots ----
  check('student views rooms', await call('GET', '/api/v1/rooms', { token: student1 }), 200);
  check('no token views rooms', await call('GET', '/api/v1/rooms'), 401);
  const room = { roomCode: 'ROOM-90', name: 'Smoke Test Room', building: 'CS Block', seats: 2 };
  check('student creates a room', await call('POST', '/api/v1/rooms', { token: student1, body: room }), 403);
  await call('DELETE', '/api/v1/rooms/ROOM-90', { token: admin });               // clean up an older run
  check('staff creates a room', await call('POST', '/api/v1/rooms', { token: staff, body: room }), 201);
  check('staff edits the room', await call('PATCH', '/api/v1/rooms/ROOM-90', { token: staff, body: { seats: 3 } }), 200);
  check('student creates a slot', await call('POST', '/api/v1/slots', { token: student1, body: { roomCode: 'ROOM-90', date: '2026-12-01', startHour: 8 } }), 403);
  check('staff deletes the room', await call('DELETE', '/api/v1/rooms/ROOM-90', { token: staff }), 403);
  check('admin deletes the room', await call('DELETE', '/api/v1/rooms/ROOM-90', { token: admin }), 204);

  // ---- 3. Bookings: own regNo only for students ----
  const slots = await call('GET', '/api/v1/slots?roomCode=ROOM-01&hasSeats=true&limit=1', { token: student1 });
  const slotId = slots.body.data[0]._id;
  check('student 1 books a seat for FA23-BAI-050 (own)', await call('POST', '/api/v1/students/FA23-BAI-050/bookings', { token: student1, body: { slotId } }), 201);
  check('student 1 sees own bookings', await call('GET', '/api/v1/students/FA23-BAI-050/bookings', { token: student1 }), 200);
  check("student 1 sees student 2's bookings (FA23-BCS-045)", await call('GET', '/api/v1/students/FA23-BCS-045/bookings', { token: student1 }), 403);
  check('student 1 books a seat for student 2', await call('POST', '/api/v1/students/FA23-BCS-045/bookings', { token: student1, body: { slotId } }), 403);
  check('staff sees bookings of FA23-BAI-050', await call('GET', '/api/v1/students/FA23-BAI-050/bookings', { token: staff }), 200);
  check('student 1 cancels own booking', await call('DELETE', `/api/v1/students/FA23-BAI-050/bookings/${slotId}`, { token: student1 }), 204);

  console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
}

main().catch(err => { console.error(err.message); process.exit(1); });
