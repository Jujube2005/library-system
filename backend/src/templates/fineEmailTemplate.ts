export const getFineEmailHtml = (
    userName: string,
    bookTitle: string,
    dueDate: string,
    fineAmount: number
) => {
    return `
    <div style="font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #d35400; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 15px;">RMUTI Library Archive</h2>
      <p>เรียน คุณ <strong>${userName}</strong>,</p>
      
      <p>ทางห้องสมุดขอแจ้งให้ทราบว่า หนังสือที่คุณยืมไปได้เลยกำหนดส่งคืนแล้ว และมีค่าปรับเกิดขึ้น</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2c3e50;">รายละเอียดหนังสื่อที่เกินกำหนด</h3>
        <ul style="list-style-type: none; padding-left: 0; margin-bottom: 0;">
          <li style="margin-bottom: 10px;"><strong>ชื่อหนังสือ:</strong> ${bookTitle}</li>
          <li style="margin-bottom: 10px;"><strong>วันครบกำหนดคืน:</strong> ${new Date(dueDate).toLocaleDateString('th-TH')}</li>
          <li><strong>ค่าปรับปัจจุบัน:</strong> <span style="color: #e74c3c; font-weight: bold; font-size: 1.1em;">${Math.floor(fineAmount)} บาท</span></li>
        </ul>
      </div>
      
      <p><strong>โปรดนำหนังสือมาคืนและชำระค่าปรับที่ห้องสมุดโดยเร็วที่สุด</strong> เพื่อหลีกเลี่ยงค่าปรับที่อาจเพิ่มขึ้น (อัตราค่าปรับ 10 บาท/วัน)</p>
      
      <p style="margin-top: 30px; font-size: 0.9em; color: #7f8c8d; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
        หากมีข้อสงสัยหรือได้ดำเนินการคืนหนังสือแล้ว โปรดติดต่อบรรณารักษ์<br>
        มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน (RMUTI)
      </p>
    </div>
  `;
};
