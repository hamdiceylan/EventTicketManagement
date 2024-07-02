export enum ValidationMessages {
    TotalSeatsInvalid = 'Total seats must be between 10 and 1,000.',
    InvalidUserIdFormat = 'Invalid userId format. Must be a valid UUID.',
    SeatNotAvailableOrHeld = 'Seat not available or already held',
    CannotReserveSeat = 'Cannot reserve seat: not held by user',
    CannotRefreshHold = 'Cannot refresh hold: not held by user',
    TransactionFailed = 'Transaction failed',
}

export enum SeatStatus {
    Available = 'available',
    Held = 'held',
    Reserved = 'reserved',
}

export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500,
  }
  
