import incomeController from "./income.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";

const router = express.Router();

router.route("/create").post(handleError(incomeController.createIncome));
// NOTE: fixed the "/getALl" typo from the original incomeRoute.ts -> "/getAll".
// Update any existing frontend calls if you were already using the old path.
router.route("/getAll").get(handleError(incomeController.getIncome));
router.route("/getSingle/:id").get(handleError(incomeController.getSingleIncome));
router.route("/update/:id").patch(handleError(incomeController.updateIncome));
router.route("/delete/:id").delete(handleError(incomeController.deleteIncome));

export default router;
