Sure, here's the markdown version of the Overall Design Document:

```markdown
# Event Reservation System - Overall Design Document

## 1. Introduction

The Event Reservation System is a backend service designed to manage event seat reservations. The system allows users to create events, hold seats for a limited time, and reserve seats. This document outlines the overall design of the system, including the architecture, components, and design decisions.

## 2. Architecture

### 2.1. High-Level Architecture

The system is built using a microservices architecture, leveraging Node.js for the backend, Redis for in-memory data storage, and Docker for containerization. The service exposes RESTful APIs for interaction with the system.

### 2.2. Components

- **Node.js**: The main runtime environment for the backend service.
- **Express.js**: The web framework used to build the RESTful APIs.
- **Redis**: Used for managing seat availability and state transitions efficiently.
- **Docker**: Used for containerizing the application to ensure consistency across different environments.

### 2.3. Data Flow

1. **Create Event**: The client sends a request to create an event with a specified number of seats.
2. **List Available Seats**: The client requests a list of available seats for a given event.
3. **Hold Seat**: The client holds a seat for a user for a limited time.
4. **Reserve Seat**: The client reserves a seat that is currently held by the user.
5. **Refresh Hold**: The client refreshes the hold on a seat to extend the hold time.

## 3. API Design

### 3.1. Endpoints

- **POST /api/v1/events**: Create an event.
- **GET /api/v1/events/{eventId}/available-seats**: List available seats for an event.
- **POST /api/v1/events/{eventId}/seats/{seatId}/hold**: Hold a seat.
- **POST /api/v1/events/{eventId}/seats/{seatId}/reserve**: Reserve a held seat.
- **POST /api/v1/events/{eventId}/seats/{seatId}/refresh**: Refresh a hold on a seat.

### 3.2. Request and Response Examples

#### Create Event

**Request:**

```json
{
  "totalSeats": 100
}
```

**Response:**

```json
{
  "id": "event123",
  "totalSeats": 100
}
```

#### List Available Seats

**Response:**

```json
[
  "seat1",
  "seat2",
  "seat3"
]
```

## 4. Components and Modules

### 4.1. Controllers

- **EventController**: Handles incoming API requests, interacts with the service layer, and returns responses.

### 4.2. Services

- **EventService**: Contains the business logic for creating events, listing available seats, holding seats, reserving seats, and refreshing holds.

### 4.3. Repositories

- **EventRepository**: Manages data access and interactions with Redis.

### 4.4. Utils

- **Validators**: Contains functions for validating input data.
- **Enums**: Defines constants and enumerations used throughout the application.

## 5. Data Management

### 5.1. Redis

- **Sets**: Used to manage available seats.
- **Hashes**: Used to store seat status and user information.
- **Keys with TTL**: Used for holding seats with a time-to-live (TTL) to automatically release seats after a specified duration.

## 6. Error Handling

The system uses consistent error handling mechanisms to ensure meaningful error messages are returned to the client. Common errors include validation errors, resource not found, and internal server errors.

## 7. Testing

The system is thoroughly tested using unit tests and end-to-end tests to ensure reliability and correctness. Jest is used as the testing framework.

## 8. Deployment

The application is containerized using Docker and can be deployed using Docker Compose. The following services are defined in the `docker-compose.yml` file:

- **app**: The Node.js application.
- **redis**: The Redis in-memory data store.

## 9. Conclusion

This document provides an overview of the Event Reservation System, detailing the architecture, components, API design, data management, and testing strategies. This design ensures scalability, reliability, and maintainability of the system.
```