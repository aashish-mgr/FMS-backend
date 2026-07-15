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
  

  export default router;