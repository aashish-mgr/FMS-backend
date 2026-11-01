import noteController from "./note.controller";
import authGuard from "../../middleware/authGuard";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../../config/permissions";
import express from "express";
import { handleError } from "../../middleware/errorHandler";
const router = express.Router();

router
  .route("/")
  .post(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.NOTE_CREATE),
    handleError(noteController.createNote),
  )
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.NOTE_READ),
    handleError(noteController.getNotes),
  );
router
  .route("/:id")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.NOTE_READ),
    handleError(noteController.getSingleNote),
  )
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.NOTE_UPDATE),
    handleError(noteController.updateNote),
  )
  .delete(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.NOTE_DELETE),
    handleError(noteController.deleteNote),
  )

router
  .route("/:id/pin")
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.NOTE_UPDATE),
    handleError(noteController.togglePin),
  );
router
  .route("/:id/archive")
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.NOTE_UPDATE),
    handleError(noteController.toggleArchive),
  )
  export default router;