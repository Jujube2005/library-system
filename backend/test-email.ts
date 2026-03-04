import { sendFineEmail } from './src/utils/email';

async function testEmail() {
    const result = await sendFineEmail(
        'chotika.jakchai@gmail.com', // อีเมลจริงที่ต้องการทดสอบ
        'ทดสอบระบบส่งอีเมลห้องสมุด RMUTI',
        '<h1>การทดสอบสำเร็จ!</h1><p>ระบบแจ้งเตือนของคุณพร้อมใช้งานแล้ว</p>'
    );
    console.log('Test Result:', result);
}

testEmail();
