import authController from "./auth.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";
import authGuard from "../../middleware/authGuard";

const router = express.Router();

router.route("/login").post(handleError(authController.login));
router.route("/register").post(handleError(authController.register));
router.route("/refresh").post(handleError(authController.refresh));
router.route("/invitations/:token").get(handleError(authController.getInvitation));
router.route("/accept-invitation").post(handleError(authController.acceptInvitation));
router.route("/logout").post(authGuard.isAuthenticated,handleError(authController.logout));

export default router;
