"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const role_middleware_1 = require("../middleware/role-middleware");
const user_service_1 = require("../services/user-service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'));
router.get('/users', async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const users = await (0, user_service_1.listUsers)(supabase);
        res.json({
            data: users
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.patch('/users/:id/role', async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const { id } = req.params;
        const { role } = req.body;
        if (!id) {
            res.status(400).json({ error: 'MISSING_USER_ID' });
            return;
        }
        if (!role) {
            res.status(400).json({ error: 'MISSING_ROLE' });
            return;
        }
        const user = await (0, user_service_1.updateUserRole)(supabase, id, role);
        res.json({
            data: user
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.patch('/users/:id/status', async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const { id } = req.params;
        const { is_active } = req.body;
        if (!id) {
            res.status(400).json({ error: 'MISSING_USER_ID' });
            return;
        }
        if (typeof is_active !== 'boolean') {
            res.status(400).json({ error: 'MISSING_STATUS' });
            return;
        }
        const user = await (0, user_service_1.updateUserStatus)(supabase, id, is_active);
        res.json({
            data: user
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
