// All access rules in ONE place. Each action lists the roles that may perform it.
// Used by the authorize middleware (REST) and by the GraphQL resolvers.
const ROLES = ['student', 'staff', 'admin'];

const PERMISSIONS = {
  'rooms:view':     ['student', 'staff', 'admin'],
  'rooms:edit':     ['staff', 'admin'],          // create / update rooms
  'rooms:delete':   ['admin'],
  'slots:view':     ['student', 'staff', 'admin'],
  'slots:edit':     ['staff', 'admin'],          // create slots
  'students:edit':  ['staff', 'admin'],          // create student records directly
  'bookings:any':   ['staff', 'admin'],          // any student's bookings
  'bookings:own':   ['student']                  // only bookings of their own regNo
};

function can(role, action) {
  return (PERMISSIONS[action] || []).includes(role);
}

// Booking rule: staff/admin may act for any student, a student only for their own regNo
function canUseBookingsOf(user, regNo) {
  if (can(user.role, 'bookings:any')) return true;
  return can(user.role, 'bookings:own') && String(regNo).toUpperCase() === user.regNo;
}

module.exports = { ROLES, PERMISSIONS, can, canUseBookingsOf };
