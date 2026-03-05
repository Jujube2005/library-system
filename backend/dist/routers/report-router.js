"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const role_middleware_1 = require("../middleware/role-middleware");
const supabase_admin_1 = require("../config/supabase-admin");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'));
router.get('/popular-books', async (req, res) => {
    try {
        const { data, error } = await supabase_admin_1.supabaseAdmin
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
        const { data: fines, error } = await supabase_admin_1.supabaseAdmin
            .from('fines')
            .select('id, amount, status, user_id, profiles ( full_name )')
            .order('created_at', { ascending: false });
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        let totalUnpaid = 0;
        let totalPaid = 0;
        const items = (fines ?? []).map((row) => {
            const amount = Number(row.amount ?? 0);
            const status = row.status;
            if (status === 'unpaid') {
                totalUnpaid += amount;
            }
            else if (status === 'paid') {
                totalPaid += amount;
            }
            return {
                id: row.id,
                user_id: row.user_id,
                user_name: row.profiles?.full_name ?? null,
                amount,
                status
            };
        });
        res.json({
            data: items,
            summary: {
                total_unpaid: totalUnpaid,
                total_paid: totalPaid,
                total_revenue: totalPaid
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
