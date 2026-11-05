import authController from "./auth.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";
import authGuard from "../../middleware/authGuard";
import {
  authLimiter,
  passwordResetLimiter,
  refreshLimiter,
  sensitiveActionLimiter,
  verificationLimiter,
} from "../../middleware/rateLimit";

const router = express.Router();

router.route("/login").post(authLimiter, handleError(authController.login));
router.route("/register").post(authLimiter, handleError(authController.register));
router.route("/refresh").post(refreshLimiter, handleError(authController.refresh));
router
  .route("/forgot-password")
  .post(passwordResetLimiter, handleError(authController.forgotPassword));
router
  .route("/reset-password")
  .post(passwordResetLimiter, handleError(authController.resetPassword));
router
  .route("/verify-email")
  .post(verificationLimiter, handleError(authController.verifyEmail));
router
  .route("/invitations/:token")
  .get(verificationLimiter, handleError(authController.getInvitation));
router
  .route("/accept-invitation")
  .post(authLimiter, handleError(authController.acceptInvitation));
router.route("/logout").post(authGuard.isAuthenticated,handleError(authController.logout));
router
  .route("/logout-all")
  .post(authGuard.isAuthenticated, sensitiveActionLimiter, handleError(authController.logoutAll));
router
  .route("/change-password")
  .post(authGuard.isAuthenticated, sensitiveActionLimiter, handleError(authController.changePassword));
router
  .route("/resend-verification")
  .post(authGuard.isAuthenticated, sensitiveActionLimiter, handleError(authController.resendVerification));

export default router;
