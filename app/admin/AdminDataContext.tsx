'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'

export interface Room {
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

export interface Booking {
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

// Mock Room Data
const INITIAL_ROOMS: Room[] = [
  { id: 'P-101', name: 'Bungalow Hương Thơm', type: 'View Vườn Cà Phê', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'available', price: 850000, guest: null },
  { id: 'P-102', name: 'Nhà Gỗ Mộc Lan', type: 'Rustic Family Suite', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'checked_in', price: 1200000, guest: 'Nguyễn Hải Nam', timeInfo: 'Hôm nay, 12:00' },
  { id: 'P-103', name: 'Phòng Đơn Đồi Tiêu', type: 'Meditative Single Room', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'cleaning', price: 600000, guest: null, timeInfo: '14:30' },
  { id: 'P-104', name: 'Lều Glamping Thung Lũng', type: 'Outdoor Premium Cabin', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'available', price: 950000, guest: null },
  { id: 'P-105', name: 'Căn Hộ Rừng Sầu Riêng', type: 'Premium Forest Suite', branchId: 'cs1', branchName: 'Tân Bình (CS1)', status: 'maintenance', price: 1800000, guest: null, timeInfo: 'Bảo dưỡng định kỳ điều hòa âm trần' },
  { id: 'P-201', name: 'Sky Loft Hoàng Hôn', type: 'Luxury Panorama View', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'checked_in', price: 1500000, guest: 'Lê Hoàng Hải', timeInfo: 'Ngày mai, 12:00' },
  { id: 'P-202', name: 'Phòng Suite Thung Lũng', type: 'Penthouse Royal Style', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'booked_not_checked_in', price: 2200000, guest: 'Phạm Minh Tuấn', timeInfo: 'Hôm nay, 14:00 (Chờ check-in)' },
  { id: 'P-203', name: 'Phòng Đôi Ánh Sáng', type: 'Standard Deluxe Double', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'checkout_imminent', price: 750000, guest: 'Trần Thị Vy', timeInfo: 'Hôm nay, 11:30' },
  { id: 'P-204', name: 'Studio Tối Giản Cát Ấm', type: 'Cozy Minimalist Studio', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'available', price: 800000, guest: null },
  { id: 'P-205', name: 'Phòng Đơn Ngắm Sao', type: 'Glass Roof Single Room', branchId: 'cs2', branchName: 'Quận 10 (CS2)', status: 'cleaning', price: 700000, guest: null, timeInfo: '13:00' },
  { id: 'P-301', name: 'Bungalow Hoa Cẩm Tú', type: 'Premium Cozy Garden', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'available', price: 1100000, guest: null },
  { id: 'P-302', name: 'Nhà Gỗ Bên Dòng Suối', type: 'Riverfront Hinoki Cabin', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'checked_in', price: 1350000, guest: 'Lâm Quốc Bảo', timeInfo: 'Còn 2 ngày nữa, 12:00' },
  { id: 'P-303', name: 'Phòng Đôi Mây Trắng', type: 'Deluxe Double Balcony', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'booked_not_checked_in', price: 900000, guest: 'Hoàng Thu Thủy', timeInfo: 'Hôm nay, 15:30 (Đã đặt cọc)' },
  { id: 'P-304', name: 'Phòng Gia Đình Ấm Cúng', type: 'Cozy Family Wooden Lodge', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'maintenance', price: 1650000, guest: null, timeInfo: 'Sửa đường dẫn bồn sục nước nóng' },
  { id: 'P-305', name: 'Phòng Đơn Yên Bình', type: 'Zen Single Room Meditation', branchId: 'cs3', branchName: 'Quận 5 (CS3)', status: 'available', price: 650000, guest: null },
  { id: 'P-401', name: 'Lều Vòm Kính Xinh Xắn', type: 'Sunlit Dome Experience', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'checkout_imminent', price: 1050000, guest: 'Đỗ Quỳnh Anh', timeInfo: 'Hôm nay, 10:45 (Trễ 15p)' },
  { id: 'P-402', name: 'Bungalow Rừng Thông', type: 'Pine Forest Eco Cabin', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'checked_in', price: 1400000, guest: 'Vũ Đức Trọng', timeInfo: 'Hôm nay, 12:00' },
  { id: 'P-403', name: 'Nhà Gỗ Trắng Vintage', type: 'Antique White Cottage', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'available', price: 1250000, guest: null },
  { id: 'P-404', name: 'Phòng Đôi Hoa Sim', type: 'Comfort Cozy Double Room', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'booked_not_checked_in', price: 850000, guest: 'Trịnh Mai Chi', timeInfo: 'Ngày mai, 14:00' },
  { id: 'P-405', name: 'Phòng Áp Mái Thơ Mộng', type: 'Romantic Attic Window', branchId: 'cs4', branchName: 'Gò Vấp (CS4)', status: 'cleaning', price: 750000, guest: null, timeInfo: '16:00' }
]

// Mock Booking Data
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

interface AdminDataContextProps {
  rooms: Room[]
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>
  bookings: Booking[]
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
  isLoadingRooms: boolean
  isLoadingBookings: boolean
  refreshRooms: () => Promise<void>
  refreshBookings: () => Promise<void>
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const AdminDataContext = createContext<AdminDataContextProps | undefined>(undefined)

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS)
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme')
    if (savedTheme === 'dark') {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    } else {
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('admin-theme', next)
      if (next === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }

  const loadRooms = async () => {
    try {
      const supabase = getSupabase()
      const { data: dbRooms, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (dbRooms && dbRooms.length > 0) {
        const mappedRooms: Room[] = dbRooms.map((r: any) => {
          let branchId: 'cs1' | 'cs2' | 'cs3' | 'cs4' = 'cs1'
          if (r.branch.includes('CS2')) branchId = 'cs2'
          else if (r.branch.includes('CS3')) branchId = 'cs3'
          else if (r.branch.includes('CS4')) branchId = 'cs4'
          
          const branchName = r.branch.split(' - ')[1] || 'Tân Bình (CS1)'

          let mappedStatus: Room['status'] = 'available'
          if (r.status === 'occupied') mappedStatus = 'checked_in'
          else if (r.status === 'maintenance') mappedStatus = 'maintenance'
          
          let hourlyPrice = Math.round(Number(r.price) / 10)
          let description = `Trải nghiệm căn phòng ${r.name} tuyệt đẹp tại chi nhánh Bliss Home.`
          let amenities: string[] = []
          let tags: string[] = []
          let imageUrl = r.thumbnail
          let isPublished = true
          let isFeatured = false

          if (r.thumbnail && r.thumbnail.startsWith('{')) {
            try {
              const meta = JSON.parse(r.thumbnail)
              imageUrl = meta.imageUrl || meta.url
              hourlyPrice = meta.hourlyPrice || hourlyPrice
              description = meta.description || description
              amenities = meta.amenities || []
              tags = meta.tags || []
              isPublished = meta.isPublished !== undefined ? meta.isPublished : true
              isFeatured = meta.isFeatured || false
            } catch (e) {
              console.error('Error parsing room thumbnail metadata:', e)
            }
          }

          return {
            id: r.id,
            name: r.name,
            type: r.capacity ? `Phòng ${r.capacity} Khách` : 'View Vườn Cà Phê',
            branchId,
            branchName: branchName.replace(' 🏡', '').replace(' 🏙️', '').replace(' 🪟', '').replace(' 🌸', ''),
            status: mappedStatus,
            price: Number(r.price),
            hourlyPrice,
            description,
            amenities,
            tags,
            imageUrl,
            isPublished,
            isFeatured,
            guest: r.status === 'occupied' ? 'Khách lưu trú' : null
          }
        })
        setRooms(mappedRooms)
      } else {
        setRooms(INITIAL_ROOMS)
      }
    } catch (error) {
      console.warn('[Supabase Connection] Loaded fallback sample rooms.', error)
      setRooms(INITIAL_ROOMS)
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const loadBookings = async () => {
    try {
      const supabase = getSupabase()
      const { data: dbBookings, error } = await supabase
        .from('bookings')
        .select('*, customers(*), rooms(*)')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (dbBookings && dbBookings.length > 0) {
        const mappedBookings: Booking[] = dbBookings.map((b: any) => ({
          id: b.id,
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
      console.warn('[Supabase Bookings Fetch] Loaded fallback bookings.', err)
      setBookings(MOCK_BOOKINGS)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  // Load both resources on mount
  useEffect(() => {
    loadRooms()
    loadBookings()
  }, [])

  return (
    <AdminDataContext.Provider
      value={{
        rooms,
        setRooms,
        bookings,
        setBookings,
        isLoadingRooms,
        isLoadingBookings,
        refreshRooms: loadRooms,
        refreshBookings: loadBookings,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AdminDataContext.Provider>
  )
}

export const useAdminData = () => {
  const context = useContext(AdminDataContext)
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider')
  }
  return context
}
