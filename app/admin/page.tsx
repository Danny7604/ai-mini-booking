'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  ShoppingBag, 
  DoorOpen, 
  Percent, 
  ShieldAlert, 
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

// Cấu trúc kiểu dữ liệu cho Dashboard Admin
interface BookingItem {
  id: string
  customerName: string
  phone: string
  roomName: string
  bookingType: 'Theo giờ' | 'Theo đêm'
  duration: string
  checkinTime: string
  amount: number
  status: 'pending' | 'success' | 'cancelled'
}

interface DashboardData {
  stats: {
    revenue: number
    newBookings: number
    vacantRooms: number
    occupancyRate: number
  }
  alerts: Array<{
    id: string
    type: 'danger' | 'warning' | 'info'
    message: string
  }>
  recentBookings: BookingItem[]
}

/**
 * Hàm nạp dữ liệu giả lập có bọc try...catch nghiêm ngặt
 * Sẵn sàng cho việc kết nối API endpoints thực tế của Admin sau này
 */
const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    // Giả lập trễ mạng tải dữ liệu (800ms)
    await new Promise(resolve => setTimeout(resolve, 800))

    // Trả về Mock Data chuẩn cấu trúc nghiệp vụ Bliss Home
    return {
      stats: {
        revenue: 18450000,
        newBookings: 12,
        vacantRooms: 1,
        occupancyRate: 85,
      },
      alerts: [
        { 
          id: 'alert-1', 
          type: 'danger', 
          message: '🚨 Cảnh báo khẩn cấp: Chi nhánh CS2 Quận 10 đang ghi nhận mật độ yêu cầu booking tăng đột biến 120% trong 2 giờ qua, cần hỗ trợ duyệt đơn nhanh!' 
        },
        { 
          id: 'alert-2', 
          type: 'warning', 
          message: '⚠️ Kiểm tra phòng: Căn phòng "Cozy Wooden Cabin" (CS3 Quận 5) dự kiến trả phòng lúc 16:00 hôm nay. Cần chuẩn bị nhân viên dọn dẹp buồng phòng trước 15 phút.' 
        },
        { 
          id: 'alert-3', 
          type: 'info', 
          message: '✨ Gợi ý Bliss Copilot: Mã giảm giá "BLISSSUMMER" đang đạt hiệu suất sử dụng cao nhất ngày hôm nay (đã áp dụng 8 lượt thành công).' 
        }
      ],
      recentBookings: [
        {
          id: 'BLISS-783912',
          customerName: 'Nguyễn Văn Hùng',
          phone: '0901234567',
          roomName: 'Pine Forest Loft (Tân Bình CS1) 🏡',
          bookingType: 'Theo đêm',
          duration: '1 đêm',
          checkinTime: '30/05/2026 14:00',
          amount: 1080000,
          status: 'success'
        },
        {
          id: 'BLISS-982736',
          customerName: 'Trần Thị Mai',
          phone: '0987654321',
          roomName: 'Valley View Suite (Quận 10 CS2) 🏙️',
          bookingType: 'Theo giờ',
          duration: '3 giờ',
          checkinTime: '30/05/2026 15:30',
          amount: 540000,
          status: 'pending'
        },
        {
          id: 'BLISS-451928',
          customerName: 'Phan Minh Anh',
          phone: '0912345678',
          roomName: 'Cozy Wooden Cabin (Quận 5 CS3) 🪟',
          bookingType: 'Theo đêm',
          duration: '2 đêm',
          checkinTime: '02/06/2026 14:00',
          amount: 3960000,
          status: 'success'
        },
        {
          id: 'BLISS-829103',
          customerName: 'Lê Hoàng Hải',
          phone: '0933445566',
          roomName: 'Sunset Panorama (Quận 10 CS2) 🏙️',
          bookingType: 'Theo đêm',
          duration: '1 đêm',
          checkinTime: '30/05/2026 14:00',
          amount: 2900000,
          status: 'success'
        },
        {
          id: 'BLISS-672514',
          customerName: 'Phạm Quỳnh Chi',
          phone: '0999887766',
          roomName: 'Sunlit Glass House (Gò Vấp CS4) 🌸',
          bookingType: 'Theo giờ',
          duration: '2 giờ',
          checkinTime: '30/05/2026 16:00',
          amount: 3000000,
          status: 'cancelled'
        }
      ]
    }
  } catch (error) {
    console.error('Lỗi khi giả lập fetch dữ liệu Dashboard:', error)
    throw new Error('Không thể nạp dữ liệu Dashboard Quản trị.')
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Lưu trữ card chỉ số được highlight từ Bliss Copilot AI
  const [highlightedCard, setHighlightedCard] = useState<'revenue' | 'newBookings' | 'vacantRooms' | 'occupancyRate' | null>(null)

  // Nạp dữ liệu tự động và xử lý lỗi đồng bộ
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchDashboardData()
      .then(res => {
        if (isMounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Đã xảy ra lỗi không xác định.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  // LẮNG NGHE SỰ KIỆN TỪ AI COPILOT ĐỂ TỰ ĐỘNG THAO TÁC / HIGHLIGHT GIAO DIỆN
  useEffect(() => {
    const handleAdminAction = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: string
        payload: string
        description: string
      }>
      if (!customEvent.detail) return

      const { type, payload } = customEvent.detail

      if (type === 'HIGHLIGHT_STAT') {
        const statKey = payload as any
        setHighlightedCard(statKey)

        // Cuộn màn hình mượt mà đến vùng card chỉ số
        setTimeout(() => {
          const cardElement = document.getElementById(`stat-card-${statKey}`)
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)

        // Xóa hiệu ứng nhấp nháy sau 4 giây
        setTimeout(() => {
          setHighlightedCard(null)
        }, 4000)
      }
    }

    window.addEventListener('bliss-admin-action', handleAdminAction)
    return () => {
      window.removeEventListener('bliss-admin-action', handleAdminAction)
    }
  }, [data])

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + 'đ'
  }

  // 1. GIAO DIỆN KHI ĐANG TẢI DỮ LIỆU (LOADING SPIN)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="w-10 h-10 border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
          Đang kết nối hệ thống Bliss Home...
        </span>
      </div>
    )
  }

  // 2. GIAO DIỆN KHI XẢY RA LỖI HỆ THỐNG (ERROR SCREEN)
  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/20 rounded-2xl p-8 text-center flex flex-col items-center gap-4 max-w-lg mx-auto mt-12 shadow-xs">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center text-red-700 dark:text-red-400">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base">Sự cố nạp thông tin quản trị</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-xl text-xs transition border-none cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw size={12} /> Thử tải lại trang
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* HEADER TÌNH TRẠNG & NÚT REFRESH TẢI LẠI */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800/60 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
            Tổng Quan Hoạt Động
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Thông tin hoạt động thực tế của toàn hệ thống chi nhánh Bliss Home Sài Gòn.
          </p>
        </div>
        
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="p-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 text-zinc-650 dark:text-zinc-300 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 font-bold text-xs"
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={13} className="text-stone-500" />
          <span className="hidden sm:inline">Làm mới dữ liệu</span>
        </button>
      </div>

      {/* PHẦN 1 - STATS CARDS TIÊU CHUẨN KÈM HIỆU ỨNG NHẬP NHÁY COPILOT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Doanh thu */}
        <div 
          id="stat-card-revenue"
          className={`bg-card border p-5 rounded-2xl shadow-xs flex flex-col gap-1.5 relative overflow-hidden group transition-all duration-700 ${
            highlightedCard === 'revenue'
              ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-md animate-pulse z-10'
              : 'border-zinc-200 dark:border-zinc-800/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Doanh thu tạm tính</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <strong className="text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 font-black leading-none font-sans mt-1">
            {formatVND(data.stats.revenue)}
          </strong>
          <span className="text-[10px] text-green-600 dark:text-green-500 font-bold">📈 +15% so với tuần trước</span>
        </div>

        {/* Đơn mới */}
        <div 
          id="stat-card-newBookings"
          className={`bg-card border p-5 rounded-2xl shadow-xs flex flex-col gap-1.5 relative overflow-hidden group transition-all duration-700 ${
            highlightedCard === 'newBookings'
              ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-md animate-pulse z-10'
              : 'border-zinc-200 dark:border-zinc-800/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Yêu cầu Booking mới</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <strong className="text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 font-black leading-none font-sans mt-1">
            {data.stats.newBookings} đơn
          </strong>
          <span className="text-[10px] text-green-600 dark:text-green-500 font-bold">📈 +20% so với hôm qua</span>
        </div>

        {/* Phòng trống */}
        <div 
          id="stat-card-vacantRooms"
          className={`bg-card border p-5 rounded-2xl shadow-xs flex flex-col gap-1.5 relative overflow-hidden group transition-all duration-700 ${
            highlightedCard === 'vacantRooms'
              ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-md animate-pulse z-10'
              : 'border-zinc-200 dark:border-zinc-800/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Căn phòng trống</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <DoorOpen size={16} />
            </div>
          </div>
          <strong className="text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 font-black leading-none font-sans mt-1">
            {data.stats.vacantRooms} phòng
          </strong>
          <span className="text-[10px] text-amber-700 dark:text-amber-500 font-bold">🔑 CS5 (Bình Thạnh) còn phòng</span>
        </div>

        {/* Tỉ lệ lấp đầy */}
        <div 
          id="stat-card-occupancyRate"
          className={`bg-card border p-5 rounded-2xl shadow-xs flex flex-col gap-1.5 relative overflow-hidden group transition-all duration-700 ${
            highlightedCard === 'occupancyRate'
              ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-md animate-pulse z-10'
              : 'border-zinc-200 dark:border-zinc-800/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tỉ lệ lấp đầy phòng</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <strong className="text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 font-black leading-none font-sans mt-1">
            {data.stats.occupancyRate}%
          </strong>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">🔥 5/6 phòng đang hoạt động</span>
        </div>
      </div>

      {/* PHẦN 2 - AI ALERTS WIDGET (CẢNH BÁO NỔI BẬT) */}
      <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4">
        <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <Sparkles size={14} className="text-zinc-800 dark:text-zinc-300 animate-pulse" /> 
          Bliss Copilot Cảnh báo & Đề xuất vận hành
        </h3>

        <div className="flex flex-col gap-3">
          {data.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl text-xs font-bold border leading-relaxed flex items-start gap-3 transition hover:-translate-y-0.5 duration-200 shadow-2xs ${
                alert.type === 'danger'
                  ? 'bg-red-50/70 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/20 text-red-900 dark:text-red-300'
                  : alert.type === 'warning'
                  ? 'bg-amber-50/70 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/20 text-amber-900 dark:text-amber-300'
                  : 'bg-blue-50/70 dark:bg-blue-950/10 border-blue-200/50 dark:border-blue-900/20 text-blue-900 dark:text-blue-300'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {alert.type === 'danger' ? (
                  <ShieldAlert size={16} className="text-red-600 dark:text-red-400 animate-bounce" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                ) : (
                  <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <p className="flex-grow">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PHẦN 3 - BOOKING TABLE (DANH SÁCH ĐƠN GẦN NHẤT) */}
      <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
            📋 5 Đơn hàng đặt phòng gần nhất
          </h3>
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Realtime data
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800/60 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="py-4 px-6">Mã Booking</th>
                <th className="py-4 px-5">Khách hàng</th>
                <th className="py-4 px-5">Phòng nghỉ & Chi nhánh</th>
                <th className="py-4 px-4 text-center">Hình thức</th>
                <th className="py-4 px-4 text-center">Thời gian</th>
                <th className="py-4 px-5 text-right">Tổng tiền</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {data.recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition">
                  <td className="py-4 px-6 font-mono text-zinc-900 dark:text-zinc-100 font-extrabold tracking-wider">
                    {booking.id}
                  </td>
                  <td className="py-4 px-5 flex flex-col">
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{booking.customerName}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{booking.phone}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="line-clamp-1">{booking.roomName}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      booking.bookingType === 'Theo giờ'
                        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30'
                        : 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30'
                    }`}>
                      {booking.bookingType === 'Theo giờ' ? '⏰ Theo giờ' : '🌙 Theo đêm'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center flex flex-col justify-center">
                    <span>{booking.duration}</span>
                    <span className="text-[9px] text-muted-foreground font-medium">{booking.checkinTime}</span>
                  </td>
                  <td className="py-4 px-5 text-right text-zinc-900 dark:text-zinc-100 font-extrabold font-mono">
                    {formatVND(booking.amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      booking.status === 'success'
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/30'
                        : booking.status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30 animate-pulse'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {booking.status === 'success' ? (
                        <>
                          <CheckCircle2 size={10} /> Đã xác nhận
                        </>
                      ) : booking.status === 'pending' ? (
                        <>
                          <Clock size={10} /> Đang duyệt
                        </>
                      ) : (
                        <span>Hủy đơn</span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
