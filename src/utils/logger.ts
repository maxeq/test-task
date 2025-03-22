import chalk from "chalk";

type LogLevel = "info" | "warn" | "error" | "debug";

function getTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, taskId?: string) {
  const prefix = taskId ? `[Task ${taskId}]` : "";
  const timestamp = chalk.gray(`[${getTimestamp()}]`);
  const tag = {
    info: chalk.blue("[INFO]"),
    warn: chalk.yellow("[WARN]"),
    error: chalk.red("[ERROR]"),
    debug: chalk.magenta("[DEBUG]"),
  }[level];

  return `${timestamp} ${tag} ${prefix} ${message}`;
}

export const logger = {
  info: (message: string, taskId?: string) => {
    console.log(formatMessage("info", message, taskId));
  },
  warn: (message: string, taskId?: string) => {
    console.warn(formatMessage("warn", message, taskId));
  },
  error: (message: string, taskId?: string) => {
    console.error(formatMessage("error", message, taskId));
  },
  debug: (message: string, taskId?: string) => {
    console.debug(formatMessage("debug", message, taskId));
  },
};
