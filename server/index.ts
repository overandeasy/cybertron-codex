import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import 'dotenv/config'; // side-effect import
import mongoose from 'mongoose';
import { validateToken } from './middlewares/validateToken';
import authRouter from './routes/auth';
import collectionRouter from './routes/collection';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

app.use('/api/auth', authRouter);
app.use('/api/user', validateToken, userRouter);
app.use('/api/collection', validateToken, collectionRouter);

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
async function connectDB() {
    if (isConnected) return;
    if (!process.env.DB_URI) throw new Error('DB_URI is required');

    // Shorten server selection and connect timeouts so cold-starts fail fast
    // in serverless environments instead of hanging until the platform timeout.
    const connectPromise = mongoose.connect(process.env.DB_URI!, {
        // How long to block waiting for server discovery (ms)
        serverSelectionTimeoutMS: 5000,
        // Socket connect timeout
        connectTimeoutMS: 5000,
        // Limit pool size for serverless environments
        maxPoolSize: 10
    } as any);

    // Race the connect with a manual timeout to ensure we never wait for 300s
    const timeoutMs = 8000;
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`MongoDB connect timed out after ${timeoutMs}ms`)), timeoutMs));

    await Promise.race([connectPromise, timeoutPromise]);
    isConnected = true;
    console.log('MongoDB connected successfully');
}

// Export a handler compatible with Vercel serverless functions.
// We wait for DB connection on cold starts and then forward the request to Express by calling app.handle.
export default async function handler(req: any, res: any) {
    console.log(`[handler] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    try {
        await connectDB();
    } catch (err) {
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
        (app as any)(req, res);
    } catch (err) {
        console.error('Error while handling request with Express:', err);
        if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ type: 'error', status: 500, code: 'HANDLER_ERROR', message: 'Request handling failed', data: String(err) }));
        }
    }
}


// Start a long-lived server when run directly (local development / non-serverless)
export async function startLocalServer(port = Number(process.env.PORT || 5001)) {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to start local server:', err);
        throw err;
    }
}

// If file executed directly (node dist/index.js), start a local server
if (require.main === module) {
    startLocalServer().catch(() => process.exit(1));
}

// Support CommonJS require() loading in some Vercel runtimes by assigning the
// handler to module.exports as well. This makes the function discoverable
// whether the runtime expects CommonJS or ESM-style default exports.
try {
    // @ts-ignore
    if (typeof module !== 'undefined' && module.exports) module.exports = handler;
} catch (e) {
    // ignore
}