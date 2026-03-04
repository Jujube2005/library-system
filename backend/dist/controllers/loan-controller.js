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
exports.getLoanById = exports.renewLoanByStaff = exports.renewLoanHandler = exports.returnLoan = exports.viewAllLoans = exports.viewMyLoans = exports.createLoan = void 0;
const loanService = __importStar(require("../services/loan-service"));
const fine_service_1 = require("../services/fine-service");
const createLoan = async (req, res) => {
    try {
        const staffId = req.user?.id;
        const { userId, bookId } = req.body;
        if (!staffId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' });
            return;
        }
        if (!userId || !bookId) {
            res.status(400).json({ error: 'MISSING_FIELDS' });
            return;
        }
        const result = await loanService.createLoan(userId, bookId, staffId);
        res.status(201).json({
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createLoan = createLoan;
const viewMyLoans = async (req, res) => {
    try {
        const userId = req.user.id;
        const loans = await loanService.getLoansByUser(userId);
        const updatedLoans = loans.map((loan) => ({
            ...loan,
            current_fine: loan.due_date ? (0, fine_service_1.calculateCurrentFine)(loan.due_date) : 0
        }));
        res.status(200).json({
            data: updatedLoans
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.viewMyLoans = viewMyLoans;
const viewAllLoans = async (_req, res) => {
    try {
        const allLoans = await loanService.getAllLoansInSystem();
        res.json({
            data: allLoans
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.viewAllLoans = viewAllLoans;
const returnLoan = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'MISSING_LOAN_ID' });
            return;
        }
        const result = await loanService.returnLoan(id);
        res.status(200).json({
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.returnLoan = returnLoan;
const renewLoanHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'MISSING_LOAN_ID' });
            return;
        }
        const result = await loanService.renewLoan(id, userId);
        res.status(200).json({
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.renewLoanHandler = renewLoanHandler;
const renewLoanByStaff = async (req, res) => {
    try {
        const staffId = req.user?.id;
        const { id } = req.params;
        const { userId } = req.body;
        if (!staffId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' });
            return;
        }
        if (!id) {
            res.status(400).json({ error: 'MISSING_LOAN_ID' });
            return;
        }
        if (!userId) {
            res.status(400).json({ error: 'MISSING_USER_ID' });
            return;
        }
        const result = await loanService.renewLoanByStaff(id, userId, staffId);
        res.status(200).json({
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.renewLoanByStaff = renewLoanByStaff;
const getLoanById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'MISSING_LOAN_ID' });
            return;
        }
        const loan = await loanService.getLoanById(id);
        if (!loan) {
            res.status(404).json({ error: 'LOAN_NOT_FOUND' });
            return;
        }
        res.status(200).json({
            data: loan
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getLoanById = getLoanById;
