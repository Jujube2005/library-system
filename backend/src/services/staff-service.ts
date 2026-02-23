import { supabase } from "../config/supabase"

export const recordBorrowByStaff = async (staffId: string, targetUserId: string, bookId: string) => {
  // 1. ตรวจสอบว่า targetUserId (นักเรียน/อาจารย์) มีตัวตนอยู่จริงไหม
  // 2. ตรวจสอบว่าหนังสือว่างไหม
  
  // 3. บันทึกรายการยืม โดยระบุเพิ่มว่าใครเป็น Staff ที่ทำรายการให้ (เพื่อตรวจสอบย้อนหลัง)
  const { data, error } = await supabase
    .from('borrowings')
    .insert([{
      user_id: targetUserId,
      book_id: bookId,
      staff_id: staffId, // เก็บ ID ของ staff ผู้บันทึก
      borrow_date: new Date(),
      status: 'active'
    }]);

  if (error) throw new Error("ไม่สามารถบันทึกการยืมได้");
  return data;
}

export const recordReturnByStaff = async (borrowId: string) => {
  // 1. คำนวณค่าปรับอัตโนมัติ (Calculate Fine - AUTO) ก่อนปิดยอด
  // 2. อัปเดตสถานะหนังสือเป็น Available
  // 3. อัปเดตรายการยืมเป็น Returned
  
  const { data, error } = await supabase
    .from('borrowings')
    .update({ 
      status: 'returned', 
      return_date: new Date() 
    })
    .eq('id', borrowId);

  if (error) throw new Error("ไม่สามารถบันทึกการคืนหนังสือได้");
  return data;
}

export const confirmReservationByStaff = async (reservationId: string, staffId: string) => {
  // 1. ตรวจสอบว่ารายการจองมีอยู่จริงและสถานะคือ 'reserved'
  const { data: resv, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  if (!resv || resv.status !== 'pending') throw new Error("รายการจองไม่ถูกต้อง");

  // 2. สร้างรายการยืมใหม่ (Borrowing)
  await supabase.from('borrowings').insert({
    user_id: resv.user_id,
    book_id: resv.book_id,
    staff_id: staffId,
    borrow_date: new Date(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // 3. อัปเดตสถานะการจองเป็น 'completed'
  await supabase.from('reservations').update({ status: 'completed' }).eq('id', reservationId);
  
  return { message: "ยืนยันการรับหนังสือสำเร็จ" };
}

export const createBook = async (bookData: any) => {
  // 1. ตรวจสอบก่อนว่าหนังสือที่มี ISBN นี้มีอยู่แล้วหรือยัง
  const { data: existingBook } = await supabase
    .from('books')
    .select('id, stock_count')
    .eq('isbn', bookData.isbn)
    .single();

  if (existingBook) {
    // ถ้ามีแล้ว อาจจะเพิ่มแค่จำนวนเล่ม (Stock) แทนการเพิ่ม Row ใหม่
    const { data } = await supabase
      .from('books')
      .update({ stock_count: existingBook.stock_count + bookData.stock_count })
      .eq('id', existingBook.id);
    return { message: "เพิ่มจำนวนหนังสือเดิมสำเร็จ", data };
  }

  // 2. ถ้าเป็นหนังสือใหม่ ให้เพิ่มข้อมูลทั้งหมดเข้าไป
  const { data, error } = await supabase
    .from('books')
    .insert([{
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      category: bookData.category,
      stock_count: bookData.stock_count,
      status: 'available',
      created_at: new Date()
    }])
    .select();

  if (error) throw new Error("ไม่สามารถเพิ่มหนังสือได้: " + error.message);
  return data;
}

// services/staffService.ts
export const deleteBookSafely = async (bookId: string) => {
  // แทนที่จะ .delete() เราใช้ .update() เพื่อเปลี่ยนสถานะแทน
  const { data, error } = await supabase
    .from('books')
    .update({ 
      is_archived: true, 
      status: 'unavailable',
      deleted_at: new Date() 
    })
    .eq('id', bookId);

  if (error) throw new Error("ไม่สามารถลบหนังสือได้");
  return data;
}

export const updateBookInfo = async (bookId: string, updateData: any) => {
  const { data, error } = await supabase
    .from('books')
    .update(updateData) // รับเฉพาะฟิลด์ที่ต้องการแก้ เช่น { title: 'ชื่อใหม่' }
    .eq('id', bookId)
    .select();

  if (error) throw new Error("แก้ไขข้อมูลไม่สำเร็จ");
  return data;
};