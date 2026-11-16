import type { OpenAPIV3 } from "openapi-types";

export type SchemaLike =
  | OpenAPIV3.SchemaObject
  | OpenAPIV3.ReferenceObject;

export function schemaRef(name: string): OpenAPIV3.ReferenceObject {
  return { $ref: `#/components/schemas/${name}` };
}

export function responseRef(name: string): OpenAPIV3.ReferenceObject {
  return { $ref: `#/components/responses/${name}` };
}

/**
 * Wraps a data schema in the API's standard success envelope:
 * `{ success: true, message: string, data?: ... }`.
 */
export function success(
  description: string,
  dataSchema?: SchemaLike,
): OpenAPIV3.ResponseObject {
  const properties: Record<string, SchemaLike> = {
    success: { type: "boolean", enum: [true] },
    message: { type: "string", example: description },
  };

  if (dataSchema) {
    properties.data = dataSchema;
  }

  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["success", "message"],
          properties,
        },
      },
    },
  };
}

export function noContent(description = "No content"): OpenAPIV3.ResponseObject {
  return { description };
}

export function jsonBody(schema: SchemaLike): OpenAPIV3.RequestBodyObject {
  return {
    required: true,
    content: {
      "application/json": {
        schema,
      },
    },
  };
}

export function multipartBody(description: string): OpenAPIV3.RequestBodyObject {
  return {
    required: true,
    description,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          required: ["files"],
          properties: {
            files: {
              type: "array",
              minItems: 1,
              maxItems: 10,
              items: { type: "string", format: "binary" },
              description:
                "One or more files. Allowed types: PDF, JPG, JPEG, PNG. Maximum size is controlled by MAX_ATTACHMENT_SIZE_MB.",
            },
          },
        },
      },
    },
  };
}

export function param(
  name: string,
  location: "path" | "query" | "header" | "cookie",
  description: string,
  schema: SchemaLike,
  required = false,
): OpenAPIV3.ParameterObject {
  return { name, in: location, description, required, schema };
}

export function uuidPathParam(
  name: string,
  description: string,
): OpenAPIV3.ParameterObject {
  return param(name, "path", description, { type: "string", format: "uuid" }, true);
}

export function permissionDescription(
  description: string,
  permissionName: string,
): string {
  return `${description}\n\nRequires permission: \`${permissionName}\`.`;
}

export const protectedErrors: Record<string, OpenAPIV3.ReferenceObject> = {
  "400": responseRef("BadRequest"),
  "401": responseRef("Unauthorized"),
  "403": responseRef("Forbidden"),
  "404": responseRef("NotFound"),
  "500": responseRef("InternalServerError"),
};

export const publicErrors: Record<string, OpenAPIV3.ReferenceObject> = {
  "400": responseRef("BadRequest"),
  "401": responseRef("Unauthorized"),
  "429": responseRef("TooManyRequests"),
  "500": responseRef("InternalServerError"),
};

export const rateLimitedError: Record<string, OpenAPIV3.ReferenceObject> = {
  "429": responseRef("TooManyRequests"),
};

export const conflictError: Record<string, OpenAPIV3.ReferenceObject> = {
  "409": responseRef("Conflict"),
};

export function reportResponse(
  description: string,
  jsonDataSchema: SchemaLike,
): OpenAPIV3.ResponseObject {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["success", "message"],
          properties: {
            success: { type: "boolean", enum: [true] },
            message: { type: "string" },
            data: jsonDataSchema,
          },
        },
      },
      "application/pdf": {
        schema: { type: "string", format: "binary" },
      },
      "text/csv": {
        schema: { type: "string" },
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        schema: { type: "string", format: "binary" },
      },
    },
  };
}
