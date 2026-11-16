import SwaggerParser from "@apidevtools/swagger-parser";
import openapi from "../src/config/openapi";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

interface RouteOperation {
  method: HttpMethod;
  path: string;
}

interface MountedRouter {
  prefix: string;
  router: unknown;
}

function joinPaths(prefix: string, routePath: string): string {
  const combined = `${prefix}/${routePath}`.replace(/\/{2,}/g, "/");
  return combined.length > 1 ? combined.replace(/\/$/, "") : combined;
}

function toOpenApiPath(routePath: string): string {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

function collectRouterOperations(
  mounted: MountedRouter,
): RouteOperation[] {
  const router = mounted.router as { stack?: any[] };
  const operations: RouteOperation[] = [];

  for (const layer of router.stack ?? []) {
    if (!layer.route) {
      continue;
    }

    const routePaths: string[] = Array.isArray(layer.route.path)
      ? layer.route.path
      : [layer.route.path];

    for (const routePath of routePaths) {
      for (const method of HTTP_METHODS) {
        if (layer.route.methods?.[method]) {
          operations.push({
            method,
            path: toOpenApiPath(joinPaths(mounted.prefix, routePath)),
          });
        }
      }
    }
  }

  return operations;
}

function collectSpecOperations(): RouteOperation[] {
  const operations: RouteOperation[] = [];

  for (const [path, pathItem] of Object.entries(openapi.paths)) {
    for (const method of HTTP_METHODS) {
      if (pathItem?.[method]) {
        operations.push({ method, path });
      }
    }
  }

  return operations;
}

function operationKey(operation: RouteOperation): string {
  return `${operation.method.toUpperCase()} ${operation.path}`;
}

function formatOperations(operations: RouteOperation[]): string {
  return operations
    .map(operationKey)
    .sort()
    .map((operation) => `  - ${operation}`)
    .join("\n");
}

function setPlaceholderEnv(): void {
  process.env.NODE_ENV ??= "test";
  process.env.DATABASE_URL ??=
    "postgresql://postgres:postgres@localhost:5432/fms_openapi_test";
  process.env.ADMIN_EMAIL ??= "admin@example.com";
  process.env.ADMIN_PASSWORD ??= "placeholder-password";
  process.env.JWT_SECRET ??= "placeholder-jwt-secret";
}

async function main(): Promise<void> {
  setPlaceholderEnv();

  const routeModules: MountedRouter[] = [
    {
      prefix: "/api/auth",
      router: require("../src/modules/auth/auth.routes").default,
    },
    {
      prefix: "/api/income",
      router: require("../src/modules/income/income.routes").default,
    },
    {
      prefix: "/api/expense",
      router: require("../src/modules/expense/expense.routes").default,
    },
    {
      prefix: "/api/note",
      router: require("../src/modules/note/note.routes").default,
    },
    {
      prefix: "/api/reminder",
      router: require("../src/modules/remainder/reminder.routes").default,
    },
    {
      prefix: "/api/category",
      router: require("../src/modules/category/category.routes").default,
    },
    {
      prefix: "/api/dashboard",
      router: require("../src/modules/dashboard/dashboard.routes").default,
    },
    {
      prefix: "/api/report",
      router: require("../src/modules/report/report.routes").default,
    },
    {
      prefix: "/api/audit-logs",
      router: require("../src/modules/audit/audit.routes").default,
    },
    {
      prefix: "/api/workspace",
      router: require("../src/modules/workspace/workspace.routes").default,
    },
  ];

  const attachmentRoutes = require("../src/modules/attachment/attachment.routes")
    .default;

  for (const entityType of ["income", "expense", "reminder"] as const) {
    routeModules.push({
      prefix: `/api/${entityType}/:entityId/attachments`,
      router: attachmentRoutes,
    });
  }

  const expressOperations = routeModules.flatMap(collectRouterOperations);
  const specOperations = collectSpecOperations();

  const expressKeys = new Set(expressOperations.map(operationKey));
  const specKeys = new Set(specOperations.map(operationKey));

  const missingFromSpec = expressOperations.filter(
    (operation) => !specKeys.has(operationKey(operation)),
  );
  const extraInSpec = specOperations.filter(
    (operation) => !expressKeys.has(operationKey(operation)),
  );

  if (missingFromSpec.length > 0 || extraInSpec.length > 0) {
    console.error("OpenAPI route drift detected.");

    if (missingFromSpec.length > 0) {
      console.error("\nExpress routes missing from the spec:");
      console.error(formatOperations(missingFromSpec));
    }

    if (extraInSpec.length > 0) {
      console.error("\nSpec operations with no matching Express route:");
      console.error(formatOperations(extraInSpec));
    }

    process.exitCode = 1;
    return;
  }

  await SwaggerParser.validate(openapi);

  const operationIds = new Set<string>();

  for (const [path, pathItem] of Object.entries(openapi.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem?.[method];

      if (!operation) {
        continue;
      }

      if (!operation.operationId) {
        throw new Error(`${method.toUpperCase()} ${path} is missing operationId`);
      }

      if (operationIds.has(operation.operationId)) {
        throw new Error(`Duplicate operationId: ${operation.operationId}`);
      }

      operationIds.add(operation.operationId);

      if (!operation.summary) {
        throw new Error(`Operation ${operation.operationId} is missing a summary`);
      }

      if (!operation.description) {
        throw new Error(
          `Operation ${operation.operationId} is missing a description`,
        );
      }

      if (!operation.tags || operation.tags.length === 0) {
        throw new Error(`Operation ${operation.operationId} is missing tags`);
      }

      const hasSuccessResponse = Object.keys(operation.responses).some((status) =>
        status.startsWith("2"),
      );

      if (!hasSuccessResponse) {
        throw new Error(
          `Operation ${operation.operationId} is missing a 2xx response`,
        );
      }
    }
  }

  console.log(
    `OpenAPI validation passed: ${specOperations.length} operations across ${Object.keys(openapi.paths).length} paths.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
