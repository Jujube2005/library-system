"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routers/authRouter.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
exports.default = router;
