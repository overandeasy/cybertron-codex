"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
require("dotenv/config"); //Side-effect import - executes code when the module is imported, without importing any specific values or functions.
const mongoose_1 = __importDefault(require("mongoose"));
const validateToken_1 = require("./middlewares/validateToken");
const auth_1 = __importDefault(require("./routes/auth"));
const collection_1 = __importDefault(require("./routes/collection"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5001;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use('/api/auth', auth_1.default);
app.use('/api/user', validateToken_1.validateToken, user_1.default);
app.use('/api/collection', validateToken_1.validateToken, collection_1.default);
app.use('/*catchall', (req, res) => {
    res.status(404).json({ error: "End point not Found" });
});
if (!process.env.DB_URI) {
    console.error("DB_URI is not defined");
    throw new Error("DB_URI is required");
}
mongoose_1.default.connect(process.env.DB_URI).then(() => app.listen(port, () => {
    console.log(`MongoDB connected successfully`);
    console.log(`Server is running on http://localhost:${port}`);
})).catch(err => {
    console.error("MongoDB connection error:", err);
});
