import authGuard from "../../middleware/authGuard";
import { handleError } from "../../middleware/errorHandler";
import auditController from "./audit.controller";
import express from 'express'
const router = express.Router();

router.route("/").get(authGuard.isAuthenticated,handleError(auditController.listAudits));

export default router;