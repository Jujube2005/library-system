"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const role_middleware_1 = require("../middleware/role-middleware");
const staffService = __importStar(require("../services/staff-service"));
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.protect, (0, role_middleware_1.authorize)('student', 'instructor', 'staff'), async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const userId = req.user?.id;
        const { bookId, expiresAt } = req.body;
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
            book_id: bookId,
            expires_at: expiresAt
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
router.get('/my', auth_middleware_1.protect, (0, role_middleware_1.authorize)('student', 'instructor', 'staff'), async (req, res) => {
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
        const { data: resvData, error: resvError } = await supabase
            .from('reservations')
            .select('*')
            .eq('user_id', userId)
            .order('reserved_at', { ascending: false });
        if (resvError) {
            res.status(400).json({ error: resvError.message });
            return;
        }
        if (!resvData || resvData.length === 0) {
            res.json({ data: [] });
            return;
        }
        const bookIds = [...new Set(resvData.map((r) => r.book_id))];
        const { data: booksData } = await supabase
            .from('books')
            .select('id, title, author, category')
            .in('id', bookIds);
        const bookMap = new Map(booksData?.map((b) => [b.id, b]));
        const merged = resvData.map((r) => ({
            ...r,
            books: bookMap.get(r.book_id) // Match the key expected by existing frontend logic
        }));
        res.json({ data: merged });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/all', auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'), async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const { data: resvData, error: resvError } = await supabase
            .from('reservations')
            .select('*')
            .order('reserved_at', { ascending: false })
            .limit(100);
        if (resvError) {
            res.status(400).json({ error: resvError.message });
            return;
        }
        if (!resvData || resvData.length === 0) {
            res.json({ data: [] });
            return;
        }
        // Collect unique IDs
        const userIds = [...new Set(resvData.map((r) => r.user_id))];
        const bookIds = [...new Set(resvData.map((r) => r.book_id))];
        // Fetch related data
        const [usersRes, booksRes] = await Promise.all([
            supabase.from('profiles').select('id, full_name, email, student_id').in('id', userIds),
            supabase.from('books').select('id, title, isbn, shelf_location').in('id', bookIds)
        ]);
        const userMap = new Map(usersRes.data?.map((u) => [u.id, u]));
        const bookMap = new Map(booksRes.data?.map((b) => [b.id, b]));
        const merged = resvData.map((r) => ({
            ...r,
            user: userMap.get(r.user_id) || { full_name: 'Unknown', student_id: 'N/A' },
            book: bookMap.get(r.book_id) || { title: 'Unknown Book', shelf_location: 'N/A' }
        }));
        res.json({ data: merged });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:id', auth_middleware_1.protect, (0, role_middleware_1.authorize)('student', 'instructor', 'staff'), async (req, res) => {
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
        const staffId = req.user?.id;
        if (!staffId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' });
            return;
        }
        if (status === 'completed') {
            const result = await staffService.confirmReservationByStaff(id, staffId);
            res.json({ data: result });
            return;
        }
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
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
