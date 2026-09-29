import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import capsuleRoutes from "./routes/capsule.routes.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.isProd ? "combined" : "dev"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use("/api", limiter);

app.get("/api/health", (_req, res) => res.json({ success: true, message: "Time-Capsule API running", timestamp: new Date().toISOString() }));
app.use("/api/auth", authRoutes);
app.use("/api/capsules", capsuleRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use(errorHandler);

app.listen(env.PORT, () => console.log(`[backend] listening on http://localhost:${env.PORT}`));
process.on("SIGTERM", async () => { await prisma.$disconnect(); process.exit(0); });
