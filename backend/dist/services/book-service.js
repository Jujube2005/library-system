"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDueDate = exports.returnBookLogic = exports.borrowBook = exports.cancelReservation = exports.reserveBook = exports.checkAvailability = exports.getBookStatusById = exports.searchBooksFromAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const supabase_1 = require("../config/supabase");
const searchBooksFromAPI = async (query) => {
    const response = await axios_1.default.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`);
    return response.data.items.map((book) => ({
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        thumbnail: book.volumeInfo.imageLinks?.thumbnail
    }));
};
exports.searchBooksFromAPI = searchBooksFromAPI;
const getBookStatusById = async (bookId) => {
    const { data, error } = await supabase_1.supabase
        .from('books')
        .select('id, title, status, due_date')
        .eq('id', bookId)
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getBookStatusById = getBookStatusById;
const checkAvailability = async (bookId) => {
    const { data, error } = await supabase_1.supabase
        .from('books')
        .select('status, available_copies, total_copies')
        .eq('id', bookId)
        .single();
    if (error || !data)
        throw new Error('Book not found');
    const isAvailable = data.status === 'available' && data.available_copies > 0;
    return {
        bookId,
        isAvailable,
        remaining: data.available_copies,
        message: isAvailable ? 'Ready to borrow' : 'Currently unavailable'
    };
};
exports.checkAvailability = checkAvailability;
const reserveBook = async (userId, bookId) => {
    const { data: availability } = await supabase_1.supabase
        .from('books')
        .select('status, available_copies')
        .eq('id', bookId)
        .single();
    if (!availability) {
        throw new Error('Book not found');
    }
    if (!(availability.status === 'available' && availability.available_copies > 0)) {
        throw new Error('Book is not available for reservation');
    }
    const { data, error } = await supabase_1.supabase
        .from('reservations')
        .insert({
        user_id: userId,
        book_id: bookId
    })
        .select('id, status, reserved_at')
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
};
exports.reserveBook = reserveBook;
const cancelReservation = async (bookId, userId) => {
    const { data: reservation, error } = await supabase_1.supabase
        .from('reservations')
        .select('id, user_id')
        .eq('book_id', bookId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();
    if (error || !reservation) {
        throw new Error("ไม่พบการจองที่สามารถยกเลิกได้");
    }
    const { error: deleteError } = await supabase_1.supabase
        .from('reservations')
        .delete()
        .eq('id', reservation.id);
    if (deleteError) {
        throw new Error("ไม่สามารถยกเลิกการจองได้");
    }
    return { deleted: true };
};
exports.cancelReservation = cancelReservation;
const borrowBook = async (bookId, userId) => {
    throw new Error("borrowBook is deprecated. กรุณาใช้ /api/loans ผ่าน Staff แทน");
};
exports.borrowBook = borrowBook;
const returnBookLogic = async (borrowId, userId) => {
    throw new Error("returnBookLogic is deprecated. กรุณาใช้ /api/loans/:id/return ผ่าน Staff แทน");
};
exports.returnBookLogic = returnBookLogic;
const calculateDueDate = (role) => {
    if (role === 'Instructor')
        return 30; // อาจารย์ยืมได้ 30 วัน
    if (role === 'Student')
        return 7; // นักเรียนยืมได้ 7 วัน
    return 0;
};
exports.calculateDueDate = calculateDueDate;
