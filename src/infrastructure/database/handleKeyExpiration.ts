import eventRepository from '../../domains/events/repositories/eventRepository';

export const handleKeyExpiration = async (channel: string, message: string) => {
    console.log(`Key expiration event received: Channel: ${channel}, Message: ${message}`);
    if (channel === '__keyevent@0__:expired' && message.startsWith('hold:')) {
        const parts = message.split(':');
        const eventId = parts[1];
        const seatId = parts[2];
        try {
            const seatStatus = await eventRepository.getSeatStatus(eventId, seatId);
            if (seatStatus.status === 'held') {
                await eventRepository.updateSeatStatus(eventId, seatId, 'available', null);
                console.log(`Seat ${seatId} returned to available for event ${eventId}`);
            }
        } catch (error) {
            console.error(`Error updating seat status: ${(error as Error).message}`);
        }
    }
};
