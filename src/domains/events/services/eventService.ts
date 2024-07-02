import eventRepository from "../repositories/eventRepository";
import { EventCreationResult, EventOperationResult } from "../../../types";

async function createEvent(totalSeats: number): Promise<EventCreationResult> {
  return await eventRepository.createEvent(totalSeats);
}

async function listAvailableSeats(eventId: string): Promise<string[]> {
  return await eventRepository.listAvailableSeats(eventId);
}

async function holdSeat(
  eventId: string,
  seatId: string,
  userId: string
): Promise<EventOperationResult> {
  return await eventRepository.holdSeat(eventId, seatId, userId);
}

async function reserveSeat(
  eventId: string,
  seatId: string,
  userId: string
): Promise<EventOperationResult> {
  return await eventRepository.reserveSeat(eventId, seatId, userId);
}

async function refreshHold(
  eventId: string,
  seatId: string,
  userId: string
): Promise<EventOperationResult> {
  return await eventRepository.refreshHold(eventId, seatId, userId);
}

export default {
  createEvent,
  listAvailableSeats,
  holdSeat,
  reserveSeat,
  refreshHold,
};
