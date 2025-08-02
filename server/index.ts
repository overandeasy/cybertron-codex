import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import 'dotenv/config'; //Side-effect import - executes code when the module is imported, without importing any specific values or functions.
import mongoose from 'mongoose';
import { validateToken } from './middlewares/validateToken';
import authRouter from './routes/auth';


const app = express();
const port = process.env.PORT || 5001;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/api/auth', authRouter)
app.use('/api/user', validateToken, userRouter)
app.use('/*catchall', (req, res) => {

    res.status(404).json({ error: "End point not Found" })
})


if (!process.env.DB_URI) {
    console.error("DB_URI is not defined");
    throw new Error("DB_URI is required");
}
mongoose.connect(process.env.DB_URI!).then(() => app.listen(port, () => {
    console.log(`MongoDB connected successfully`);
    console.log(`Server is running on http://localhost:${port}`);
})).catch(err => {
    console.error("MongoDB connection error:", err);
}); 