import { Request, Response } from "express";
import eventService from "../services/eventService";
import { isTotalSeatsValid, isUserIdValid } from "../../../utils/validators";
import { ValidationMessages, HttpStatusCode } from "../../../utils/enums";

const createEvent = async (req: Request, res: Response): Promise<void> => {
  const { totalSeats } = req.body;
  try {
    if (!isTotalSeatsValid(totalSeats)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: ValidationMessages.TotalSeatsInvalid });
      return;
    }

    const event = await eventService.createEvent(totalSeats);
    res.status(HttpStatusCode.CREATED).json(event);
  } catch (error) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
};

const listAvailableSeats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { eventId } = req.params;
  try {
    const availableSeats = await eventService.listAvailableSeats(eventId);
    res.status(HttpStatusCode.OK).json(availableSeats);
  } catch (error) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
};

const holdSeat = async (req: Request, res: Response): Promise<void> => {
  const { eventId, seatId } = req.params;
  const { userId } = req.body;
  try {
    if (!isUserIdValid(userId)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: ValidationMessages.InvalidUserIdFormat });
      return;
    }

    const result = await eventService.holdSeat(eventId, seatId, userId);
    res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .json({ error: (error as Error).message });
  }
};

const reserveSeat = async (req: Request, res: Response): Promise<void> => {
  const { eventId, seatId } = req.params;
  const { userId } = req.body;
  try {
    if (!isUserIdValid(userId)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: ValidationMessages.InvalidUserIdFormat });
      return;
    }
    const result = await eventService.reserveSeat(eventId, seatId, userId);
    res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .json({ error: (error as Error).message });
  }
};

const refreshHold = async (req: Request, res: Response): Promise<void> => {
  const { eventId, seatId } = req.params;
  const { userId } = req.body;
  try {
    if (!isUserIdValid(userId)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: ValidationMessages.InvalidUserIdFormat });
      return;
    }
    const result = await eventService.refreshHold(eventId, seatId, userId);
    res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .json({ error: (error as Error).message });
  }
};

export { createEvent, listAvailableSeats, holdSeat, reserveSeat, refreshHold };
