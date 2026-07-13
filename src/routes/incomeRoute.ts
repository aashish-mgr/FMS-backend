import incomeController from "../controllers/incomeController";
import {handleError}  from "../middleware/errorHandler";
import express from 'express'

const router = express.Router();

router.route("/create").post(handleError(incomeController.createIncome));
router.route("/getALl").get(handleError(incomeController.getIncome));
router.route("/getSingle/:id").get(handleError(incomeController.getSingleIncome));
router.route("/update/:id").patch(handleError(incomeController.updateIncome));

export default router;