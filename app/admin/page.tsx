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
        <div className="w-10 h-10 border-4 border-[#0A273A] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest animate-pulse">
          Đang kết nối hệ thống Bliss Home...
        </span>
      </div>
    )
  }

  // 2. GIAO DIỆN KHI XẢY RA LỖI HỆ THỐNG (ERROR SCREEN)
  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center flex flex-col items-center gap-4 max-w-lg mx-auto mt-12 shadow-sm">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-700">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="font-extrabold text-stone-850 text-base">Sự cố nạp thông tin quản trị</h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 bg-[#0A273A] hover:bg-[#124263] text-white font-bold rounded-xl text-xs transition border-none cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw size={12} /> Thử tải lại trang
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* HEADER TÌNH TRẠNG & NÚT REFRESH TẢI LẠI */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/50 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-stone-850 tracking-tight font-sans">
            Tổng Quan Hoạt Động
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Thông tin hoạt động thực tế của toàn hệ thống chi nhánh Bliss Home Sài Gòn.
          </p>
        </div>
        
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="p-2.5 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#0A273A] text-stone-600 hover:text-[#0A273A] rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 font-bold text-xs"
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
          className={`bg-white border p-5 rounded-3xl shadow-xs flex flex-col gap-1.5 relative overflow-hidden group transition-all duration-700 ${
            highlightedCard === 'revenue'
              ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-md animate-pulse z-10'
              : 'border-stone-200/60 hover:shadow-md hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Doanh thu tạm tính</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <strong className="text-xl md:text-2xl text-[#0A273A] font-black leading-none font-sans mt-1">
            {formatVND(data.stats.revenue)}
          </strong>
          <span className="text-[10px] text-green-600 font-bold">📈 +15% so với tuần trước</span>
        </div>

        {/* Đơn mới */}
        <div 
          id="stat-card-newBookings"
          className={`bg-white border p-5 rounded-3xl shadow-xs flex flex-col gap-1.5 relative overflow-hidden group transition-all duration-700 ${
            highlightedCard === 'newBookings'
              ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-md animate-pulse z-10'
              : 'border-stone-200/60 hover:shadow-md hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Yêu cầu Booking mới</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <strong className="text-xl md:text-2xl text-[#0A273A] font-black leading-none font-sans mt-1">
            {data.stats.newBookings} đơn
          </strong>
          <span className="text-[10px] text-green-600 font-bold">📈 +20% so với hôm qua</span>
        </div>

        {/* Phòng trống */}
        <div 
          id="stat-card-vacantRooms"
          className={`bg-white border p-5 rounded-3xl shadow-xs flex flex-col gap-1.5 relative overflow-hidden group transition-all duration-700 ${
            highlightedCard === 'vacantRooms'
              ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-md animate-pulse z-10'
              : 'border-stone-200/60 hover:shadow-md hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Căn phòng trống</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <DoorOpen size={16} />
            </div>
          </div>
          <strong className="text-xl md:text-2xl text-[#0A273A] font-black leading-none font-sans mt-1">
            {data.stats.vacantRooms} phòng
          </strong>
          <span className="text-[10px] text-amber-700 font-bold">🔑 CS5 (Bình Thạnh) còn phòng</span>
        </div>

        {/* Tỉ lệ lấp đầy */}
        <div 
          id="stat-card-occupancyRate"
          className={`bg-white border p-5 rounded-3xl shadow-xs flex flex-col gap-1.5 relative overflow-hidden group transition-all duration-700 ${
            highlightedCard === 'occupancyRate'
              ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-md animate-pulse z-10'
              : 'border-stone-200/60 hover:shadow-md hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Tỉ lệ lấp đầy phòng</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <strong className="text-xl md:text-2xl text-[#0A273A] font-black leading-none font-sans mt-1">
            {data.stats.occupancyRate}%
          </strong>
          <span className="text-[10px] text-stone-500 font-semibold">🔥 5/6 phòng đang hoạt động</span>
        </div>
      </div>

      {/* PHẦN 2 - AI ALERTS WIDGET (CẢNH BÁO NỔI BẬT) */}
      <div className="bg-white border border-stone-200/60 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-black text-[#0A273A] uppercase tracking-widest flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles size={14} className="text-emerald-500 animate-pulse" /> 
          Bliss Copilot Cảnh báo & Đề xuất vận hành
        </h3>

        <div className="flex flex-col gap-3">
          {data.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl text-xs font-bold border leading-relaxed flex items-start gap-3 transition hover:-translate-y-0.5 duration-200 shadow-2xs ${
                alert.type === 'danger'
                  ? 'bg-red-50/70 border-red-200/50 text-red-900'
                  : alert.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-200/50 text-amber-900'
                  : 'bg-blue-50/70 border-blue-200/50 text-blue-900'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {alert.type === 'danger' ? (
                  <ShieldAlert size={16} className="text-red-600 animate-bounce" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle size={16} className="text-amber-600" />
                ) : (
                  <Sparkles size={16} className="text-blue-600" />
                )}
              </div>
              <p className="flex-grow">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PHẦN 3 - BOOKING TABLE (DANH SÁCH ĐƠN GẦN NHẤT) */}
      <div className="bg-white border border-stone-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-[#0A273A] uppercase tracking-widest">
            📋 5 Đơn hàng đặt phòng gần nhất
          </h3>
          <span className="text-[10px] bg-stone-100 text-stone-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Realtime data
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100 text-[10px] font-black text-stone-400 uppercase tracking-wider">
                <th className="py-4 px-6">Mã Booking</th>
                <th className="py-4 px-5">Khách hàng</th>
                <th className="py-4 px-5">Phòng nghỉ & Chi nhánh</th>
                <th className="py-4 px-4 text-center">Hình thức</th>
                <th className="py-4 px-4 text-center">Thời gian</th>
                <th className="py-4 px-5 text-right">Tổng tiền</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs font-semibold text-stone-750">
              {data.recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-stone-50/50 transition">
                  <td className="py-4 px-6 font-mono text-[#0A273A] font-extrabold tracking-wider">
                    {booking.id}
                  </td>
                  <td className="py-4 px-5 flex flex-col">
                    <span className="font-extrabold text-stone-850">{booking.customerName}</span>
                    <span className="text-[10px] text-stone-400 font-medium">{booking.phone}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="line-clamp-1">{booking.roomName}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      booking.bookingType === 'Theo giờ'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-purple-50 text-purple-700 border border-purple-100'
                    }`}>
                      {booking.bookingType === 'Theo giờ' ? '⏰ Theo giờ' : '🌙 Theo đêm'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center flex flex-col justify-center">
                    <span>{booking.duration}</span>
                    <span className="text-[9px] text-stone-400 font-medium">{booking.checkinTime}</span>
                  </td>
                  <td className="py-4 px-5 text-right text-[#0A273A] font-black font-mono">
                    {formatVND(booking.amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      booking.status === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : booking.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
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
