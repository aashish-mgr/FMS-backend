import remainderController from "./remainder.controller";
import authGuard from "../../middleware/authGuard";
import express from "express";
import { handleError } from "../../middleware/errorHandler";
import { withEntityType } from "../../middleware/upload.middleware";
import attachmentRoutes from "../attachment/attachment.routes"
const router = express.Router();

router
  .route("/")
  .post(authGuard.isAuthenticated, handleError(remainderController.createRemainder))
  .get(authGuard.isAuthenticated, handleError(remainderController.getRemainders));
router
  .route("/:id")
  .get(authGuard.isAuthenticated, handleError(remainderController.getSingleRemainder))
  .patch(authGuard.isAuthenticated, handleError(remainderController.updateRemainder))
  .delete(authGuard.isAuthenticated,handleError(remainderController.deleteRemainder))
  
router.route("/:id/complete").patch(authGuard.isAuthenticated,handleError(remainderController.markCompleteHandler))


  router.use('/:entityId/attachments', withEntityType('reminder'), attachmentRoutes);
  export default router;