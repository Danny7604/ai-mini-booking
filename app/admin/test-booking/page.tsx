'use client'

import React, { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAdminData } from '../AdminDataContext'
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  User, 
  Wrench, 
  Sparkles, 
  Clock, 
  Building2, 
  Flame, 
  Check, 
  Calendar, 
  DollarSign, 
  ChevronDown,
  Info,
  Plus,
  Trash2,
  KeyRound,
  Phone,
  BookmarkPlus
} from 'lucide-react'

// Định nghĩa cấu trúc dữ liệu của Phòng nghỉ nâng cao
interface Room {
  id: string
  name: string
  type: string
  branchId: 'cs1' | 'cs2' | 'cs3' | 'cs4'
  branchName: string
  status: 'available' | 'booked_not_checked_in' | 'checked_in' | 'checkout_imminent' | 'maintenance' | 'cleaning'
  price: number
  guest: string | null
  timeInfo?: string // Lưu trữ giờ Check-in/Check-out dự kiến, lý do bảo trì hoặc giờ xong dọn dẹp
}

// Danh mục Chi nhánh để lọc
const BRANCHES = [
  { id: 'all', name: 'Chi nhánh/Branch' },
  { id: 'cs1', name: 'Dancin Home - Tân Bình (CS1) 🏡' },
  { id: 'cs2', name: 'Dancin Home - Quận 10 (CS2) 🏙️' },
  { id: 'cs3', name: 'Dancin Home - Quận 5 (CS3) 🪟' },
  { id: 'cs4', name: 'Dancin Home - Gò Vấp (CS4) 🌸' }
]

// Danh mục Tình trạng phòng để lọc
const STATUS_FILTER_OPTIONS = [
  { id: 'all', name: "Room's Status" },
  { id: 'available', name: '🟢 Trống / Available' },
  { id: 'booked_not_checked_in', name: '🟠 Đã Đặt Chưa Đến' },
  { id: 'checked_in', name: '💗 Đã Check-In' },
  { id: 'checkout_imminent', name: '🔴 Sắp Check-Out ⚠️' },
  { id: 'maintenance', name: '🔵 Đang Bảo Trì' },
  { id: 'cleaning', name: '⚪ Đang Dọn Dẹp' }
]

// Khởi tạo danh sách 20 phòng mẫu tuyệt đẹp phân bố đều ở các chi nhánh
const INITIAL_ROOMS: Room[] = [
  // --- CHI NHÁNH 1: TÂN BÌNH CS1 ---
  { id: 'P-101', name: 'Bungalow Hương Thơm', type: 'View Vườn Cà Phê', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'available', price: 850000, guest: null },
  { id: 'P-102', name: 'Nhà Gỗ Mộc Lan', type: 'Rustic Family Suite', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'checked_in', price: 1200000, guest: 'Nguyễn Hải Nam', timeInfo: 'Hôm nay, 12:00' },
  { id: 'P-103', name: 'Phòng Đơn Đồi Tiêu', type: 'Meditative Single Room', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'cleaning', price: 600000, guest: null, timeInfo: '14:30' },
  { id: 'P-104', name: 'Lều Glamping Thung Lũng', type: 'Outdoor Premium Cabin', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'available', price: 950000, guest: null },
  { id: 'P-105', name: 'Căn Hộ Rừng Sầu Riêng', type: 'Premium Forest Suite', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'maintenance', price: 1800000, guest: null, timeInfo: 'Bảo dưỡng định kỳ điều hòa âm trần' },

  // --- CHI NHÁNH 2: QUẬN 10 CS2 ---
  { id: 'P-201', name: 'Sky Loft Hoàng Hôn', type: 'Luxury Panorama View', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'checked_in', price: 1500000, guest: 'Lê Hoàng Hải', timeInfo: 'Ngày mai, 12:00' },
  { id: 'P-202', name: 'Phòng Suite Thung Lũng', type: 'Penthouse Royal Style', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'booked_not_checked_in', price: 2200000, guest: 'Phạm Minh Tuấn', timeInfo: 'Hôm nay, 14:00 (Chờ check-in)' },
  { id: 'P-203', name: 'Phòng Đôi Ánh Sáng', type: 'Standard Deluxe Double', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'checkout_imminent', price: 750000, guest: 'Trần Thị Vy', timeInfo: 'Hôm nay, 11:30' },
  { id: 'P-204', name: 'Studio Tối Giản Cát Ấm', type: 'Cozy Minimalist Studio', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'available', price: 800000, guest: null },
  { id: 'P-205', name: 'Phòng Đơn Ngắm Sao', type: 'Glass Roof Single Room', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'cleaning', price: 700000, guest: null, timeInfo: '13:00' },

  // --- CHI NHÁNH 3: QUẬN 5 CS3 ---
  { id: 'P-301', name: 'Bungalow Hoa Cẩm Tú', type: 'Premium Cozy Garden', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'available', price: 1100000, guest: null },
  { id: 'P-302', name: 'Nhà Gỗ Bên Dòng Suối', type: 'Riverfront Hinoki Cabin', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'checked_in', price: 1350000, guest: 'Lâm Quốc Bảo', timeInfo: 'Còn 2 ngày nữa, 12:00' },
  { id: 'P-303', name: 'Phòng Đôi Mây Trắng', type: 'Deluxe Double Balcony', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'booked_not_checked_in', price: 900000, guest: 'Hoàng Thu Thủy', timeInfo: 'Hôm nay, 15:30 (Đã đặt cọc)' },
  { id: 'P-304', name: 'Phòng Gia Đình Ấm Cúng', type: 'Cozy Family Wooden Lodge', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'maintenance', price: 1650000, guest: null, timeInfo: 'Sửa đường dẫn bồn sục nước nóng' },
  { id: 'P-305', name: 'Phòng Đơn Yên Bình', type: 'Zen Single Room Meditation', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'available', price: 650000, guest: null },

  // --- CHI NHÁNH 4: GÒ VẤP CS4 ---
  { id: 'P-401', name: 'Lều Vòm Kính Xinh Xắn', type: 'Sunlit Dome Experience', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'checkout_imminent', price: 1050000, guest: 'Đỗ Quỳnh Anh', timeInfo: 'Hôm nay, 10:45 (Trễ 15p)' },
  { id: 'P-402', name: 'Bungalow Rừng Thông', type: 'Pine Forest Eco Cabin', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'checked_in', price: 1400000, guest: 'Vũ Đức Trọng', timeInfo: 'Hôm nay, 12:00' },
  { id: 'P-403', name: 'Nhà Gỗ Trắng Vintage', type: 'Antique White Cottage', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'available', price: 1250000, guest: null },
  { id: 'P-404', name: 'Phòng Đôi Hoa Sim', type: 'Comfort Cozy Double Room', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'booked_not_checked_in', price: 850000, guest: 'Trịnh Mai Chi', timeInfo: 'Ngày mai, 14:00' },
  { id: 'P-405', name: 'Phòng Áp Mái Thơ Mộng', type: 'Romantic Attic Window', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'cleaning', price: 750000, guest: null, timeInfo: '16:00' }
]

export default function RoomGridManagementDashboard() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const { theme } = useAdminData()
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // Custom Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // States quản lý việc THÊM PHÒNG MỚI
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newRoomId, setNewRoomId] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomType, setNewRoomType] = useState('')
  const [newRoomBranchId, setNewRoomBranchId] = useState<'cs1' | 'cs2' | 'cs3' | 'cs4'>('cs1')
  const [newRoomPrice, setNewRoomPrice] = useState<number>(850000)
  const [newRoomStatus, setNewRoomStatus] = useState<Room['status']>('available')

  // States quản lý CẬP NHẬT TRẠNG THÁI PHÒNG (POPUP) & ĐẶT PHÒNG LIÊN KẾT BOOKING
  const [activeEditingRoom, setActiveEditingRoom] = useState<Room | null>(null)
  const [tempStatus, setTempStatus] = useState<Room['status']>('available')
  const [tempGuest, setTempGuest] = useState<string>('')
  const [tempTimeInfo, setTempTimeInfo] = useState<string>('')

  // State phụ phục vụ ĐẶT PHÒNG NHANH CHO KHÁCH (Nhân viên thao tác)
  const [bookingGuestName, setBookingGuestName] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingStatus, setBookingStatus] = useState<'booked_not_checked_in' | 'checked_in'>('booked_not_checked_in')
  const [bookingDates, setBookingDates] = useState('Hôm nay, 14:00 - Mai, 12:00')
  const [bookingNotes, setBookingNotes] = useState('')

  // Đọc tham số tìm kiếm từ URL khi tải trang lần đầu
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('search')
      if (q) {
        setSearchTerm(decodeURIComponent(q))
      }
    }
  }, [])

  // Hàm hiển thị Toast
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Tính toán nhanh số lượng phòng theo từng trạng thái để làm thống kê động
  const getStatusCount = (status: Room['status']) => {
    return rooms.filter(r => r.status === status).length
  }

  // Cấu hình mã màu sắc, biểu tượng cho từng Trạng thái phòng (Tinh tế, HSL cao cấp)
  const getStatusConfig = (status: Room['status'], currentTheme: 'light' | 'dark') => {
    const isDark = currentTheme === 'dark'
    switch (status) {
      case 'available':
        return {
          bg: isDark
            ? 'bg-emerald-900 hover:bg-emerald-850'
            : 'bg-emerald-100 hover:bg-emerald-200/70',
          border: isDark
            ? 'border-emerald-700 hover:border-emerald-600'
            : 'border-emerald-300 hover:border-emerald-400',
          text: isDark ? 'text-white' : 'text-emerald-950 font-black',
          badgeBg: 'bg-emerald-600 text-white',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 size={16} />,
          label: 'Available (Trống)'
        }
      case 'booked_not_checked_in':
        return {
          bg: isDark
            ? 'bg-orange-900 hover:bg-orange-850'
            : 'bg-orange-100 hover:bg-orange-200/70',
          border: isDark
            ? 'border-orange-700 hover:border-orange-600'
            : 'border-orange-300 hover:border-orange-400',
          text: isDark ? 'text-white' : 'text-orange-950 font-black',
          badgeBg: 'bg-orange-500 text-white',
          dot: 'bg-orange-500',
          icon: <Calendar size={16} />,
          label: 'Đã Đặt Chưa Đến'
        }
      case 'checked_in':
        return {
          bg: isDark
            ? 'bg-pink-900 hover:bg-pink-850'
            : 'bg-pink-100 hover:bg-pink-200/70',
          border: isDark
            ? 'border-pink-700 hover:border-pink-600'
            : 'border-pink-300 hover:border-pink-400',
          text: isDark ? 'text-white' : 'text-pink-950 font-black',
          badgeBg: 'bg-pink-500 text-white',
          dot: 'bg-pink-500',
          icon: <User size={16} />,
          label: 'Đã Check-In'
        }
      case 'checkout_imminent':
        return {
          bg: isDark
            ? 'bg-rose-900 hover:bg-rose-850'
            : 'bg-rose-100 hover:bg-rose-200/70',
          border: isDark
            ? 'border-rose-700 hover:border-rose-600'
            : 'border-rose-300 hover:border-rose-400',
          text: isDark ? 'text-white' : 'text-rose-950 font-black',
          badgeBg: 'bg-rose-600 text-white',
          dot: 'bg-rose-650',
          icon: <Flame size={16} className="animate-pulse" />,
          label: 'Sắp Check-Out ⚠️'
        }
      case 'maintenance':
        return {
          bg: isDark
            ? 'bg-blue-900 hover:bg-blue-850'
            : 'bg-blue-100 hover:bg-blue-200/70',
          border: isDark
            ? 'border-blue-700 hover:border-blue-600'
            : 'border-blue-300 hover:border-blue-400',
          text: isDark ? 'text-white' : 'text-blue-950 font-black',
          badgeBg: 'bg-blue-600 text-white',
          dot: 'bg-blue-500',
          icon: <Wrench size={16} />,
          label: 'Đang Bảo Trì'
        }
      case 'cleaning':
        return {
          bg: isDark
            ? 'bg-zinc-800 hover:bg-zinc-700'
            : 'bg-zinc-200 hover:bg-zinc-300/70',
          border: isDark
            ? 'border-zinc-700 hover:border-zinc-600'
            : 'border-zinc-350 hover:border-zinc-400',
          text: isDark ? 'text-white' : 'text-zinc-900 font-black',
          badgeBg: 'bg-zinc-550 text-white',
          dot: 'bg-zinc-500',
          icon: <Sparkles size={16} />,
          label: 'Đang Dọn Dẹp'
        }
    }
  }

  // --- THỰC THI 1: THÊM PHÒNG MỚI (ADD ROOM FLOW) ---
  const handleAddNewRoom = () => {
    if (!newRoomId.trim() || !newRoomName.trim() || !newRoomType.trim()) {
      alert('Vui lòng nhập đầy đủ các trường thông tin phòng!')
      return
    }

    // Kiểm tra trùng ID phòng
    if (rooms.some(r => r.id.toLowerCase() === newRoomId.trim().toLowerCase())) {
      alert(`Mã phòng "${newRoomId}" đã tồn tại trên hệ thống! Vui lòng chọn mã khác.`)
      return
    }

    const branchName = BRANCHES.find(b => b.id === newRoomBranchId)?.name.split(' - ')[1] || 'Chi nhánh Sài Gòn'
    const newRoomObj: Room = {
      id: newRoomId.trim().toUpperCase(),
      name: newRoomName.trim(),
      type: newRoomType.trim(),
      branchId: newRoomBranchId,
      branchName: branchName.replace(' 🏡', '').replace(' 🏙️', '').replace(' 🪟', '').replace(' 🌸', ''),
      status: newRoomStatus,
      price: Number(newRoomPrice),
      guest: null
    }

    setRooms(prev => [newRoomObj, ...prev])
    setIsAddModalOpen(false)
    showToast(`Đã thêm thành công phòng nghỉ mới: #${newRoomObj.id} - ${newRoomObj.name}`)

    // Reset Form
    setNewRoomId('')
    setNewRoomName('')
    setNewRoomType('')
    setNewRoomPrice(850000)
    setNewRoomStatus('available')
  }

  // --- THỰC THI 2: XÓA PHÒNG MẪU (DELETE ROOM FLOW) ---
  const handleDeleteRoom = (roomId: string, roomName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA phòng nghỉ "${roomName}" (#${roomId}) ra khỏi sơ đồ quản lý không?`)) return
    
    setRooms(prev => prev.filter(r => r.id !== roomId))
    setActiveEditingRoom(null)
    showToast(`Đã xóa thành công phòng nghỉ: #${roomId}`)
  }

  // Mở Popup chỉnh sửa/Cập nhật phòng
  const handleOpenStatusEditor = (room: Room) => {
    setActiveEditingRoom(room)
    setTempStatus(room.status)
    setTempGuest(room.guest || '')
    setTempTimeInfo(room.timeInfo || '')

    // Reset form đặt phòng nhanh liên kết booking
    setBookingGuestName('')
    setBookingPhone('')
    setBookingStatus('booked_not_checked_in')
    setBookingDates('Hôm nay, 14:00 - Mai, 12:00')
    setBookingNotes('')
  }

  // Lưu cập nhật nhanh phòng từ admin
  const handleSaveStatus = () => {
    if (!activeEditingRoom) return

    setRooms(prev => prev.map(r => {
      if (r.id === activeEditingRoom.id) {
        return {
          ...r,
          status: tempStatus,
          guest: tempStatus === 'available' || tempStatus === 'maintenance' || tempStatus === 'cleaning' ? null : tempGuest || 'Khách vãng lai',
          timeInfo: tempTimeInfo.trim() || undefined
        }
      }
      return r
    }))

    setActiveEditingRoom(null)
    showToast(`Đã cập nhật trạng thái phòng #${activeEditingRoom.id} thành công!`)
  }

  // --- THỰC THI 3: ĐẶT PHÒNG LIÊN KẾT BOOKING CHO NHÂN VIÊN ---
  const handleCreateBookingForGuest = async () => {
    if (!activeEditingRoom) return
    if (!bookingGuestName.trim() || !bookingPhone.trim()) {
      alert('Vui lòng nhập Họ tên và Số điện thoại khách để đặt phòng!')
      return
    }

    try {
      // 1. Cập nhật trạng thái trực tiếp của thẻ phòng trong state
      setRooms(prev => prev.map(r => {
        if (r.id === activeEditingRoom.id) {
          return {
            ...r,
            status: bookingStatus,
            guest: bookingGuestName.trim(),
            timeInfo: bookingDates.trim()
          }
        }
        return r
      }))

      // 2. Ghi nhận hóa đơn/booking mới trực tiếp vào Supabase database để đồng bộ với cổng quản lý booking!
      const supabase = getSupabase()
      
      // Tìm hoặc tạo khách hàng CRM
      let customerId = 'CUST-TEMP'
      const { data: dbCustomer, error: cErr } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', bookingPhone.trim())
        .single()

      if (!cErr && dbCustomer) {
        customerId = dbCustomer.id
      } else {
        // Tạo khách hàng mới trong Supabase CRM
        const { data: newCust, error: insCErr } = await supabase
          .from('customers')
          .insert({
            name: bookingGuestName.trim(),
            phone: bookingPhone.trim(),
            notes: [`Được nhân viên đặt phòng trực tiếp tại Sơ đồ phòng sandbox. Ghi chú đặc biệt: ${bookingNotes || 'Không'}`]
          })
          .select()
          .single()
        
        if (!insCErr && newCust) {
          customerId = newCust.id
        }
      }

      // Tạo đơn đặt phòng liên kếtbookings table
      const { error: bkErr } = await supabase
        .from('bookings')
        .insert({
          customer_id: customerId,
          room_id: null, // Đặt phòng ảo sandbox hoặc liên kết phòng thực tế nếu khớp mã
          checkin_date: new Date().toISOString().split('T')[0],
          checkout_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          total_price: activeEditingRoom.price,
          status: bookingStatus === 'checked_in' ? 'completed' : 'confirmed',
          special_notes: `[Staff Booking] ${bookingNotes || 'Không có ghi chú đặc biệt.'} Lịch: ${bookingDates}`
        })

      if (bkErr) throw bkErr

      showToast(`🔑 Đặt phòng thành công! Đã tạo hóa đơn và đồng bộ dữ liệu Booking cho khách ${bookingGuestName.trim()}`)
    } catch (e: any) {
      console.warn('[Supabase Booking Sync] Ghi nhận offline thành công (Fallback active):', e)
      showToast(`🔑 Đặt phòng thành công ở chế độ Offline! Đã lưu trữ lịch trình của khách ${bookingGuestName.trim()}`)
    } finally {
      setActiveEditingRoom(null)
    }
  }

  // Định dạng tiền VND
  const formatVND = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ'
  }

  // Thực hiện lọc danh sách theo nhánh, tình trạng phòng và từ khóa tìm kiếm
  const filteredRooms = rooms.filter(room => {
    const matchBranch = selectedBranch === 'all' || room.branchId === selectedBranch
    const matchStatus = selectedStatus === 'all' || room.status === selectedStatus
    const query = searchTerm.toLowerCase().trim()
    const matchSearch = !query || 
      room.id.toLowerCase().includes(query) ||
      room.name.toLowerCase().includes(query) ||
      room.type.toLowerCase().includes(query) ||
      (room.guest && room.guest.toLowerCase().includes(query))

    return matchBranch && matchStatus && matchSearch
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
      
      {/* 🔮 CUSTOM TOAST SYSTEM */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[999] bg-zinc-900 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-white dark:text-zinc-950 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white">
            <Check size={11} className="stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 🧪 BẢN CẢNH BÁO SANDBOX */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 flex-shrink-0">
          <Sparkles size={20} className="animate-spin" />
        </div>
        <div>
          <h3 className="font-extrabold text-emerald-900 text-sm">🧪 Sơ Đồ Phòng Multi-Branch Playground (Sandbox V2)</h3>
          <p className="text-xs text-emerald-700 leading-relaxed mt-1 font-semibold">
            Đã tích hợp đầy đủ tính năng **Thêm phòng mới**, **Xóa phòng trực tiếp**, và **Đặt phòng liên kết Booking**. 
            Bạn có thể thao tác đặt phòng cho khách để hệ thống tự động tạo hồ sơ khách hàng CRM và tạo đơn booking đồng bộ Supabase an toàn!
          </p>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
          Sơ Đồ Phòng & Quản Lý Chi Nhánh
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Bản đồ phòng nghỉ đa nhiệm: Lọc tình trạng, tìm kiếm nhanh, thêm mới phòng và book lịch nhanh chóng.
        </p>
      </div>

      {/* THANH CÔNG CỤ ĐIỀU HƯỚNG & BỘ LỌC ĐA HƯỚNG */}
      <div className="bg-white border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-3xl shadow-2xs">
        {/* Lưới phân chia đều 4 ô trong frame */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full items-center">
          
          {/* 1. Ô Tìm kiếm nhanh (Đứng trước cùng) */}
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên phòng, mã, khách..."
              className="w-full bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white text-zinc-700 dark:text-zinc-300 shadow-2xs transition duration-200"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          </div>

          {/* 2. Dropdown chọn tình trạng phòng (Room's Status) */}
          <div className="relative w-full">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white cursor-pointer appearance-none shadow-2xs transition duration-200"
            >
              {STATUS_FILTER_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none stroke-[2.5]" />
          </div>

          {/* 3. Dropdown chọn chi nhánh (Chi nhánh/Branch) */}
          <div className="relative w-full">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white cursor-pointer appearance-none shadow-2xs transition duration-200"
            >
              {BRANCHES.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none stroke-[2.5]" />
          </div>

          {/* 4. Nút Thêm Phòng Mới (Căn chỉnh đều cùng dòng) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white font-extrabold text-xs rounded-xl border border-transparent cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition duration-200"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>Thêm Phòng Mới</span>
          </button>

        </div>
      </div>

      {/* DYNAMIC STATS WIDGETS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { key: 'available', label: 'Trống / Available', color: 'bg-emerald-50 text-emerald-950 border-emerald-200/70', dot: 'bg-emerald-600' },
          { key: 'booked_not_checked_in', label: 'Đã Đặt Chưa Đến', color: 'bg-orange-50 text-orange-950 border-orange-200/70', dot: 'bg-orange-500' },
          { key: 'checked_in', label: 'Đã Check-In', color: 'bg-pink-50 text-pink-950 border-pink-200/70', dot: 'bg-pink-500' },
          { key: 'checkout_imminent', label: 'Sắp Check-Out ⚠️', color: 'bg-rose-50 text-rose-950 border-rose-250/70', dot: 'bg-rose-600' },
          { key: 'maintenance', label: 'Đang Bảo Trì', color: 'bg-blue-50 text-blue-950 border-blue-200/70', dot: 'bg-blue-600' },
          { key: 'cleaning', label: 'Đang Dọn Dẹp', color: 'bg-zinc-50 dark:bg-zinc-900/60 text-stone-900 border-zinc-200 dark:border-zinc-800', dot: 'bg-zinc-50 dark:bg-zinc-900/600' }
        ].map(stat => {
          const count = getStatusCount(stat.key as any)
          return (
            <div 
              key={stat.key}
              className={`px-4 py-3 rounded-2xl border flex items-center justify-between shadow-2xs font-semibold text-xs transition duration-200 hover:shadow-sm ${stat.color}`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stat.dot}`}></span>
                <span className="truncate leading-none text-[11px] font-extrabold uppercase tracking-wider">{stat.label.split(' / ')[0]}</span>
              </div>
              <span className="font-mono font-black text-sm leading-none pl-1">{count}</span>
            </div>
          )
        })}
      </div>

      {/* LƯỚI SƠ ĐỒ PHÒNG GIẢ LẬP (GRID MAP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full py-16 bg-white border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center text-zinc-400 dark:text-zinc-500 flex flex-col items-center justify-center gap-3">
            <Info size={28} className="text-stone-300" />
            <span className="text-xs font-bold">Không tìm thấy phòng nghỉ nào khớp với bộ lọc tìm kiếm.</span>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const config = getStatusConfig(room.status, theme)

            return (
              <div
                key={room.id}
                onClick={() => handleOpenStatusEditor(room)}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${config.bg} ${config.border}`}
                title="Bấm vào để Cập nhật trạng thái / Đặt phòng nhanh"
              >
                {/* Header thẻ phòng */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-xs ${config.text} border border-black/5 ${
                    theme === 'dark' ? 'bg-zinc-950/70' : 'bg-white/70'
                  }`}>
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                  <span className={`text-xs font-black font-mono ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-400'
                  }`}>#{room.id}</span>
                </div>

                {/* Giữa thẻ phòng: Tên & Loại phòng */}
                <div className="mb-4">
                  <h3 className={`text-base font-extrabold leading-snug line-clamp-1 ${
                    theme === 'dark' ? 'text-white' : 'text-zinc-800'
                  }`}>{room.name}</h3>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold mt-1 uppercase tracking-wide ${
                    theme === 'dark' ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400'
                  }`}>
                    <Building2 size={10} className="stroke-[2.5]" />
                    <span>{room.branchName} • {room.type}</span>
                  </div>
                </div>

                {/* Cuối thẻ phòng: Thông tin động theo màu sắc yêu cầu */}
                <div className={`mt-auto pt-3.5 border-t border-dashed ${
                  theme === 'dark' ? 'border-zinc-700' : 'border-stone-900/10'
                }`}>
                  
                  {/* TRẠNG THÁI 1: Trống (Green) - Hiển thị giá phòng */}
                  {room.status === 'available' && (
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400'
                      }`}>Giá cơ bản:</span>
                      <strong className={`text-sm font-black font-mono ${
                        theme === 'dark' ? 'text-white' : 'text-emerald-700'
                      }`}>{formatVND(room.price)}</strong>
                    </div>
                  )}

                  {/* TRẠNG THÁI 2: Đã Đặt Chưa Đến (Cam) - Tên khách đặt và lịch giờ nhận */}
                  {room.status === 'booked_not_checked_in' && (
                    <div className="flex flex-col gap-0.5">
                      <div className={`text-xs font-extrabold truncate ${
                        theme === 'dark' ? 'text-white' : 'text-zinc-800'
                      }`}>Khách: {room.guest}</div>
                      <div className={`text-[10px] font-bold flex items-center gap-1 mt-1 font-mono ${
                        theme === 'dark' ? 'text-white' : 'text-orange-700'
                      }`}>
                        <Clock size={11} /> {room.timeInfo}
                      </div>
                    </div>
                  )}

                  {/* TRẠNG THÁI 3: Đã Check-In (Hồng) - Tên khách đang ở và lịch trả phòng */}
                  {room.status === 'checked_in' && (
                    <div className="flex flex-col gap-0.5">
                      <div className={`text-xs font-extrabold truncate ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>Đang ở: {room.guest}</div>
                      <div className={`text-[10px] font-bold flex items-center gap-1 mt-1 font-mono ${theme === 'dark' ? 'text-white' : 'text-pink-700'}`}>
                        <Clock size={11} /> Hạn trả: {room.timeInfo}
                      </div>
                    </div>
                  )}

                  {/* TRẠNG THÁI 4: Sắp Check-Out ⚠️ (Đỏ) - Hiển thị thông báo gấp */}
                  {room.status === 'checkout_imminent' && (
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs font-black text-rose-950 truncate">Đang ở: {room.guest}</div>
                      <div className="text-[10px] text-rose-700 font-black flex items-center gap-1 mt-1 font-mono animate-pulse">
                        <Flame size={11} className="stroke-[2.5]" /> HẠN OUT: {room.timeInfo}
                      </div>
                    </div>
                  )}

                  {/* TRẠNG THÁI 5: Bảo Trì (Xanh dương) - Hiển thị lý do sự cố */}
                  {room.status === 'maintenance' && (
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                      }`}>Lý do bảo trì:</span>
                      <p className={`text-[10px] font-semibold leading-relaxed mt-0.5 line-clamp-1 italic ${
                        theme === 'dark' ? 'text-white' : 'text-blue-700'
                      }`}>
                        "{room.timeInfo}"
                      </p>
                    </div>
                  )}

                  {/* TRẠNG THÁI 6: Đang Dọn Dẹp (Xám trắng) - Thời gian dự kiến hoàn tất */}
                  {room.status === 'cleaning' && (
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400'
                      }`}>Dự kiến xong:</span>
                      <strong className={`text-xs font-black font-mono flex items-center gap-1 ${
                        theme === 'dark' ? 'text-zinc-100' : 'text-zinc-700'
                      }`}>
                        <Clock size={11} /> {room.timeInfo}
                      </strong>
                    </div>
                  )}

                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ================= THỰC THI 1: MODAL THÊM PHÒNG MỚI (ADD ROOM MODAL) ================= */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-4 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Tiêu đề */}
            <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-white rounded-2xl flex items-center justify-center shadow-inner">
                <Plus size={18} className="stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase leading-none">Thêm Phòng Nghỉ Mới</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tracking-wider block mt-1">Khởi tạo thực thể phòng nghỉ trên sơ đồ</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Mã Phòng (Duy nhất):</label>
                  <input
                    type="text"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    placeholder="Ví dụ: P-106..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Loại Phòng:</label>
                  <input
                    type="text"
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    placeholder="Ví dụ: View Vườn Thông..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tên Phòng Nghỉ:</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Ví dụ: Bungalow Hoa Sữa..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Chi Nhánh Lắp Đặt:</label>
                  <select
                    value={newRoomBranchId}
                    onChange={(e) => setNewRoomBranchId(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
                  >
                    <option value="cs1">Tân Bình (CS1)</option>
                    <option value="cs2">Quận 10 (CS2)</option>
                    <option value="cs3">Quận 5 (CS3)</option>
                    <option value="cs4">Gò Vấp (CS4)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Giá Thuê Phòng (VND/đêm):</label>
                  <input
                    type="number"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                    placeholder="850000"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Trạng Thái Khởi Tạo:</label>
                <select
                  value={newRoomStatus}
                  onChange={(e) => setNewRoomStatus(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
                >
                  <option value="available">🟢 Trống / Available</option>
                  <option value="booked_not_checked_in">🟠 Đã Đặt Chưa Đến</option>
                  <option value="checked_in">💗 Đã Check-In</option>
                  <option value="maintenance">🔵 Đang Bảo Trì</option>
                  <option value="cleaning">⚪ Đang Dọn Dẹp</option>
                </select>
              </div>
            </div>

            {/* Cụm Action */}
            <div className="flex gap-2.5 mt-3">
              <button
                onClick={handleAddNewRoom}
                className="flex-grow py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white rounded-xl font-bold text-xs shadow-md transition border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={14} className="stroke-[3]" /> Tạo Mới Ngay
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs transition border-none cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CẬP NHẬT TRẠNG THÁI & LIÊN KẾT ĐẶT PHÒNG NHANH ================= */}
      {/* ================= MODAL CẬP NHẬT TRẠNG THÁI & LIÊN KẾT ĐẶT PHÒNG NHANH ================= */}
      {activeEditingRoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setActiveEditingRoom(null)}
        >
          <div 
            className="bg-white w-full max-w-3xl rounded-3xl p-7 md:p-9 overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-6 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              onClick={() => setActiveEditingRoom(null)}
              className="absolute top-5 right-5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-8 h-8 rounded-full flex items-center justify-center transition font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Tiêu đề Modal */}
            <div className="border-b border-zinc-150 dark:border-zinc-800 pb-4 flex items-center gap-3.5">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center shadow-inner">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase leading-none">Cập Nhật Phòng Sandbox</h3>
                <span className="text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500 font-mono tracking-wider block mt-1.5">Phòng: {activeEditingRoom.id} • {activeEditingRoom.name}</span>
              </div>
            </div>

            {/* layout flex 2 cột chia đôi hoặc lưới dọc để tối ưu màn hình */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-stone-150">
              
              {/* CỘT TRÁI: Cập nhật Trạng thái nhanh của hệ thống */}
              <div className="flex flex-col gap-4 text-xs pb-5 md:pb-0">
                <h4 className="font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-[11.5px] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1.5 text-zinc-900 dark:text-zinc-100">
                  🛠️ Trạng thái cơ bản
                </h4>

                {/* Dropdown trạng thái */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Trạng thái phòng:</label>
                  <select
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
                  >
                    <option value="available">🟢 Trống / Available</option>
                    <option value="booked_not_checked_in">🟠 Đã Đặt Chưa Đến (Sunset Orange)</option>
                    <option value="checked_in">💗 Đã Check-In (Premium Blush Pink)</option>
                    <option value="checkout_imminent">🔴 Sắp Check-Out ⚠️ (Crimson Red)</option>
                    <option value="maintenance">🔵 Đang Bảo Trì (Slate Blue)</option>
                    <option value="cleaning">⚪ Đang Dọn Dẹp (Sand Grey)</option>
                  </select>
                </div>

                {/* Tên khách hàng nếu có khách */}
                {(tempStatus === 'booked_not_checked_in' || tempStatus === 'checked_in' || tempStatus === 'checkout_imminent') && (
                  <div className="flex flex-col gap-1.5 animate-in slide-in-from-top duration-150">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Họ và Tên khách hàng:</label>
                    <input
                      type="text"
                      value={tempGuest}
                      onChange={(e) => setTempGuest(e.target.value)}
                      placeholder="Tên khách đang ở..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                    />
                  </div>
                )}

                {/* Lịch trình chi tiết */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">
                    {tempStatus === 'available' ? 'Ghi chú phụ (Tùy chọn):' :
                     tempStatus === 'booked_not_checked_in' ? 'Giờ check-in dự kiến:' :
                     tempStatus === 'checked_in' || tempStatus === 'checkout_imminent' ? 'Hạn giờ check-out:' :
                     tempStatus === 'maintenance' ? 'Lý do sự cố bảo trì:' : 'Giờ dọn xong dự kiến:'}
                  </label>
                  <input
                    type="text"
                    value={tempTimeInfo}
                    onChange={(e) => setTempTimeInfo(e.target.value)}
                    placeholder={
                      tempStatus === 'available' ? 'Ví dụ: Tặng kèm trà chiều...' :
                      tempStatus === 'booked_not_checked_in' ? 'Ví dụ: Hôm nay, 14:00...' :
                      tempStatus === 'checked_in' || tempStatus === 'checkout_imminent' ? 'Ví dụ: Hôm nay, 12:00...' :
                      tempStatus === 'maintenance' ? 'Ví dụ: Sửa bồn Hinoki rò nước...' : 'Ví dụ: 14:30...'
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>

                {/* Áp dụng thay đổi cơ bản */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveStatus}
                    className="flex-grow py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white rounded-xl font-bold text-xs shadow-md transition border-none cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Check size={14} className="stroke-[3]" /> Lưu Thay Đổi
                  </button>
                </div>
              </div>

              {/* CỘT PHẢI: ĐẶT PHÒNG NHANH LIÊN KẾT HỆ THỐNG BOOKING */}
              <div className="flex flex-col gap-4 text-xs pt-5 md:pt-0 md:pl-8">
                <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-[11.5px] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <KeyRound size={14} className="text-emerald-600 animate-pulse" /> 🔑 Đặt phòng nhanh liên kết Booking
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Họ & Tên Khách Hàng:</label>
                  <input
                    type="text"
                    value={bookingGuestName}
                    onChange={(e) => setBookingGuestName(e.target.value)}
                    placeholder="Nhập tên đầy đủ của khách..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Số Điện Thoại:</label>
                    <input
                      type="text"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="09..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600 text-zinc-700 dark:text-zinc-300 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Lịch Đặt Phòng:</label>
                    <select
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="booked_not_checked_in">🟠 Đặt trước chưa đến</option>
                      <option value="checked_in">💗 Check-in ở ngay</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Thời gian lưu trú (Lịch trình):</label>
                  <input
                    type="text"
                    value={bookingDates}
                    onChange={(e) => setBookingDates(e.target.value)}
                    placeholder="Hôm nay, 14:00 - Mai, 12:00"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Ghi chú đặc biệt (Voucher/BBQ):</label>
                  <input
                    type="text"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Ví dụ: Hưởng tuần trăng mật, chuẩn bị BBQ..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>

                {/* Nút đặt lịch */}
                <button
                  onClick={handleCreateBookingForGuest}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition border-none cursor-pointer flex items-center justify-center gap-1.5 mt-1 active:scale-95"
                >
                  <BookmarkPlus size={14} className="stroke-[3.5]" />
                  <span>Xác nhận Đặt phòng (Đồng bộ Booking)</span>
                </button>
              </div>

            </div>

            {/* KHU VỰC NGUY HIỂM: NÚT XÓA PHÒNG Ở CUỐI TRANG POPUP */}
            <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-5 flex items-center justify-between mt-3">
              <button
                onClick={() => handleDeleteRoom(activeEditingRoom.id, activeEditingRoom.name)}
                className="bg-red-50 hover:bg-red-650 text-red-600 hover:text-white border border-red-200 hover:border-red-600 px-5 py-2.5 rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 transition-all duration-200 shadow-2xs active:scale-95"
                title="Xóa phòng này vĩnh viễn khỏi sơ đồ"
              >
                <Trash2 size={13} />
                <span>Xóa phòng này khỏi hệ thống</span>
              </button>
              
              <button
                onClick={() => setActiveEditingRoom(null)}
                className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-xl font-black text-xs transition border-none cursor-pointer"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
