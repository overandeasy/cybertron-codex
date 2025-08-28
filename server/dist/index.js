"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
require("dotenv/config"); // side-effect import
const mongoose_1 = __importDefault(require("mongoose"));
const validateToken_1 = require("./middlewares/validateToken");
const auth_1 = __importDefault(require("./routes/auth"));
const collection_1 = __importDefault(require("./routes/collection"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// Fail-fast request timeout for serverless environment to prevent 300s platform timeouts.
// If a request is still processing after `REQUEST_TIMEOUT_MS`, respond with 504 and log details.
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || '15000');
app.use((req, res, next) => {
    const start = Date.now();
    const timer = setTimeout(() => {
        if (!res.headersSent) {
            console.error(`[request-timeout] ${new Date().toISOString()} - ${req.method} ${req.url} timed out after ${REQUEST_TIMEOUT_MS}ms`);
            res.status(504).json({ type: 'error', status: 504, code: 'REQUEST_TIMEOUT', message: `Request exceeded ${REQUEST_TIMEOUT_MS}ms timeout` });
        }
    }, REQUEST_TIMEOUT_MS);
    const cleanup = () => {
        clearTimeout(timer);
        const duration = Date.now() - start;
        console.log(`[request] ${new Date().toISOString()} - ${req.method} ${req.url} completed in ${duration}ms`);
    };
    res.once('finish', cleanup);
    res.once('close', cleanup);
    res.once('error', cleanup);
    next();
});
app.use('/api/auth', auth_1.default);
app.use('/api/user', validateToken_1.validateToken, user_1.default);
app.use('/api/collection', validateToken_1.validateToken, collection_1.default);
app.use('/*catchall', (req, res) => {
    res.status(404).json({ error: 'End point not Found' });
});
// In serverless environments we should not call app.listen().
// Instead we export a handler. Ensure DB connects before handling requests
// and reuse the connection across invocations when possible.
if (!process.env.DB_URI) {
    console.error('DB_URI is not defined');
}
let isConnected = false;
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isConnected)
            return;
        if (!process.env.DB_URI)
            throw new Error('DB_URI is required');
        // Shorten server selection and connect timeouts so cold-starts fail fast
        // in serverless environments instead of hanging until the platform timeout.
        const connectPromise = mongoose_1.default.connect(process.env.DB_URI, {
            // How long to block waiting for server discovery (ms)
            serverSelectionTimeoutMS: 5000,
            // Socket connect timeout
            connectTimeoutMS: 5000,
            // Limit pool size for serverless environments
            maxPoolSize: 10
        });
        // Race the connect with a manual timeout to ensure we never wait for 300s
        const timeoutMs = 8000;
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`MongoDB connect timed out after ${timeoutMs}ms`)), timeoutMs));
        yield Promise.race([connectPromise, timeoutPromise]);
        isConnected = true;
        console.log('MongoDB connected successfully');
    });
}
// Export a handler compatible with Vercel serverless functions.
// We wait for DB connection on cold starts and then forward the request to Express by calling app.handle.
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[handler] ${new Date().toISOString()} - ${req.method} ${req.url}`);
        try {
            yield connectDB();
        }
        catch (err) {
            console.error('MongoDB connection error:', err);
            // If DB connection fails, return 502 so Vercel logs show the error
            res.statusCode = 502;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ type: 'error', status: 502, code: 'DB_CONNECTION_FAILED', message: 'Database connection failed', data: String(err) }));
            return;
        }
        // Directly hand the request to the Express app. Using serverless-http caused long-running
        // invocations in some serverless environments with Express 5; calling `app.handle` delegates
        // processing to Express and lets Vercel observe the response lifecycle normally.
        try {
            // Express apps are callable functions: app(req, res)
            app(req, res);
        }
        catch (err) {
            console.error('Error while handling request with Express:', err);
            if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify({ type: 'error', status: 500, code: 'HANDLER_ERROR', message: 'Request handling failed', data: String(err) }));
            }
        }
    });
}
// Support CommonJS require() loading in some Vercel runtimes by assigning the
// handler to module.exports as well. This makes the function discoverable
// whether the runtime expects CommonJS or ESM-style default exports.
try {
    // @ts-ignore
    if (typeof module !== 'undefined' && module.exports)
        module.exports = handler;
}
catch (e) {
    // ignore
}
