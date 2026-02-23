"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const role_middleware_1 = require("../middleware/role-middleware");
const fine_service_1 = require("../services/fine-service");
const router = (0, express_1.Router)();
router.post('/pay/:borrowId', auth_middleware_1.protect, (0, role_middleware_1.authorize)('user'), async (req, res) => {
    try {
        const { borrowId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'UNAUTHENTICATED' });
            return;
        }
        const result = await (0, fine_service_1.processPayment)(borrowId, userId);
        res.json({
            message: 'ชำระค่าปรับสำเร็จ',
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
