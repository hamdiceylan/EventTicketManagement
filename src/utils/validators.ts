import { validate as validateUUID } from 'uuid';
import { SeatStatus } from './enums';

export const isTotalSeatsValid = (totalSeats: number): boolean => {
    return totalSeats >= 10 && totalSeats <= 1000;
};

export const isUserIdValid = (userId: string): boolean => {
    return validateUUID(userId);
};

export const isSeatAvailable = (seatStatus: string | undefined): boolean => {
    return seatStatus === SeatStatus.Available;
};

export const isSeatHeldByUser = (seatStatus: string | undefined, userId: string, expectedUserId: string | null): boolean => {
    return seatStatus === SeatStatus.Held && userId === expectedUserId;
};

export const isSeatHeld = (seatStatus: string | undefined): boolean => {
    return seatStatus === SeatStatus.Held;
};

export const isTransactionSuccessful = (results: any): boolean => {
    return results !== null;
};
