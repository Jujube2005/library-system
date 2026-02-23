"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const notification_service_1 = require("../services/notification-service");
const router = (0, express_1.Router)();
router.get('/my', auth_middleware_1.protect, async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' });
            return;
        }
        const notifications = await (0, notification_service_1.getMyNotifications)(supabase, userId);
        res.json({
            data: notifications
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.patch('/:id/read', auth_middleware_1.protect, async (req, res) => {
    try {
        const supabase = req.supabase;
        if (!supabase) {
            res.status(500).json({ error: 'Supabase client not available' });
            return;
        }
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'UNAUTHENTICATED' });
            return;
        }
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'MISSING_NOTIFICATION_ID' });
            return;
        }
        const notification = await (0, notification_service_1.markNotificationAsRead)(supabase, id, userId);
        res.json({
            data: notification
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
