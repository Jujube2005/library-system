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
        .select('status, stock_count')
        .eq('id', bookId)
        .single();
    if (error || !data)
        throw new Error('Book not found');
    const isAvailable = data.status === 'available' && data.stock_count > 0;
    return {
        bookId,
        isAvailable,
        remaining: data.stock_count,
        message: isAvailable ? 'Ready to borrow' : 'Currently unavailable'
    };
};
exports.checkAvailability = checkAvailability;
const reserveBook = async (userId, bookId) => {
    const { data: availability } = await supabase_1.supabase
        .from('books')
        .select('status, stock_count')
        .eq('id', bookId)
        .single();
    if (!availability) {
        throw new Error('Book not found');
    }
    if (!(availability.status === 'available' && availability.stock_count > 0)) {
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
    const { data: book, error: fetchError } = await supabase_1.supabase
        .from('books')
        .select('reserved_by, status')
        .eq('id', bookId)
        .single();
    if (fetchError || !book)
        throw new Error("ไม่พบข้อมูลหนังสือ");
    if (book.status !== 'reserved' || book.reserved_by !== userId) {
        throw new Error("คุณไม่มีสิทธิ์ยกเลิกการจองนี้ หรือหนังสือไม่ได้อยู่ในสถานะถูกจอง");
    }
    const { data, error: updateError } = await supabase_1.supabase
        .from('books')
        .update({
        status: 'available',
        reserved_by: null,
        reserved_at: null
    })
        .eq('id', bookId)
        .select()
        .single();
    if (updateError)
        throw new Error(updateError.message);
    return data;
};
exports.cancelReservation = cancelReservation;
const borrowBook = async (bookId, userId) => {
    const { data: book, error: bookError } = await supabase_1.supabase
        .from('books')
        .select('status, stock_count, title')
        .eq('id', bookId)
        .single();
    if (bookError || !book)
        throw new Error("ไม่พบข้อมูลหนังสือ");
    if (book.status !== 'available' || book.stock_count <= 0) {
        throw new Error("ขออภัย หนังสือเล่มนี้ไม่พร้อมให้ยืมในขณะนี้");
    }
    const { error: updateError } = await supabase_1.supabase
        .from('books')
        .update({
        status: book.stock_count === 1 ? 'borrowed' : 'available',
        stock_count: book.stock_count - 1
    })
        .eq('id', bookId);
    if (updateError)
        throw new Error("ไม่สามารถอัปเดตสถานะหนังสือได้");
    const { data: borrowing, error: borrowError } = await supabase_1.supabase
        .from('borrowings')
        .insert([{
            user_id: userId,
            book_id: bookId,
            borrow_date: new Date(),
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // กำหนดส่งใน 7 วัน
            status: 'active'
        }])
        .select()
        .single();
    if (borrowError)
        throw new Error("ไม่สามารถบันทึกข้อมูลการยืมได้");
    return borrowing;
};
exports.borrowBook = borrowBook;
const returnBookLogic = async (borrowId, userId) => {
    const { data: borrowing, error } = await supabase_1.supabase
        .from('borrowings')
        .select('*')
        .eq('id', borrowId)
        .eq('user_id', userId) // ตรวจสอบความเป็นเจ้าของ
        .eq('status', 'active')
        .single();
    if (error || !borrowing)
        throw new Error("ไม่พบรายการยืมที่ถูกต้อง");
    await supabase_1.supabase.from('books')
        .update({ status: 'available' }) // หรือเพิ่ม stock_count: +1
        .eq('id', borrowing.book_id);
    const { data: result } = await supabase_1.supabase
        .from('borrowings')
        .update({
        status: 'returned',
        return_date: new Date()
    })
        .eq('id', borrowId)
        .select();
    return result;
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
