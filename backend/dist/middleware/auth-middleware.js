"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const supabase_1 = require("../config/supabase");
// สมมติใช้ supabase.auth.getUser(token) หรือ jwt.verify()
const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    // ตรวจสอบ Token และเก็บ user ไว้ใน req
    const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
    if (error || !user)
        return res.status(401).json({ message: "Invalid token" });
    req.user = user; // ฝากข้อมูล user ไว้ใน request
    next();
};
exports.protect = protect;
