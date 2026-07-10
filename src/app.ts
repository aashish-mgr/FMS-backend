import express from 'express';
import dotenv from 'dotenv'
import { connectDb } from './config/dbConfig';
const app = express();
dotenv.config();
app.use(express.json());
connectDb();

export default app;