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
const loan_router_1 = __importDefault(require("./routers/loan-router"));
const reservation_router_1 = __importDefault(require("./routers/reservation-router"));
const fine_router_1 = __importDefault(require("./routers/fine-router"));
const staff_router_1 = __importDefault(require("./routers/staff-router"));
const admin_router_1 = __importDefault(require("./routers/admin-router"));
const report_router_1 = __importDefault(require("./routers/report-router"));
const notification_router_1 = __importDefault(require("./routers/notification-router"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_router_1.default);
app.use('/api/books', book_router_1.default);
app.use('/api/loans', loan_router_1.default);
app.use('/api/reservations', reservation_router_1.default);
app.use('/api/fines', fine_router_1.default);
app.use('/api/users', user_router_1.default);
app.use('/api/staff', staff_router_1.default);
app.use('/api/admin', admin_router_1.default);
app.use('/api/reports', report_router_1.default);
app.use('/api/notifications', notification_router_1.default);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
const port = env_1.env.port;
app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
});
