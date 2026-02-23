"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveBook = exports.checkAvailability = exports.getBookStatusById = exports.searchBooksFromAPI = void 0;
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
