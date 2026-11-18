import type { OpenAPIV3 } from "openapi-types";
import {
  jsonBody,
  multipartBody,
  noContent,
  permissionDescription,
  protectedErrors,
  schemaRef,
  success,
} from "../helpers";

function attachmentPaths(entityType: "income" | "expense" | "reminder"): OpenAPIV3.PathsObject {
  const base = `/api/${entityType}/{entityId}/attachments`;

  return {
    [base]: {
      get: {
        tags: ["Attachments"],
        summary: `List ${entityType} attachments`,
        operationId: `list${entityType[0]!.toUpperCase()}${entityType.slice(1)}Attachments`,
        description: permissionDescription(
          `Returns non-deleted attachments linked to an existing ${entityType} record in the active workspace.`,
          "attachment:read",
        ),
        parameters: [{ $ref: "#/components/parameters/EntityId" }],
        responses: {
          "200": success("attachments fetched successfully", {
            type: "array",
            items: schemaRef("Attachment"),
          }),
          ...protectedErrors,
        },
      },
      post: {
        tags: ["Attachments"],
        summary: `Upload ${entityType} attachments`,
        operationId: `upload${entityType[0]!.toUpperCase()}${entityType.slice(1)}Attachments`,
        description: permissionDescription(
          `Uploads one or more PDF or image files and links them to an existing ${entityType} record in the active workspace. Files are stored privately and downloaded through a signed URL.`,
          "attachment:create",
        ),
        parameters: [{ $ref: "#/components/parameters/EntityId" }],
        requestBody: multipartBody(
          "Multipart form data with a `files` field containing 1-10 PDF/JPG/JPEG/PNG files.",
        ),
        responses: {
          "201": success("uploaded attachment", {
            type: "array",
            items: schemaRef("Attachment"),
          }),
          ...protectedErrors,
        },
      },
    },

    [`${base}/{attachmentId}/download`]: {
      get: {
        tags: ["Attachments"],
        summary: `Download an ${entityType} attachment`,
        operationId: `download${entityType[0]!.toUpperCase()}${entityType.slice(1)}Attachment`,
        description: permissionDescription(
          `Redirects to a short-lived signed URL for a private ${entityType} attachment in the active workspace.`,
          "attachment:read",
        ),
        parameters: [
          { $ref: "#/components/parameters/EntityId" },
          { $ref: "#/components/parameters/AttachmentId" },
        ],
        responses: {
          "302": {
            description: "Redirects to a short-lived signed download URL.",
          },
          ...protectedErrors,
        },
      },
    },

    [`${base}/{attachmentId}`]: {
      delete: {
        tags: ["Attachments"],
        summary: `Delete an ${entityType} attachment`,
        operationId: `delete${entityType[0]!.toUpperCase()}${entityType.slice(1)}Attachment`,
        description: permissionDescription(
          "Deletes the stored file, then soft-deletes the attachment owned by the active workspace so it no longer appears in future reads.",
          "attachment:delete",
        ),
        parameters: [
          { $ref: "#/components/parameters/EntityId" },
          { $ref: "#/components/parameters/AttachmentId" },
        ],
        responses: {
          "204": noContent("Attachment deleted successfully."),
          ...protectedErrors,
        },
      },
    },
  };
}

export const notePaths: OpenAPIV3.PathsObject = {
  "/api/note": {
    post: {
      tags: ["Notes"],
      summary: "Create a note",
      operationId: "createNote",
      description: permissionDescription(
        "Creates a tenant-scoped note. `createdBy` is assigned from the authenticated user.",
        "note:create",
      ),
      requestBody: jsonBody(schemaRef("CreateNoteRequest")),
      responses: {
        "200": success("Note created successfully.", schemaRef("Note")),
        ...protectedErrors,
      },
    },
    get: {
      tags: ["Notes"],
      summary: "List notes",
      operationId: "listNotes",
      description: permissionDescription(
        "Returns all non-deleted notes for the active workspace.",
        "note:read",
      ),
      responses: {
        "200": success("Notes fetched successfully.", {
          type: "array",
          items: schemaRef("Note"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/note/{id}": {
    get: {
      tags: ["Notes"],
      summary: "Get a note by ID",
      operationId: "getNote",
      description: permissionDescription(
        "Returns a single non-deleted note from the active workspace.",
        "note:read",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("Note fetched successfully.", schemaRef("Note")),
        ...protectedErrors,
      },
    },
    patch: {
      tags: ["Notes"],
      summary: "Update a note",
      operationId: "updateNote",
      description: permissionDescription(
        "Partially updates a note. Ownership fields cannot be changed through this endpoint.",
        "note:update",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      requestBody: jsonBody(schemaRef("UpdateNoteRequest")),
      responses: {
        "200": success("Note updated successfully.", schemaRef("Note")),
        ...protectedErrors,
      },
    },
    delete: {
      tags: ["Notes"],
      summary: "Delete a note",
      operationId: "deleteNote",
      description: permissionDescription(
        "Soft-deletes a note by setting `deletedAt`. The deleted record is returned.",
        "note:delete",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("Note deleted successfully.", schemaRef("Note")),
        ...protectedErrors,
      },
    },
  },

  "/api/note/{id}/pin": {
    patch: {
      tags: ["Notes"],
      summary: "Pin or unpin a note",
      operationId: "toggleNotePin",
      description: permissionDescription(
        "Sets the note's `isPinned` flag to the supplied value.",
        "note:update",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      requestBody: jsonBody(schemaRef("ToggleNotePinRequest")),
      responses: {
        "200": success("successfully toggled isPinned", schemaRef("Note")),
        ...protectedErrors,
      },
    },
  },

  "/api/note/{id}/archive": {
    patch: {
      tags: ["Notes"],
      summary: "Archive or unarchive a note",
      operationId: "toggleNoteArchive",
      description: permissionDescription(
        "Sets the note's `isArchived` flag to the supplied value.",
        "note:update",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      requestBody: jsonBody(schemaRef("ToggleNoteArchiveRequest")),
      responses: {
        "200": success("successfully toggled isArchived", schemaRef("Note")),
        ...protectedErrors,
      },
    },
  },

  "/api/reminder": {
    post: {
      tags: ["Reminders"],
      summary: "Create a reminder",
      operationId: "createReminder",
      description: permissionDescription(
        "Creates a tenant-scoped reminder. `createdBy` is assigned from the authenticated user.",
        "reminder:create",
      ),
      requestBody: jsonBody(schemaRef("CreateReminderRequest")),
      responses: {
        "200": success("remainder created successfully", schemaRef("Reminder")),
        ...protectedErrors,
      },
    },
    get: {
      tags: ["Reminders"],
      summary: "List reminders",
      operationId: "listReminders",
      description: permissionDescription(
        "Returns all non-deleted reminders for the active workspace.",
        "reminder:read",
      ),
      responses: {
        "200": success("remainders fetched successfully.", {
          type: "array",
          items: schemaRef("Reminder"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/reminder/{id}": {
    get: {
      tags: ["Reminders"],
      summary: "Get a reminder by ID",
      operationId: "getReminder",
      description: permissionDescription(
        "Returns a single non-deleted reminder from the active workspace.",
        "reminder:read",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("remainder fetched successfully.", schemaRef("Reminder")),
        ...protectedErrors,
      },
    },
    patch: {
      tags: ["Reminders"],
      summary: "Update a reminder",
      operationId: "updateReminder",
      description: permissionDescription(
        "Partially updates a reminder. Ownership fields cannot be changed through this endpoint.",
        "reminder:update",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      requestBody: jsonBody(schemaRef("UpdateReminderRequest")),
      responses: {
        "200": success("remainder updated successfully.", schemaRef("Reminder")),
        ...protectedErrors,
      },
    },
    delete: {
      tags: ["Reminders"],
      summary: "Delete a reminder",
      operationId: "deleteReminder",
      description: permissionDescription(
        "Soft-deletes a reminder by setting `deletedAt`. The deleted record is returned.",
        "reminder:delete",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("remainder deleted successfully.", schemaRef("Reminder")),
        ...protectedErrors,
      },
    },
  },

  "/api/reminder/{id}/complete": {
    patch: {
      tags: ["Reminders"],
      summary: "Mark a reminder complete",
      operationId: "completeReminder",
      description: permissionDescription(
        "Sets the reminder status to `COMPLETED`.",
        "reminder:update",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("successfully updated status", schemaRef("Reminder")),
        ...protectedErrors,
      },
    },
  },

  ...attachmentPaths("income"),
  ...attachmentPaths("expense"),
  ...attachmentPaths("reminder"),
};
