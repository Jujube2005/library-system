"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const role_middleware_1 = require("../middleware/role-middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'));
router.get('/popular-books', async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const { data, error } = await supabase
            .from('loans')
            .select('book_id, books ( title )');
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        const counter = {};
        for (const row of data ?? []) {
            const bookId = row.book_id;
            const title = row.books?.title ?? null;
            if (!counter[bookId]) {
                counter[bookId] = { book_id: bookId, title, loan_count: 0 };
            }
            counter[bookId].loan_count += 1;
        }
        const items = Object.values(counter).sort((a, b) => b.loan_count - a.loan_count);
        res.json({
            data: items
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/overdue-fines', async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const { data, error } = await supabase
            .from('fines')
            .select('amount, status, user_id, profiles ( full_name )')
            .eq('status', 'unpaid');
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        let total = 0;
        const items = (data ?? []).map((row) => {
            const amount = Number(row.amount ?? 0);
            total += amount;
            return {
                user_id: row.user_id,
                user_name: row.profiles?.full_name ?? null,
                amount
            };
        });
        res.json({
            data: items,
            summary: {
                total_unpaid: total
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
