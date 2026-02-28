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
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200',
    credentials: true
}));
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
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is reachable' });
});
app.get('/api/diag-books', async (req, res) => {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(env_1.env.supabaseUrl, env_1.env.supabaseAnonKey);
        const { data, error } = await supabase.from('books').select('id, title').limit(5);
        res.json({ data, error });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const port = env_1.env.port;
app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
});
