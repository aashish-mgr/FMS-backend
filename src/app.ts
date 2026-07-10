import express from 'express';
import dotenv from 'dotenv'
import { connectDb } from './config/dbConfig';
import {adminSeeder} from './seeder/adminSeeder';
import {roleSeeder} from './seeder/roleSeeder';


const app = express();
dotenv.config();
app.use(express.json());
connectDb();
adminSeeder();
roleSeeder();

export default app;