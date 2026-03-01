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
exports.updateBookCopies = exports.deleteBook = exports.updateBook = exports.createBook = exports.returnBook = exports.borrow = exports.cancelMyReservation = exports.reserve = exports.checkBook = exports.getStatus = void 0;
exports.searchBooks = searchBooks;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
const bookService = __importStar(require("../services/book-service"));
async function searchBooks(req, res) {
    try {
        console.log('searchBooks: starting query...');
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
        const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : '';
        const page = Number(req.query.page ?? 1) || 1;
        const limit = Number(req.query.limit ?? 10) || 10;
        console.log(`[Backend] Searching books: q="${q}", cat="${category}", page=${page}`);
        const publicSupabase = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseAnonKey);
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        let query = publicSupabase
            .from('books')
            .select('*', { count: 'exact' });
        if (q) {
            query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
        }
        if (category) {
            query = query.eq('category', category);
        }
        const { data, error, count } = await query
            .range(from, to)
            .order('title', { ascending: true });
        console.log(`[Backend] Query finished. Found ${data?.length} results. Total count: ${count}`);
        if (error) {
            console.error('Supabase Search Error:', error);
            res.status(400).json({ error: error.message, details: error.details });
            return;
        }
        res.json({
            data: data ?? [],
            pagination: {
                page,
                limit,
                total: count ?? data?.length ?? 0
            }
        });
    }
    catch (_error) {
        res.status(500).json({ error: 'Search failed' });
    }
}
const getStatus = async (req, res) => {
    try {
        const publicSupabase = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseAnonKey);
        const { id } = req.params;
        const { data, error } = await publicSupabase
            .from('books')
            .select('id, title, author, category, shelf_location, available_copies, total_copies, status')
            .eq('id', id)
            .single();
        if (error || !data) {
            console.error('Get Book Error:', error);
            res.status(404).json({ error: 'BOOK_NOT_FOUND' });
            return;
        }
        res.status(200).json({ data });
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to load book' });
    }
};
exports.getStatus = getStatus;
const checkBook = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await bookService.checkAvailability(id);
        res.json(result);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.checkBook = checkBook;
const reserve = async (req, res) => {
    try {
        const user = req.user;
        const userId = user?.id;
        if (!userId) {
            res.status(401).json({ message: 'UNAUTHENTICATED' });
            return;
        }
        const { bookId } = req.body;
        if (!bookId) {
            res.status(400).json({ message: 'bookId is required' });
            return;
        }
        const reservation = await bookService.reserveBook(userId, bookId);
        res.status(201).json(reservation);
    }
    catch (error) {
        res.status(400).json({ message: 'Reservation failed', error: error.message });
    }
};
exports.reserve = reserve;
const cancelMyReservation = async (req, res) => {
    try {
        const { bookId } = req.body; // หรือรับจาก req.params ก็ได้
        const userId = req.user.id; // ได้มาจาก protect middleware
        const result = await bookService.cancelReservation(bookId, userId);
        res.json({
            message: "ยกเลิกการจองสำเร็จ",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.cancelMyReservation = cancelMyReservation;
const borrow = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id; // ดึงจาก protect middleware
        const result = await bookService.borrowBook(bookId, userId);
        res.status(201).json({
            message: "ยืมหนังสือสำเร็จ กรุณาส่งคืนตามกำหนด",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.borrow = borrow;
const returnBook = async (req, res) => {
    try {
        const { borrowId } = req.body;
        const userId = req.user.id;
        const result = await bookService.returnBookLogic(borrowId, userId);
        res.json({
            message: "คืนหนังสือสำเร็จ",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.returnBook = returnBook;
const createBook = async (req, res) => {
    try {
        const bookData = req.body;
        const result = await bookService.createBook(bookData);
        res.status(201).json({
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createBook = createBook;
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'MISSING_BOOK_ID' });
            return;
        }
        const updateData = req.body;
        const result = await bookService.updateBookInfo(id, updateData);
        res.status(200).json({
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateBook = updateBook;
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'MISSING_BOOK_ID' });
            return;
        }
        const result = await bookService.deleteBook(id);
        res.status(200).json({
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteBook = deleteBook;
const updateBookCopies = async (req, res) => {
    try {
        const { id } = req.params;
        const { change } = req.body;
        if (!id) {
            res.status(400).json({ error: 'MISSING_BOOK_ID' });
            return;
        }
        if (typeof change !== 'number') {
            res.status(400).json({ error: 'CHANGE_AMOUNT_REQUIRED' });
            return;
        }
        const result = await bookService.updateBookCopies(id, change);
        res.status(200).json({
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateBookCopies = updateBookCopies;
