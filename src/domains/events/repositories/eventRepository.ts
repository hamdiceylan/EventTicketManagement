import {
  saddAsync,
  sremAsync,
  smembersAsync,
  hsetAsync,
  hgetAsync,
  watchAsync,
  unwatchAsync,
} from "../../../infrastructure/database/utils";

import {
  commandClient,
} from "../../../infrastructure/database/redisClient";


import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import { SeatStatus, ValidationMessages } from "../../../utils/enums";
import {
  isTotalSeatsValid,
  isUserIdValid,
  isSeatAvailable,
  isSeatHeldByUser,
  isTransactionSuccessful,
} from "../../../utils/validators";
import { SeatInfo, EventOperationResult } from "../../../types";

async function createEvent(
  totalSeats: number
): Promise<{ id: string; totalSeats: number }> {
  if (!isTotalSeatsValid(totalSeats)) {
      throw new Error(ValidationMessages.TotalSeatsInvalid);
  }

  const eventId = uuidv4();
  const seats = Array.from(
      { length: totalSeats },
      (_, index) => `seat${index + 1}`
  );
  await Promise.all(
      seats.map((seatId) =>
          updateSeatStatus(eventId, seatId, SeatStatus.Available, null)
      )
  );
  return { id: eventId, totalSeats };
}

async function listAvailableSeats(eventId: string): Promise<string[]> {
  const availableSeats = await smembersAsync(
      `event:${eventId}:available_seats`
  );
  return availableSeats;
}

async function updateSeatStatus(
  eventId: string,
  seatId: string,
  status: string,
  userId: string | null
): Promise<void> {
  const seatInfo: SeatInfo = { status, userId };
  await hsetAsync(`event:${eventId}`, seatId, JSON.stringify(seatInfo));
  if (status === SeatStatus.Available) {
      await saddAsync(`event:${eventId}:available_seats`, seatId);
  } else {
      await sremAsync(`event:${eventId}:available_seats`, seatId);
  }
}

async function holdSeat(
  eventId: string,
  seatId: string,
  userId: string
): Promise<EventOperationResult> {
  if (!isUserIdValid(userId)) {
      throw new Error(ValidationMessages.InvalidUserIdFormat);
  }

  await watchAsync(`event:${eventId}`);
  const seatInfoJson = await hgetAsync(`event:${eventId}`, seatId);
  const seatStatus: SeatInfo = JSON.parse(seatInfoJson || "{}");

  if (!isSeatAvailable(seatStatus.status)) {
      await unwatchAsync();
      throw new Error(ValidationMessages.SeatNotAvailableOrHeld);
  }

  const multi = commandClient.multi();
  const seatInfo: SeatInfo = { status: SeatStatus.Held, userId };
  multi.hset(`event:${eventId}`, seatId, JSON.stringify(seatInfo));
  multi.srem(`event:${eventId}:available_seats`, seatId);
  multi.setex(`hold:${eventId}:${seatId}`, 60, SeatStatus.Held);

  const execAsync = promisify(multi.exec).bind(multi);
  const results = await execAsync();
  if (!isTransactionSuccessful(results)) {
      throw new Error(ValidationMessages.TransactionFailed);
  }
  return { status: "success", seatId, userId };
}

async function reserveSeat(
  eventId: string,
  seatId: string,
  userId: string
): Promise<EventOperationResult> {
  if (!isUserIdValid(userId)) {
      throw new Error(ValidationMessages.InvalidUserIdFormat);
  }

  await watchAsync(`event:${eventId}`);
  const seatInfoJson = await hgetAsync(`event:${eventId}`, seatId);
  const seatStatus: SeatInfo = JSON.parse(seatInfoJson || "{}");

  if (!isSeatHeldByUser(seatStatus.status, userId, seatStatus.userId)) {
      await unwatchAsync();
      throw new Error(ValidationMessages.CannotReserveSeat);
  }

  const multi = commandClient.multi();
  const seatInfo: SeatInfo = { status: SeatStatus.Reserved, userId };
  multi.hset(`event:${eventId}`, seatId, JSON.stringify(seatInfo));

  const execAsync = promisify(multi.exec).bind(multi);
  const results = await execAsync();
  if (!isTransactionSuccessful(results)) {
      throw new Error(ValidationMessages.TransactionFailed);
  }
  return { status: "success", seatId, userId };
}

async function refreshHold(
  eventId: string,
  seatId: string,
  userId: string
): Promise<EventOperationResult> {
  if (!isUserIdValid(userId)) {
      throw new Error(ValidationMessages.InvalidUserIdFormat);
  }

  await watchAsync(`event:${eventId}`);
  const seatInfoJson = await hgetAsync(`event:${eventId}`, seatId);
  const seatStatus: SeatInfo = JSON.parse(seatInfoJson || "{}");

  if (!isSeatHeldByUser(seatStatus.status, userId, seatStatus.userId)) {
      await unwatchAsync();
      throw new Error(ValidationMessages.CannotRefreshHold);
  }

  const multi = commandClient.multi();
  multi.setex(`hold:${eventId}:${seatId}`, 60, SeatStatus.Held);

  const execAsync = promisify(multi.exec).bind(multi);
  const results = await execAsync();
  if (!isTransactionSuccessful(results)) {
      throw new Error(ValidationMessages.TransactionFailed);
  }
  return { status: "success", seatId, userId };
}

async function getSeatStatus(
  eventId: string,
  seatId: string
): Promise<SeatInfo> {
  const seatInfoJson = await hgetAsync(`event:${eventId}`, seatId);
  return JSON.parse(seatInfoJson || "{}");
}

export default {
  createEvent,
  listAvailableSeats,
  updateSeatStatus,
  holdSeat,
  reserveSeat,
  refreshHold,
  getSeatStatus,
};
