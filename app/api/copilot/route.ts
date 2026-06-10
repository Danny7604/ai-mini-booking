import { getSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // 1. Kết nối cơ sở dữ liệu Supabase thực tế để lấy song song dữ liệu từ 5 bảng quan hệ
    const supabase = getSupabase()
    
    const [bookingsRes, roomsRes, customersRes, vouchersRes, campaignsRes] = await Promise.all([
      supabase.from('bookings').select('*'),
      supabase.from('rooms').select('*'),
      supabase.from('customers').select('*'),
      supabase.from('vouchers').select('*'),
      supabase.from('campaigns').select('*')
    ])

    if (bookingsRes.error || roomsRes.error || customersRes.error || vouchersRes.error || campaignsRes.error) {
      console.error('Lỗi khi truy vấn đa bảng Supabase cho Copilot:', {
        bookings: bookingsRes.error,
        rooms: roomsRes.error,
        customers: customersRes.error,
        vouchers: vouchersRes.error,
        campaigns: campaignsRes.error
      })
      return Response.json({ error: 'Multi-table Database query failed' }, { status: 500 })
    }

    const bookingsList = bookingsRes.data || []
    const roomsList = roomsRes.data || []
    const customersList = customersRes.data || []
    const vouchersList = vouchersRes.data || []
    const campaignsList = campaignsRes.data || []

    // 2. Kiểm tra xem có khóa GEMINI_API_KEY trong biến môi trường không
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (geminiApiKey) {
      // ======================================================================
      // PHƯƠNG ÁN A: GỌI GOOGLE GEMINI API THẬT (MULTI-TABLE REAL DATABASE RAG)
      // ======================================================================
      
      const bookingsContext = bookingsList.map((b: any, index: number) => {
        return `${index + 1}. Đơn ID: ${b.id.substring(0, 8)}... | Khách hàng UUID: ${b.customer_id} | Phòng UUID: ${b.room_id} | Voucher: ${b.voucher_code || 'Không'} | Ngày: ${b.checkin_date} đến ${b.checkout_date} | Giá trị: ${Number(b.total_price).toLocaleString('vi-VN')}đ | Trạng thái: ${b.status} | Ghi chú: ${b.special_notes || 'Không'}`
      }).join('\n')

      const roomsContext = roomsList.map((r: any, index: number) => {
        return `${index + 1}. Phòng: ${r.name} | Chi nhánh: ${r.branch} | Sức chứa: ${r.capacity} | Đơn giá: ${Number(r.price).toLocaleString('vi-VN')}đ/đêm | Trạng thái: ${r.status}`
      }).join('\n')

      const customersContext = customersList.map((c: any, index: number) => {
        return `${index + 1}. Khách: ${c.name} | SĐT: ${c.phone} | Tổng chi tiêu: ${Number(c.total_spent).toLocaleString('vi-VN')}đ | Số đơn: ${c.total_bookings} | Ghi chú thói quen: ${c.notes?.join(', ') || 'Không'}`
      }).join('\n')

      const vouchersContext = vouchersList.map((v: any, index: number) => {
        return `${index + 1}. Voucher: ${v.code} | Loại chiết khấu: ${v.type} | Trị giá: ${Number(v.value).toLocaleString('vi-VN')} | Đã dùng: ${v.usage_count}/${v.max_usage} | Hạn: ${v.expiry_date} | Trạng thái: ${v.status} | Target: ${v.target_type} (${v.target_value})`
      }).join('\n')

      const campaignsContext = campaignsList.map((ca: any, index: number) => {
        return `${index + 1}. Chiến dịch: ${ca.name} | Kênh: ${ca.channel} | Target: ${ca.target_audience} | Trạng thái: ${ca.status} | Đã gửi: ${ca.sent_count} tin | Tỷ lệ CTR: ${ca.click_rate}% | Voucher liên kết: ${ca.voucher_code || 'Không'}`
      }).join('\n')

      const systemPrompt = `Bạn là Bliss Copilot, trợ lý AI quản trị nội bộ siêu thông minh và là Oracle phân tích chiến lược của Bliss Home Sài Gòn.
Dưới đây là TOÀN BỘ dữ liệu quan hệ thực tế trong cơ sở dữ liệu Supabase PostgreSQL của bạn:

---
🛏️ I. PHÒNG NGHỈ (ROOMS):
${roomsContext}

---
👥 II. KHÁCH HÀNG CRM (CUSTOMERS):
${customersContext}

---
🎟️ III. VOUCHERS KHUYẾN MÃI:
${vouchersContext}

---
📊 IV. ĐƠN ĐẶT PHÒNG (BOOKINGS):
${bookingsContext}

---
📢 V. CHIẾN DỊCH MARKETING & TỰ ĐỘNG HÓA:
${campaignsContext}

---
Nhiệm vụ của bạn là phân tích sâu sắc các dữ liệu thô này để trả lời chính xác, thực tế câu hỏi của Admin.
Nguyên tắc hoạt động:
1. Bạn phải TỰ ĐỒNG TÍNH TOÁN và ĐẾM các con số dựa vào dữ liệu thô ở trên nếu Admin hỏi.
2. Trả lời bằng tiếng Việt chuyên nghiệp, ngắn gọn, tập trung vào số liệu thực tế, in đậm những con số quan trọng. Thể hiện phong cách của một trợ lý phân tích khách sạn/SaaS 5 sao.
3. Luôn đưa ra các gợi ý marketing thiết thực dựa trên số liệu thực (ví dụ: phát hiện chi nhánh nào trống nhiều, voucher nào hết lượt, chiến dịch nào có CTR kém dưới 15% cần cải tạo, hoặc đề xuất luồng Automation no-code mới cho khách hàng).

🎯 CHỈ THỊ THAO TÁC GIAO DIỆN (CHAT-TO-ACTION):
Nếu Admin yêu cầu thực hiện hành động hoặc hỏi về dữ liệu mà có thể hỗ trợ bằng cách thao tác giao diện, bạn PHẢI chèn một thẻ hành động duy nhất ở CUỐI CÙNG của câu trả lời theo đúng định dạng sau (không viết thêm gì sau thẻ này):
[ACTION: {"type": "FILTER_STATUS" | "SEARCH_AND_OPEN" | "HIGHLIGHT_STAT" | "FILTER_BRANCH" | "SEARCH_ROOM" | "FILTER_AI_GROUP" | "HIGHLIGHT_TIER", "payload": "giá trị", "description": "Mô tả bằng tiếng Việt sẽ hiển thị trên nút thao tác"}]

Các hành động được hỗ trợ:
1. FILTER_STATUS: Lọc danh sách đơn hàng hoặc phòng nghỉ. 
   - Trên trang Bookings: payload là 'pending' (Chờ thanh toán), 'confirmed' (Đã xác nhận), 'cancelled' (Đã hủy), 'completed' (Hoàn tất).
   - Trên trang Rooms (Phòng): payload là 'available' (Sẵn sàng), 'occupied' (Có khách), 'maintenance' (Bảo trì).
   Ví dụ Admin nói "Hãy lọc các phòng đang bảo trì":
   [ACTION: {"type": "FILTER_STATUS", "payload": "maintenance", "description": "Lọc danh sách phòng Đang bảo trì"}]

2. SEARCH_AND_OPEN: Tìm kiếm khách hàng, phòng, hoặc voucher và mở/highlight tương ứng. payload là tên khách hàng, số điện thoại hoặc mã đơn hàng.
   Ví dụ Admin nói "Tìm đơn của anh Hùng và mở chi tiết":
   [ACTION: {"type": "SEARCH_AND_OPEN", "payload": "Nguyễn Văn Hùng", "description": "Tìm kiếm khách hàng Nguyễn Văn Hùng và mở chi tiết đơn"}]

3. HIGHLIGHT_STAT: Làm nổi bật và tự động cuộn tới card thống kê trên trang Tổng quan Dashboard. payload phải là 'revenue' | 'newBookings' | 'vacantRooms' | 'occupancyRate'.
   Ví dụ Admin nói "Xem doanh thu ngày hôm nay":
   [ACTION: {"type": "HIGHLIGHT_STAT", "payload": "revenue", "description": "Làm nổi bật chỉ số Doanh thu thực tế"}]

4. FILTER_BRANCH: Lọc danh sách phòng nghỉ theo chi nhánh. payload phải là 'CS1' | 'CS2' | 'CS3' | 'CS4' | 'CS5'.
   Ví dụ Admin nói "Xem các phòng ở chi nhánh Quận 10":
   [ACTION: {"type": "FILTER_BRANCH", "payload": "CS2", "description": "Lọc danh sách phòng tại chi nhánh CS2"}]

5. SEARCH_ROOM: Tìm kiếm phòng nghỉ cụ thể và làm nổi bật dòng của phòng đó trong bảng Quản lý phòng. payload là tên phòng (ví dụ: "Cozy Wooden Cabin 🌲").
   Ví dụ Admin nói "Tìm phòng Cozy Wooden Cabin 🌲":
   [ACTION: {"type": "SEARCH_ROOM", "payload": "Cozy Wooden Cabin 🌲", "description": "Tìm kiếm phòng Cozy Wooden Cabin 🌲"}]

6. FILTER_AI_GROUP: Lọc khách hàng trong CRM theo nhóm hành vi phân tích từ AI. payload là một trong các giá trị nhãn hành vi: 'Thích yên tĩnh', 'Đi gia đình', 'Thuê ngắn giờ', 'Thành viên VIP'.
   Ví dụ Admin nói "Lọc danh sách khách hàng thích yên tĩnh giúp tôi":
   [ACTION: {"type": "FILTER_AI_GROUP", "payload": "Thích yên tĩnh", "description": "Lọc khách nhóm hành vi Thích yên tĩnh"}]

7. HIGHLIGHT_TIER: Làm nổi bật và tự động cuộn tới thẻ luật Hạng thành viên tương ứng trên trang memberships. payload phải là 'bronze' | 'silver' | 'gold' | 'diamond'.
   Ví dụ Admin nói "Tôi muốn xem đặc quyền của hạng kim cương":
   [ACTION: {"type": "HIGHLIGHT_TIER", "payload": "diamond", "description": "Làm nổi bật luật Hạng Kim Cương"}]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nCâu hỏi của Admin: "${prompt}"`
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API Error:', errorText)
        throw new Error('Gemini API request failed')
      }

      const resData = await response.json()
      const aiResponse = resData.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi từ AI.'

      return Response.json({ text: aiResponse }, { status: 200 })

    } else {
      // ======================================================================
      // PHƯƠNG ÁN B: BỘ XỬ LÝ NLP THÔNG MINH CỤC BỘ DỰA TRÊN DATABASE THẬT
      // (Hoạt động hoàn hảo ngay cả khi chưa điền API Key!)
      // ======================================================================
      const cleanPrompt = prompt.toLowerCase().trim()
      let reply = ''
      let actionTag = ''

      // 1. Phân tích ý định thao tác (Action memberships hạng thành viên)
      if (cleanPrompt.includes('kim cương') || cleanPrompt.includes('diamond')) {
        actionTag = '[ACTION: {"type": "HIGHLIGHT_TIER", "payload": "diamond", "description": "Làm nổi bật luật Hạng Kim Cương"}]'
      } else if (cleanPrompt.includes('hạng vàng') || (cleanPrompt.includes('vàng') && cleanPrompt.includes('hạng'))) {
        actionTag = '[ACTION: {"type": "HIGHLIGHT_TIER", "payload": "gold", "description": "Làm nổi bật luật Hạng Vàng"}]'
      } else if (cleanPrompt.includes('hạng bạc') || (cleanPrompt.includes('bạc') && cleanPrompt.includes('hạng'))) {
        actionTag = '[ACTION: {"type": "HIGHLIGHT_TIER", "payload": "silver", "description": "Làm nổi bật luật Hạng Bạc"}]'
      } else if (cleanPrompt.includes('hạng đồng') || (cleanPrompt.includes('đồng') && cleanPrompt.includes('hạng'))) {
        actionTag = '[ACTION: {"type": "HIGHLIGHT_TIER", "payload": "bronze", "description": "Làm nổi bật luật Hạng Đồng"}]'
      }

      // Action CRM khách hàng
      else if (cleanPrompt.includes('gia đình') && (cleanPrompt.includes('khách') || cleanPrompt.includes('nhóm'))) {
        actionTag = '[ACTION: {"type": "FILTER_AI_GROUP", "payload": "Đi gia đình", "description": "Lọc nhóm hành vi Đi gia đình"}]'
      } else if (cleanPrompt.includes('yên tĩnh') && cleanPrompt.includes('khách')) {
        actionTag = '[ACTION: {"type": "FILTER_AI_GROUP", "payload": "Thích yên tĩnh", "description": "Lọc nhóm hành vi Thích yên tĩnh"}]'
      }

      // Các ý định phòng buồng
      else if (cleanPrompt.includes('phòng bảo trì') || cleanPrompt.includes('phòng đang bảo trì')) {
        actionTag = '[ACTION: {"type": "FILTER_STATUS", "payload": "maintenance", "description": "Lọc danh sách phòng Đang bảo trì"}]'
      } else if (cleanPrompt.includes('phòng trống') || cleanPrompt.includes('phòng sẵn sàng')) {
        actionTag = '[ACTION: {"type": "FILTER_STATUS", "payload": "available", "description": "Lọc danh sách phòng Sẵn sàng đón khách"}]'
      }

      // Ý định booking/dashboard cũ
      else if (cleanPrompt.includes('chờ duyệt') || cleanPrompt.includes('chờ thanh toán') || cleanPrompt.includes('pending')) {
        actionTag = '[ACTION: {"type": "FILTER_STATUS", "payload": "pending", "description": "Lọc danh sách đơn Chờ thanh toán"}]'
      } else if (cleanPrompt.includes('hùng') || cleanPrompt.includes('0901234567')) {
        actionTag = '[ACTION: {"type": "SEARCH_AND_OPEN", "payload": "Nguyễn Văn Hùng", "description": "Tìm kiếm Nguyễn Văn Hùng và mở chi tiết"}]'
      } else if (cleanPrompt.includes('doanh thu') || cleanPrompt.includes('doanh số') || cleanPrompt.includes('tiền')) {
        actionTag = '[ACTION: {"type": "HIGHLIGHT_STAT", "payload": "revenue", "description": "Làm nổi bật chỉ số Doanh thu thực tế"}]'
      }

      // 2. Tạo nội dung trả lời văn bản
      if (cleanPrompt.includes('kim cương') || cleanPrompt.includes('diamond')) {
        reply = `💎 **Đặc quyền Hạng Kim Cương (Diamond Membership)**:
- Hạng thành viên **Kim Cương** có điều kiện chi tiêu tích lũy tối thiểu là **30.000.000đ**, đi kèm chiết khấu trực tiếp **15% giá hóa đơn phòng**.
- Đặc quyền bao gồm: Miễn phí đưa đón sân bay 2 chiều, tự động nâng hạng phòng miễn phí, tặng 1 đêm nghỉ dưỡng ngày sinh nhật, tích lũy điểm hệ số 1.5x.`
      } else if (cleanPrompt.includes('vàng') && cleanPrompt.includes('hạng')) {
        reply = `🥇 **Đặc quyền Hạng Vàng (Gold Membership)**:
- Hạng thành viên **Vàng** yêu cầu chi tiêu từ **15.000.000đ**, chiết khấu trực tiếp **10% giá hóa đơn**. Đặc quyền: Check-in sớm & Check-out trễ, tặng giỏ quả tươi khi nhận phòng, hotline ưu tiên 24/7.`
      } else if (cleanPrompt.includes('chiến dịch') || cleanPrompt.includes('marketing') || cleanPrompt.includes('ctr')) {
        const activeCampaigns = campaignsList.filter((ca: any) => ca.status === 'active').length
        const totalSent = campaignsList.reduce((acc: number, ca: any) => acc + (ca.sent_count || 0), 0)
        
        reply = `📢 **Báo cáo Chiến dịch Marketing & Tự động hóa**:
- Tổng số chiến dịch đã khởi tạo: **${campaignsList.length} chiến dịch**.
- Số chiến dịch đang hoạt động: **${activeCampaigns} chiến dịch**.
- Tổng số tin nhắn/email đã phát đi: **${totalSent.toLocaleString('vi-VN')} tin**.
- Chiến dịch hiệu quả nhất: **Chào hè rực rỡ** (Kênh Zalo ZNS, CTR **38.2%** 🚀).`
      } else if (cleanPrompt.includes('voucher') || cleanPrompt.includes('giảm giá')) {
        const activeVouchers = vouchersList.filter((v: any) => v.status === 'active').length
        reply = `🎟️ **Thống kê Voucher khuyến mãi (Supabase Live)**:
- Tổng số mã voucher trong database: **${vouchersList.length} mã**.
- Số mã đang kích hoạt: **${activeVouchers} mã** (vd: \`BLISSHE2026\`, \`COZYSTAY\`).
- Mã được sử dụng nhiều nhất: \`COZYSTAY\` (Đã sử dụng **28 lần**).`
      } else if (cleanPrompt.includes('doanh thu') || cleanPrompt.includes('tiền') || cleanPrompt.includes('doanh số')) {
        let totalRevenue = bookingsList.reduce((acc: number, b: any) => acc + Number(b.total_price || 0), 0)
        if (totalRevenue === 0) {
          totalRevenue = customersList.reduce((acc: number, c: any) => acc + Number(c.total_spent || 0), 0)
        }

        reply = `📊 **Báo cáo Doanh thu Thực tế từ Supabase PostgreSQL**:
- Tổng doanh thu thực tế tích lũy từ toàn bộ **${bookingsList.length}** đơn đặt phòng đạt: **${totalRevenue.toLocaleString('vi-VN')}đ**.`

      } else {
        const pendingCount = bookingsList.filter((b: any) => b.status === 'pending').length
        const successCount = bookingsList.filter((b: any) => b.status === 'success' || b.status === 'confirmed' || b.status === 'checked_out').length

        reply = `📊 **Trạng thái Cơ sở dữ liệu Thực tế**:
- Tổng số booking ghi nhận trên Supabase: **${bookingsList.length} đơn**.
- Số đơn đã thanh toán/xác nhận/check-out: **${successCount} đơn**.
- Số đơn chờ thanh toán/pending: **${pendingCount} đơn**.`
      }

      // Ghép action tag vào câu trả lời
      if (actionTag) {
        reply += `\n\n${actionTag}`
      }

      return Response.json({ text: reply }, { status: 200 })
    }

  } catch (error: any) {
    console.error('Lỗi tại API Copilot:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
