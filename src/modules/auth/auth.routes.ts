import authController from "./auth.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";
import authGuard from "../../middleware/authGuard";

const router = express.Router();

router.route("/login").post(handleError(authController.login));
router.route("/register").post(handleError(authController.register));
router.route("/refresh").post(handleError(authController.refresh));
router.route("/forgot-password").post(handleError(authController.forgotPassword));
router.route("/reset-password").post(handleError(authController.resetPassword));
router.route("/verify-email").post(handleError(authController.verifyEmail));
router.route("/invitations/:token").get(handleError(authController.getInvitation));
router.route("/accept-invitation").post(handleError(authController.acceptInvitation));
router.route("/logout").post(authGuard.isAuthenticated,handleError(authController.logout));
router
  .route("/change-password")
  .post(authGuard.isAuthenticated, handleError(authController.changePassword));
router
  .route("/resend-verification")
  .post(authGuard.isAuthenticated, handleError(authController.resendVerification));

export default router;
