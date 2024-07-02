import { validate as validateUUID } from 'uuid';
import { SeatStatus } from '../../utils/enums';
import {
  isTotalSeatsValid,
  isUserIdValid,
  isSeatAvailable,
  isSeatHeldByUser,
  isSeatHeld,
  isTransactionSuccessful
} from '../../utils/validators';

jest.mock('uuid', () => ({
  validate: jest.fn()
}));

describe('validators', () => {
  describe('isTotalSeatsValid', () => {
    it('should return true for valid totalSeats', () => {
      expect(isTotalSeatsValid(10)).toBe(true);
      expect(isTotalSeatsValid(1000)).toBe(true);
      expect(isTotalSeatsValid(500)).toBe(true);
    });

    it('should return false for invalid totalSeats', () => {
      expect(isTotalSeatsValid(9)).toBe(false);
      expect(isTotalSeatsValid(1001)).toBe(false);
    });
  });

  describe('isUserIdValid', () => {
    it('should return true for valid UUID', () => {
      (validateUUID as jest.Mock).mockReturnValue(true);
      expect(isUserIdValid('valid-uuid')).toBe(true);
      expect(validateUUID).toHaveBeenCalledWith('valid-uuid');
    });

    it('should return false for invalid UUID', () => {
      (validateUUID as jest.Mock).mockReturnValue(false);
      expect(isUserIdValid('invalid-uuid')).toBe(false);
      expect(validateUUID).toHaveBeenCalledWith('invalid-uuid');
    });
  });

  describe('isSeatAvailable', () => {
    it('should return true if seat is available', () => {
      expect(isSeatAvailable(SeatStatus.Available)).toBe(true);
    });

    it('should return false if seat is not available', () => {
      expect(isSeatAvailable(SeatStatus.Held)).toBe(false);
      expect(isSeatAvailable(SeatStatus.Reserved)).toBe(false);
      expect(isSeatAvailable(undefined)).toBe(false);
    });
  });

  describe('isSeatHeldByUser', () => {
    it('should return true if seat is held by the user', () => {
      expect(isSeatHeldByUser(SeatStatus.Held, 'user1', 'user1')).toBe(true);
    });

    it('should return false if seat is not held by the user', () => {
      expect(isSeatHeldByUser(SeatStatus.Held, 'user1', 'user2')).toBe(false);
      expect(isSeatHeldByUser(SeatStatus.Reserved, 'user1', 'user1')).toBe(false);
      expect(isSeatHeldByUser(undefined, 'user1', 'user1')).toBe(false);
    });
  });

  describe('isSeatHeld', () => {
    it('should return true if seat is held', () => {
      expect(isSeatHeld(SeatStatus.Held)).toBe(true);
    });

    it('should return false if seat is not held', () => {
      expect(isSeatHeld(SeatStatus.Available)).toBe(false);
      expect(isSeatHeld(SeatStatus.Reserved)).toBe(false);
      expect(isSeatHeld(undefined)).toBe(false);
    });
  });

  describe('isTransactionSuccessful', () => {
    it('should return true if transaction is successful', () => {
      expect(isTransactionSuccessful(['some result'])).toBe(true);
    });

    it('should return false if transaction is not successful', () => {
      expect(isTransactionSuccessful(null)).toBe(false);
    });
  });
});
