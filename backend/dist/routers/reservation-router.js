"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const role_middleware_1 = require("../middleware/role-middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.protect, (0, role_middleware_1.authorize)('student', 'instructor'), async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const userId = req.user?.id;
        const { bookId } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' });
            return;
        }
        if (!bookId) {
            res.status(400).json({ error: 'MISSING_BOOK_ID' });
            return;
        }
        const { data, error } = await supabase
            .from('reservations')
            .insert({
            user_id: userId,
            book_id: bookId
        })
            .select('id, book_id, status, reserved_at, expires_at')
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(201).json({ data });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
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
        const { data, error } = await supabase
            .from('reservations')
            .select('id, status, reserved_at, expires_at, books ( title )')
            .eq('user_id', userId);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json({ data: data ?? [] });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:id', auth_middleware_1.protect, (0, role_middleware_1.authorize)('student', 'instructor'), async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' });
            return;
        }
        if (!id) {
            res.status(400).json({ error: 'MISSING_RESERVATION_ID' });
            return;
        }
        const { error } = await supabase
            .from('reservations')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json({ data: { deleted: true } });
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
        const { status } = req.body;
        if (!id) {
            res.status(400).json({ error: 'MISSING_RESERVATION_ID' });
            return;
        }
        if (!status) {
            res.status(400).json({ error: 'MISSING_STATUS' });
            return;
        }
        const { data, error } = await supabase
            .from('reservations')
            .update({ status })
            .eq('id', id)
            .select('id, status, updated_at')
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json({ data });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
