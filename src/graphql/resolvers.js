// Resolvers only translate between GraphQL and the SAME service functions the REST API uses
const { GraphQLError } = require('graphql');
const ApiError = require('../utils/ApiError');
const { toApiError } = require('../middleware/errorHandler');
const roomsService = require('../services/rooms.service');
const slotsService = require('../services/slots.service');
const studentsService = require('../services/students.service');
const bookingsService = require('../services/bookings.service');

const CODES = { 400: 'BAD_USER_INPUT', 404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'VALIDATION_FAILED' };

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
    rooms: () => run(() => roomsService.listRooms()),
    slots: (_, { roomCode, date }) =>
      run(async () => (await slotsService.listSlots({ roomCode, date, limit: 100 })).data),
    student: (_, { regNo }) => run(async () => {
      try {
        return await studentsService.getStudent(regNo);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null; // not found -> null
        throw err;
      }
    })
  },
  Mutation: {
    bookSlot: (_, { regNo, slotId }) => run(() => bookingsService.bookSlot(regNo, slotId)),
    cancelBooking: (_, { regNo, slotId }) => run(async () => {
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
