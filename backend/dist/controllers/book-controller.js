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
exports.reserve = exports.checkBook = exports.getStatus = void 0;
exports.searchBooks = searchBooks;
const bookService = __importStar(require("../services/book-service"));
async function searchBooks(req, res) {
    try {
        const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        if (!query) {
            res.status(400).json({ message: 'Query is required' });
            return;
        }
        const books = await bookService.searchBooksFromAPI(query);
        res.json(books);
    }
    catch (_error) {
        res.status(500).json({ error: 'Search failed' });
    }
}
const getStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const bookStatus = await bookService.getBookStatusById(id);
        res.status(200).json(bookStatus);
    }
    catch (error) {
        res.status(404).json({ message: 'Book not found', error: error.message });
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
