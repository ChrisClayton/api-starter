require('dotenv').config()
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import database from "./utils/database";
import logger from "./utils/logger";
import { CORS_ORIGIN } from "./constants";
import helmet from "helmet";

import userRoute from "./modules/user/user.route";
import authRoute from "./modules/auth/auth.route";

import deserializeUser from "./utils/deserializeUser";

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());
app.use(deserializeUser);

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

const server = app.listen(PORT, async () => {
  await database.connect();
  logger.info(`Server listening at htp://localhost:${PORT}`);
});

const signals = ["SIGTERM", "SIGINT"];

function gracefulShutdown(signal: string) {
  process.on(signal, async () => {
    logger.info("Goodbye, got signal", signal);
    server.close();

    // disconnect from the db
    await database.disconnect();

    logger.info("My work here is done");

    process.exit(0);
  });
}

for (let i = 0; i < signals.length; i++) {
  gracefulShutdown(signals[i]);
}
