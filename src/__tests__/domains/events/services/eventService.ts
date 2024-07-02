import eventService from "../../../../domains/events/services/eventService";
import eventRepository from "../../../../domains/events/repositories/eventRepository";
import { EventCreationResult, EventOperationResult } from "../../../../types";

jest.mock("../../../../domains/events/repositories/eventRepository");
jest.mock("../../../../utils/validators");

jest.mock("../../../../infrastructure/database/redisClient", () => ({
  saddAsync: jest.fn(),
  sremAsync: jest.fn(),
  smembersAsync: jest.fn(),
  setexAsync: jest.fn(),
  hsetAsync: jest.fn(),
  hgetAsync: jest.fn(),
  watchAsync: jest.fn(),
  commandClient: {
    on: jest.fn(),
    multi: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  },
  subscriptionClient: {
    on: jest.fn(),
    psubscribe: jest.fn(),
  },
}));

describe("EventService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should create an event with the given total seats", async () => {
      const mockResult: EventCreationResult = { id: "event1", totalSeats: 100 };
      (eventRepository.createEvent as jest.Mock).mockResolvedValue(mockResult);

      const result = await eventService.createEvent(100);

      expect(result).toEqual(mockResult);
      expect(eventRepository.createEvent).toHaveBeenCalledWith(100);
    });

    it("should throw an error if the repository fails", async () => {
      const errorMessage = "Failed to create event";
      (eventRepository.createEvent as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(eventService.createEvent(100)).rejects.toThrow(errorMessage);
    });
  });

  describe("listAvailableSeats", () => {
    it("should return a list of available seats for the given event", async () => {
      const mockSeats = ["seat1", "seat2"];
      (eventRepository.listAvailableSeats as jest.Mock).mockResolvedValue(
        mockSeats
      );

      const result = await eventService.listAvailableSeats("event1");

      expect(result).toEqual(mockSeats);
      expect(eventRepository.listAvailableSeats).toHaveBeenCalledWith("event1");
    });

    it("should throw an error if the repository fails", async () => {
      const errorMessage = "Failed to list available seats";
      (eventRepository.listAvailableSeats as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(eventService.listAvailableSeats("event1")).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe("holdSeat", () => {
    it("should hold a seat for the given user", async () => {
      const mockResult: EventOperationResult = {
        status: "success",
        seatId: "seat1",
        userId: "user1",
      };
      (eventRepository.holdSeat as jest.Mock).mockResolvedValue(mockResult);

      const result = await eventService.holdSeat("event1", "seat1", "user1");

      expect(result).toEqual(mockResult);
      expect(eventRepository.holdSeat).toHaveBeenCalledWith(
        "event1",
        "seat1",
        "user1"
      );
    });

    it("should throw an error if the repository fails", async () => {
      const errorMessage = "Failed to hold seat";
      (eventRepository.holdSeat as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(
        eventService.holdSeat("event1", "seat1", "user1")
      ).rejects.toThrow(errorMessage);
    });
  });

  describe("reserveSeat", () => {
    it("should reserve a seat for the given user", async () => {
      const mockResult: EventOperationResult = {
        status: "success",
        seatId: "seat1",
        userId: "user1",
      };
      (eventRepository.reserveSeat as jest.Mock).mockResolvedValue(mockResult);

      const result = await eventService.reserveSeat("event1", "seat1", "user1");

      expect(result).toEqual(mockResult);
      expect(eventRepository.reserveSeat).toHaveBeenCalledWith(
        "event1",
        "seat1",
        "user1"
      );
    });

    it("should throw an error if the repository fails", async () => {
      const errorMessage = "Failed to reserve seat";
      (eventRepository.reserveSeat as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(
        eventService.reserveSeat("event1", "seat1", "user1")
      ).rejects.toThrow(errorMessage);
    });
  });

  describe("refreshHold", () => {
    it("should refresh the hold for a seat for the given user", async () => {
      const mockResult: EventOperationResult = {
        status: "success",
        seatId: "seat1",
        userId: "user1",
      };
      (eventRepository.refreshHold as jest.Mock).mockResolvedValue(mockResult);

      const result = await eventService.refreshHold("event1", "seat1", "user1");

      expect(result).toEqual(mockResult);
      expect(eventRepository.refreshHold).toHaveBeenCalledWith(
        "event1",
        "seat1",
        "user1"
      );
    });

    it("should throw an error if the repository fails", async () => {
      const errorMessage = "Failed to refresh hold";
      (eventRepository.refreshHold as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(
        eventService.refreshHold("event1", "seat1", "user1")
      ).rejects.toThrow(errorMessage);
    });
  });
});
