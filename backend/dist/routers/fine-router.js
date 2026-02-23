"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const role_middleware_1 = require("../middleware/role-middleware");
const fine_service_1 = require("../services/fine-service");
const router = (0, express_1.Router)();
router.get('/my', auth_middleware_1.protect, (0, role_middleware_1.authorize)('student', 'instructor'), async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' });
            return;
        }
        const fines = await (0, fine_service_1.getMyFines)(supabase, userId);
        res.json({ data: fines });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/', auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'), async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const fines = await (0, fine_service_1.getAllFines)(supabase);
        res.json({ data: fines });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.patch('/:id', auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'), async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'MISSING_FINE_ID' });
            return;
        }
        const fine = await (0, fine_service_1.processPayment)(supabase, id);
        res.json({ data: fine });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
