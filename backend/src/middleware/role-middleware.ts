import { Request, Response, NextFunction } from 'express';

// ฟังก์ชันนี้จะรับ "รายชื่อ Role ที่อนุญาต" เข้าไป
export const authorize = (...allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // ข้อมูล user.role ต้องถูกดึงมาใส่ไว้ใน req ตั้งแต่ตอนผ่าน protect middleware
    const userRole = req.user?.role; 

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Forbidden: คุณไม่มีสิทธิ์เข้าถึงส่วนนี้" 
      });
    }
    next();
  };
};