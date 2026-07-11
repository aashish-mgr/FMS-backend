import express from 'express';
import dotenv from 'dotenv'
import { connectDb } from './config/dbConfig';
import {adminSeeder} from './seeder/adminSeeder';
import {roleSeeder} from './seeder/roleSeeder';
import authRoute from './routes/userRoute'


const app = express();
dotenv.config();
app.use(express.json());
connectDb();
adminSeeder();
roleSeeder();


app.use("/api/auth",authRoute);

export default app;