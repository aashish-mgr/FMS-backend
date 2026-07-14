import authController from "./auth.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";

const router = express.Router();

router.route("/login").post(handleError(authController.login));

export default router;
