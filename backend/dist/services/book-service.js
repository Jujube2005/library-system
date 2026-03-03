"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookCopies = exports.deleteBook = exports.updateBookInfo = exports.createBook = exports.calculateDueDate = exports.returnBookLogic = exports.borrowBook = exports.cancelReservation = exports.reserveBook = exports.checkAvailability = exports.getBookStatusById = exports.searchBooksFromAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");
// Original functions
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
        console.error('Supabase Update Copies Error:', error);
        throw {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        };
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
// New Staff functions
const createBook = async (bookData, supabaseClient) => {
    console.log('--- START BOOK SERVICE createBook ---');
    // 1. Use the provided authenticated client
    // 2. Or use a new admin client if service role key exists
    // 3. Or fall back to the global anon client
    const client = supabaseClient || (env_1.env.supabaseServiceRoleKey
        ? (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey)
        : supabase_1.supabase);
    if (!env_1.env.supabaseServiceRoleKey && !supabaseClient) {
        console.warn('WARNING: No service role key and no auth client. This will likely fail due to RLS.');
    }
    // Ensure we only insert valid columns to avoid 400 errors from Supabase
    const isbn = bookData.isbn ? bookData.isbn.replace(/[-\s]/g, '') : null;
    const insertData = {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        isbn: isbn && isbn.length > 0 ? isbn : null,
        category: bookData.category.trim(),
        shelf_location: bookData.shelf_location.trim(),
        image_url: bookData.image_url ? bookData.image_url.trim() : null,
        total_copies: Number(bookData.total_copies),
        available_copies: Number(bookData.total_copies),
        status: (Number(bookData.total_copies) > 0 ? 'available' : 'unavailable')
    };
    console.log('Inserting into Supabase:', JSON.stringify(insertData));
    const { data, error } = await client
        .from('books')
        .insert(insertData)
        .select()
        .single();
    if (error) {
        console.error('Supabase Insert Error detail:', error);
        // Throw an object that matches the structure expected by the controller
        throw {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        };
    }
    console.log('Supabase insert success');
    return data;
};
exports.createBook = createBook;
const updateBookInfo = async (bookId, updateData, supabaseClient) => {
    const client = supabaseClient || (env_1.env.supabaseServiceRoleKey
        ? (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey)
        : supabase_1.supabase);
    // Filter out invalid columns
    const validColumns = ['title', 'author', 'isbn', 'category', 'shelf_location', 'image_url', 'total_copies', 'available_copies', 'status'];
    const filteredData = {};
    for (const key of validColumns) {
        if (key in updateData) {
            const value = updateData[key];
            if (key === 'isbn') {
                const cleanedIsbn = typeof value === 'string' ? value.replace(/[-\s]/g, '') : value;
                filteredData[key] = cleanedIsbn && cleanedIsbn.length > 0 ? cleanedIsbn : null;
            }
            else if (key === 'total_copies' || key === 'available_copies') {
                filteredData[key] = Number(value);
            }
            else if (typeof value === 'string') {
                filteredData[key] = value.trim();
            }
            else {
                filteredData[key] = value;
            }
        }
    }
    const { data, error } = await client
        .from('books')
        .update(filteredData)
        .eq('id', bookId)
        .select()
        .single();
    if (error) {
        console.error('Supabase Update Error:', error);
        throw {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        };
    }
    return data;
};
exports.updateBookInfo = updateBookInfo;
const deleteBook = async (bookId, supabaseClient) => {
    const client = supabaseClient || (env_1.env.supabaseServiceRoleKey
        ? (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey)
        : supabase_1.supabase);
    const { data: loans, error: loanError } = await client
        .from('loans')
        .select('id')
        .eq('book_id', bookId)
        .neq('status', 'returned');
    if (loanError)
        throw new Error(loanError.message);
    if (loans && loans.length > 0) {
        throw new Error('ไม่สามารถลบหนังสือได้ เนื่องจากมีการยืมหรือจองค้างอยู่');
    }
    const { error } = await client
        .from('books')
        .delete()
        .eq('id', bookId);
    if (error) {
        console.error('Supabase Delete Error:', error);
        throw {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        };
    }
    return { message: 'ลบหนังสือสำเร็จ' };
};
exports.deleteBook = deleteBook;
const updateBookCopies = async (bookId, change, supabaseClient) => {
    const client = supabaseClient || (env_1.env.supabaseServiceRoleKey
        ? (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey)
        : supabase_1.supabase);
    const { data: currentBook, error: fetchError } = await client
        .from('books')
        .select('total_copies, available_copies')
        .eq('id', bookId)
        .single();
    if (fetchError)
        throw new Error(fetchError.message);
    if (!currentBook)
        throw new Error('ไม่พบหนังสือ');
    const newTotalCopies = currentBook.total_copies + change;
    if (newTotalCopies < 0) {
        throw new Error('จำนวนสำเนาทั้งหมดไม่สามารถน้อยกว่า 0 ได้');
    }
    const borrowedCopies = currentBook.total_copies - currentBook.available_copies;
    const newAvailableCopies = newTotalCopies - borrowedCopies;
    if (newAvailableCopies < 0) {
        throw new Error('จำนวนสำเนาที่ว่างไม่สามารถน้อยกว่าจำนวนที่ถูกยืมอยู่ได้');
    }
    const { data, error } = await client
        .from('books')
        .update({
        total_copies: newTotalCopies,
        available_copies: newAvailableCopies,
        status: newTotalCopies > 0 ? 'available' : 'unavailable'
    })
        .eq('id', bookId)
        .select()
        .single();
    if (error) {
        console.error('Supabase Update Copies Error (New Staff):', error);
        throw {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        };
    }
    return data;
};
exports.updateBookCopies = updateBookCopies;
