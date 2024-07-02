import { Router } from "express";
import {
  createEvent,
  listAvailableSeats,
  holdSeat,
  reserveSeat,
  refreshHold,
} from "../../../domains/events/controllers/eventController";

const router = Router();

router.post("/", createEvent);
router.get("/:eventId/available-seats", listAvailableSeats);
router.post("/:eventId/seats/:seatId/hold", holdSeat);
router.post("/:eventId/seats/:seatId/reserve", reserveSeat);
router.post("/:eventId/seats/:seatId/refresh", refreshHold);

export default router;
