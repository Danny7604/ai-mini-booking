'use client'

import React, { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAdminData } from '../AdminDataContext'
import RoomActionModal from '@/components/admin/RoomActionModal'
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
  timeInfo?: string // Giờ Check-in/Check-out dự kiến, lý do bảo trì hoặc giờ xong dọn dẹp
  hourlyPrice?: number
  description?: string
  amenities?: string[]
  tags?: string[]
  imageUrl?: string
  isPublished?: boolean
  isFeatured?: boolean
}

const PRESET_IMAGES = [
  { name: 'Bungalow Rừng Thông 🌲', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hinoki River View 🌊', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Rustic Wooden Lodge 🏡', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sunset Starview Dome 🌌', url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80' }
]

const PREDEFINED_FEATURES = [
  { id: 'bath', label: 'Bồn tắm 🛁', amenity: 'Bồn tắm gỗ ngoài trời' },
  { id: 'cloud', label: 'Săn mây ☁️', amenity: 'Ban công kính ngắm mây' },
  { id: 'couple', label: 'Cặp đôi 👩‍❤️‍👨', amenity: 'Trang trí nến & hoa cặp đôi' },
  { id: 'family', label: 'Gia đình 🏡', amenity: 'Bàn ăn gia đình rộng rãi' },
  { id: 'budget', label: 'Tiết kiệm 🏷️', amenity: 'Đầy đủ tiện ích cơ bản' },
  { id: 'pool', label: 'Hồ bơi 🏊‍♂️', amenity: 'Hiên tắm nắng cạnh hồ bơi' },
  { id: 'forest', label: 'Mộc mạc 🌲', amenity: 'Vách gỗ thông nguyên khối' },
  { id: 'bbq', label: 'Bếp BBQ 🍖', amenity: 'Sân BBQ nướng thịt ngoài trời' },
  { id: 'projector', label: 'Máy chiếu 📽️', amenity: 'Máy chiếu màn ảnh rộng HD' },
  { id: 'silent', label: 'Yên tĩnh 🤫', amenity: 'Kính cách âm chống ồn' }
]

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
  const { rooms, setRooms, isLoadingRooms, theme } = useAdminData()
  const isLoading = isLoadingRooms
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
  const [newRoomHourlyPrice, setNewRoomHourlyPrice] = useState<number>(100000)
  const [newRoomDescription, setNewRoomDescription] = useState<string>('')
  const [newRoomImageUrl, setNewRoomImageUrl] = useState<string>('')
  const [newRoomAmenities, setNewRoomAmenities] = useState<string[]>([])
  const [newRoomTags, setNewRoomTags] = useState<string[]>([])
  const [customAmenityInput, setCustomAmenityInput] = useState<string>('')
  const [newRoomStatus, setNewRoomStatus] = useState<Room['status']>('available')

  // States quản lý CẬP NHẬT TRẠNG THÁI PHÒNG (POPUP) & ĐẶT PHÒNG LIÊN KẾT BOOKING
  const [activeEditingRoom, setActiveEditingRoom] = useState<Room | null>(null)
  const [tempStatus, setTempStatus] = useState<Room['status']>('available')
  const [tempGuest, setTempGuest] = useState<string>('')
  const [tempTimeInfo, setTempTimeInfo] = useState<string>('')
  const [tempIsPublished, setTempIsPublished] = useState(true)
  const [tempIsFeatured, setTempIsFeatured] = useState(false)

  // States chọn giờ/ngày Check-in & Check-out kiểu dropdown
  const [tempCheckinDay, setTempCheckinDay] = useState('Hôm nay')
  const [tempCheckinTime, setTempCheckinTime] = useState('14:00')
  const [tempCheckoutDay, setTempCheckoutDay] = useState('Ngày mai')
  const [tempCheckoutTime, setTempCheckoutTime] = useState('12:00')

  // States quản lý quy trình duyệt đăng 2 bước
  const [isConfirmWizardOpen, setIsConfirmWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [wizardIsPublished, setWizardIsPublished] = useState(true)
  const [wizardIsFeatured, setWizardIsFeatured] = useState(false)

  // State phụ phục vụ ĐẶT PHÒNG NHANH CHO KHÁCH (Nhân viên thao tác)
  const [bookingGuestName, setBookingGuestName] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingStatus, setBookingStatus] = useState<'booked_not_checked_in' | 'checked_in'>('booked_not_checked_in')
  const [bookingDates, setBookingDates] = useState('Hôm nay, 14:00 - Mai, 12:00')
  const [bookingNotes, setBookingNotes] = useState('')


  // Đọc tham số tìm kiếm từ URL khi tải trang lần đầu
  useEffect(() => {
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
  const handleAddNewRoom = async () => {
    if (!newRoomId.trim() || !newRoomName.trim() || !newRoomType.trim()) {
      alert('Vui lòng nhập đầy đủ các trường thông tin phòng!')
      return
    }

    if (rooms.some(r => r.id.toLowerCase() === newRoomId.trim().toLowerCase())) {
      alert(`Mã phòng "${newRoomId}" đã tồn tại! Vui lòng chọn mã khác.`)
      return
    }

    // Kích hoạt Quy trình duyệt đăng 2 bước (Double Confirmation Wizard)
    setWizardStep(1)
    setWizardIsPublished(true)
    setWizardIsFeatured(false)
    setIsConfirmWizardOpen(true)
  }

  // Thực thi lưu phòng thực tế sau khi được xác nhận qua Wizard
  const executeSaveRoom = async (isPub: boolean, isFeat: boolean) => {
    const branchNameClean = BRANCHES.find(b => b.id === newRoomBranchId)?.name.split(' - ')[1] || 'Tân Bình (CS1)'
    const displayBranchName = branchNameClean.replace(' 🏡', '').replace(' 🏙️', '').replace(' 🪟', '').replace(' 🌸', '')

    const metadata = {
      imageUrl: newRoomImageUrl.trim() || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
      hourlyPrice: Number(newRoomHourlyPrice),
      description: newRoomDescription.trim() || `Trải nghiệm căn phòng ${newRoomName} tuyệt đẹp tại chi nhánh Dancin Home.`,
      amenities: newRoomAmenities,
      tags: newRoomTags,
      isPublished: isPub,
      isFeatured: isFeat
    }

    const metadataString = JSON.stringify(metadata)

    const newRoomObj: Room = {
      id: newRoomId.trim().toUpperCase(),
      name: newRoomName.trim(),
      type: newRoomType.trim(),
      branchId: newRoomBranchId,
      branchName: displayBranchName,
      status: newRoomStatus,
      price: Number(newRoomPrice),
      hourlyPrice: Number(newRoomHourlyPrice),
      description: metadata.description,
      amenities: newRoomAmenities,
      tags: newRoomTags,
      imageUrl: metadata.imageUrl,
      isPublished: isPub,
      isFeatured: isFeat,
      guest: null
    }

    setRooms(prev => [newRoomObj, ...prev])
    setIsAddModalOpen(false)
    setIsConfirmWizardOpen(false)

    try {
      const supabase = getSupabase()
      const dbBranchName = newRoomBranchId === 'cs1' ? 'CS1 - Tân Bình 🏡' :
                           newRoomBranchId === 'cs2' ? 'CS2 - Quận 10 🏙️' :
                           newRoomBranchId === 'cs3' ? 'CS3 - Quận 5 🪟' : 'CS4 - Gò Vấp 🌸'

      let dbStatus: 'available' | 'occupied' | 'maintenance' = 'available'
      if (newRoomStatus === 'checked_in') dbStatus = 'occupied'
      else if (newRoomStatus === 'maintenance') dbStatus = 'maintenance'

      const capacity = parseInt(newRoomType.replace(/[^0-9]/g, '')) || 2

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name: newRoomName.trim(),
          branch: dbBranchName,
          capacity,
          price: Number(newRoomPrice),
          status: dbStatus,
          thumbnail: metadataString // Lưu JSON Payload đầy đủ!
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setRooms(prev => prev.map(r => r.id === newRoomObj.id ? { ...r, id: data.id } : r))
        showToast(`Đã lưu phòng mới lên Supabase! Trạng thái: ${isPub ? (isFeat ? 'Nổi bật 🔥' : 'Công khai 🌐') : 'Bản nháp 🔒'}`)
      }
    } catch (e: any) {
      console.warn('[Supabase Insert] Ghi nhận offline (Fallback active):', e)
      showToast(`Đã lưu phòng mới cục bộ thành công! Trạng thái: ${isPub ? (isFeat ? 'Nổi bật 🔥' : 'Công khai 🌐') : 'Bản nháp 🔒'}`)
    } finally {
      setNewRoomId('')
      setNewRoomName('')
      setNewRoomType('')
      setNewRoomPrice(850000)
      setNewRoomHourlyPrice(100000)
      setNewRoomDescription('')
      setNewRoomImageUrl('')
      setNewRoomAmenities([])
      setNewRoomTags([])
      setNewRoomStatus('available')
    }
  }

  // Chuyển đổi nhanh trạng thái Công khai/Bản nháp của phòng trực tiếp từ Sơ đồ
  const handleTogglePublish = async (room: Room, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedPub = !room.isPublished
    const updatedFeat = updatedPub ? room.isFeatured || false : false

    setRooms(prev => prev.map(r => {
      if (r.id === room.id) {
        return {
          ...r,
          isPublished: updatedPub,
          isFeatured: updatedFeat
        }
      }
      return r
    }))

    try {
      const supabase = getSupabase()

      const meta = {
        imageUrl: room.imageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
        hourlyPrice: room.hourlyPrice || Math.round(room.price / 10),
        description: room.description || `Trải nghiệm căn phòng ${room.name} tuyệt đẹp tại chi nhánh Dancin Home.`,
        amenities: room.amenities || [],
        tags: room.tags || [],
        isPublished: updatedPub,
        isFeatured: updatedFeat
      }

      if (room.id.length === 36) {
        const { error } = await supabase
          .from('rooms')
          .update({ thumbnail: JSON.stringify(meta) })
          .eq('id', room.id)

        if (error) throw error
      } else {
        // Tự động insert mới mockup room lên Supabase
        const dbBranchName = room.branchId === 'cs1' ? 'CS1 - Tân Bình 🏡' :
                             room.branchId === 'cs2' ? 'CS2 - Quận 10 🏙️' :
                             room.branchId === 'cs3' ? 'CS3 - Quận 5 🪟' : 'CS4 - Gò Vấp 🌸'
        
        let dbStatus: 'available' | 'occupied' | 'maintenance' = 'available'
        if (room.status === 'checked_in' || room.status === 'checkout_imminent') dbStatus = 'occupied'
        else if (room.status === 'maintenance') dbStatus = 'maintenance'

        const capacity = parseInt(room.type.replace(/[^0-9]/g, '')) || 2

        const { data, error } = await supabase
          .from('rooms')
          .insert({
            name: room.name,
            branch: dbBranchName,
            capacity,
            price: Number(room.price),
            status: dbStatus,
            thumbnail: JSON.stringify(meta)
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setRooms(prev => prev.map(r => r.id === room.id ? { ...r, id: data.id, isPublished: updatedPub, isFeatured: updatedFeat } : r))
        }
      }
      showToast(`Đã chuyển trạng thái phòng sang: ${updatedPub ? 'Công khai 🌐' : 'Ẩn (Bản nháp) 🔒'}`)
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái hiển thị phòng:', err)
      showToast(`Lỗi đồng bộ. Đã đổi trạng thái phòng cục bộ!`)
    }
  }

  // --- THỰC THI 2: XÓA PHÒNG MẪU (DELETE ROOM FLOW) ---
  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA phòng nghỉ "${roomName}" khỏi hệ thống không?`)) return
    
    const originalRooms = [...rooms]
    setRooms(prev => prev.filter(r => r.id !== roomId))
    setActiveEditingRoom(null)

    try {
      const supabase = getSupabase()
      if (roomId.length === 36) {
        const { error } = await supabase
          .from('rooms')
          .delete()
          .eq('id', roomId)

        if (error) throw error
      }
      showToast(`Đã xóa thành công phòng: #${roomId.substring(0, 8)}`)
    } catch (e) {
      console.error('Lỗi khi xóa phòng trên Supabase:', e)
      setRooms(originalRooms)
      alert('Không thể thực hiện xóa phòng trên Supabase. Đang hoàn tác...')
    }
  }

  // Mở Popup chỉnh sửa/Cập nhật phòng
  const handleOpenStatusEditor = (room: Room) => {
    setActiveEditingRoom(room)
    setTempStatus(room.status)
    setTempGuest(room.guest || '')
    setTempTimeInfo(room.timeInfo || '')
    setTempIsPublished(room.isPublished !== undefined ? room.isPublished : true)
    setTempIsFeatured(room.isFeatured || false)

    // Parse ngày & giờ Check-in / Check-out từ timeInfo của phòng mẫu
    let checkinDay = 'Hôm nay'
    let checkinTime = '14:00'
    let checkoutDay = 'Ngày mai'
    let checkoutTime = '12:00'

    if (room.timeInfo) {
      const parts = room.timeInfo.split(' - ')
      if (parts.length === 2) {
        // Có dạng "Hôm nay, 14:00 - Mai, 12:00"
        const ciParts = parts[0].split(', ')
        if (ciParts.length === 2) {
          checkinDay = ciParts[0].trim()
          checkinTime = ciParts[1].trim()
        }
        const coParts = parts[1].split(', ')
        if (coParts.length === 2) {
          checkoutDay = coParts[0].trim()
          if (checkoutDay === 'Mai') checkoutDay = 'Ngày mai'
          checkoutTime = coParts[1].trim()
        }
      } else {
        // Chỉ có dạng "Hôm nay, 12:00"
        const ciParts = room.timeInfo.split(', ')
        if (ciParts.length === 2) {
          checkinDay = ciParts[0].trim()
          checkinTime = ciParts[1].trim()
        }
      }
    }

    setTempCheckinDay(checkinDay)
    setTempCheckinTime(checkinTime)
    setTempCheckoutDay(checkoutDay)
    setTempCheckoutTime(checkoutTime)

    setBookingGuestName('')
    setBookingPhone('')
    setBookingStatus('booked_not_checked_in')
    setBookingDates('Hôm nay, 14:00 - Mai, 12:00')
    setBookingNotes('')
  }

  // Lưu cập nhật nhanh phòng từ admin
  const handleSaveStatus = async (
    updatedStatusVal?: Room['status'],
    updatedGuestVal?: string | null,
    updatedTimeInfoVal?: string,
    updatedPubVal?: boolean,
    updatedFeatVal?: boolean
  ) => {
    if (!activeEditingRoom) return

    const updatedStatus = updatedStatusVal !== undefined ? updatedStatusVal : tempStatus
    const updatedGuest = updatedGuestVal !== undefined ? updatedGuestVal : (tempStatus === 'available' || tempStatus === 'maintenance' || tempStatus === 'cleaning' ? null : tempGuest || 'Khách vãng lai')
    
    let updatedTimeInfo = updatedTimeInfoVal !== undefined ? updatedTimeInfoVal : (tempTimeInfo.trim() || undefined)
    if (updatedStatusVal === undefined && (updatedStatus === 'booked_not_checked_in' || updatedStatus === 'checked_in' || updatedStatus === 'checkout_imminent')) {
      const shortCoDay = tempCheckoutDay === 'Ngày mai' ? 'Mai' : tempCheckoutDay
      updatedTimeInfo = `${tempCheckinDay}, ${tempCheckinTime} - ${shortCoDay}, ${tempCheckoutTime}`
    }

    const updatedPub = updatedPubVal !== undefined ? updatedPubVal : tempIsPublished
    const updatedFeat = updatedPub ? (updatedFeatVal !== undefined ? updatedFeatVal : tempIsFeatured) : false

    setRooms(prev => prev.map(r => {
      if (r.id === activeEditingRoom.id) {
        return {
          ...r,
          status: updatedStatus,
          guest: updatedGuest,
          timeInfo: updatedTimeInfo,
          isPublished: updatedPub,
          isFeatured: updatedFeat
        }
      }
      return r
    }))

    try {
      const supabase = getSupabase()
      
      let dbStatus: 'available' | 'occupied' | 'maintenance' = 'available'
      if (updatedStatus === 'checked_in' || updatedStatus === 'checkout_imminent') {
        dbStatus = 'occupied'
      } else if (updatedStatus === 'maintenance') {
        dbStatus = 'maintenance'
      }

      const meta = {
        imageUrl: activeEditingRoom.imageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
        hourlyPrice: activeEditingRoom.hourlyPrice || Math.round(activeEditingRoom.price / 10),
        description: activeEditingRoom.description || `Trải nghiệm căn phòng ${activeEditingRoom.name} tuyệt đẹp tại chi nhánh Dancin Home.`,
        amenities: activeEditingRoom.amenities || [],
        tags: activeEditingRoom.tags || [],
        isPublished: updatedPub,
        isFeatured: updatedFeat
      }

      if (activeEditingRoom.id.length === 36) {
        const { error } = await supabase
          .from('rooms')
          .update({ 
            status: dbStatus,
            thumbnail: JSON.stringify(meta)
          })
          .eq('id', activeEditingRoom.id)

        if (error) throw error
        showToast(`Đã cập nhật phòng #${activeEditingRoom.id.substring(0, 8)} lên Supabase! Trạng thái: ${updatedPub ? (updatedFeat ? 'Nổi bật 🔥' : 'Công khai 🌐') : 'Bản nháp 🔒'}`)
      } else {
        // Tự động insert mới mockup room lên Supabase
        const dbBranchName = activeEditingRoom.branchId === 'cs1' ? 'CS1 - Tân Bình 🏡' :
                             activeEditingRoom.branchId === 'cs2' ? 'CS2 - Quận 10 🏙️' :
                             activeEditingRoom.branchId === 'cs3' ? 'CS3 - Quận 5 🪟' : 'CS4 - Gò Vấp 🌸'
        
        const capacity = parseInt(activeEditingRoom.type.replace(/[^0-9]/g, '')) || 2

        const { data, error } = await supabase
          .from('rooms')
          .insert({
            name: activeEditingRoom.name,
            branch: dbBranchName,
            capacity,
            price: Number(activeEditingRoom.price),
            status: dbStatus,
            thumbnail: JSON.stringify(meta)
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setRooms(prev => prev.map(r => r.id === activeEditingRoom.id ? { ...r, id: data.id, isPublished: updatedPub, isFeatured: updatedFeat } : r))
          showToast(`Đã đồng bộ phòng mẫu "${activeEditingRoom.name}" lên Supabase! Trạng thái: ${updatedPub ? (updatedFeat ? 'Nổi bật 🔥' : 'Công khai 🌐') : 'Bản nháp 🔒'}`)
        }
      }
    } catch (e: any) {
      console.warn('[Supabase Update] Ghi nhận offline (Fallback active):', e)
      showToast(`Đã cập nhật trạng thái phòng #${activeEditingRoom.id.substring(0, 8)} thành công!`)
    } finally {
      setActiveEditingRoom(null)
    }
  }

  // --- THỰC THI 3: ĐẶT PHÒNG LIÊN KẾT BOOKING CHO NHÂN VIÊN ---
  const handleCreateBookingForGuest = async () => {
    if (!activeEditingRoom) return
    if (!bookingGuestName.trim() || !bookingPhone.trim()) {
      alert('Vui lòng nhập Họ tên và Số điện thoại khách để đặt phòng!')
      return
    }

    try {
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

      const supabase = getSupabase()

      let finalRoomId = activeEditingRoom.id

      // Nếu phòng đang chọn là phòng mẫu chưa được đồng bộ hóa lên Supabase
      if (activeEditingRoom.id.length !== 36) {
        const dbBranchName = activeEditingRoom.branchId === 'cs1' ? 'CS1 - Tân Bình 🏡' :
                             activeEditingRoom.branchId === 'cs2' ? 'CS2 - Quận 10 🏙️' :
                             activeEditingRoom.branchId === 'cs3' ? 'CS3 - Quận 5 🪟' : 'CS4 - Gò Vấp 🌸'
        
        let dbStatus: 'available' | 'occupied' | 'maintenance' = 'occupied'
        const capacity = parseInt(activeEditingRoom.type.replace(/[^0-9]/g, '')) || 2

        const meta = {
          imageUrl: activeEditingRoom.imageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
          hourlyPrice: activeEditingRoom.hourlyPrice || Math.round(activeEditingRoom.price / 10),
          description: activeEditingRoom.description || `Trải nghiệm căn phòng ${activeEditingRoom.name} tuyệt đẹp tại chi nhánh Dancin Home.`,
          amenities: activeEditingRoom.amenities || [],
          tags: activeEditingRoom.tags || [],
          isPublished: true,
          isFeatured: activeEditingRoom.isFeatured || false
        }

        const { data: newRoom, error: rErr } = await supabase
          .from('rooms')
          .insert({
            name: activeEditingRoom.name,
            branch: dbBranchName,
            capacity,
            price: Number(activeEditingRoom.price),
            status: dbStatus,
            thumbnail: JSON.stringify(meta)
          })
          .select()
          .single()

        if (rErr) throw rErr

        if (newRoom) {
          finalRoomId = newRoom.id
          setRooms(prev => prev.map(r => r.id === activeEditingRoom.id ? { ...r, id: newRoom.id } : r))
        }
      }
      
      let customerId = 'CUST-TEMP'
      const { data: dbCustomer, error: cErr } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', bookingPhone.trim())
        .single()

      if (!cErr && dbCustomer) {
        customerId = dbCustomer.id
      } else {
        const { data: newCust, error: insCErr } = await supabase
          .from('customers')
          .insert({
            name: bookingGuestName.trim(),
            phone: bookingPhone.trim(),
            notes: [`Đặt phòng trực tiếp từ Sơ đồ phòng. Ghi chú: ${bookingNotes || 'Không'}`]
          })
          .select()
          .single()
        
        if (!insCErr && newCust) {
          customerId = newCust.id
        }
      }

      const { error: bkErr } = await supabase
        .from('bookings')
        .insert({
          customer_id: customerId,
          room_id: finalRoomId,
          checkin_date: new Date().toISOString().split('T')[0],
          checkout_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          total_price: activeEditingRoom.price,
          status: bookingStatus === 'checked_in' ? 'checked_in' : 'confirmed',
          special_notes: `[Staff Direct Booking] ${bookingNotes || 'Không'}. Lịch: ${bookingDates}`
        })

      if (bkErr) throw bkErr

      showToast(`🔑 Đặt phòng thành công! Đã đồng bộ dữ liệu Booking cho khách ${bookingGuestName.trim()}`)
    } catch (e: any) {
      console.warn('[Supabase Booking Sync] Ghi nhận offline thành công (Fallback active):', e)
      showToast(`🔑 Đặt phòng thành công ở chế độ Offline! Đã lưu lịch trình khách ${bookingGuestName.trim()}`)
    } finally {
      setActiveEditingRoom(null)
    }
  }

  const formatVND = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ'
  }

  // Lọc danh sách theo nhánh, tình trạng phòng và từ khóa tìm kiếm
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

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
          Sơ Đồ Phòng & Quản Lý Chi Nhánh
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
          Bản đồ phòng nghỉ đa nhiệm: Lọc tình trạng, tìm kiếm nhanh, thêm mới phòng và book lịch nhanh chóng.
        </p>
      </div>

      {/* THANH CÔNG CỤ ĐIỀU HƯỚNG & BỘ LỌC ĐA HƯỚNG */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-3xl shadow-2xs">
        {/* Lưới phân chia đều 4 ô trong frame */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full items-center">
          
          {/* 1. Ô Tìm kiếm nhanh */}
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

          {/* 4. Nút Thêm Phòng Mới */}
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
          { key: 'available', label: 'Trống / Available', color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border-emerald-200/70 dark:border-emerald-850', dot: 'bg-emerald-600' },
          { key: 'booked_not_checked_in', label: 'Đã Đặt Chưa Đến', color: 'bg-orange-50 dark:bg-orange-950 text-orange-950 dark:text-orange-200 border-orange-200/70 dark:border-orange-850', dot: 'bg-orange-500' },
          { key: 'checked_in', label: 'Đã Check-In', color: 'bg-pink-50 dark:bg-pink-950 text-pink-950 dark:text-pink-200 border-pink-200/70 dark:border-pink-850', dot: 'bg-pink-500' },
          { key: 'checkout_imminent', label: 'Sắp Check-Out ⚠️', color: 'bg-rose-50 dark:bg-rose-950 text-rose-950 dark:text-rose-200 border-rose-200 dark:border-rose-850', dot: 'bg-rose-600' },
          { key: 'maintenance', label: 'Đang Bảo Trì', color: 'bg-blue-50 dark:bg-blue-950 text-blue-950 dark:text-blue-200 border-blue-200/70 dark:border-blue-850', dot: 'bg-blue-600' },
          { key: 'cleaning', label: 'Đang Dọn Dẹp', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-600 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700', dot: 'bg-zinc-500' }
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
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="w-28 h-28 animate-bounce">
            <img src="/mascot.png" alt="Dancin Mascot Loading" className="w-full h-full object-contain" />
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest animate-pulse">
            Đang tải dữ liệu sơ đồ phòng Dancin...
          </span>
        </div>
      ) : (
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
                    <span className={`text-[10px] font-black font-mono ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-zinc-400'
                    }`}>
                      #{room.id.length === 36 ? room.id.substring(0, 8) : room.id}
                    </span>
                  </div>

                  {/* Giữa thẻ phòng: Tên & Loại phòng */}
                  <div className="mb-4">
                    <h3 className={`text-base font-extrabold leading-snug line-clamp-1 ${
                      theme === 'dark' ? 'text-white' : 'text-zinc-800'
                    }`}>{room.name}</h3>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold mt-1 uppercase tracking-wide ${
                      theme === 'dark' ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-500'
                    }`}>
                      <Building2 size={10} className="stroke-[2.5]" />
                      <span>{room.branchName} • {room.type}</span>
                    </div>
                  </div>

                  {/* Cuối thẻ phòng: Thông tin động */}
                  <div className={`mt-auto pt-3.5 border-t border-dashed ${
                    theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                  }`}>
                    
                    {/* TRẠNG THÁI 1: Trống (Green) */}
                    {room.status === 'available' && (
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          theme === 'dark' ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-500'
                        }`}>Giá cơ bản:</span>
                        <strong className={`text-sm font-black font-mono ${
                          theme === 'dark' ? 'text-white' : 'text-emerald-700'
                        }`}>{formatVND(room.price)}</strong>
                      </div>
                    )}

                    {/* TRẠNG THÁI 2: Đã Đặt Chưa Đến (Cam) */}
                    {room.status === 'booked_not_checked_in' && (
                      <div className="flex flex-col gap-0.5">
                        <div className={`text-xs font-extrabold truncate ${
                          theme === 'dark' ? 'text-white' : 'text-zinc-800'
                        }`}>Khách: {room.guest}</div>
                        <div className={`text-[10px] flex items-center gap-1 mt-1 font-mono ${
                          theme === 'dark' ? 'text-white' : 'text-orange-700'
                        }`}>
                          <Clock size={11} /> {room.timeInfo || 'Đợi Check-in'}
                        </div>
                      </div>
                    )}

                    {/* TRẠNG THÁI 3: Đã Check-In (Hồng) */}
                    {room.status === 'checked_in' && (
                      <div className="flex flex-col gap-0.5">
                        <div className={`text-xs font-extrabold truncate ${
                          theme === 'dark' ? 'text-white' : 'text-zinc-800'
                        }`}>Đang ở: {room.guest || 'Khách lưu trú'}</div>
                        <div className={`text-[10px] flex items-center gap-1 mt-1 font-mono ${
                          theme === 'dark' ? 'text-white' : 'text-pink-700'
                        }`}>
                          <Clock size={11} /> Hạn trả: {room.timeInfo || 'Chưa định hạn'}
                        </div>
                      </div>
                    )}

                    {/* TRẠNG THÁI 4: Sắp Check-Out ⚠️ (Đỏ) */}
                    {room.status === 'checkout_imminent' && (
                      <div className="flex flex-col gap-0.5">
                        <div className={`text-xs font-black truncate ${
                          theme === 'dark' ? 'text-white' : 'text-rose-950'
                        }`}>Đang ở: {room.guest}</div>
                        <div className={`text-[10px] font-black flex items-center gap-1 mt-1 font-mono animate-pulse ${
                          theme === 'dark' ? 'text-white' : 'text-rose-700'
                        }`}>
                          <Flame size={11} className="stroke-[2.5]" /> HẠN OUT: {room.timeInfo || '12:00 Hôm nay'}
                        </div>
                      </div>
                    )}

                    {/* TRẠNG THÁI 5: Bảo Trì (Xanh dương) */}
                    {room.status === 'maintenance' && (
                      <div className="flex flex-col gap-0.5">
                        <div className={`text-xs font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-zinc-800'
                        }`}>Đang bảo trì</div>
                        <div className={`text-[10px] flex items-center gap-1 mt-1 font-mono ${
                          theme === 'dark' ? 'text-white' : 'text-blue-700'
                        }`}>
                          <Wrench size={11} /> {room.timeInfo || 'Bảo dưỡng định kỳ'}
                        </div>
                      </div>
                    )}

                    {room.status === 'cleaning' && (
                      <div className="flex flex-col gap-0.5">
                        <div className={`text-xs font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-zinc-800'
                        }`}>Đang dọn dẹp</div>
                        <div className={`text-[10px] font-bold flex items-center gap-1 mt-1 font-mono ${
                          theme === 'dark' ? 'text-white' : 'text-zinc-600'
                        }`}>
                          <Sparkles size={11} /> Hoàn thành: {room.timeInfo || '12:00'}
                        </div>
                      </div>
                    )}

                  </div>


                  {/* Trạng thái Duyệt đăng trên Booking */}
                  <div className={`mt-3.5 pt-3 border-t flex items-center justify-between text-[10px] ${
                    theme === 'dark' ? 'border-zinc-800' : 'border-zinc-150'
                  }`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {room.isPublished !== false ? (
                        <>
                          <span className={`border px-2 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 ${
                            theme === 'dark' 
                              ? 'bg-emerald-950 text-emerald-250 border-emerald-800/50' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                          }`}>
                            🌐 Công khai
                          </span>
                          {room.isFeatured && (
                            <span className={`border px-2 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 animate-pulse ${
                              theme === 'dark'
                                ? 'bg-orange-950 text-orange-250 border-orange-850/50'
                                : 'bg-orange-50 text-orange-800 border-orange-200/50'
                            }`}>
                              🔥 Nổi bật
                            </span>
                          )}
                        </>
                      ) : (
                        <span className={`border px-2 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 ${
                          theme === 'dark'
                            ? 'bg-zinc-800 text-zinc-600 dark:text-zinc-200 border-zinc-700'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}>
                          🔒 Bản nháp
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleTogglePublish(room, e)}
                      className={`px-2.5 py-1 rounded-lg font-black border transition-all active:scale-95 cursor-pointer ${
                        room.isPublished !== false
                          ? theme === 'dark'
                            ? 'bg-zinc-900 hover:bg-rose-955/40 text-zinc-300 hover:text-rose-300 border-zinc-800'
                            : 'bg-zinc-50 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border-zinc-200 hover:border-rose-200'
                          : theme === 'dark'
                            ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border-transparent'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-white border-transparent'
                      }`}
                      title={room.isPublished !== false ? "Ẩn khỏi trang chủ Booking" : "Công khai lên trang chủ Booking"}
                    >
                      {room.isPublished !== false ? 'Ẩn / Hide' : 'Bật / Publish'}
                    </button>
                  </div>

                </div>
              )
            })
          )}
        </div>
      )}

      {/* ================= THỰC THI 1: MODAL THÊM PHÒNG MỚI (ADD ROOM MODAL) ================= */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-card border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-stone-200 border-none w-7 h-7 rounded-full flex items-center justify-center transition font-bold cursor-pointer"
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
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tracking-wider block mt-1">Đầy đủ giá giờ/ngày, mô tả, ảnh và đặc điểm nổi bật</span>
              </div>
            </div>

            {/* Layout 2 cột rộng rãi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-700 dark:text-zinc-300">
              
              {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
              <div className="flex flex-col gap-3">
                <h4 className="font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-[11px] uppercase tracking-wider flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-1 text-zinc-900 dark:text-zinc-50">
                  📋 Thông tin cơ bản
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Mã Phòng:</label>
                    <input
                      type="text"
                      value={newRoomId}
                      onChange={(e) => setNewRoomId(e.target.value)}
                      placeholder="Ví dụ: P-601..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Sức chứa (Khách):</label>
                    <input
                      type="text"
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value)}
                      placeholder="Ví dụ: 2 Khách..."
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
                    placeholder="Ví dụ: Sunlit Glass Suite..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Chi Nhánh:</label>
                    <select
                      value={newRoomBranchId}
                      onChange={(e) => setNewRoomBranchId(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
                    >
                      <option value="cs1">Tân Bình (CS1)</option>
                      <option value="cs2">Quận 10 (CS2)</option>
                      <option value="cs3">Quận 5 (CS3)</option>
                      <option value="cs4">Gò Vấp (CS4)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Trạng Thái Khởi Tạo:</label>
                    <select
                      value={newRoomStatus}
                      onChange={(e) => setNewRoomStatus(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
                    >
                      <option value="available">🟢 Trống / Available</option>
                      <option value="booked_not_checked_in">🟠 Đã Đặt Chưa Đến</option>
                      <option value="checked_in">💗 Đã Check-In</option>
                      <option value="maintenance">🔵 Đang Bảo Trì</option>
                      <option value="cleaning">⚪ Đang Dọn Dẹp</option>
                    </select>
                  </div>
                </div>

                {/* HAI PHƯƠNG THỨC TÍNH TIỀN (SPLIT PRICING) */}
                <h4 className="font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-[10px] uppercase tracking-widest mt-2 border-t border-zinc-200 dark:border-zinc-800 pt-2 text-zinc-900 dark:text-zinc-50">
                  💰 Cơ chế tính tiền (2 phương thức)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Giá Ngày/Đêm (VND/đêm):</label>
                    <input
                      type="number"
                      value={newRoomPrice}
                      onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                      placeholder="850000"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Giá Theo Giờ (VND/giờ):</label>
                    <input
                      type="number"
                      value={newRoomHourlyPrice}
                      onChange={(e) => setNewRoomHourlyPrice(Number(e.target.value))}
                      placeholder="100000"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: MÔ TẢ, ẢNH & ĐẶC ĐIỂM DỊCH VỤ */}
              <div className="flex flex-col gap-3">
                <h4 className="font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-[11px] uppercase tracking-wider flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-1 text-zinc-900 dark:text-zinc-50">
                  ✨ Thẩm mỹ & Đặc điểm dịch vụ
                </h4>

                {/* Chọn ảnh mô tả */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Ảnh mô tả phòng (Link URL):</label>
                  <input
                    type="text"
                    value={newRoomImageUrl}
                    onChange={(e) => setNewRoomImageUrl(e.target.value)}
                    placeholder="Nhập link ảnh hoặc click chọn preset bên dưới..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                  />
                  {/* Preset Images Quick Selector */}
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => setNewRoomImageUrl(img.url)}
                        className={`p-1.5 border rounded-lg text-[9px] font-bold text-left truncate cursor-pointer transition ${
                          newRoomImageUrl === img.url 
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 text-white' 
                            : 'bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:bg-zinc-800 text-stone-600 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Văn bản mô tả phòng */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Mô tả phòng nghỉ:</label>
                  <textarea
                    rows={2}
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    placeholder="Ví dụ: Căn phòng gỗ thông ngập tràn ánh sáng tự nhiên với bồn tắm sứ..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300 resize-none"
                  />
                </div>

                {/* Đặc điểm / Tính năng phòng có sẵn */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Đặc điểm & Tiện ích (Click để gán):</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {PREDEFINED_FEATURES.map((feat) => {
                      const isActive = newRoomTags.includes(feat.id)
                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => {
                            if (isActive) {
                              setNewRoomTags(prev => prev.filter(t => t !== feat.id))
                              setNewRoomAmenities(prev => prev.filter(a => a !== feat.amenity))
                            } else {
                              setNewRoomTags(prev => [...prev, feat.id])
                              setNewRoomAmenities(prev => [...prev, feat.amenity])
                            }
                          }}
                          className={`px-2 py-1 rounded-full text-[9px] font-bold border transition cursor-pointer ${
                            isActive
                              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 text-white'
                              : 'bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-stone-600'
                          }`}
                        >
                          {isActive ? '✓ ' : '+ '} {feat.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Thêm đặc điểm Custom */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Thêm Đặc điểm mới (Custom):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAmenityInput}
                      onChange={(e) => setCustomAmenityInput(e.target.value)}
                      placeholder="Ví dụ: Tặng rượu vang đỏ 🍷..."
                      className="flex-grow bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = customAmenityInput.trim()
                        if (val) {
                          setNewRoomAmenities(prev => [...prev, val])
                          setCustomAmenityInput('')
                        }
                      }}
                      className="px-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-stone-800 text-white font-extrabold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center"
                    >
                      Thêm +
                    </button>
                  </div>
                  {/* List of currently added amenities */}
                  {newRoomAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 max-h-[60px] overflow-y-auto p-1.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-150 dark:border-zinc-800">
                      {newRoomAmenities.map((amen) => (
                        <span 
                          key={amen} 
                          className="inline-flex items-center gap-1 bg-white border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md text-[9px] font-bold text-stone-600 animate-in zoom-in-95 duration-100"
                        >
                          {amen}
                          <button
                            type="button"
                            onClick={() => {
                              setNewRoomAmenities(prev => prev.filter(a => a !== amen))
                              // Gỡ bỏ tag tương ứng nếu đó là predefined
                              const matchedFeat = PREDEFINED_FEATURES.find(f => f.amenity === amen)
                              if (matchedFeat) {
                                setNewRoomTags(prev => prev.filter(t => t !== matchedFeat.id))
                              }
                            }}
                            className="text-red-500 hover:text-red-750 font-bold border-none bg-transparent cursor-pointer ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-2.5 mt-3 border-t border-zinc-150 dark:border-zinc-800 pt-4">
              <button
                onClick={handleAddNewRoom}
                className="flex-grow py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white rounded-xl font-bold text-xs shadow-md transition border border-transparent cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={14} className="stroke-[3]" /> Tạo Mới & Đăng Sơ Đồ
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-600 rounded-xl font-bold text-xs transition border-none cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= THỰC THI 2: MODAL CẬP NHẬT TRẠNG THÁI PHÒNG (UPDATE ROOM MODAL) ================= */}
      {activeEditingRoom && (
        <RoomActionModal
          room={activeEditingRoom}
          onClose={() => setActiveEditingRoom(null)}
          onSave={handleSaveStatus}
          onDeleteRoom={handleDeleteRoom}
        />
      )}

      {/* ================= MODAL XÁC NHẬN DUYỆT ĐĂNG 2 BƯỚC (DOUBLE CONFIRMATION WIZARD) ================= */}
      {isConfirmWizardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-350 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 flex flex-col gap-6">
            
            {/* Tiêu đề bước */}
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-white rounded-2xl flex items-center justify-center shadow-lg font-bold">
                  {wizardStep}/2
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase tracking-tight leading-none">
                    {wizardStep === 1 ? 'Bước 1: Duyệt Đăng Trang Chủ' : 'Bước 2: Cài Đặt Top Nổi Bật'}
                  </h3>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider block mt-1">
                    {wizardStep === 1 ? 'Xác định hiển thị công khai trên Booking' : 'Lựa chọn vị trí sắp xếp hiển thị ưu tiên'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setIsConfirmWizardOpen(false)}
                className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-full w-6 h-6 border-none flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* BƯỚC 1: XÁC NHẬN ĐĂNG LÊN TRANG CHỦ BOOKING */}
            {wizardStep === 1 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  Bạn có muốn đăng công khai phòng nghỉ <strong className="text-zinc-900 dark:text-zinc-50">"{newRoomName}"</strong> lên trang chủ Booking ngay lập tức để khách hàng tìm kiếm và đặt trực tuyến không?
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {/* Lựa chọn 1: ĐĂNG CÔNG KHAI */}
                  <div
                    onClick={() => setWizardIsPublished(true)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-start gap-3.5 hover:shadow-md ${
                      wizardIsPublished 
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950' 
                        : 'border-zinc-200 dark:border-zinc-800 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base ${wizardIsPublished ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                      🌐
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-extrabold text-xs">Đăng Công Khai Lên Trang Chủ (Hiển thị ngay)</h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-snug">
                        Khách hàng có thể tìm thấy phòng này trên Dancin Gallery, xem chi tiết và đặt phòng trực tuyến.
                      </p>
                    </div>
                  </div>

                  {/* Lựa chọn 2: LƯU NỘI BỘ (BẢN NHÁP) */}
                  <div
                    onClick={() => setWizardIsPublished(false)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-start gap-3.5 hover:shadow-md ${
                      !wizardIsPublished 
                        ? 'border-zinc-900 dark:border-zinc-100 bg-sky-50/20 text-stone-900' 
                        : 'border-zinc-200 dark:border-zinc-800 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base ${!wizardIsPublished ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                      🔒
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-extrabold text-xs">Lưu Nội Bộ (Chưa đăng / Bản nháp)</h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-snug">
                        Lưu phòng nghỉ vào sơ đồ Admin này để vận hành nội bộ. Bạn có thể bật hiển thị lên Booking sau.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-2 border-t border-zinc-150 dark:border-zinc-800 pt-4">
                  <button
                    onClick={() => {
                      if (wizardIsPublished) {
                        setWizardStep(2)
                      } else {
                        executeSaveRoom(false, false)
                      }
                    }}
                    className="flex-grow py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white rounded-xl font-bold text-xs shadow-md transition border-none cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>{wizardIsPublished ? 'Tiếp tục ➔' : 'Xác nhận Lưu Nội Bộ ✓'}</span>
                  </button>
                  <button
                    onClick={() => setIsConfirmWizardOpen(false)}
                    className="px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-600 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            )}

            {/* BƯỚC 2: XÁC NHẬN CHÈN LÊN TOP NỔI BẬT */}
            {wizardStep === 2 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  Đồng ý đăng phòng nghỉ công khai. Bạn có muốn **chèn phòng nghỉ này lên Top Nổi Bật** ở vị trí đầu tiên trong Gallery của khách hàng không?
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {/* Lựa chọn 1: CÓ, ĐƯA LÊN ĐẦU TRANG */}
                  <div
                    onClick={() => setWizardIsFeatured(true)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-start gap-3.5 hover:shadow-md ${
                      wizardIsFeatured 
                        ? 'border-orange-500 bg-orange-50/40 text-orange-950' 
                        : 'border-zinc-200 dark:border-zinc-800 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base ${wizardIsFeatured ? 'bg-orange-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                      🔥
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-extrabold text-xs">Có, Đưa Lên Top Nổi Bật (Ưu tiên số 1)</h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-snug">
                        Phòng sẽ tự động chèn lên vị trí trên cùng của danh sách hiển thị, gây ấn tượng mạnh nhất với khách hàng.
                      </p>
                    </div>
                  </div>

                  {/* Lựa chọn 2: KHÔNG, ĐĂNG THƯỜNG */}
                  <div
                    onClick={() => setWizardIsFeatured(false)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-start gap-3.5 hover:shadow-md ${
                      !wizardIsFeatured 
                        ? 'border-stone-850 bg-zinc-50 dark:bg-zinc-900/60 text-stone-900' 
                        : 'border-zinc-200 dark:border-zinc-800 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base ${!wizardIsFeatured ? 'bg-stone-700 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                      ❄️
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-extrabold text-xs">Không, Đăng Bình Thường (Sắp xếp tiêu chuẩn)</h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-snug">
                        Hiển thị theo thứ tự sắp xếp tiêu chuẩn ngẫu nhiên của hệ thống, không chèn ưu tiên.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-2 border-t border-zinc-150 dark:border-zinc-800 pt-4">
                  <button
                    onClick={() => executeSaveRoom(true, wizardIsFeatured)}
                    className="flex-grow py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition border-none cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Xác nhận Đăng & Lưu Lên Supabase ✓</span>
                  </button>
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-600 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
