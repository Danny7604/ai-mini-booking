'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  CheckCircle2, 
  User, 
  Wrench, 
  Sparkles, 
  Clock, 
  Flame, 
  Check, 
  KeyRound, 
  Phone, 
  BookmarkPlus, 
  Plus, 
  Minus, 
  Trash2, 
  HelpCircle,
  AlertCircle,
  Coins,
  ShieldCheck,
  ClipboardList
} from 'lucide-react'

// Interface trùng khớp với định nghĩa Room của trang admin/rooms
interface Room {
  id: string
  name: string
  type: string
  branchId: 'cs1' | 'cs2' | 'cs3' | 'cs4'
  branchName: string
  status: 'available' | 'booked_not_checked_in' | 'checked_in' | 'checkout_imminent' | 'maintenance' | 'cleaning'
  price: number
  guest: string | null
  timeInfo?: string
  hourlyPrice?: number
  description?: string
  amenities?: string[]
  tags?: string[]
  imageUrl?: string
  isPublished?: boolean
  isFeatured?: boolean
}

interface RoomActionModalProps {
  room: Room
  onClose: () => void
  onSave: (
    updatedStatus: Room['status'],
    updatedGuest: string | null,
    updatedTimeInfo: string,
    updatedIsPublished: boolean,
    updatedIsFeatured: boolean
  ) => void
  onDeleteRoom?: (roomId: string, roomName: string) => void
}

interface Customer {
  id: string
  phone: string
  name: string
}

interface ServiceItem {
  id: string
  name: string
  price: number
  quantity: number
}

// Mock Database khởi tạo ban đầu theo yêu cầu
const INITIAL_MOCK_CUSTOMERS: Customer[] = [
  { id: 'C1', phone: '0901234567', name: 'Nguyễn Văn A' },
  { id: 'C2', phone: '0988888888', name: 'Trần Thị B' },
  { id: 'C3', phone: '0977665544', name: 'Lê Hoàng C' }
]

export default function RoomActionModal({ room, onClose, onSave, onDeleteRoom }: RoomActionModalProps) {
  // Quản lý CRM danh sách khách hàng cục bộ
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_MOCK_CUSTOMERS)

  // States tĩnh cột trái
  const [localStatus, setLocalStatus] = useState<Room['status']>(room.status)
  const [tempTimeInfo, setTempTimeInfo] = useState<string>(room.timeInfo || '')
  const [tempIsPublished, setTempIsPublished] = useState<boolean>(room.isPublished !== false)
  const [tempIsFeatured, setTempIsFeatured] = useState<boolean>(room.isFeatured || false)

  // States chọn giờ/ngày Check-in & Check-out kiểu dropdown
  const [tempCheckinDay, setTempCheckinDay] = useState('Hôm nay')
  const [tempCheckinTime, setTempCheckinTime] = useState('14:00')
  const [tempCheckoutDay, setTempCheckoutDay] = useState('Ngày mai')
  const [tempCheckoutTime, setTempCheckoutTime] = useState('12:00')
  const [stateChangeNote, setStateChangeNote] = useState<string>('')

  // States động cột phải (Tương tác nghiệp vụ)
  const [tempGuest, setTempGuest] = useState<string>(room.guest || '')
  const [phoneInput, setPhoneInput] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [customerFound, setCustomerFound] = useState<boolean | null>(null) // null: chưa gõ đủ, false: mới, true: cũ

  // States dịch vụ phụ thu (dùng cho trạng thái checked_in và checkout_imminent)
  const [activeServices, setActiveServices] = useState<ServiceItem[]>([
    { id: 'srv1', name: 'Nước suối tinh khiết 💧', price: 15000, quantity: 0 },
    { id: 'srv2', name: 'Coca Cola mát lạnh 🥤', price: 20000, quantity: 0 },
    { id: 'srv3', name: 'Bia Heineken thượng hạng 🍺', price: 35000, quantity: 0 },
    { id: 'srv4', name: 'Snack khoai tây Oishi 🍿', price: 25000, quantity: 0 },
    { id: 'srv5', name: 'Giặt hấp cao cấp / Bộ 👔', price: 80000, quantity: 0 },
    { id: 'srv6', name: 'Thuê xe máy tay ga / Ngày 🛵', price: 150000, quantity: 0 },
  ])

  // States phục vụ buồng phòng / dọn dẹp / bảo trì
  const [cleaningNotes, setCleaningNotes] = useState<string>('Thay ga trải giường mới, khử khuẩn bồn tắm bằng tinh dầu sả chanh.')
  const [maintenanceReason, setMaintenanceReason] = useState<string>('Sửa chữa đường dẫn bồn sục jacuzzi ngoài trời bị rò nước.')
  const [maintenanceAssignee, setMaintenanceAssignee] = useState<string>('Anh Trần Quốc Bảo (Kỹ thuật viên cs1)')
  const [maintenanceTargetStatus, setMaintenanceTargetStatus] = useState<'available' | 'cleaning'>('cleaning')

  // Phân tích timeInfo ban đầu sang dropdowns khi mở modal
  useEffect(() => {
    try {
      if (room.timeInfo) {
        const parts = room.timeInfo.split(' - ')
        if (parts.length === 2) {
          const ciParts = parts[0].split(', ')
          if (ciParts.length === 2) {
            setTempCheckinDay(ciParts[0].trim())
            setTempCheckinTime(ciParts[1].trim())
          }
          const coParts = parts[1].split(', ')
          if (coParts.length === 2) {
            let coDay = coParts[0].trim()
            if (coDay === 'Mai') coDay = 'Ngày mai'
            setTempCheckoutDay(coDay)
            setTempCheckoutTime(coParts[1].trim())
          }
        } else {
          const ciParts = room.timeInfo.split(', ')
          if (ciParts.length === 2) {
            setTempCheckinDay(ciParts[0].trim())
            setTempCheckinTime(ciParts[1].trim())
          }
        }
      }
      console.log(`[API] Đã nạp thông tin phòng: ID=${room.id}, Tên="${room.name}", Trạng thái gốc=${room.status}`)
    } catch (e) {
      console.error('[Error] Lỗi khi phân giải timeInfo gốc:', e)
    }
  }, [room])

  // Tự động tìm kiếm khách hàng khi SĐT >= 9 chữ số
  useEffect(() => {
    if (phoneInput.length >= 9) {
      handleSearchCustomer(phoneInput)
    } else {
      setCustomerFound(null)
    }
  }, [phoneInput])

  // Hàm tìm kiếm khách hàng CRM
  const handleSearchCustomer = (phone: string) => {
    try {
      setIsSearching(true)
      console.log(`[API] Đang quét CRM tìm kiếm khách hàng có SĐT: ${phone}...`)
      
      const found = customers.find(c => c.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''))
      
      setTimeout(() => {
        if (found) {
          setTempGuest(found.name)
          setCustomerFound(true)
          console.log(`[CRM Match] Đã tìm thấy khách quen: Tên="${found.name}", ID=${found.id}`)
        } else {
          setCustomerFound(false)
          console.log(`[CRM Missing] Không tìm thấy SĐT ${phone} trên CRM. Chuyển sang chế độ nhập tay khách mới.`)
        }
        setIsSearching(false)
      }, 350)
    } catch (e) {
      console.error('[Error] Lỗi khi tra cứu khách hàng CRM:', e)
      setIsSearching(false)
    }
  }

  // Tăng giảm số lượng dịch vụ
  const handleUpdateServiceQuantity = (id: string, delta: number) => {
    setActiveServices(prev => prev.map(s => {
      if (s.id === id) {
        const nextQty = Math.max(0, s.quantity + delta)
        return { ...s, quantity: nextQty }
      }
      return s
    }))
  }

  // Phụ thu tổng cộng dịch vụ
  const getServicesTotal = () => {
    return activeServices.reduce((sum, s) => sum + (s.price * s.quantity), 0)
  }

  // Tổng cộng hóa đơn cuối cùng
  const getGrandTotal = () => {
    return room.price + getServicesTotal()
  }

  // Lưu nhanh cập nhật tĩnh ở cột trái
  const handleSaveLeftStatic = () => {
    try {
      console.log('[API] Bắt đầu lưu thông tin tĩnh cột trái...')
      let finalTimeInfo = tempTimeInfo.trim()
      
      // Nếu trạng thái thuộc nhóm lưu trú, biên dịch lại chuỗi thời gian từ dropdown
      if (localStatus === 'booked_not_checked_in' || localStatus === 'checked_in' || localStatus === 'checkout_imminent') {
        const shortCoDay = tempCheckoutDay === 'Ngày mai' ? 'Mai' : tempCheckoutDay
        finalTimeInfo = `${tempCheckinDay}, ${tempCheckinTime} - ${shortCoDay}, ${tempCheckoutTime}`
      }

      // Đính kèm lý do đổi trạng thái nếu có ghi chú vận hành
      if (localStatus !== room.status && stateChangeNote.trim()) {
        finalTimeInfo = finalTimeInfo 
          ? `${finalTimeInfo} (Lý do: ${stateChangeNote.trim()})` 
          : `Lý do: ${stateChangeNote.trim()}`
      }

      const finalGuest = (localStatus === 'available' || localStatus === 'maintenance' || localStatus === 'cleaning') ? null : tempGuest || 'Khách vãng lai'
      
      onSave(localStatus, finalGuest, finalTimeInfo, tempIsPublished, tempIsFeatured)
      console.log(`[API] Đã lưu thông tin tĩnh. Trạng thái=${localStatus}, Khách=${finalGuest}, Lịch trình="${finalTimeInfo}"`)
    } catch (e) {
      console.error('[Error] Thất bại khi lưu thông tin tĩnh cột trái:', e)
      alert('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!')
    }
  }

  // --- CÁC HÀM XỬ LÝ WORKFLOW ĐỘNG CỘT PHẢI ---

  // 1. Luồng TRỐNG 🟢: Đặt phòng nhanh & CRM
  const handleCreateBookingFlow = () => {
    try {
      if (!phoneInput.trim()) {
        alert('Vui lòng điền Số điện thoại của khách hàng!')
        return
      }
      if (!tempGuest.trim()) {
        alert('Vui lòng điền Họ tên khách hàng!')
        return
      }

      console.log('--- KHỞI CHẠY TIẾN TRÌNH API ĐẶT PHÒNG NHANH ---')
      
      // 1. Nếu là khách mới, tự động lưu vào CRM giả lập
      if (customerFound === false) {
        const newCustId = `C${customers.length + 1}`
        const newCustomer: Customer = {
          id: newCustId,
          phone: phoneInput.trim(),
          name: tempGuest.trim()
        }
        setCustomers(prev => [...prev, newCustomer])
        console.log(`[API Step 1] Đã tạo mới hồ sơ khách hàng thành công: ID=${newCustId}, Tên="${tempGuest}", SĐT=${phoneInput}`)
      } else {
        console.log(`[API Step 1] Đã nhận diện khách cũ từ CRM. Bỏ qua tạo hồ sơ mới.`)
      }

      // 2. Ghép chuỗi lịch đặt phòng
      const shortCoDay = tempCheckoutDay === 'Ngày mai' ? 'Mai' : tempCheckoutDay
      const bookingTimeInfo = `${tempCheckinDay}, ${tempCheckinTime} - ${shortCoDay}, ${tempCheckoutTime}`

      // 3. Giả lập gọi API tạo Booking
      console.log(`[API Step 2] Đang khởi tạo hóa đơn đặt phòng (Bookings)...`)
      console.log(` - Phòng: ${room.name} (${room.id.substring(0, 8)})`)
      console.log(` - Khách hàng: ${tempGuest.trim()} | SĐT: ${phoneInput.trim()}`)
      console.log(` - Lịch trình: ${bookingTimeInfo}`)
      console.log(` - Đơn giá gốc: ${room.price.toLocaleString('vi-VN')} VND`)
      
      // 4. Giả lập đổi trạng thái phòng thành Đã Đặt Chưa Đến (Reserved/booked_not_checked_in)
      console.log(`[API Step 3] Đang cập nhật trạng thái buồng phòng trên sơ đồ thành "booked_not_checked_in" (Reserved)...`)
      
      // Kích hoạt callback lưu về parent và Supabase
      onSave('booked_not_checked_in', tempGuest.trim(), bookingTimeInfo, tempIsPublished, tempIsFeatured)
      
      console.log('✓ Hoàn tất luồng Đặt phòng nhanh CRM thành công!')
      onClose()
    } catch (e) {
      console.error('[Error] Thất bại trong tiến trình đặt phòng nhanh:', e)
    }
  }

  // 2. Luồng ĐÃ ĐẶT CHƯA ĐẾN 🟠: Check-in hoặc hủy
  const handleCheckinFlow = () => {
    try {
      console.log('--- KHỞI CHẠY TIẾN TRÌNH CHECK-IN NHANH ---')
      const shortCoDay = tempCheckoutDay === 'Ngày mai' ? 'Mai' : tempCheckoutDay
      const timeInfoStr = `${tempCheckinDay}, ${tempCheckinTime} - ${shortCoDay}, ${tempCheckoutTime}`

      console.log(`[API] Cập nhật trạng thái phòng ${room.id} sang "checked_in" (Đã nhận phòng)`)
      console.log(`[API] Khách nhận phòng: "${tempGuest || room.guest}" lúc ${new Date().toLocaleTimeString()}`)
      
      onSave('checked_in', tempGuest || room.guest || 'Khách vãng lai', timeInfoStr, tempIsPublished, tempIsFeatured)
      onClose()
    } catch (e) {
      console.error('[Error] Lỗi check-in:', e)
    }
  }

  const handleCancelBookingFlow = () => {
    try {
      if (!confirm(`Bạn có chắc chắn muốn HỦY ĐƠN ĐẶT PHÒNG của khách "${tempGuest || room.guest}" không?`)) return
      console.log('--- KHỞI CHẠY TIẾN TRÌNH HỦY BOOKING ---')
      console.log(`[API] Giải phóng đơn đặt phòng ${room.id}. Hủy giữ chỗ.`)
      console.log(`[API] Đổi trạng thái phòng thành "available" (Trống) và dọn sạch dữ liệu khách.`)
      
      onSave('available', null, 'Tặng kèm trà chiều ☕', tempIsPublished, tempIsFeatured)
      onClose()
    } catch (e) {
      console.error('[Error] Lỗi hủy booking:', e)
    }
  }

  // 3. Luồng ĐÃ CHECK-IN 🟣: Thêm dịch vụ / Check-out
  const handleProceedCheckoutFlow = () => {
    try {
      console.log('--- KHỞI CHẠY YÊU CẦU TIẾN HÀNH CHECK-OUT ---')
      console.log(`[API] Đang kết chuyển trạng thái phòng sang "checkout_imminent" (Sắp check-out)...`)
      
      // Đồng bộ thời gian trả phòng hiện tại
      const shortCoDay = tempCheckoutDay === 'Ngày mai' ? 'Mai' : tempCheckoutDay
      const timeInfoStr = `${tempCheckinDay}, ${tempCheckinTime} - ${shortCoDay}, ${tempCheckoutTime}`
      
      setLocalStatus('checkout_imminent') // Chuyển state UI sang tab bill thanh toán để nhân viên kiểm tra luôn!
      console.log('[UI Switch] Đã chuyển tiếp sang bảng hóa đơn thanh toán mini.')
    } catch (e) {
      console.error('[Error] Lỗi chuyển sang check-out:', e)
    }
  }

  // 4. Luồng ĐANG CHECK-OUT 🔴: Thanh toán & dọn dẹp
  const handleCompletePaymentFlow = () => {
    try {
      console.log('--- KHỞI CHẠY TIẾN TRÌNH HOÀN TẤT THANH TOÁN ---')
      console.log(`[API] Ghi nhận giao dịch thanh toán thành công:`)
      console.log(` - Khách hàng: ${tempGuest || room.guest}`)
      console.log(` - Tiền phòng: ${room.price.toLocaleString('vi-VN')} VND`)
      console.log(` - Tiền dịch vụ phụ thu: ${getServicesTotal().toLocaleString('vi-VN')} VND`)
      console.log(` - Tổng doanh thu thu về: ${getGrandTotal().toLocaleString('vi-VN')} VND`)
      console.log(`[API] In hóa đơn điện tử & gửi email VAT cho khách hàng.`)
      console.log(`[API] Chuyển đổi trạng thái buồng phòng sang "cleaning" (Chờ dọn dẹp)...`)
      
      onSave('cleaning', null, '14:30', tempIsPublished, tempIsFeatured)
      onClose()
    } catch (e) {
      console.error('[Error] Lỗi hoàn tất thanh toán:', e)
    }
  }

  // 5. Luồng ĐANG DỌN DẸP ⚪: Hoàn thành dọn dẹp
  const handleCompleteCleaningFlow = () => {
    try {
      console.log('--- KHỞI CHẠY BÁO CÁO HOÀN TẤT DỌN DẸP ---')
      console.log(`[Housekeeping Note]: "${cleaningNotes}"`)
      console.log(`[API] Xác nhận buồng phòng sạch sẽ đạt chuẩn 5 sao.`)
      console.log(`[API] Trả trạng thái phòng về "available" (Sẵn sàng đón khách mới)`)
      
      onSave('available', null, 'Tặng kèm nước hoa quả 🍹', tempIsPublished, tempIsFeatured)
      onClose()
    } catch (e) {
      console.error('[Error] Lỗi hoàn thành dọn dẹp:', e)
    }
  }

  // 6. Luồng ĐANG BẢO TRÌ 🔵: Hoàn tất bảo trì
  const handleCompleteMaintenanceFlow = () => {
    try {
      console.log('--- KHỞI CHẠY BÁO CÁO HOÀN TẤT BẢO TRÌ ---')
      console.log(`[Maintenance Log]: Lý do: "${maintenanceReason}", Người phụ trách: "${maintenanceAssignee}"`)
      console.log(`[API] Hệ thống kỹ thuật đã nghiệm thu an toàn thiết bị.`)
      console.log(`[API] Chuyển tiếp trạng thái phòng sang: ${maintenanceTargetStatus === 'cleaning' ? 'Đang dọn dẹp (cleaning)' : 'Sẵn sàng bán (available)'}`)
      
      onSave(maintenanceTargetStatus, null, maintenanceTargetStatus === 'cleaning' ? '12:00' : 'Tặng kèm trà chiều ☕', tempIsPublished, tempIsFeatured)
      onClose()
    } catch (e) {
      console.error('[Error] Lỗi hoàn tất bảo trì:', e)
    }
  }

  // --- HÀM RENDER DYNAMIC RIGHT PANEL (BỘ NÃO CHUYỂN ĐỔI WORKFLOW CỦA POPUP) ---
  const renderDynamicRightPanel = () => {
    switch (localStatus) {
      
      // 🟢 TRẠNG THÁI 1: PHÒNG TRỐNG (AVAILABLE)
      case 'available':
        return (
          <div className="flex flex-col gap-4.5 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookmarkPlus size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Quy Trình CRM Đặt Phòng Nhanh</h4>
                <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5">Nhập SĐT để tự động nhận diện khách hàng cũ/mới</span>
              </div>
            </div>

            {/* Ô nhập Số điện thoại */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider flex items-center gap-1">
                <Phone size={11} className="text-zinc-400 dark:text-zinc-500" /> Số Điện Thoại Khách Hàng:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ví dụ: 0901234567..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                />
                <Search size={13} className="absolute left-3.5 top-3.5 text-zinc-400 dark:text-zinc-500" />
                {isSearching && (
                  <span className="absolute right-3.5 top-3.5 text-[9px] font-bold text-sky-600 animate-pulse">
                    Đang quét CRM...
                  </span>
                )}
              </div>
            </div>

            {/* Thông báo trạng thái CRM của khách hàng */}
            {phoneInput.length >= 9 && (
              <div className="animate-in zoom-in-95 duration-200">
                {customerFound === true ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-900 dark:text-emerald-300">
                    <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block text-emerald-800">✓ Khách hàng cũ thành viên</span>
                      <p className="text-[9.5px] font-semibold mt-0.5 leading-snug">Hệ thống đã nhận diện thông tin hồ sơ. Tên khách được tự động khớp!</p>
                    </div>
                  </div>
                ) : customerFound === false ? (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-900 dark:text-amber-300">
                    <AlertCircle size={16} className="text-orange-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block text-amber-900 dark:text-amber-300">⚠️ Khách hàng mới tinh</span>
                      <p className="text-[9.5px] font-semibold mt-0.5 leading-snug">Số điện thoại chưa có trên hệ thống. Xin vui lòng nhập tay Họ tên bên dưới để tạo mới.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Ô nhập Họ Tên Khách Hàng */}
            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top duration-150">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider flex items-center gap-1">
                <User size={11} className="text-zinc-400 dark:text-zinc-500" /> Họ và Tên Khách Hàng:
              </label>
              <input
                type="text"
                value={tempGuest}
                disabled={customerFound === true}
                onChange={(e) => setTempGuest(e.target.value)}
                placeholder="Nhập đầy đủ họ tên..."
                className={`w-full border rounded-xl px-4 py-2.5 text-xs font-extrabold focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 ${
                  customerFound === true 
                    ? 'bg-emerald-50/30 border-emerald-200 text-zinc-900 dark:text-zinc-100 font-black' 
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200'
                }`}
              />
            </div>

            {/* Biểu mẫu chọn thời gian lưu trú nhanh */}
            <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 flex flex-col gap-3">
              <span className="text-[9.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                📅 Lịch trình đặt chỗ dự kiến:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">🛫 Ngày check-in:</label>
                  <select
                    value={tempCheckinDay}
                    onChange={(e) => setTempCheckinDay(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none"
                  >
                    <option value="Hôm nay">Hôm nay</option>
                    <option value="Ngày mai">Ngày mai</option>
                    <option value="Tuần sau">Tuần sau</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">⏰ Giờ check-in:</label>
                  <select
                    value={tempCheckinTime}
                    onChange={(e) => setTempCheckinTime(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none"
                  >
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nút hành động nghiệp vụ đặt phòng */}
            <button
              onClick={handleCreateBookingFlow}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 border-none cursor-pointer text-white active:scale-95 duration-200 ${
                customerFound === true 
                  ? 'bg-emerald-700 hover:bg-emerald-600' 
                  : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950'
              }`}
            >
              <BookmarkPlus size={14} className="stroke-[3.5]" />
              <span>{customerFound === true ? 'Xác nhận Đặt phòng (Thành viên)' : 'Tạo Khách Mới & Xác nhận Đặt phòng'}</span>
            </button>
          </div>
        )

      // 🟠 TRẠNG THÁI 2: ĐÃ ĐẶT CHƯA ĐẾN (RESERVED)
      case 'booked_not_checked_in':
        return (
          <div className="flex flex-col gap-4.5 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Xác Nhận Khách Đến Check-In</h4>
                <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5">Khách đã đặt giữ phòng trước, sẵn sàng nhận phòng</span>
              </div>
            </div>

            {/* Khung thông tin thẻ đặt chỗ */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-extrabold text-sm shadow-inner">
                  {tempGuest ? tempGuest[0].toUpperCase() : 'K'}
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">{tempGuest || room.guest || 'Khách chưa cập nhật tên'}</h5>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5">🏷️ Mã đơn: MOCK-BKG-992</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-dashed border-amber-500/20 pt-3 text-[10.5px]">
                <div>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Giờ đón dự kiến (ETA):</span>
                  <strong className="text-amber-900 dark:text-amber-300 font-black flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> {tempCheckinDay}, {tempCheckinTime}
                  </strong>
                </div>
                 <div>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Trạng thái đặt cọc:</span>
                  <span className="inline-flex items-center gap-1 mt-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md">
                    ✓ Đã chuyển cọc 50%
                  </span>
                </div>
              </div>
            </div>

            {/* Nút hành động nghiệp vụ */}
            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={handleCheckinFlow}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 border-none cursor-pointer active:scale-95 duration-200"
              >
                <CheckCircle2 size={14} className="stroke-[3]" />
                <span>Xác nhận Check-in (Khách nhận phòng)</span>
              </button>

              <button
                onClick={handleCancelBookingFlow}
                className="w-full py-3 bg-red-50 dark:bg-rose-950/20 hover:bg-red-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border border-rose-500/20 dark:border-rose-800/30 cursor-pointer active:scale-95 duration-200"
              >
                <Trash2 size={13} />
                <span>Hủy Đơn Đặt Phòng này</span>
              </button>
            </div>
          </div>
        )

      // 🟣 TRẠNG THÁI 3: ĐÃ CHECK-IN (OCCUPIED)
      case 'checked_in':
        return (
          <div className="flex flex-col gap-4.5 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <User size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Quản Lý Phụ Thu Dịch Vụ</h4>
                <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5">Khách đang lưu trú. Thêm dịch vụ tiêu dùng và chuẩn bị check-out</span>
              </div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping flex-shrink-0" />
              <span>Khách lưu trú hiện tại: <strong className="font-extrabold text-stone-900">{tempGuest || room.guest || 'Khách vãng lai'}</strong></span>
            </div>

            {/* BẢNG TÍCH CHỌN DỊCH VỤ MINI-BAR & GIẶT ỦI */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[9.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                <ClipboardList size={12} /> Bảng kê dịch vụ tiêu dùng (Mini-Bar / Tiện ích):
              </span>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-[180px] overflow-y-auto bg-white dark:bg-zinc-950">
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase">
                      <th className="px-3.5 py-2">Dịch vụ</th>
                      <th className="px-3 py-2 text-right">Đơn giá</th>
                      <th className="px-3.5 py-2 text-center w-28">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-semibold text-zinc-700 dark:text-zinc-300">
                    {activeServices.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50/50 dark:bg-zinc-900/50">
                        <td className="px-3.5 py-2.5 font-bold text-zinc-900 dark:text-zinc-100">{s.name}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-zinc-600 dark:text-zinc-400">{s.price.toLocaleString('vi-VN')}đ</td>
                        <td className="px-3.5 py-1 text-center">
                          <div className="inline-flex items-center gap-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800">
                            <button
                              type="button"
                              onClick={() => handleUpdateServiceQuantity(s.id, -1)}
                              className="w-5 h-5 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 rounded-md flex items-center justify-center cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-black text-zinc-900 dark:text-zinc-100 w-3">{s.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateServiceQuantity(s.id, 1)}
                              className="w-5 h-5 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 rounded-md flex items-center justify-center cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phụ thu tạm tính */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
              <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[9px]">Tổng phụ thu dịch vụ:</span>
              <span className="text-zinc-900 dark:text-zinc-50 font-black font-mono text-[13px]">+{getServicesTotal().toLocaleString('vi-VN')} VND</span>
            </div>

            {/* Nút hành động */}
            <button
              onClick={handleProceedCheckoutFlow}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 border-none cursor-pointer mt-1.5 active:scale-95 duration-200"
            >
              <Coins size={14} />
              <span>Tiến hành Check-out (Tính bill thanh toán)</span>
            </button>
          </div>
        )

      // 🔴 TRẠNG THÁI 4: ĐANG CHECK-OUT / CHUẨN BỊ THANH TOÁN (CHECKOUT_IMMINENT)
      case 'checkout_imminent':
        return (
          <div className="flex flex-col gap-4.5 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Coins size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Hóa Đơn Thanh Toán Tổng Hợp</h4>
                <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5">Xác nhận thu tiền phòng và phụ thu dịch vụ trước khi trả phòng</span>
              </div>
            </div>

            {/* BẢNG TÓM TẮT BILL MINI */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between text-[9.5px] font-black uppercase text-zinc-400 dark:text-zinc-500">
                <span>Diễn giải hóa đơn</span>
                <span>Thành tiền</span>
              </div>
              
              <div className="p-4 flex flex-col gap-3 text-xs">
                {/* 1. Tiền phòng */}
                <div className="flex items-center justify-between font-semibold">
                  <div className="text-zinc-700 dark:text-zinc-300">
                    <span className="font-black text-zinc-900 dark:text-zinc-100">🏡 Giá phòng cơ bản</span>
                    <span className="block text-[9.5px] text-zinc-400 dark:text-zinc-500 mt-0.5">{room.name} ({room.type})</span>
                  </div>
                  <span className="font-mono text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-bold">{room.price.toLocaleString('vi-VN')}đ</span>
                </div>

                {/* 2. Tiền các dịch vụ phát sinh */}
                {activeServices.filter(s => s.quantity > 0).length > 0 ? (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-col gap-2.5">
                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">🛵 Phụ thu tiện ích phát sinh:</span>
                    {activeServices.filter(s => s.quantity > 0).map(s => (
                      <div key={s.id} className="flex items-center justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 pl-2">
                        <span>{s.name.split(' ')[0]} {s.name.substring(s.name.indexOf(' '))} <span className="font-mono text-zinc-400 dark:text-zinc-500 text-[10px]">x{s.quantity}</span></span>
                        <span className="font-mono">{(s.price * s.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 italic">
                    Không có phụ thu dịch vụ phát sinh.
                  </div>
                )}

                {/* 3. Tổng kết hóa đơn */}
                <div className="border-t-2 border-double border-zinc-200 dark:border-zinc-800 pt-3.5 mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Tổng cộng cần thanh toán:</span>
                  <span className="text-rose-700 dark:text-rose-400 font-black font-mono text-[16px] underline decoration-double decoration-rose-300 dark:decoration-rose-900/50">
                    {getGrandTotal().toLocaleString('vi-VN')} VND
                  </span>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <button
              onClick={handleCompletePaymentFlow}
              className="w-full py-3 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 border-none cursor-pointer mt-1 active:scale-95 duration-200"
            >
              <CheckCircle2 size={14} className="stroke-[3]" />
              <span>Hoàn tất Thanh toán & Khách rời đi ✓</span>
            </button>
          </div>
        )

      // ⚪ TRẠNG THÁI 5: ĐANG DỌN DẸP (CLEANING)
      case 'cleaning':
        return (
          <div className="flex flex-col gap-4.5 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                <Sparkles size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Nhiệm Vụ Dọn Buồng Phòng</h4>
                <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5">Nhập ghi chú chỉ dẫn cho nhân viên buồng phòng dọn dẹp</span>
              </div>
            </div>

            {/* Textarea nhập ghi chú dọn dẹp */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider flex items-center gap-1">
                <ClipboardList size={11} className="text-zinc-400 dark:text-zinc-500" /> Chỉ dẫn dọn phòng chi tiết:
              </label>
              <textarea
                rows={4}
                value={cleaningNotes}
                onChange={(e) => setCleaningNotes(e.target.value)}
                placeholder="Nhập yêu cầu: Thay ga giường, khử khuẩn, đặt nến thơm..."
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-700 dark:text-zinc-300 resize-none"
              />
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
              <AlertCircle size={14} className="text-zinc-900 dark:text-zinc-50 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">Khi hoàn tất dọn dẹp, phòng nghỉ sẽ tự động quay về trạng thái Trống sẵn sàng (available) và cập nhật hiển thị đồng bộ lên Booking công cộng.</p>
            </div>

            {/* Nút hành động dọn dẹp xong */}
            <button
              onClick={handleCompleteCleaningFlow}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 border-none cursor-pointer mt-1 active:scale-95 duration-200"
            >
              <Sparkles size={14} className="stroke-[2.5]" />
              <span>Dọn dẹp hoàn tất (Trả phòng trống)</span>
            </button>
          </div>
        )

      // 🔵 TRẠNG THÁI 6: ĐANG BẢO TRÌ (MAINTENANCE)
      case 'maintenance':
        return (
          <div className="flex flex-col gap-4.5 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Wrench size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Theo Dõi Khắc Phục Sự Cố Kỹ Thuật</h4>
                <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5">Ghi nhận thông tin bảo dưỡng thiết bị buồng phòng</span>
              </div>
            </div>

            {/* Ô nhập Lý do bảo trì */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">
                🛠️ Lý do sự cố cần bảo trì:
              </label>
              <input
                type="text"
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                placeholder="Ví dụ: Rò nước đường ống bồn tắm, hỏng điều hòa..."
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-700 dark:text-zinc-300"
              />
            </div>

            {/* Ô nhập Người phụ trách */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">
                👤 Kỹ thuật viên / Người phụ trách:
              </label>
              <input
                type="text"
                value={maintenanceAssignee}
                onChange={(e) => setMaintenanceAssignee(e.target.value)}
                placeholder="Ví dụ: Anh Nguyễn Văn Minh (Tổ kỹ thuật)..."
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-700 dark:text-zinc-300"
              />
            </div>

            {/* Cho phép chọn trạng thái đích sau khi sửa xong */}
            <div className="bg-zinc-50/40 dark:bg-zinc-900/40 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
              <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">🎯 Sau khi sửa đổi xong, chuyển phòng sang:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="maint_dest"
                    checked={maintenanceTargetStatus === 'cleaning'}
                    onChange={() => setMaintenanceTargetStatus('cleaning')}
                    className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span>Dọn dẹp lại buồng phòng</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="maint_dest"
                    checked={maintenanceTargetStatus === 'available'}
                    onChange={() => setMaintenanceTargetStatus('available')}
                    className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span>Sẵn sàng phục vụ ngay</span>
                </label>
              </div>
            </div>

            {/* Nút hành động */}
            <button
              onClick={handleCompleteMaintenanceFlow}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 border-none cursor-pointer mt-1 active:scale-95 duration-200"
            >
              <Wrench size={14} className="stroke-[2.5]" />
              <span>Nghiệm thu hoàn tất (Giải phóng bảo trì)</span>
            </button>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-500">
            <HelpCircle size={32} className="stroke-[1.5]" />
            <span className="text-[11px] font-bold mt-2">Đang tải cấu trúc nghiệp vụ...</span>
          </div>
        )
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 w-full max-w-4xl rounded-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng chéo ở góc */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-stone-200 border-none w-7 h-7 rounded-full flex items-center justify-center transition font-bold cursor-pointer"
        >
          ✕
        </button>

        {/* TIÊU ĐỀ POPUP THƯỢNG HẠNG */}
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
            <CheckCircle2 size={18} className="stroke-[3]" />
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight leading-none">Bliss Home Room Operations</h3>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider block mt-1">
              Phòng: <strong className="text-zinc-900 dark:text-zinc-50 font-black">{room.name}</strong> • Chi nhánh: {room.branchName}
            </span>
          </div>
        </div>

        {/* LAYOUT 2 CỘT QUY TRÌNH HẠNG SANG */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-8 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          
          {/* CỘT TRÁI (TĨNH - 40%): CÀI ĐẶT THUỘC TÍNH CƠ BẢN */}
          <div className="flex flex-col gap-4 text-xs pb-5 md:pb-0 md:col-span-4">
            <h4 className="font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-1.5 text-zinc-900 dark:text-zinc-50">
              🛠️ Trạng thái & Quảng bá
            </h4>

            {/* Dropdown thay đổi trạng thái gốc */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Trạng thái cơ bản:</label>
              <select
                value={localStatus}
                onChange={(e) => {
                  setLocalStatus(e.target.value as any)
                  console.log(`[Status Switch] Người dùng đổi trạng thái tĩnh cột trái sang: ${e.target.value}`)
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 cursor-pointer"
              >
                <option value="available">🟢 Trống / Available</option>
                <option value="booked_not_checked_in">🟠 Đã Đặt Chưa Đến (Reserved)</option>
                <option value="checked_in">💗 Đã Check-In (Occupied)</option>
                <option value="checkout_imminent">🔴 Sắp Check-Out ⚠️ (Checking-out)</option>
                <option value="maintenance">🔵 Đang Bảo Trì (Maintenance)</option>
                <option value="cleaning">⚪ Đang Dọn Dẹp (Cleaning)</option>
              </select>
            </div>

            {/* Lịch trình dự kiến (Ghi chú phụ) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">
                {localStatus === 'available' ? 'Ghi chú phục vụ (Tùy chọn):' :
                 localStatus === 'maintenance' ? 'Ghi chú kỹ thuật:' : 'Chu kỳ thời gian lưu trú:'}
              </label>
              
              {/* Nếu là các trạng thái lưu trú, hiện dropdown để chỉnh thời gian cho chuyên nghiệp */}
              {(localStatus === 'booked_not_checked_in' || localStatus === 'checked_in' || localStatus === 'checkout_imminent') ? (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2 font-semibold">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400 dark:text-zinc-500">🛫 Ngày & Giờ In:</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">{tempCheckinDay}, {tempCheckinTime}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-2 text-[10px]">
                    <span className="text-zinc-400 dark:text-zinc-500">🛬 Ngày & Giờ Out:</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">{tempCheckoutDay}, {tempCheckoutTime}</span>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={tempTimeInfo}
                  onChange={(e) => setTempTimeInfo(e.target.value)}
                  placeholder={
                    localStatus === 'available' ? 'Tặng kèm nước quả 🍹...' :
                    localStatus === 'maintenance' ? 'Sửa đường dẫn bồn sục...' : 'Ví dụ: 14:30...'
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-700 dark:text-zinc-300"
                />
              )}
            </div>

            {/* Checkbox Hiển thị & Quảng bá trên Booking công cộng */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Hiển thị & Quảng bá:</label>
              <div className="flex flex-col gap-2.5 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800/50">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempIsPublished}
                    onChange={(e) => {
                      setTempIsPublished(e.target.checked)
                      if (!e.target.checked) setTempIsFeatured(false)
                    }}
                    className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                  <span>🌐 Công khai phòng trên Booking</span>
                </label>

                <label className={`flex items-center gap-2 text-xs font-bold transition cursor-pointer ${tempIsPublished ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700 pointer-events-none'}`}>
                  <input
                    type="checkbox"
                    checked={tempIsFeatured}
                    disabled={!tempIsPublished}
                    onChange={(e) => setTempIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                  <span>🔥 Đẩy lên nhóm Nổi Bật</span>
                </label>
              </div>
            </div>

            {/* Lý do chuyển trạng thái phòng (Chỉ hiển thị khi localStatus khác room.status) */}
            {localStatus !== room.status && (
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top duration-200">
                <label className="text-[9.5px] text-orange-600 font-black uppercase tracking-wider flex items-center gap-1">
                  ⚠️ Lý do chuyển trạng thái:
                </label>
                <textarea
                  rows={2}
                  value={stateChangeNote}
                  onChange={(e) => setStateChangeNote(e.target.value)}
                  placeholder="Ví dụ: Đổi phòng từ P-102 sang vì hỏng điều hòa, nâng cấp cho khách VIP..."
                  className="w-full bg-orange-50/20 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500 text-zinc-700 dark:text-zinc-300 resize-none"
                />
              </div>
            )}

            {/* Nút hành động Cột Trái: Lưu thông số tĩnh nhanh */}
            <button
              onClick={handleSaveLeftStatic}
              className={`w-fit px-6 py-2.5 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 border-none cursor-pointer mt-1 active:scale-95 mx-auto ${
                localStatus !== room.status
                  ? 'bg-orange-600 hover:bg-orange-500 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950'
              }`}
            >
              <Check size={13} className="stroke-[3]" />
              <span>{localStatus !== room.status ? 'Xác Nhận Đổi Trạng Thái' : 'Lưu Thuộc Tính Cơ Bản'}</span>
            </button>
          </div>

          {/* CỘT PHẢI (ĐỘNG - DYNAMIC ZONE - 60%): LOGIC NGHIỆP VỤ BIẾN ĐỔI THEO TRẠNG THÁI */}
          <div className="flex flex-col gap-4 text-xs pt-5 md:pt-0 md:pl-8 md:col-span-6">
            {renderDynamicRightPanel()}
          </div>

        </div>

        {/* NÚT KHU VỰC NGUY HIỂM & ĐÓNG Ở CUỐI TRANG POPUP */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex items-center justify-between">
          {onDeleteRoom ? (
            <button
              onClick={() => onDeleteRoom(room.id, room.name)}
              className="bg-red-50 hover:bg-red-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 hover:border-red-600 px-4 py-2.5 rounded-xl font-black text-[10.5px] cursor-pointer flex items-center gap-1.5 transition-all duration-200 active:scale-95"
            >
              <Trash2 size={12} />
              <span>Xóa phòng khỏi hệ thống</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-stone-200 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-[11px] transition border-none cursor-pointer"
          >
            Đóng lại
          </button>
        </div>

      </div>
    </div>
  )
}
