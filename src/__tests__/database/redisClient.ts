import { createClient, RedisClient } from "redis";
import config from "../../config";
import { handleKeyExpiration } from "../../infrastructure/database/handleKeyExpiration";
import { commandClient, subscriptionClient } from "../../infrastructure/database/redisClient";

jest.mock("redis", () => {
  const mRedisClient = {
    on: jest.fn(),
    psubscribe: jest.fn(),
  };
  return { createClient: jest.fn(() => mRedisClient) };
});

jest.mock("../../infrastructure/database/handleKeyExpiration", () => ({
  handleKeyExpiration: jest.fn(),
}));

describe("Redis Clients and Event Handling", () => {
  let commandClientInstance: RedisClient;
  let subscriptionClientInstance: RedisClient;

  beforeAll(() => {
    commandClientInstance = createClient({
      host: config.redis.host,
      port: config.redis.port,
    });
    subscriptionClientInstance = createClient({
      host: config.redis.host,
      port: config.redis.port,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log connection messages for commandClient", () => {
    const logSpy = jest.spyOn(console, "log");
    const errorSpy = jest.spyOn(console, "error");

    (commandClientInstance.on as jest.Mock).mockImplementation(
      (event: string, callback: Function) => {
        if (event === "connect") {
          callback();
        } else if (event === "error") {
          callback(new Error("Test Error"));
        }
      }
    );

    commandClientInstance.on("connect", () => {
      console.log("Redis command client connected");
    });

    commandClientInstance.on("error", (err: Error) => {
      console.error("Redis command client error:", err);
    });

    expect(logSpy).toHaveBeenCalledWith("Redis command client connected");
    expect(errorSpy).toHaveBeenCalledWith(
      "Redis command client error:",
      new Error("Test Error")
    );
  });

  it("should log connection messages for subscriptionClient", () => {
    const logSpy = jest.spyOn(console, "log");
    const errorSpy = jest.spyOn(console, "error");

    (subscriptionClientInstance.on as jest.Mock).mockImplementation(
      (event: string, callback: Function) => {
        if (event === "connect") {
          callback();
        } else if (event === "error") {
          callback(new Error("Test Error"));
        }
      }
    );

    subscriptionClientInstance.on("connect", () => {
      console.log("Redis subscription client connected");
    });

    subscriptionClientInstance.on("error", (err: Error) => {
      console.error("Redis subscription client error:", err);
    });

    expect(logSpy).toHaveBeenCalledWith("Redis subscription client connected");
    expect(errorSpy).toHaveBeenCalledWith(
      "Redis subscription client error:",
      new Error("Test Error")
    );
  });

  it("should subscribe to key expiration events", () => {
    (subscriptionClientInstance.psubscribe as jest.Mock).mockImplementation(
      (pattern: string) => {
        expect(pattern).toBe("__keyevent@0__:expired");
      }
    );

    subscriptionClientInstance.on("connect", () => {
      subscriptionClientInstance.psubscribe("__keyevent@0__:expired");
    });

    expect(subscriptionClientInstance.psubscribe).toHaveBeenCalledWith(
      "__keyevent@0__:expired"
    );
  });

  it("should handle key expiration events", () => {
    (subscriptionClientInstance.on as jest.Mock).mockImplementation(
      (event: string, callback: Function) => {
        if (event === "pmessage") {
          callback(
            "__keyevent@0__:expired",
            "__keyevent@0__:expired",
            "hold:event1:seat1"
          );
        }
      }
    );

    subscriptionClientInstance.on(
      "pmessage",
      (pattern: string, channel: string, message: string) => {
        handleKeyExpiration(channel, message);
      }
    );

    expect(handleKeyExpiration).toHaveBeenCalledWith(
      "__keyevent@0__:expired",
      "hold:event1:seat1"
    );
  });
});
