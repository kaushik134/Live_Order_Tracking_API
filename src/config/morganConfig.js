const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const util = require("util");

const LOG_DIR = path.join(process.cwd());
const ERROR_LOG = path.join(LOG_DIR, "app.error.log");
const ACCESS_LOG = path.join(LOG_DIR, "app.access.log");
const APP_LOG = path.join(LOG_DIR, "appLogFile.log");

function ensureFile(filePath) {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "");
}
ensureFile(ERROR_LOG);
ensureFile(ACCESS_LOG);
ensureFile(APP_LOG);

// ---- Custom Tokens ----
morgan.token("body", (req) => {
    const data = JSON.stringify(req.body);
    return data?.length > 150 ? data.slice(0, 150) + "..." : data;
});

morgan.token("response-body", (req, res) => {
    const msg = res.locals.successMessage || res.locals.errorMessage;
    if (!msg) return "";
    const data = JSON.stringify(msg);
    return data.length > 150 ? data.slice(0, 150) + "..." : data;
});

morgan.token("ip", (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
});

// ---- Formats ----
const accessFormat = () =>
    JSON.stringify(
        {
            method: ":method",
            url: ":url",
            status: ":status",
            response_time: ":response-time ms",
            timestamp: ":date[iso]",
            request_body: ":body",
            response_body: ":response-body",
            ip: ":ip",
        },
        null,
        2
    ) + "\n";

const errorFormat = () =>
    JSON.stringify(
        {
            method: ":method",
            url: ":url",
            status: ":status",
            timestamp: ":date[iso]",
            message: ":response-body",
            ip: ":ip",
        },
        null,
        2
    ) + "\n";

// ---- Log Streams ----
const errorLogStream = fs.createWriteStream(ERROR_LOG, { flags: "a" });
const accessLogStream = fs.createWriteStream(ACCESS_LOG, { flags: "a" });

// ---- Override console.log ----
const originalLog = console.log;
console.log = (...args) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${args
        .map((arg) =>
            typeof arg === "object" ? util.inspect(arg, { depth: null }) : arg
        )
        .join(" ")}`;
    fs.appendFileSync(APP_LOG, log + "\n");
    originalLog(...args);
};

// ---- Morgan Instances ----
const errorLogger = morgan(errorFormat(), {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400,
});

const accessLogger = morgan(accessFormat(), {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode >= 400,
});

module.exports = { errorLogger, accessLogger };
