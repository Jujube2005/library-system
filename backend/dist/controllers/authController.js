"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
const authService_1 = require("../services/authService");
async function login(req, res) {
    const { email, password } = req.body;
    const result = await (0, authService_1.login)(email ?? '', password ?? '');
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
    const result = await (0, authService_1.logout)(accessToken);
    res.json(result);
}
