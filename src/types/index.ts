export interface SeatInfo {
    status: string;
    userId: string | null;
  }
  
  export interface EventOperationResult {
    status: string;
    seatId: string;
    userId: string;
  }
  
  export interface EventCreationResult {
    id: string;
    totalSeats: number;
  }

