// Resolvers only translate between GraphQL and the SAME service functions the REST API uses
const { GraphQLError } = require('graphql');
const ApiError = require('../utils/ApiError');
const { toApiError } = require('../middleware/errorHandler');
const roomsService = require('../services/rooms.service');
const slotsService = require('../services/slots.service');
const studentsService = require('../services/students.service');
const bookingsService = require('../services/bookings.service');
const { userFromToken } = require('../middleware/requireAuth');
const { can, canUseBookingsOf } = require('../config/roles');

const CODES = { 400: 'BAD_USER_INPUT', 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'VALIDATION_FAILED' };

// Same rules as the REST API (config/roles.js): log in first, then check the role / regNo
async function allowed(ctx, action) {
  const user = await userFromToken(ctx.authHeader);
  if (!can(user.role, action)) throw ApiError.forbidden(`Your role (${user.role}) is not allowed to do this`, 'FORBIDDEN');
}
async function allowedForRegNo(ctx, regNo) {
  const user = await userFromToken(ctx.authHeader);
  if (!canUseBookingsOf(user, regNo)) throw ApiError.forbidden('Students can only access their own bookings', 'NOT_YOUR_REGNO');
}

// Service errors become GraphQL errors with the same code (SLOT_FULL, ALREADY_BOOKED, ...)
async function run(fn) {
  try {
    return await fn();
  } catch (err) {
    const apiError = toApiError(err);
    if (!apiError) throw err;
    throw new GraphQLError(apiError.message, {
      extensions: { code: apiError.code || CODES[apiError.status], status: apiError.status }
    });
  }
}

module.exports = {
  Query: {
    rooms: (_, __, ctx) => run(async () => { await allowed(ctx, 'rooms:view'); return roomsService.listRooms(); }),
    slots: (_, { roomCode, date }, ctx) => run(async () => {
      await allowed(ctx, 'slots:view');
      return (await slotsService.listSlots({ roomCode, date, limit: 100 })).data;
    }),
    student: (_, { regNo }, ctx) => run(async () => {
      await allowedForRegNo(ctx, regNo);
      try {
        return await studentsService.getStudent(regNo);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null; // not found -> null
        throw err;
      }
    })
  },
  Mutation: {
    bookSlot: (_, { regNo, slotId }, ctx) => run(async () => {
      await allowedForRegNo(ctx, regNo);
      return bookingsService.bookSlot(regNo, slotId);
    }),
    cancelBooking: (_, { regNo, slotId }, ctx) => run(async () => {
      await allowedForRegNo(ctx, regNo);
      await bookingsService.cancelBooking(regNo, slotId);
      return true;
    })
  },
  Room: {
    slots: (room, { date }) => slotsService.listForRoom(room.roomCode, date)
  },
  Slot: {
    id: slot => String(slot._id),
    seatsLeft: slot => slot.seats - slot.booked,
    room: slot => roomsService.getRoom(slot.roomCode).catch(() => null)
  },
  Student: {
    bookings: student => bookingsService.listBookings(student.regNo)
  },
  Booking: {
    bookedAt: b => (b.bookedAt ? new Date(b.bookedAt).toISOString() : null)
  }
};
