import type { OpenAPIV3 } from "openapi-types";
import {
  conflictError,
  jsonBody,
  protectedErrors,
  publicErrors,
  rateLimitedError,
  schemaRef,
  success,
} from "../helpers";

export const authPaths: OpenAPIV3.PathsObject = {
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Log in",
      operationId: "login",
      description:
        "Authenticates with email and password. Returns an access token and sets the HttpOnly `refreshToken` cookie.",
      security: [],
      requestBody: jsonBody(schemaRef("LoginRequest")),
      responses: {
        "200": success("Login successful.", schemaRef("AuthSession")),
        ...publicErrors,
      },
    },
  },

  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Create a workspace and owner account",
      operationId: "register",
      description:
        "Creates a new workspace, an owner user with the global `admin` role, default categories, and an authenticated session. Also sends a best-effort email verification message.",
      security: [],
      requestBody: jsonBody(schemaRef("RegisterRequest")),
      responses: {
        "201": success("Workspace created successfully.", schemaRef("AuthSession")),
        ...publicErrors,
        ...conflictError,
      },
    },
  },

  "/api/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Rotate the refresh token",
      operationId: "refreshToken",
      description:
        "Reads the `refreshToken` cookie, revokes the old token, stores a new token hash, and sets a new cookie. The old refresh token cannot be reused.",
      security: [{ cookieAuth: [] }],
      responses: {
        "200": success("Token refreshed successfully.", schemaRef("AuthSession")),
        "401": { $ref: "#/components/responses/Unauthorized" },
        ...rateLimitedError,
        "500": { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },

  "/api/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Request a password reset",
      operationId: "forgotPassword",
      description:
        "Sends a password reset link when the account exists. The response is deliberately generic to prevent account enumeration.",
      security: [],
      requestBody: jsonBody(schemaRef("ForgotPasswordRequest")),
      responses: {
        "200": success(
          "If an account with that email exists, a password reset link has been sent.",
        ),
        ...publicErrors,
      },
    },
  },

  "/api/auth/reset-password": {
    post: {
      tags: ["Auth"],
      summary: "Reset a password with a token",
      operationId: "resetPassword",
      description:
        "Consumes a single-use password reset token and revokes every active refresh token for the user.",
      security: [],
      requestBody: jsonBody(schemaRef("ResetPasswordRequest")),
      responses: {
        "200": success("Password reset successfully."),
        ...publicErrors,
      },
    },
  },

  "/api/auth/verify-email": {
    post: {
      tags: ["Auth"],
      summary: "Verify an email address",
      operationId: "verifyEmail",
      description:
        "Consumes a single-use email verification token and records `emailVerifiedAt` on the user.",
      security: [],
      requestBody: jsonBody(schemaRef("VerifyEmailRequest")),
      responses: {
        "200": success(
          "Email verified successfully.",
          schemaRef("VerifyEmailResult"),
        ),
        ...publicErrors,
      },
    },
  },

  "/api/auth/invitations/{token}": {
    get: {
      tags: ["Auth", "Invitations"],
      summary: "Preview an invitation",
      operationId: "getInvitation",
      description:
        "Returns the invited email, workspace, role, and expiry for a pending invitation token.",
      security: [],
      parameters: [{ $ref: "#/components/parameters/InvitationToken" }],
      responses: {
        "200": success(
          "Invitation fetched successfully.",
          schemaRef("InvitationPreview"),
        ),
        "400": { $ref: "#/components/responses/BadRequest" },
        "404": { $ref: "#/components/responses/NotFound" },
        ...rateLimitedError,
        "500": { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },

  "/api/auth/accept-invitation": {
    post: {
      tags: ["Auth", "Invitations"],
      summary: "Accept an invitation",
      operationId: "acceptInvitation",
      description:
        "Creates the invited user, assigns the invited role, marks the invitation accepted, and returns an authenticated session.",
      security: [],
      requestBody: jsonBody(schemaRef("AcceptInvitationRequest")),
      responses: {
        "201": success(
          "Invitation accepted successfully.",
          schemaRef("AuthSession"),
        ),
        ...publicErrors,
        ...conflictError,
      },
    },
  },

  "/api/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Log out the current session",
      operationId: "logout",
      description:
        "Revokes the refresh token from the current `refreshToken` cookie and clears the cookie. The access token remains valid until it expires.",
      responses: {
        "200": success("Logged out successfully."),
        ...protectedErrors,
      },
    },
  },

  "/api/auth/logout-all": {
    post: {
      tags: ["Auth"],
      summary: "Log out every session",
      operationId: "logoutAll",
      description:
        "Revokes every active refresh token for the authenticated user and clears the current cookie.",
      responses: {
        "200": success("Logged out of all devices successfully."),
        ...protectedErrors,
        ...rateLimitedError,
      },
    },
  },

  "/api/auth/change-password": {
    post: {
      tags: ["Auth"],
      summary: "Change the current password",
      operationId: "changePassword",
      description:
        "Verifies the current password, updates the password hash, keeps the current session, and revokes every other refresh token.",
      requestBody: jsonBody(schemaRef("ChangePasswordRequest")),
      responses: {
        "200": success("Password changed successfully."),
        ...protectedErrors,
        ...rateLimitedError,
      },
    },
  },

  "/api/auth/resend-verification": {
    post: {
      tags: ["Auth"],
      summary: "Resend the email verification message",
      operationId: "resendVerification",
      description:
        "Sends a new verification email to the authenticated user. Delivery is best-effort.",
      responses: {
        "200": success(
          "Verification email sent.",
          schemaRef("EmailDispatchResult"),
        ),
        ...protectedErrors,
        ...rateLimitedError,
      },
    },
  },
};
