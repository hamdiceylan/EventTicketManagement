# Event Reservation System

## Description

This is an event reservation system built with Node.js, Express, TypeScript, and Redis. The application allows users to create events, hold seats, reserve seats, and refresh seat holds.

## Project Structure

- `src/`: Contains the source code of the application
  - `domains/`: Contains domain-specific logic and structures
    - `events/`: Contains logic for event management
  - `infrastructure/`: Contains infrastructure-related code like database and server setup
  - `interfaces/`: Contains interface-related code like routes and middlewares
- `docker-compose.yml`: Docker Compose configuration
- `Dockerfile`: Docker configuration
- `Dockerfile.test`: Docker configuration file to run unit and end to end tests
- `.gitignore`: Specifies files and directories to be ignored by Git
- `package.json`: Project metadata and dependencies
- `tsconfig.json`: TypeScript configuration
- `jest.config.json`: Jest test runner configuration
- `openapi.yml`: API specification file
- `DesignDocument.md`: Design document file
- `README.md`: Project documentation

## Getting Started

### Prerequisites

- Node.js
- Docker
- Docker Compose

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/event-reservation-system.git
   cd event-reservation-system


## Running Application 
To run the application, use the following commands:

   ```bash
   docker-compose up --build app
   ```


## Running Tests
To run the tests, use the following commands:

   ```bash
   docker-compose up --build
   ```


## Swagger UI 
You can test api via swagger after running with above command at below address

   ```bash
   http://localhost:3000/api-docs/#/
   ```

![Screenshot 2024-07-02 at 09 37 48](https://github.com/hamdiceylan/EventTicketManagement/assets/3088148/00283e39-d4ee-4e6d-82c7-d89818494b09)



# Event Reservation API

This project provides a RESTful API for managing event seat reservations. It includes functionality for creating events, listing available seats, holding seats, reserving seats, and refreshing holds.

## Base URL
```
http://localhost:3000/api/v1
```

## Endpoints

### Create an Event
- **URL:** `/events`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "totalSeats": number
  }
  ```
- **Response:**
  - **Success:** `201 Created`
    ```json
    {
      "id": string,
      "totalSeats": number
    }
    ```
  - **Error:** `400 Bad Request` or `500 Internal Server Error`
    ```json
    {
      "error": string
    }
    ```

### List Available Seats
- **URL:** `/events/:eventId/available-seats`
- **Method:** `GET`
- **Response:**
  - **Success:** `200 OK`
    ```json
    [
      "seatId1",
      "seatId2",
      ...
    ]
    ```
  - **Error:** `500 Internal Server Error`
    ```json
    {
      "error": string
    }
    ```

### Hold a Seat
- **URL:** `/events/:eventId/seats/:seatId/hold`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "userId": string
  }
  ```
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "status": "success",
      "seatId": string,
      "userId": string
    }
    ```
  - **Error:** `400 Bad Request`
    ```json
    {
      "error": string
    }
    ```

### Reserve a Seat
- **URL:** `/events/:eventId/seats/:seatId/reserve`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "userId": string
  }
  ```
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "status": "success",
      "seatId": string,
      "userId": string
    }
    ```
  - **Error:** `400 Bad Request`
    ```json
    {
      "error": string
    }
    ```

### Refresh a Hold
- **URL:** `/events/:eventId/seats/:seatId/refresh`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "userId": string
  }
  ```
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "status": "success",
      "seatId": string,
      "userId": string
    }
    ```
  - **Error:** `400 Bad Request`
    ```json
    {
      "error": string
    }
    ```

## Error Messages

### Validation Messages
- **TotalSeatsInvalid:** `"Total seats must be between 10 and 1000."`
- **InvalidUserIdFormat:** `"Invalid userId format. Must be a valid UUID."`
- **SeatNotAvailableOrHeld:** `"Seat not available or already held."`
- **CannotReserveSeat:** `"Cannot reserve seat: not held by user."`
- **CannotRefreshHold:** `"Cannot refresh hold: not held by user."`
- **TransactionFailed:** `"Transaction failed"`

### HTTP Status Codes
- **OK:** `200`
- **CREATED:** `201`
- **BAD_REQUEST:** `400`
- **INTERNAL_SERVER_ERROR:** `500`

