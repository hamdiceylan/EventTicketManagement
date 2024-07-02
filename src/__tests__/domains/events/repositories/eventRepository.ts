import { commandClient } from "../../../../infrastructure/database/redisClient";

import {
  saddAsync,
  sremAsync,
  smembersAsync,
  hsetAsync,
  hgetAsync,
  watchAsync,
} from "../../../../infrastructure/database/utils";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import eventRepository from "../../../../domains/events/repositories/eventRepository";
import { SeatStatus, ValidationMessages } from "../../../../utils/enums";
import {
  isTotalSeatsValid,
  isUserIdValid,
  isSeatAvailable,
  isSeatHeldByUser,
  isTransactionSuccessful,
} from "../../../../utils/validators";
import { SeatInfo, EventOperationResult } from "../../../../types";

jest.mock("../../../../infrastructure/database/utils", () => ({
  saddAsync: jest.fn(),
  sremAsync: jest.fn(),
  smembersAsync: jest.fn(),
  setexAsync: jest.fn(),
  hsetAsync: jest.fn(),
  hgetAsync: jest.fn(),
  watchAsync: jest.fn(),
  unwatchAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../../../infrastructure/database/redisClient", () => ({
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

jest.mock("uuid");
jest.mock("util");
jest.mock("../../../../utils/validators");

describe("EventRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should create an event with valid totalSeats", async () => {
      (isTotalSeatsValid as jest.Mock).mockReturnValue(true);
      (uuidv4 as jest.Mock).mockReturnValue("event1");

      const mockSaddAsync = (saddAsync as jest.Mock).mockResolvedValue(1);
      const mockHsetAsync = (hsetAsync as jest.Mock).mockResolvedValue(1);

      const result = await eventRepository.createEvent(100);

      expect(result).toEqual({ id: "event1", totalSeats: 100 });
      expect(mockSaddAsync).toHaveBeenCalledTimes(100);
      expect(mockHsetAsync).toHaveBeenCalledTimes(100);
    });

    it("should throw an error if totalSeats is invalid", async () => {
      (isTotalSeatsValid as jest.Mock).mockReturnValue(false);

      await expect(eventRepository.createEvent(5)).rejects.toThrow(
        ValidationMessages.TotalSeatsInvalid
      );
    });
  });

  describe("listAvailableSeats", () => {
    it("should return a list of available seats", async () => {
      const mockSeats = ["seat1", "seat2"];
      (smembersAsync as jest.Mock).mockResolvedValue(mockSeats);

      const result = await eventRepository.listAvailableSeats("event1");

      expect(result).toEqual(mockSeats);
      expect(smembersAsync).toHaveBeenCalledWith(
        "event:event1:available_seats"
      );
    });
  });

  describe("updateSeatStatus", () => {
    it("should update the seat status to available", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Available,
        userId: null,
      };
      (hsetAsync as jest.Mock).mockResolvedValue(1);
      (saddAsync as jest.Mock).mockResolvedValue(1);

      await eventRepository.updateSeatStatus(
        "event1",
        "seat1",
        SeatStatus.Available,
        null
      );

      expect(hsetAsync).toHaveBeenCalledWith(
        "event:event1",
        "seat1",
        JSON.stringify(mockSeatInfo)
      );
      expect(saddAsync).toHaveBeenCalledWith(
        "event:event1:available_seats",
        "seat1"
      );
    });

    it("should update the seat status to held", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Held,
        userId: "user1",
      };
      (hsetAsync as jest.Mock).mockResolvedValue(1);
      (sremAsync as jest.Mock).mockResolvedValue(1);

      await eventRepository.updateSeatStatus(
        "event1",
        "seat1",
        SeatStatus.Held,
        "user1"
      );

      expect(hsetAsync).toHaveBeenCalledWith(
        "event:event1",
        "seat1",
        JSON.stringify(mockSeatInfo)
      );
      expect(sremAsync).toHaveBeenCalledWith(
        "event:event1:available_seats",
        "seat1"
      );
    });
  });

  describe("holdSeat", () => {
    it("should hold a seat for a valid user", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Available,
        userId: null,
      };
      const mockResult: EventOperationResult = {
        status: "success",
        seatId: "seat1",
        userId: "user1",
      };
      (isUserIdValid as jest.Mock).mockReturnValue(true);
      (hgetAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSeatInfo));
      (isSeatAvailable as jest.Mock).mockReturnValue(true);
      (promisify as unknown as jest.Mock).mockImplementation((fn) => fn);

      const mockMulti = {
        hset: jest.fn().mockReturnThis(),
        srem: jest.fn().mockReturnThis(),
        setex: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([1]),
      };
      (commandClient.multi as jest.Mock).mockReturnValue(mockMulti);

      (isTransactionSuccessful as jest.Mock).mockReturnValue(true);

      const result = await eventRepository.holdSeat("event1", "seat1", "user1");

      expect(result).toEqual(mockResult);
      expect(hgetAsync).toHaveBeenCalledWith("event:event1", "seat1");
      expect(mockMulti.hset).toHaveBeenCalledWith(
        "event:event1",
        "seat1",
        JSON.stringify({ status: SeatStatus.Held, userId: "user1" })
      );
      expect(mockMulti.srem).toHaveBeenCalledWith(
        "event:event1:available_seats",
        "seat1"
      );
      expect(mockMulti.setex).toHaveBeenCalledWith(
        "hold:event1:seat1",
        60,
        SeatStatus.Held
      );
    });

    it("should throw an error if userId is invalid", async () => {
      (isUserIdValid as jest.Mock).mockReturnValue(false);

      await expect(
        eventRepository.holdSeat("event1", "seat1", "invalidUser")
      ).rejects.toThrow(ValidationMessages.InvalidUserIdFormat);
    });

    it("should throw an error if the seat is not available", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Held,
        userId: "user2",
      };
      (isUserIdValid as jest.Mock).mockReturnValue(true);
      (hgetAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSeatInfo));
      (isSeatAvailable as jest.Mock).mockReturnValue(false);

      await expect(
        eventRepository.holdSeat("event1", "seat1", "user1")
      ).rejects.toThrow(ValidationMessages.SeatNotAvailableOrHeld);
    });
  });

  describe("reserveSeat", () => {
    it("should reserve a seat for a valid user", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Held,
        userId: "user1",
      };
      const mockResult: EventOperationResult = {
        status: "success",
        seatId: "seat1",
        userId: "user1",
      };
      (isUserIdValid as jest.Mock).mockReturnValue(true);
      (hgetAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSeatInfo));
      (isSeatHeldByUser as jest.Mock).mockReturnValue(true);
      (promisify as unknown as jest.Mock).mockImplementation((fn) => fn);

      const mockMulti = {
        hset: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([1]),
      };
      (commandClient.multi as jest.Mock).mockReturnValue(mockMulti);

      (isTransactionSuccessful as jest.Mock).mockReturnValue(true);

      const result = await eventRepository.reserveSeat(
        "event1",
        "seat1",
        "user1"
      );

      expect(result).toEqual(mockResult);
      expect(hgetAsync).toHaveBeenCalledWith("event:event1", "seat1");
      expect(mockMulti.hset).toHaveBeenCalledWith(
        "event:event1",
        "seat1",
        JSON.stringify({ status: SeatStatus.Reserved, userId: "user1" })
      );
    });

    it("should throw an error if userId is invalid", async () => {
      (isUserIdValid as jest.Mock).mockReturnValue(false);

      await expect(
        eventRepository.reserveSeat("event1", "seat1", "invalidUser")
      ).rejects.toThrow(ValidationMessages.InvalidUserIdFormat);
    });

    it("should throw an error if the seat is not held by the user", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Held,
        userId: "user2",
      };
      (isUserIdValid as jest.Mock).mockReturnValue(true);
      (hgetAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSeatInfo));
      (isSeatHeldByUser as jest.Mock).mockReturnValue(false);

      await expect(
        eventRepository.reserveSeat("event1", "seat1", "user1")
      ).rejects.toThrow(ValidationMessages.CannotReserveSeat);
    });
  });

  describe("refreshHold", () => {
    it("should refresh hold for a valid user", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Held,
        userId: "user1",
      };
      const mockResult: EventOperationResult = {
        status: "success",
        seatId: "seat1",
        userId: "user1",
      };
      (isUserIdValid as jest.Mock).mockReturnValue(true);
      (hgetAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSeatInfo));
      (isSeatHeldByUser as jest.Mock).mockReturnValue(true);
      (promisify as unknown as jest.Mock).mockImplementation((fn) => fn);

      const mockMulti = {
        setex: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([1]),
      };
      (commandClient.multi as jest.Mock).mockReturnValue(mockMulti);

      (isTransactionSuccessful as jest.Mock).mockReturnValue(true);

      const result = await eventRepository.refreshHold(
        "event1",
        "seat1",
        "user1"
      );

      expect(result).toEqual(mockResult);
      expect(hgetAsync).toHaveBeenCalledWith("event:event1", "seat1");
      expect(mockMulti.setex).toHaveBeenCalledWith(
        "hold:event1:seat1",
        60,
        SeatStatus.Held
      );
    });

    it("should throw an error if userId is invalid", async () => {
      (isUserIdValid as jest.Mock).mockReturnValue(false);

      await expect(
        eventRepository.refreshHold("event1", "seat1", "invalidUser")
      ).rejects.toThrow(ValidationMessages.InvalidUserIdFormat);
    });

    it("should throw an error if the seat is not held by the user", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Held,
        userId: "user2",
      };
      (isUserIdValid as jest.Mock).mockReturnValue(true);
      (hgetAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSeatInfo));
      (isSeatHeldByUser as jest.Mock).mockReturnValue(false);

      await expect(
        eventRepository.refreshHold("event1", "seat1", "user1")
      ).rejects.toThrow(ValidationMessages.CannotRefreshHold);
    });
  });

  describe("getSeatStatus", () => {
    it("should return the seat status", async () => {
      const mockSeatInfo: SeatInfo = {
        status: SeatStatus.Held,
        userId: "user1",
      };
      (hgetAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSeatInfo));

      const result = await eventRepository.getSeatStatus("event1", "seat1");

      expect(result).toEqual(mockSeatInfo);
      expect(hgetAsync).toHaveBeenCalledWith("event:event1", "seat1");
    });

    it("should return an empty object if the seat status is not found", async () => {
      (hgetAsync as jest.Mock).mockResolvedValue(null);

      const result = await eventRepository.getSeatStatus("event1", "seat1");

      expect(result).toEqual({});
      expect(hgetAsync).toHaveBeenCalledWith("event:event1", "seat1");
    });
  });
});
