import { getSupabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const payload = await request.json()
    const { 
      customer_name, 
      phone, 
      check_in, 
      room_type, 
      note, 
      status,
      // Các trường tùy chọn hoặc bổ sung phục vụ cấu trúc quan hệ
      checkin_date,
      checkout_date,
      total_price,
      voucher_code
    } = payload

    if (!customer_name || !phone || !room_type) {
      return Response.json(
        { error: 'Missing required fields: customer_name, phone, room_type' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 1. TÌM HOẶC TẠO KHÁCH HÀNG (CUSTOMERS CRM)
    let customerId = null
    const { data: existingCustomer, error: findCustError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone.trim())
      .maybeSingle()

    if (findCustError) {
      console.error('Find customer error:', findCustError)
    }

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Cập nhật last_active và nối thêm ghi chú mới vào mảng notes
      const currentNotes = existingCustomer.notes || []
      const updatedNotes = [...currentNotes, note].slice(-10) // Giữ tối đa 10 ghi chú gần nhất
      
      const { error: updateCustError } = await supabase
        .from('customers')
        .update({
          name: customer_name.trim(),
          notes: updatedNotes,
          last_active: new Date().toISOString()
        })
        .eq('id', customerId)

      if (updateCustError) {
        console.error('Update customer error:', updateCustError)
      }
    } else {
      // Tạo mới khách hàng hoàn toàn
      const { data: newCustomer, error: createCustError } = await supabase
        .from('customers')
        .insert([{
          name: customer_name.trim(),
          phone: phone.trim(),
          notes: [note],
          total_spent: 0,
          total_bookings: 0,
          last_active: new Date().toISOString()
        }])
        .select()
        .single()

      if (createCustError) {
        console.error('Create customer error:', createCustError)
        throw new Error(`Không thể tạo hồ sơ khách hàng: ${createCustError.message}`)
      }
      customerId = newCustomer.id
    }

    // 2. TÌM PHÒNG TƯƠNG THÍCH (ROOMS)
    let roomId = null
    let roomPrice = 0
    
    // Tìm kiếm tương đối theo tên phòng
    const cleanRoomType = room_type.split('(')[0].trim()
    const { data: matchedRoom, error: roomMatchError } = await supabase
      .from('rooms')
      .select('*')
      .ilike('name', `%${cleanRoomType}%`)
      .limit(1)
      .maybeSingle()

    if (roomMatchError) {
      console.error('Room match error:', roomMatchError)
    }

    if (matchedRoom) {
      roomId = matchedRoom.id
      roomPrice = Number(matchedRoom.price)
    } else {
      // Fallback: Tìm phòng bất kỳ đầu tiên trong database để tránh lỗi khóa ngoại
      const { data: fallbackRoom, error: fallbackRoomError } = await supabase
        .from('rooms')
        .select('*')
        .limit(1)
        .single()

      if (fallbackRoomError) {
        console.error('Fallback room fetch error:', fallbackRoomError)
        throw new Error('Cơ sở dữ liệu phòng nghỉ trống. Vui lòng tạo phòng trước!')
      }
      roomId = fallbackRoom.id
      roomPrice = Number(fallbackRoom.price)
    }

    // 3. XỬ LÝ NGÀY CHECK-IN VÀ CHECK-OUT HỢP LỆ
    // Nếu client không truyền, tự động phân tách từ chuỗi check_in hoặc dùng mặc định
    let checkinDateVal = checkin_date
    let checkoutDateVal = checkout_date

    if (!checkinDateVal || !checkoutDateVal) {
      // Giả lập phân tách: "2026-05-30 14:00" -> "2026-05-30"
      if (check_in && check_in.includes(' ')) {
        checkinDateVal = check_in.split(' ')[0]
      } else {
        checkinDateVal = new Date().toISOString().split('T')[0]
      }
      
      const checkinDateObj = new Date(checkinDateVal)
      const checkoutDateObj = new Date(checkinDateObj)
      checkoutDateObj.setDate(checkoutDateObj.getDate() + 1)
      checkoutDateVal = checkoutDateObj.toISOString().split('T')[0]
    }

    // 4. KIỂM TRA MÃ GIẢM GIÁ (VOUCHERS)
    let validVoucherCode = null
    if (voucher_code) {
      const { data: matchedVoucher } = await supabase
        .from('vouchers')
        .select('code')
        .eq('code', voucher_code.trim())
        .maybeSingle()
      
      if (matchedVoucher) {
        validVoucherCode = matchedVoucher.code
      }
    }

    // 5. TÍNH TOÁN TỔNG GIÁ TRỊ ĐƠN HÀNG
    const finalPrice = total_price || roomPrice || 1200000

    // 6. CHÈN BẢN GHI ĐƠN ĐẶT PHÒNG QUAN HỆ (BOOKINGS)
    const { data: bookingRecord, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        customer_id: customerId,
        room_id: roomId,
        voucher_code: validVoucherCode,
        checkin_date: checkinDateVal,
        checkout_date: checkoutDateVal,
        total_price: finalPrice,
        status: status || 'pending',
        special_notes: note
      }])
      .select()
      .single()

    if (bookingError) {
      console.error('Supabase booking insert error:', bookingError)
      throw new Error(`Lỗi chèn đơn đặt phòng: ${bookingError.message}`)
    }

    return Response.json({ data: bookingRecord }, { status: 200 })
  } catch (error) {
    console.error('Booking API relational error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
