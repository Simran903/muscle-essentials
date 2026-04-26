import "dotenv/config";
import { getEnv } from "./config/env.js";

getEnv();

const { createApp } = await import("./app.js");

const app = createApp();
const env = getEnv();
const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function shutdown(signal: string): void {
  console.info(`${signal} received, shutting down`);
  server.close(async () => {
    try {
      const { prisma } = await import("database");
      await prisma.$disconnect();
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
