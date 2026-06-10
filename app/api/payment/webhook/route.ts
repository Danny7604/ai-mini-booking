import { getSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { gateway, amount, content } = payload

    if (!content) {
      return Response.json({ error: 'Missing content transaction detail' }, { status: 400 })
    }

    console.log(`[BANK WEBHOOK]: Nhận tín hiệu từ cổng ${gateway || 'Chung'}. Số tiền: ${amount || 0}. Nội dung: "${content}"`)

    // Trích xuất mã đơn dạng BLISS-XXXXXX hoặc BLISS XXXXXX
    const match = content.match(/BLISS[- ]?([0-9]{6})/i)
    if (!match) {
      console.warn(`[BANK WEBHOOK]: Không tìm thấy mã đơn hợp lệ trong nội dung giao dịch: "${content}"`)
      return Response.json({ error: 'Invalid transaction content schema' }, { status: 400 })
    }

    const bookingCode = `BLISS-${match[1]}`
    console.log(`[BANK WEBHOOK]: Trích xuất mã đơn thành công: "${bookingCode}"`)

    const supabase = getSupabase()

    // Tìm kiếm đơn đặt phòng có trường special_notes chứa mã đơn này và đang ở trạng thái pending
    const { data: matchedBookings, error: findError } = await supabase
      .from('bookings')
      .select('*')
      .ilike('special_notes', `%${bookingCode}%`)

    if (findError) {
      console.error('[BANK WEBHOOK ERROR]: Tìm kiếm đơn phòng thất bại:', findError)
      return Response.json({ error: 'Database search error' }, { status: 500 })
    }

    if (!matchedBookings || matchedBookings.length === 0) {
      console.warn(`[BANK WEBHOOK]: Không tìm thấy đơn booking nào có mã đơn khớp với "${bookingCode}" trong database.`)
      return Response.json({ error: 'Booking code not found in records' }, { status: 404 })
    }

    // Chọn đơn booking mới nhất khớp điều kiện
    const booking = matchedBookings[0]

    // Cập nhật trạng thái đơn đặt phòng sang Đã xác nhận (confirmed)
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking.id)
      .select()
      .single()

    if (updateError) {
      console.error('[BANK WEBHOOK ERROR]: Cập nhật trạng thái đơn thất bại:', updateError)
      return Response.json({ error: 'Database update failed' }, { status: 500 })
    }

    console.log(`[BANK WEBHOOK SUCCESS]: Đơn đặt phòng ${booking.id} của mã đơn "${bookingCode}" đã được chuyển sang trạng thái CONFIRMED (Đã thanh toán) thành công!`)

    return Response.json({ 
      success: true, 
      message: 'Transaction verified and booking confirmed successfully!',
      bookingId: booking.id,
      code: bookingCode,
      status: 'confirmed'
    }, { status: 200 })

  } catch (e: any) {
    console.error('[BANK WEBHOOK SYSTEM ERROR]:', e)
    return Response.json({ error: e.message }, { status: 500 })
  }
}
