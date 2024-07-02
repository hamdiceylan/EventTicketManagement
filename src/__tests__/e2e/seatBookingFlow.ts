import request from "supertest";
import { Server } from "http";
import app from "../../app";

let server: Server;
let port: number;

beforeAll((done) => {
  server = app.listen(0, () => {
    port = (server.address() as any).port;
    console.log(`Test server running on port ${port}`);
    done();
  });
});

afterAll((done) => {
  server.close(() => {
    console.log("Test server stopped");
    done();
  });

  setTimeout(() => {
    console.log("Checking for open handles...");
    done();
  }, 1000).unref();
});

describe("Event API End-to-End Tests", () => {
  let eventId: string;
  const userId = "37e40924-5cc1-4782-9123-1a5f73ce829d";
  const anotherUserId = "7e55d960-5cba-4711-af56-c65b7096f94d";

  it("should create an event", async () => {
    const response = await request(app)
      .post("/api/v1/events")
      .send({ totalSeats: 100 })
      .set("Host", `127.0.0.1:${port}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("totalSeats", 100);

    eventId = response.body.id;
  });

  it("should list available seats", async () => {
    const response = await request(app)
      .get(`/api/v1/events/${eventId}/available-seats`)
      .set("Host", `127.0.0.1:${port}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.any(Array));
  });

  it("should hold a seat", async () => {
    const seatId = "seat1";
    const response = await request(app)
      .post(`/api/v1/events/${eventId}/seats/${seatId}/hold`)
      .send({ userId })
      .set("Host", `127.0.0.1:${port}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      seatId,
      userId,
    });

    const availableSeatsResponse = await request(app)
      .get(`/api/v1/events/${eventId}/available-seats`)
      .set("Host", `127.0.0.1:${port}`);

    expect(availableSeatsResponse.body).not.toContain(seatId);
  });

  it("should reserve a held seat", async () => {
    const seatId = "seat1";
    const response = await request(app)
      .post(`/api/v1/events/${eventId}/seats/${seatId}/reserve`)
      .send({ userId })
      .set("Host", `127.0.0.1:${port}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      seatId,
      userId,
    });
  });

  it("should refresh a hold", async () => {
    const seatId = "seat2";
    await request(app)
      .post(`/api/v1/events/${eventId}/seats/${seatId}/hold`)
      .send({ userId })
      .set("Host", `127.0.0.1:${port}`);

    const response = await request(app)
      .post(`/api/v1/events/${eventId}/seats/${seatId}/refresh`)
      .send({ userId })
      .set("Host", `127.0.0.1:${port}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      seatId,
      userId,
    });

    // Wait for 30 seconds and check if the seat is still held
    await new Promise((resolve) => setTimeout(resolve, 30000));

    const availableSeatsResponse = await request(app)
      .get(`/api/v1/events/${eventId}/available-seats`)
      .set("Host", `127.0.0.1:${port}`);

    expect(availableSeatsResponse.body).not.toContain(seatId);

    // Wait for another 40 seconds (total 70 seconds) and check if the seat is available again
    await new Promise((resolve) => setTimeout(resolve, 40000));

    const availableSeatsResponseAfterExpire = await request(app)
      .get(`/api/v1/events/${eventId}/available-seats`)
      .set("Host", `127.0.0.1:${port}`);

    expect(availableSeatsResponseAfterExpire.body).toContain(seatId);
  });

  it("should fail to hold a seat with an invalid userId", async () => {
    const seatId = "seat3";
    const response = await request(app)
      .post(`/api/v1/events/${eventId}/seats/${seatId}/hold`)
      .send({ userId: "invalid-uuid" })
      .set("Host", `127.0.0.1:${port}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid userId format. Must be a valid UUID.",
    });
  });

  it("should release a held seat after 61 seconds", async () => {
    const seatId = "seat4";
    await request(app)
      .post(`/api/v1/events/${eventId}/seats/${seatId}/hold`)
      .send({ userId })
      .set("Host", `127.0.0.1:${port}`);

    // Verify the seat is not available immediately after hold
    let availableSeatsResponse = await request(app)
      .get(`/api/v1/events/${eventId}/available-seats`)
      .set("Host", `127.0.0.1:${port}`);

    expect(availableSeatsResponse.body).not.toContain(seatId);

    // Wait for 61 seconds to allow the hold to expire
    await new Promise((resolve) => setTimeout(resolve, 61000));

    // Verify the seat is available again after the hold expires
    availableSeatsResponse = await request(app)
      .get(`/api/v1/events/${eventId}/available-seats`)
      .set("Host", `127.0.0.1:${port}`);

    expect(availableSeatsResponse.body).toContain(seatId);
  });

  it("should fail to reserve a seat if seat is held by a different user id", async () => {
    const seatId = "seat5";
    // Hold the seat with the original userId
    await request(app)
      .post(`/api/v1/events/${eventId}/seats/${seatId}/hold`)
      .send({ userId })
      .set("Host", `127.0.0.1:${port}`);

    // Attempt to reserve the seat with a different userId
    const response = await request(app)
      .post(`/api/v1/events/${eventId}/seats/${seatId}/reserve`)
      .send({ userId: anotherUserId })
      .set("Host", `127.0.0.1:${port}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Cannot reserve seat: not held by user",
    });
  });
});
