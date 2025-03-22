"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
function getTimestamp() {
    return new Date().toISOString();
}
function formatMessage(level, message, taskId) {
    const prefix = taskId ? `[Task ${taskId}]` : "";
    const timestamp = chalk_1.default.gray(`[${getTimestamp()}]`);
    const tag = {
        info: chalk_1.default.blue("[INFO]"),
        warn: chalk_1.default.yellow("[WARN]"),
        error: chalk_1.default.red("[ERROR]"),
        debug: chalk_1.default.magenta("[DEBUG]"),
    }[level];
    return `${timestamp} ${tag} ${prefix} ${message}`;
}
exports.logger = {
    info: (message, taskId) => {
        console.log(formatMessage("info", message, taskId));
    },
    warn: (message, taskId) => {
        console.warn(formatMessage("warn", message, taskId));
    },
    error: (message, taskId) => {
        console.error(formatMessage("error", message, taskId));
    },
    debug: (message, taskId) => {
        console.debug(formatMessage("debug", message, taskId));
    },
};
