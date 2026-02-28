"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const role_middleware_1 = require("../middleware/role-middleware");
const loan_controller_1 = require("../controllers/loan-controller");
const router = (0, express_1.Router)();
// User routes
router.get('/my', auth_middleware_1.protect, loan_controller_1.viewMyLoans);
router.patch('/:id/renew', auth_middleware_1.protect, loan_controller_1.renewLoanHandler);
// Staff routes
router.get('/', auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'), loan_controller_1.viewAllLoans);
router.get('/:id', auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'), loan_controller_1.getLoanById);
router.post('/', auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'), loan_controller_1.createLoan);
router.patch('/:id/return', auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'), loan_controller_1.returnLoan);
router.patch('/:id/renew-by-staff', auth_middleware_1.protect, (0, role_middleware_1.authorize)('staff'), loan_controller_1.renewLoanByStaff);
exports.default = router;
