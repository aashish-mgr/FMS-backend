import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/database";
import authRoute from "./modules/auth/auth.routes";
import incomeRoute from "./modules/income/income.routes";
import expenseRoute from "./modules/expense/expense.routes"
import noteRoute from "./modules/note/note.routes"
import { globalErrorHandler } from "./middleware/errorHandler";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());

connectDb();

app.use("/api/auth", authRoute);
app.use("/api/income", incomeRoute);
app.use("/api/expense",expenseRoute);
app.use("/api/note",noteRoute);

// Registered last so it catches errors forwarded from every route above
// (see src/middleware/errorHandler.ts). The original app.ts had no
// equivalent global handler — errors from `handleError` just hung or
// crashed the request; this fixes that.
app.use(globalErrorHandler);

export default app;
