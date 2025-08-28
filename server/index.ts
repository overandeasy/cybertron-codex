import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import 'dotenv/config'; // side-effect import
import mongoose from 'mongoose';
import { validateToken } from './middlewares/validateToken';
import authRouter from './routes/auth';
import collectionRouter from './routes/collection';
import serverless from 'serverless-http';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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
    await mongoose.connect(process.env.DB_URI!);
    isConnected = true;
    console.log('MongoDB connected successfully');
}

const expressHandler = serverless(app);

// Export a handler compatible with Vercel serverless functions.
// We wait for DB connection on cold starts and then forward the request to Express.
export default async function handler(req: any, res: any) {
    try {
        await connectDB();
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // If DB connection fails, return 500 so Vercel logs show the error
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
    }

    return expressHandler(req, res);
}