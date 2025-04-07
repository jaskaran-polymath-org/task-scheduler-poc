import { Queue } from "bullmq";
import { EventEmitter } from "events";

const REDIS_URL = "******"; // Add Redis url here
const queueName = "task-scheduler";

export const TaskQueue = (() => {
  let queue: Queue | null = null;
  let isReconnecting = false;
  const event = new EventEmitter();

  const init = async () => {
    if (queue) return queue;

    queue = new Queue(queueName, {
      connection: {
        url: REDIS_URL,
      },
    });

    const client = await queue.client;

    client.on("connect", () => {
      console.info("Connecting to Redis...");
    });

    client.on("reconnecting", () => {
      isReconnecting = true;
      console.info("Attempting to reconnect to Redis...");
    });

    client.on("ready", () => {
      if (isReconnecting) {
        console.info("Redis client reconnected successfully.");
        event.emit("reconnected");
        isReconnecting = false;
      } else {
        console.info("Redis client is ready and connected.");
      }
    });

    client.on("error", (err: any) => {
      console.error("Redis error:", err);
    });

    client.on("end", () => {
      console.info("Redis connection closed successfully.");
    });

    return queue;
  };

  const getConnection = () => ({ url: REDIS_URL });

  return {
    init,
    getQueue: () => queue,
    onReconnected: (fn: () => void) => event.on("reconnected", fn),
    getConnection
  };
})();
