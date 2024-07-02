import { handleKeyExpiration } from '../../infrastructure/database/handleKeyExpiration';
import eventRepository from '../../domains/events/repositories/eventRepository';

jest.mock('../../domains/events/repositories/eventRepository', () => ({
    getSeatStatus: jest.fn(),
    updateSeatStatus: jest.fn(),
}));

describe('handleKeyExpiration', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update seat status to available when key expires and seat is held', async () => {
        (eventRepository.getSeatStatus as jest.Mock).mockResolvedValue({ status: 'held' });
        (eventRepository.updateSeatStatus as jest.Mock).mockResolvedValue(undefined);

        await handleKeyExpiration('__keyevent@0__:expired', 'hold:event1:seat1');

        expect(eventRepository.getSeatStatus).toHaveBeenCalledWith('event1', 'seat1');
        expect(eventRepository.updateSeatStatus).toHaveBeenCalledWith('event1', 'seat1', 'available', null);
        expect(consoleLogSpy).toHaveBeenCalledWith('Seat seat1 returned to available for event event1');
    });

    it('should log an error if updating seat status fails', async () => {
        (eventRepository.getSeatStatus as jest.Mock).mockResolvedValue({ status: 'held' });
        (eventRepository.updateSeatStatus as jest.Mock).mockRejectedValue(new Error('Test Error'));

        await handleKeyExpiration('__keyevent@0__:expired', 'hold:event1:seat1');

        expect(eventRepository.getSeatStatus).toHaveBeenCalledWith('event1', 'seat1');
        expect(eventRepository.updateSeatStatus).toHaveBeenCalledWith('event1', 'seat1', 'available', null);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating seat status: Test Error');
    });

    it('should not update seat status if the seat is not held', async () => {
        (eventRepository.getSeatStatus as jest.Mock).mockResolvedValue({ status: 'available' });

        await handleKeyExpiration('__keyevent@0__:expired', 'hold:event1:seat1');

        expect(eventRepository.getSeatStatus).toHaveBeenCalledWith('event1', 'seat1');
        expect(eventRepository.updateSeatStatus).not.toHaveBeenCalled();
    });

    it('should not process if channel is not __keyevent@0__:expired', async () => {
        await handleKeyExpiration('__keyevent@0__:set', 'hold:event1:seat1');

        expect(eventRepository.getSeatStatus).not.toHaveBeenCalled();
        expect(eventRepository.updateSeatStatus).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('Key expiration event received: Channel: __keyevent@0__:set, Message: hold:event1:seat1');
    });

    it('should not process if message does not start with hold:', async () => {
        await handleKeyExpiration('__keyevent@0__:expired', 'reserve:event1:seat1');

        expect(eventRepository.getSeatStatus).not.toHaveBeenCalled();
        expect(eventRepository.updateSeatStatus).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('Key expiration event received: Channel: __keyevent@0__:expired, Message: reserve:event1:seat1');
    });
});
