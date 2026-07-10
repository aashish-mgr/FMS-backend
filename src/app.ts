import express from 'express';
import dotenv from 'dotenv'
import { connectDb } from './config/dbConfig';
import {adminSeeder} from './seeder/adminSeeder';


const app = express();
dotenv.config();
app.use(express.json());
connectDb();
adminSeeder();

export default app;