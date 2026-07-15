import noteController from "./note.controller";
import authGuard from "../../middleware/authGuard";
import express from "express";
import { handleError } from "../../middleware/errorHandler";
const router = express.Router();

router
  .route("/")
  .post(authGuard.isAuthenticated, handleError(noteController.createNote))
  .get(authGuard.isAuthenticated, handleError(noteController.getNotes));
router
  .route("/:id")
  .get(authGuard.isAuthenticated, handleError(noteController.getSingleNote))
  .patch(authGuard.isAuthenticated, handleError(noteController.updateNote))
  .delete(authGuard.isAuthenticated,handleError(noteController.deleteNote))
  
router.route("/:id/pin").patch(authGuard.isAuthenticated, handleError(noteController.togglePin));
router.route("/:id/archive").patch(authGuard.isAuthenticated, handleError(noteController.toggleArchive))
  export default router;