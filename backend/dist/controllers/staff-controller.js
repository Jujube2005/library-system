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
exports.recordReturn = exports.recordBorrow = void 0;
const staffService = __importStar(require("../services/staff-service"));
const recordBorrow = async (req, res) => {
    try {
        const staffId = req.user?.id;
        const { targetUserId, bookId } = req.body;
        if (!staffId) {
            res.status(401).json({ message: 'UNAUTHENTICATED' });
            return;
        }
        if (!targetUserId || !bookId) {
            res.status(400).json({ message: 'targetUserId and bookId are required' });
            return;
        }
        const result = await staffService.recordBorrowByStaff(staffId, targetUserId, bookId);
        res.status(201).json({
            message: 'บันทึกการยืมโดย Staff สำเร็จ',
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.recordBorrow = recordBorrow;
const recordReturn = async (req, res) => {
    try {
        const { borrowId } = req.body;
        if (!borrowId) {
            res.status(400).json({ message: 'borrowId is required' });
            return;
        }
        const result = await staffService.recordReturnByStaff(borrowId);
        res.status(200).json({
            message: 'บันทึกการคืนโดย Staff สำเร็จ',
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.recordReturn = recordReturn;
