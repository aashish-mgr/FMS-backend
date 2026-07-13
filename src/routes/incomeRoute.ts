import incomeController from "../controllers/incomeController";
import {handleError}  from "../middleware/errorHandler";
import express from 'express'

const router = express.Router();

router.route("/create").post(handleError(incomeController.createIncome as any))

export default router;