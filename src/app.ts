import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/database";
import authRoute from "./modules/auth/auth.routes";
import incomeRoute from "./modules/income/income.routes";
import expenseRoute from "./modules/expense/expense.routes"
import noteRoute from "./modules/note/note.routes"
import remainderRoute from "./modules/remainder/reminder.routes"
import categoryRoute from "./modules/category/category.routes"
import dashboardRoute from "./modules/dashboard/dashboard.routes"
import reportRoute from "./modules/report/report.routes"
import { globalErrorHandler } from "./middleware/errorHandler";
import cors from 'cors'
const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

connectDb();

app.use("/api/auth", authRoute);
app.use("/api/income", incomeRoute);
app.use("/api/expense",expenseRoute);
app.use("/api/note",noteRoute);
app.use("/api/reminder",remainderRoute);
app.use("/api/category",categoryRoute);
app.use("/api/dashboard",dashboardRoute);
app.use("/api/report",reportRoute);

// Registered last so it catches errors forwarded from every route above
// (see src/middleware/errorHandler.ts). The original app.ts had no
// equivalent global handler — errors from `handleError` just hung or
// crashed the request; this fixes that.
app.use(globalErrorHandler);

export default app;
