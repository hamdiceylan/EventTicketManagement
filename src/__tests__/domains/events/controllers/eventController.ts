import { Request, Response } from "express";
import {
  createEvent,
  listAvailableSeats,
  holdSeat,
  reserveSeat,
  refreshHold
} from "../../../../domains/events/controllers/eventController";
import eventService from "../../../../domains/events/services/eventService";
import { ValidationMessages, HttpStatusCode } from "../../../../utils/enums";
import { isTotalSeatsValid, isUserIdValid } from "../../../../utils/validators";

jest.mock("../../../../domains/events/services/eventService");
jest.mock("../../../../utils/validators");

jest.mock("../../../../infrastructure/database/utils", () => ({
  saddAsync: jest.fn(),
  sremAsync: jest.fn(),
  smembersAsync: jest.fn(),
  setexAsync: jest.fn(),
  hsetAsync: jest.fn(),
  hgetAsync: jest.fn(),
  watchAsync: jest.fn(),
}));
jest.mock("../../../../infrastructure/database/redisClient", () => ({
  commandClient: {
    on: jest.fn(),
    multi: jest.fn().mockReturnThis(),
    exec: jest.fn()
  },
  subscriptionClient: {
    on: jest.fn(),
    psubscribe: jest.fn()
  }
}));

describe("EventController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    req = {};
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson })) as jest.Mock;
    res = {
      status: mockStatus,
      json: mockJson
    } as unknown as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should return 400 if totalSeats is invalid", async () => {
      (isTotalSeatsValid as jest.Mock).mockReturnValue(false);

      req.body = { totalSeats: 5 };

      await createEvent(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: ValidationMessages.TotalSeatsInvalid });
    });

    it("should return 201 and create event if totalSeats is valid", async () => {
      const mockEvent = { id: "event1", totalSeats: 100 };
      (isTotalSeatsValid as jest.Mock).mockReturnValue(true);
      (eventService.createEvent as jest.Mock).mockResolvedValue(mockEvent);

      req.body = { totalSeats: 100 };

      await createEvent(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.CREATED);
      expect(mockJson).toHaveBeenCalledWith(mockEvent);
    });

    it("should return 500 if there is an internal server error", async () => {
      (isTotalSeatsValid as jest.Mock).mockReturnValue(true);
      (eventService.createEvent as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

      req.body = { totalSeats: 100 };

      await createEvent(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("listAvailableSeats", () => {
    it("should return 200 and list available seats", async () => {
      const mockSeats = ["seat1", "seat2"];
      (eventService.listAvailableSeats as jest.Mock).mockResolvedValue(mockSeats);

      req.params = { eventId: "event1" };

      await listAvailableSeats(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockJson).toHaveBeenCalledWith(mockSeats);
    });

    it("should return 500 if there is an internal server error", async () => {
      (eventService.listAvailableSeats as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

      req.params = { eventId: "event1" };

      await listAvailableSeats(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("holdSeat", () => {
    it("should return 400 if userId is invalid", async () => {
      (isUserIdValid as jest.Mock).mockReturnValue(false);

      req.params = { eventId: "event1", seatId: "seat1" };
      req.body = { userId: "invalid-user-id" };

      await holdSeat(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: ValidationMessages.InvalidUserIdFormat });
    });

    it("should return 200 and hold the seat if userId is valid", async () => {
      const mockResult = { status: "success", seatId: "seat1", userId: "user1" };
      (isUserIdValid as jest.Mock).mockReturnValue(true);
      (eventService.holdSeat as jest.Mock).mockResolvedValue(mockResult);

      req.params = { eventId: "event1", seatId: "seat1" };
      req.body = { userId: "user1" };

      await holdSeat(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 if there is a bad request error", async () => {
      (isUserIdValid as jest.Mock).mockReturnValue(true);
      (eventService.holdSeat as jest.Mock).mockRejectedValue(new Error("Bad Request"));

      req.params = { eventId: "event1", seatId: "seat1" };
      req.body = { userId: "user1" };

      await holdSeat(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: "Bad Request" });
    });
  });

  describe("reserveSeat", () => {
    it("should return 200 and reserve the seat", async () => {
      const mockResult = { status: "success", seatId: "seat1", userId: "user1" };
      (eventService.reserveSeat as jest.Mock).mockResolvedValue(mockResult);

      req.params = { eventId: "event1", seatId: "seat1" };
      req.body = { userId: "user1" };

      await reserveSeat(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 if there is a bad request error", async () => {
      (eventService.reserveSeat as jest.Mock).mockRejectedValue(new Error("Bad Request"));

      req.params = { eventId: "event1", seatId: "seat1" };
      req.body = { userId: "user1" };

      await reserveSeat(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: "Bad Request" });
    });
  });

  describe("refreshHold", () => {
    it("should return 200 and refresh the hold", async () => {
      const mockResult = { status: "success", seatId: "seat1", userId: "user1" };
      (eventService.refreshHold as jest.Mock).mockResolvedValue(mockResult);

      req.params = { eventId: "event1", seatId: "seat1" };
      req.body = { userId: "user1" };

      await refreshHold(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 if there is a bad request error", async () => {
      (eventService.refreshHold as jest.Mock).mockRejectedValue(new Error("Bad Request"));

      req.params = { eventId: "event1", seatId: "seat1" };
      req.body = { userId: "user1" };

      await refreshHold(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: "Bad Request" });
    });
  });
});
