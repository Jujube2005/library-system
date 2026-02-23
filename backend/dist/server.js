"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const auth_router_1 = __importDefault(require("./routers/auth-router"));
const book_router_1 = __importDefault(require("./routers/book-router"));
const user_router_1 = __importDefault(require("./routers/user-router"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_router_1.default);
app.use('/api/books', book_router_1.default);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/books', book_router_1.default);
app.use('/api/users', user_router_1.default);
const port = env_1.env.port;
app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
});
