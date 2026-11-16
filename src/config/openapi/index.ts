import type { OpenAPIV3 } from "openapi-types";
import {
  parameters,
  responses,
  schemas,
  securitySchemes,
  tags,
} from "./components";
import { analyticsPaths } from "./paths/analytics";
import { authPaths } from "./paths/auth";
import { notePaths } from "./paths/notes";
import { transactionPaths } from "./paths/transactions";
import { workspacePaths } from "./paths/workspace";

export const openapi: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "FMS API",
    version: "1.0.0",
    description: [
      "API for the FMS multi-tenant finance management system.",
      "",
      "All tenant-owned endpoints are scoped to the workspace in the authenticated user's access token.",
      "Protected endpoints require `Authorization: Bearer <accessToken>`.",
      "The refresh token is stored in an HttpOnly `refreshToken` cookie and is rotated on every refresh.",
    ].join("\n"),
  },
  servers: [
    {
      url: "/",
      description: "Current server",
    },
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags,
  security: [{ bearerAuth: [] }],
  paths: {
    ...authPaths,
    ...transactionPaths,
    ...analyticsPaths,
    ...notePaths,
    ...workspacePaths,
  },
  components: {
    securitySchemes,
    schemas,
    parameters,
    responses,
  },
};

export default openapi;
