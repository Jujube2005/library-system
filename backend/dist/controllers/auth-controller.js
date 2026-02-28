"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.logout = logout;
const auth_service_1 = require("../services/auth-service");
async function login(req, res) {
    const { email, password } = req.body;
    const result = await (0, auth_service_1.login)(email ?? '', password ?? '');
    res.json(result);
}
async function register(req, res) {
    const { email, password, fullName, phone, studentId, role } = req.body;
    const result = await (0, auth_service_1.register)(email ?? '', password ?? '', fullName ?? '', phone ?? '', studentId, role);
    res.json(result);
}
async function logout(req, res) {
    const authHeader = req.headers.authorization ?? '';
    const accessToken = authHeader.replace('Bearer ', '').trim();
    if (!accessToken) {
        res.status(400).json({
            success: false,
            message: 'Missing access token'
        });
        return;
    }
    const result = await (0, auth_service_1.logout)(accessToken);
    res.json(result);
}
