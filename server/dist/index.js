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
const serverless_http_1 = __importDefault(require("serverless-http"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
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
        yield mongoose_1.default.connect(process.env.DB_URI);
        isConnected = true;
        console.log('MongoDB connected successfully');
    });
}
const expressHandler = (0, serverless_http_1.default)(app);
// Export a handler compatible with Vercel serverless functions.
// We wait for DB connection on cold starts and then forward the request to Express.
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connectDB();
        }
        catch (err) {
            console.error('MongoDB connection error:', err);
            // If DB connection fails, return 500 so Vercel logs show the error
            res.statusCode = 500;
            res.end('Internal Server Error');
            return;
        }
        return expressHandler(req, res);
    });
}
