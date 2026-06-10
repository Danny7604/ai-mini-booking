'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { 
  Search, 
  Check, 
  X, 
  Eye, 
  Phone, 
  Sparkles,
  FileText,
  AlertCircle
} from 'lucide-react'

// Cấu trúc dữ liệu đơn Booking
interface Booking {
  id: string
  customerName: string
  phone: string
  branch: string
  roomName: string
  checkIn: string
  checkOut: string
  totalAmount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  notes?: string
}

// 1. Khởi tạo mảng MOCK_BOOKINGS chất lượng cao theo đúng chuẩn Bliss Home
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BLISS-783912',
    customerName: 'Nguyễn Văn Hùng',
    phone: '0901234567',
    branch: 'Bliss Home - Tân Bình (CS1) 🏡',
    roomName: 'Pine Forest Loft (Tân Bình CS1)',
    checkIn: '30/05/2026 14:00',
    checkOut: '31/05/2026 12:00',
    totalAmount: 1080000,
    status: 'confirmed',
    createdAt: '29/05/2026 10:15',
    notes: 'Khách cần chuẩn bị bồn tắm gỗ Hinoki thơm nhẹ ngoài ban công.'
  },
  {
    id: 'BLISS-982736',
    customerName: 'Trần Thị Mai',
    phone: '0987654321',
    branch: 'Bliss Home - Quận 10 (CS2) 🏙️',
    roomName: 'Valley View Suite (Quận 10 CS2)',
    checkIn: '30/05/2026 15:30',
    checkOut: '30/05/2026 18:30',
    totalAmount: 540000,
    status: 'pending',
    createdAt: '30/05/2026 08:42',
    notes: 'Thuê theo giờ (3 tiếng). Khách yêu cầu setup máy chiếu HD và Netflix sẵn.'
  },
  {
    id: 'BLISS-451928',
    customerName: 'Phan Minh Anh',
    phone: '0912345678',
    branch: 'Bliss Home - Quận 5 (CS3) 🪟',
    roomName: 'Cozy Wooden Cabin (Quận 5 CS3)',
    checkIn: '02/06/2026 14:00',
    checkOut: '04/06/2026 12:00',
    totalAmount: 3960000,
    status: 'confirmed',
    createdAt: '28/05/2026 15:30',
    notes: 'Gia đình đi nghỉ mát. Cần chuẩn bị bếp nướng BBQ ngoài ban công.'
  },
  {
    id: 'BLISS-829103',
    customerName: 'Lê Hoàng Hải',
    phone: '0933445566',
    branch: 'Bliss Home - Quận 10 (CS2) 🏙️',
    roomName: 'Sunset Panorama (Quận 10 CS2)',
    checkIn: '29/05/2026 14:00',
    checkOut: '30/05/2026 12:00',
    totalAmount: 2900000,
    status: 'completed',
    createdAt: '25/05/2026 09:00',
    notes: 'Khách VIP dắt gia đình đi bơi nghỉ dưỡng hoàng hôn.'
  },
  {
    id: 'BLISS-672514',
    customerName: 'Phạm Quỳnh Chi',
    phone: '0999887766',
    branch: 'Bliss Home - Gò Vấp (CS4) 🌸',
    roomName: 'Sunlit Glass House (Gò Vấp CS4)',
    checkIn: '30/05/2026 16:00',
    checkOut: '30/05/2026 18:00',
    totalAmount: 300000,
    status: 'cancelled',
    createdAt: '30/05/2026 11:20',
    notes: 'Khách trùng lịch đột xuất xin hủy đơn thuê theo giờ.'
  }
]

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null) // State phục vụ xem chi tiết đơn hàng

  // Đọc tham số tìm kiếm từ URL khi tải trang lần đầu (Bảo mật Hydration sạch sẽ)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('search')
      if (q) {
        setSearchTerm(decodeURIComponent(q))
      }
    }
  }, [])

  // Hiệu ứng phát sáng tự động (Copilot Highlights)
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null)
  const [highlightedTab, setHighlightedTab] = useState<string | null>(null)

  // Nạp dữ liệu thực tế từ Supabase
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const { data: dbBookings, error } = await supabase
          .from('bookings')
          .select('*, customers(*), rooms(*)')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (dbBookings && dbBookings.length > 0) {
          const mappedBookings: Booking[] = dbBookings.map((b: any) => ({
            id: b.id, // giữ UUID làm ID chính xác
            customerName: b.customers?.name || 'Khách vãng lai',
            phone: b.customers?.phone || 'Chưa cập nhật',
            branch: b.rooms?.branch || 'Chi nhánh Sài Gòn 🏡',
            roomName: b.rooms?.name || 'Phòng nghỉ Bliss Home',
            checkIn: new Date(b.checkin_date).toLocaleDateString('vi-VN') + ' 14:00',
            checkOut: new Date(b.checkout_date).toLocaleDateString('vi-VN') + ' 12:00',
            totalAmount: Number(b.total_price),
            status: b.status === 'checked_out' || b.status === 'completed' ? 'completed' 
                  : b.status === 'confirmed' ? 'confirmed' 
                  : b.status === 'cancelled' ? 'cancelled' 
                  : 'pending',
            createdAt: new Date(b.created_at).toLocaleDateString('vi-VN') + ' ' + new Date(b.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            notes: b.special_notes || ''
          }))
          setBookings(mappedBookings)
        } else {
          setBookings(MOCK_BOOKINGS)
        }
      } catch (err) {
        console.warn('[Supabase Bookings Fetch] Fallback active:', err)
        setBookings(MOCK_BOOKINGS)
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  // LẮNG NGHE SỰ KIỆN TỪ BLISS COPILOT AI (CHAT-TO-ACTION)
  useEffect(() => {
    const handleAdminAction = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: string
        payload: string
        description: string
      }>
      if (!customEvent.detail) return

      const { type, payload } = customEvent.detail

      if (type === 'FILTER_STATUS') {
        const targetStatus = payload as any
        setStatusFilter(targetStatus)
        setHighlightedTab(targetStatus)
        setTimeout(() => setHighlightedTab(null), 3000)
      } 
      else if (type === 'SEARCH_AND_OPEN') {
        setSearchTerm(payload)
        
        // Tự động tìm kiếm đơn khớp nhất và mở modal chi tiết
        const lowercasePayload = payload.toLowerCase().trim()
        const found = bookings.find(b => 
          b.customerName.toLowerCase().includes(lowercasePayload) ||
          b.phone.includes(lowercasePayload) ||
          b.id.toLowerCase().includes(lowercasePayload) ||
          b.roomName.toLowerCase().includes(lowercasePayload)
        )

        if (found) {
          setSelectedBooking(found)
          setHighlightedBookingId(found.id)
          // Xóa highlight sau 4 giây
          setTimeout(() => setHighlightedBookingId(null), 4000)
        }
      }
    }

    window.addEventListener('bliss-admin-action', handleAdminAction)
    return () => {
      window.removeEventListener('bliss-admin-action', handleAdminAction)
    }
  }, [bookings])

  /**
   * Hàm xử lý Cập nhật Trạng thái Đơn hàng
   * Áp dụng Optimistic UI Update để cập nhật ngay lập tức giao diện người dùng
   */
  const handleUpdateStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    const originalBookings = [...bookings]

    try {
      // 1. [Optimistic Update]: Cập nhật trực tiếp state ngay lập tức
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      )

      // 2. Cập nhật trực tiếp vào Supabase database
      const supabase = getSupabase()
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

    } catch (error: any) {
      console.error(`Lỗi khi cập nhật trạng thái đơn ${bookingId}:`, error)
      setBookings(originalBookings)
      alert(`Sự cố cập nhật trạng thái đơn. Lỗi: ${error.message || error}`)
    }
  }

  // Logic lọc tìm kiếm nâng cao (Tìm theo Tên, Số điện thoại hoặc Mã đơn hàng + Lọc trạng thái)
  const filteredBookings = bookings.filter(b => {
    const query = searchTerm.toLowerCase().trim()
    const matchSearch = !query || (
      b.id.toLowerCase().includes(query) ||
      b.customerName.toLowerCase().includes(query) ||
      b.phone.includes(query) ||
      b.roomName.toLowerCase().includes(query)
    )

    const matchStatus = statusFilter === 'all' || b.status === statusFilter

    return matchSearch && matchStatus
  })

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + 'đ'
  }

  // Lấy số lượng tương ứng cho các tab
  const getCount = (status: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    if (status === 'all') return bookings.length
    return bookings.filter(b => b.status === status).length
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative text-zinc-700 dark:text-zinc-300">
      
      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/60 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
            Quản Lý Đơn Booking
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5 animate-in fade-in">
            Xem lịch trình, kiểm soát trạng thái đơn hàng và duyệt lịch đặt phòng của khách.
          </p>
        </div>

        {/* SEARCH BAR (BỘ LỌC TÌM KIẾM ĐẦU TRANG) */}
        <div className="relative w-full md:w-80 flex-shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã đơn..."
            className="w-full bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-800 dark:text-zinc-200 transition"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {/* BỘ LỌC TRẠNG THÁI (STATUS FILTER TABS) */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'Tất cả đơn' },
          { value: 'pending', label: 'Chờ duyệt' },
          { value: 'confirmed', label: 'Đã xác nhận' },
          { value: 'completed', label: 'Hoàn tất' },
          { value: 'cancelled', label: 'Đã hủy' }
        ].map((tab) => {
          const isSelected = statusFilter === tab.value
          const isHighlighted = highlightedTab === tab.value

          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold border cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                isSelected
                  ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-950 shadow-xs'
                  : 'bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
              } ${isHighlighted ? 'ring-2 ring-emerald-500/80 scale-[1.03] animate-pulse' : ''}`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                isSelected 
                  ? 'bg-emerald-600 text-white font-extrabold dark:bg-emerald-500/20 dark:text-emerald-450' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450 font-bold'
              }`}>
                {getCount(tab.value as any)}
              </span>
            </button>
          )
        })}
      </div>

      {/* RENDER KHI ĐANG TẢI DỮ LIỆU */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-8 h-8 border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
            Đang đồng bộ dữ liệu booking...
          </span>
        </div>
      ) : (
        /* DATA TABLE (BẢNG HIỂN THỊ ĐƠN ĐẶT PHÒNG) */
        <div className="bg-card border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Mã Đơn</th>
                  <th className="py-4 px-5">Khách Hàng</th>
                  <th className="py-4 px-5">Phòng & Chi Nhánh</th>
                  <th className="py-4 px-4 text-center">Thời Gian Lưu Trú</th>
                  <th className="py-4 px-5 text-right">Tổng Tiền</th>
                  <th className="py-4 px-6 text-center">Trạng Thái</th>
                  <th className="py-4 px-6 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={24} className="text-zinc-300 dark:text-zinc-700" />
                        <span>Không tìm thấy đơn booking nào khớp với bộ lọc.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const isRowHighlighted = highlightedBookingId === booking.id

                    return (
                      <tr 
                        key={booking.id} 
                        className={`transition-all duration-500 ${
                          isRowHighlighted 
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/5 border-y-2 border-emerald-500 animate-pulse relative z-10' 
                            : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-850/60'
                        }`}
                      >
                        
                        {/* Mã đơn */}
                        <td className="py-4 px-6 font-mono text-zinc-900 dark:text-zinc-100 font-extrabold tracking-wider">
                          {booking.id}
                        </td>
  
                        {/* Khách hàng */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-extrabold text-zinc-900 dark:text-zinc-50">{booking.customerName}</span>
                            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold font-mono flex items-center gap-0.5">
                              <Phone size={9} /> {booking.phone}
                            </span>
                          </div>
                        </td>
  
                        {/* Phòng & Chi nhánh */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-zinc-800 dark:text-zinc-200 font-bold leading-tight">{booking.roomName.split('(')[0]}</span>
                            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">{booking.branch.replace(' 🏡', '').replace(' 🏙️', '').replace(' 🪟', '').replace(' 🌸', '')}</span>
                          </div>
                        </td>
  
                        {/* Thời gian */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col justify-center gap-0.5">
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{booking.checkIn.split(' ')[0]}</span>
                            <span className="text-[9.5px] text-zinc-450 dark:text-zinc-500 font-semibold font-mono">
                              {booking.checkIn.split(' ')[1]} - {booking.checkOut.split(' ')[1]}
                            </span>
                          </div>
                        </td>
  
                        {/* Tổng tiền */}
                        <td className="py-4 px-5 text-right font-black font-mono text-zinc-900 dark:text-zinc-50 text-sm">
                          {formatVND(booking.totalAmount)}
                        </td>
  
                        {/* Trạng thái (Status Badges) */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            booking.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                              : booking.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                              : booking.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450 border border-zinc-200 dark:border-zinc-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              booking.status === 'pending'
                                ? 'bg-amber-500'
                                : booking.status === 'confirmed'
                                ? 'bg-emerald-555'
                                : booking.status === 'completed'
                                ? 'bg-blue-500'
                                : 'bg-zinc-400'
                            }`}></span>
                            {booking.status === 'pending' ? 'Chờ duyệt' :
                             booking.status === 'confirmed' ? 'Đã xác nhận' :
                             booking.status === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                          </span>
                        </td>
  
                        {/* Thao tác cuối bảng */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            
                            {/* Nút Xem chi tiết (Cho mọi trạng thái) */}
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 hover:text-zinc-900 dark:text-zinc-350 dark:hover:text-zinc-100 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700 transition cursor-pointer shadow-xs"
                              title="Xem chi tiết đơn"
                            >
                              <Eye size={15} />
                            </button>
  
                            {/* Nhóm thao tác nhanh (Chỉ xuất hiện khi ở trạng thái Chờ duyệt - pending) */}
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                  className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-550/15 dark:hover:bg-emerald-600 text-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-white flex items-center justify-center border border-emerald-250 dark:border-emerald-500/30 transition cursor-pointer shadow-xs"
                                  title="Xác nhận lịch đặt"
                                >
                                  <Check size={15} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                  className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-650 dark:bg-rose-550/15 dark:hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white flex items-center justify-center border border-rose-250 dark:border-rose-500/30 transition cursor-pointer shadow-xs"
                                  title="Hủy đơn booking"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
  
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM CHI TIẾT ĐƠN BOOKING CAO CẤP ================= */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="bg-card border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
              title="Đóng"
            >
              ✕
            </button>

            {/* Icon & Title */}
            <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl flex items-center justify-center shadow-inner">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 uppercase leading-none">Chi Tiết Đơn Booking</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider block mt-1">Mã: {selectedBooking.id}</span>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center border-b border-zinc-200/30 dark:border-zinc-800/40 pb-2">
                <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">👤 Khách hàng đặt:</span>
                <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{selectedBooking.customerName}</strong>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-200/30 dark:border-zinc-800/40 pb-2">
                <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">📞 Số điện thoại:</span>
                <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{selectedBooking.phone}</strong>
              </div>

              <div className="flex justify-between items-start border-b border-zinc-200/30 dark:border-zinc-800/40 pb-2">
                <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">🏢 Chi nhánh lưu trú:</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-right max-w-[200px]">{selectedBooking.branch}</span>
              </div>

              <div className="flex justify-between items-start border-b border-zinc-200/30 dark:border-zinc-800/40 pb-2">
                <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">🚪 Phòng nghỉ:</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-right max-w-[200px]">{selectedBooking.roomName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-200/30 dark:border-zinc-800/40 pb-2">
                <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">📅 Lịch check-in:</span>
                <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{selectedBooking.checkIn}</strong>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-200/30 dark:border-zinc-800/40 pb-2">
                <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">📅 Lịch check-out:</span>
                <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{selectedBooking.checkOut}</strong>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-200/30 dark:border-zinc-800/40 pb-2">
                <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">⏱️ Ngày lập hóa đơn:</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-mono">{selectedBooking.createdAt}</span>
              </div>

              {selectedBooking.notes && (
                <div className="flex flex-col gap-1.5 border-b border-zinc-200/30 dark:border-zinc-800/40 pb-2.5">
                  <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">📝 Ghi chú yêu cầu của khách:</span>
                  <p className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-2.5 rounded-xl text-zinc-650 dark:text-zinc-300 font-medium leading-relaxed italic">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-1">
                <span className="text-zinc-450 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Trạng thái đơn:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  selectedBooking.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                    : selectedBooking.status === 'confirmed'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    : selectedBooking.status === 'completed'
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450 border border-zinc-200 dark:border-zinc-700'
                }`}>
                  {selectedBooking.status === 'pending' ? 'Chờ duyệt' :
                   selectedBooking.status === 'confirmed' ? 'Đã xác nhận' :
                   selectedBooking.status === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3 mt-1.5">
                <span className="text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[9px] font-black">Hóa đơn tổng thanh toán:</span>
                <strong className="text-zinc-900 dark:text-zinc-50 text-base md:text-lg font-black font-mono">{formatVND(selectedBooking.totalAmount)}</strong>
              </div>
            </div>

            {/* Nhóm nút duyệt nhanh bên trong Popup chi tiết (Chỉ xuất hiện khi đơn ở trạng thái pending) */}
            {selectedBooking.status === 'pending' && (
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedBooking.id, 'confirmed')
                    setSelectedBooking(prev => prev ? { ...prev, status: 'confirmed' } : null)
                  }}
                  className="flex-grow py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition border-none shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={12} /> Xác nhận duyệt đơn
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedBooking.id, 'cancelled')
                    setSelectedBooking(prev => prev ? { ...prev, status: 'cancelled' } : null)
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl font-bold text-xs transition border-none shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X size={12} /> Hủy đơn
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl font-bold text-xs shadow-xs transition border-none cursor-pointer mt-1"
            >
              Quay lại danh sách đơn
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
