import { logger } from "./logger";

export function handleError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message, context);
}
