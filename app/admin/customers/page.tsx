'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { useAdminData } from '../AdminDataContext'
import { 
  Search, 
  Sparkles, 
  Bot, 
  Pencil, 
  Eye, 
  Check, 
  X, 
  AlertCircle,
  Users,
  Layers,
  Plus,
  Trash2,
  Phone,
  Calendar,
  Settings,
  HelpCircle,
  Award,
  Gem,
  Shield,
  Coins,
  Clock,
  History,
  TrendingUp,
  Megaphone,
  Percent,
  Send
} from 'lucide-react'

// Định nghĩa kiểu dữ liệu Nhóm Khách Hàng (Customer Group)
interface CustomerGroup {
  id: string
  name: string
  description: string
  type: 'ai' | 'manual'
}

// Định nghĩa kiểu dữ liệu Khách hàng CRM
interface Customer {
  id: string
  name: string
  phone: string
  totalBookings: number
  totalSpent: number
  lastActive: string
  notes: string[] // Danh sách các ghi chú hành vi để AI phân loại
  groupIds: string[] // Liên kết khóa ngoại đến các nhóm khách hàng chỉ định
}

// Hằng số định dạng tiền tệ VND hoisted lên đầu để biên dịch an toàn
const formatVND = (val: number) => {
  return val.toLocaleString('vi-VN') + 'đ'
}

const cleanGroupName = (name: string) => {
  return name
    .replace(/^Nhóm AI:\s*/i, '')
    .replace(/^Thành viên\s*/i, '')
    .trim()
}

// Định nghĩa kiểu dữ liệu Lịch sử đặt phòng giả lập
interface MockBooking {
  id: string
  roomName: string
  branch: string
  checkIn: string
  checkOut: string
  amount: number
  status: 'completed' | 'confirmed' | 'cancelled'
  specialRequest: string
}

// Định nghĩa kiểu cấu hình Hạng thành viên
interface TierInfo {
  name: string
  colorTheme: 'stone' | 'slate' | 'amber' | 'violet'
  benefits: string[]
}

// Hàm phân hạng thành viên tự động dựa trên tổng chi tiêu tích lũy
const getCustomerTier = (spent: number): TierInfo => {
  if (spent >= 30000000) {
    return {
      name: 'Diamond (Kim Cương) 💎',
      colorTheme: 'violet',
      benefits: ['Giảm giá tối đa 15% tổng hóa đơn phòng', 'Miễn phí đưa đón sân bay 2 chiều', 'Tích lũy điểm nhân hệ số 1.5x']
    }
  } else if (spent >= 15000000) {
    return {
      name: 'Gold (Vàng) 🥇',
      colorTheme: 'amber',
      benefits: ['Chiết khấu trực tiếp 10% giá hóa đơn', 'Check-in sớm & Check-out trễ linh hoạt', 'Tích lũy điểm nhân hệ số 1.3x']
    }
  } else if (spent >= 5000000) {
    return {
      name: 'Silver (Bạc) 🥈',
      colorTheme: 'slate',
      benefits: ['Ưu đãi 5% cho tất cả các chi nhánh', 'Tặng 1 phần đồ uống chào mừng', 'Tích lũy điểm nhân hệ số 1.1x']
    }
  } else {
    return {
      name: 'Bronze (Đồng) 🥉',
      colorTheme: 'stone',
      benefits: ['Tích điểm cơ bản nhận voucher', 'Hỗ trợ đặt phòng trực tuyến 24/7']
    }
  }
}

// Lấy style CSS tương ứng cho thẻ hạng thành viên
const getTierThemeClasses = (colorTheme: 'stone' | 'slate' | 'amber' | 'violet') => {
  switch (colorTheme) {
    case 'stone':
      return 'from-stone-900 to-stone-850 text-stone-100 border-stone-800'
    case 'slate':
      return 'from-slate-800 to-slate-700 text-slate-100 border-slate-650'
    case 'amber':
      return 'from-[#7A5B0B] via-[#5F4503] to-[#80600C] text-amber-50 border-amber-600/40'
    case 'violet':
      return 'from-indigo-900 via-purple-900 to-violet-950 text-indigo-50 border-indigo-950/60 border-l-4 border-l-indigo-400'
  }
}

// Render icon tương ứng cho thẻ hạng thành viên
const renderTierIcon = (colorTheme: 'stone' | 'slate' | 'amber' | 'violet', size = 18) => {
  switch (colorTheme) {
    case 'stone':
      return <Shield size={size} className="text-zinc-400 dark:text-zinc-500 animate-pulse" />
    case 'slate':
      return <Award size={size} className="text-blue-300 animate-pulse" />
    case 'amber':
      return <Coins size={size} className="text-yellow-400 animate-pulse" />
    case 'violet':
      return <Gem size={size} className="text-purple-300 animate-bounce" />
  }
}

// Sinh danh sách đặt phòng giả lập cao cấp phục vụ xem chi tiết
const getMockBookings = (cust: Customer): MockBooking[] => {
  if (cust.id === 'CUST-01') {
    return [
      {
        id: 'BK-8902',
        roomName: 'Cozy Wooden Cabin CS3 🪟',
        branch: 'Quận 5 (CS3)',
        checkIn: '25/05/2026',
        checkOut: '27/05/2026',
        amount: 4400000,
        status: 'completed',
        specialRequest: 'Đoàn 5 người lớn, 2 trẻ em. Cần chuẩn bị bếp nướng BBQ và set up bồn tắm gỗ Hinoki.'
      },
      {
        id: 'BK-8411',
        roomName: 'Sunset Panorama CS2 🏙️',
        branch: 'Quận 10 (CS2)',
        checkIn: '12/04/2026',
        checkOut: '14/04/2026',
        amount: 5800000,
        status: 'completed',
        specialRequest: 'Đi cùng gia đình lớn. Yêu cầu thêm nệm phụ và hoa quả chào mừng.'
      },
      {
        id: 'BK-7890',
        roomName: 'Pine Forest Loft CS1 🏡',
        branch: 'Tân Bình (CS1)',
        checkIn: '01/03/2026',
        checkOut: '04/03/2026',
        amount: 3600000,
        status: 'completed',
        specialRequest: 'Khách quen. Thích ban công rộng và chuẩn bị sẵn bếp nướng than.'
      },
      {
        id: 'BK-7012',
        roomName: 'Valley View Suite CS2 🏙️',
        branch: 'Quận 10 (CS2)',
        checkIn: '15/01/2026',
        checkOut: '17/01/2026',
        amount: 4650000,
        status: 'completed',
        specialRequest: 'Kỷ niệm ngày cưới. Yêu cầu set up nến thơm và vang đỏ.'
      }
    ]
  }
  if (cust.id === 'CUST-02') {
    return [
      {
        id: 'BK-8921',
        roomName: 'Sunset Panorama CS2 🏙️',
        branch: 'Quận 10 (CS2)',
        checkIn: '30/05/2026 14:00',
        checkOut: '30/05/2026 17:00',
        amount: 540000,
        status: 'completed',
        specialRequest: 'Thuê theo giờ (3 tiếng). Setup máy chiếu HD và tài khoản Netflix sẵn sàng phục vụ.'
      },
      {
        id: 'BK-8512',
        roomName: 'Valley View Suite CS2 🏙️',
        branch: 'Quận 10 (CS2)',
        checkIn: '15/05/2026 18:00',
        checkOut: '15/05/2026 21:00',
        amount: 540000,
        status: 'completed',
        specialRequest: 'Yêu cầu phòng yên tĩnh tuyệt đối, set up máy chiếu chiếu phim sắc nét.'
      },
      {
        id: 'BK-8041',
        roomName: 'Pine Forest Loft CS1 🏡',
        branch: 'Tân Bình (CS1)',
        checkIn: '01/05/2026 13:00',
        checkOut: '01/05/2026 16:00',
        amount: 540000,
        status: 'completed',
        specialRequest: 'Setup Netflix sẵn sàng.'
      },
      {
        id: 'BK-7612',
        roomName: 'Sunlit Glass House CS4 🌸',
        branch: 'Gò Vấp (CS4)',
        checkIn: '10/04/2026 10:00',
        checkOut: '10/04/2026 13:00',
        amount: 540000,
        status: 'completed',
        specialRequest: 'Setup nước suối lạnh và khăn mát.'
      }
    ]
  }
  if (cust.id === 'CUST-03') {
    return [
      {
        id: 'BK-8851',
        roomName: 'Cozy Wooden Cabin CS3 🪟',
        branch: 'Quận 5 (CS3)',
        checkIn: '25/05/2026',
        checkOut: '28/05/2026',
        amount: 6600000,
        status: 'completed',
        specialRequest: 'Gia đình đi nghỉ hè. Cần chuẩn bị bếp nướng BBQ ngoài trời và khu vui chơi nhỏ.'
      },
      {
        id: 'BK-8102',
        roomName: 'Sunlit Glass House CS4 🌸',
        branch: 'Gò Vấp (CS4)',
        checkIn: '10/04/2026',
        checkOut: '13/04/2026',
        amount: 4500000,
        status: 'completed',
        specialRequest: 'Có trẻ nhỏ đi cùng. Yêu cầu rào chắn hồ bơi/ban công và thêm ghế ăn trẻ em.'
      },
      {
        id: 'BK-7492',
        roomName: 'Valley View Suite CS2 🏙️',
        branch: 'Quận 10 (CS2)',
        checkIn: '15/02/2026',
        checkOut: '17/02/2026',
        amount: 4740000,
        status: 'completed',
        specialRequest: 'Gia đình đi nghỉ cuối tuần. Chuẩn bị thêm bộ đồ chơi xếp hình.'
      }
    ]
  }
  if (cust.id === 'CUST-04') {
    return [
      {
        id: 'BK-8890',
        roomName: 'Valley View Suite CS2 🏙️',
        branch: 'Quận 10 (CS2)',
        checkIn: '27/05/2026',
        checkOut: '29/05/2026',
        amount: 3600000,
        status: 'completed',
        specialRequest: 'Khách hưởng tuần trăng mật. Set up nến thơm, cánh hoa hồng rải giường và bồn tắm.'
      },
      {
        id: 'BK-8291',
        roomName: 'Sunset Panorama CS2 🏙️',
        branch: 'Quận 10 (CS2)',
        checkIn: '01/05/2026',
        checkOut: '03/05/2026',
        amount: 5100000,
        status: 'completed',
        specialRequest: 'Yêu cầu phòng có view hoàng hôn đẹp nhất, yên tĩnh tuyệt đối.'
      }
    ]
  }
  if (cust.id === 'CUST-05') {
    return [
      {
        id: 'BK-8712',
        roomName: 'Valley View Suite CS2 🏙️',
        branch: 'Quận 10 (CS2)',
        checkIn: '25/05/2026 09:00',
        checkOut: '25/05/2026 11:00',
        amount: 300000,
        status: 'completed',
        specialRequest: 'Cần không gian cách âm cực tốt để họp zoom quan trọng.'
      },
      {
        id: 'BK-8002',
        roomName: 'Sunlit Glass House CS4 🌸',
        branch: 'Gò Vấp (CS4)',
        checkIn: '12/05/2026 14:00',
        checkOut: '12/05/2026 16:00',
        amount: 300000,
        status: 'completed',
        specialRequest: 'Nghỉ ngơi làm việc tập trung.'
      }
    ]
  }

  // Sinh ngẫu nhiên khi tạo khách hàng mới
  const branches = ['CS1 - Tân Bình', 'CS2 - Quận 10', 'CS3 - Quận 5', 'CS4 - Gò Vấp', 'CS5 - Bình Thạnh']
  const roomNames = ['Pine Forest Loft 🏡', 'Valley View Suite 🏙️', 'Cozy Wooden Cabin 🪟', 'Sunset Panorama 🌅', 'Sunlit Glass House 🌸']
  const generated: MockBooking[] = []
  const count = Math.min(cust.totalBookings, 3)
  for (let i = 0; i < count; i++) {
    const bookingPrice = Math.floor(cust.totalSpent / Math.max(cust.totalBookings, 1))
    const dateOffset = i * 15 + 2
    const checkInDate = `${28 - dateOffset > 0 ? 28 - dateOffset : 10}/${5 - Math.floor(dateOffset/30) > 0 ? 5 - Math.floor(dateOffset/30) : 1}/2026`
    generated.push({
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      roomName: roomNames[Math.floor(Math.random() * roomNames.length)],
      branch: branches[Math.floor(Math.random() * branches.length)],
      checkIn: checkInDate,
      checkOut: checkInDate,
      amount: bookingPrice,
      status: 'completed',
      specialRequest: cust.notes.join(' | ') || 'Không có yêu cầu đặc biệt.'
    })
  }
  return generated
}

// (INITIAL_GROUPS and INITIAL_CUSTOMERS have been moved to AdminDataContext.tsx)

export default function CRMManagementPage() {
  const { 
    theme, 
    customers, 
    setCustomers, 
    groups, 
    setGroups, 
    vouchers,
    isLoadingCustomers,
    isLoadingGroups
  } = useAdminData()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'customers' | 'groups'>('customers')
  
  const [isAISimulating, setIsAISimulating] = useState(false)
  const isLoading = isLoadingCustomers || isLoadingGroups || isAISimulating
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all')

  // States cho việc tạo Nhóm khách hàng mới
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupType, setNewGroupType] = useState<CustomerGroup['type']>('ai')

  // States cho việc chỉnh sửa Nhóm khách hàng
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null)
  const [editGroupName, setEditGroupName] = useState('')
  const [editGroupDesc, setEditGroupDesc] = useState('')
  const [editGroupType, setEditGroupType] = useState<CustomerGroup['type']>('ai')

  // States cho việc xem danh sách thành viên nhóm
  const [isGroupMembersOpen, setIsGroupMembersOpen] = useState(false)
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<CustomerGroup | null>(null)

  // States cho việc quản lý Nhóm dạng Sheet (Google Sheets style) & Thao tác hội viên inline
  const [selectedGroupTabId, setSelectedGroupTabId] = useState<string>('group-01')
  const [hoveredCustomerId, setHoveredCustomerId] = useState<string | null>(null)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [searchMemberTerm, setSearchMemberTerm] = useState('')
  const [isGuideExpanded, setIsGuideExpanded] = useState(false)

  // States cho việc gán Nhóm thủ công cho Khách hàng & Chỉnh sửa hồ sơ
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [assignedGroupIds, setAssignedGroupIds] = useState<string[]>([])

  // States cho việc Chỉnh sửa & Thêm mới Khách hàng
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerNote, setNewCustomerNote] = useState('')

  const [editCustomerName, setEditCustomerName] = useState('')
  const [editCustomerPhone, setEditCustomerPhone] = useState('')
  const [editCustomerNote, setEditCustomerNote] = useState('')

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // States cho việc Tạo chiến dịch Marketing nhanh từ Nhóm khách hàng
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false)
  const [activeVouchers, setActiveVouchers] = useState<{ code: string; label: string }[]>([])
  const [marketingCampName, setMarketingCampName] = useState('')
  const [marketingCampChannel, setMarketingCampChannel] = useState<'Zalo ZNS' | 'Email'>('Zalo ZNS')
  const [marketingCampVoucher, setMarketingCampVoucher] = useState('')
  const [marketingCampBudget, setMarketingCampBudget] = useState(500000)
  const [marketingCampContent, setMarketingCampContent] = useState('')

  // States quản lý Modal xem Lịch sử đặt phòng chi tiết
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<Customer | null>(null)
  const [newDetailNote, setNewDetailNote] = useState('')
  const [realHistoryBookings, setRealHistoryBookings] = useState<MockBooking[] | null>(null)

  // Highlights của Copilot AI
  const [highlightedCustomerId, setHighlightedCustomerId] = useState<string | null>(null)
  const [highlightedGroupId, setHighlightedGroupId] = useState<string | null>(null)

  // Hàm mở lịch sử đặt phòng & nạp đơn thực tế từ Supabase
  const openHistoryModal = async (cust: Customer) => {
    setSelectedHistoryCustomer(cust)
    setRealHistoryBookings(null) // trạng thái loading hiển thị mượt mà
    setIsHistoryModalOpen(true)

    try {
      const supabase = getSupabase()
      const { data: dbBookings, error } = await supabase
        .from('bookings')
        .select('*, rooms(*)')
        .eq('customer_id', cust.id)
        .order('checkin_date', { ascending: false })

      if (error) throw error

      if (dbBookings && dbBookings.length > 0) {
        const mappedBookings: MockBooking[] = dbBookings.map((b: any) => ({
          id: b.id.substring(0, 8).toUpperCase(),
          roomName: b.rooms?.name || 'Phòng nghỉ Bliss Home',
          branch: b.rooms?.branch || 'Chi nhánh Sài Gòn',
          checkIn: new Date(b.checkin_date).toLocaleDateString('vi-VN'),
          checkOut: new Date(b.checkout_date).toLocaleDateString('vi-VN'),
          amount: Number(b.total_price),
          status: b.status === 'checked_out' || b.status === 'completed' ? 'completed' 
                : b.status === 'cancelled' ? 'cancelled' 
                : 'confirmed',
          specialRequest: b.special_notes || ''
        }))
        setRealHistoryBookings(mappedBookings)
      } else {
        setRealHistoryBookings([])
      }
    } catch (err) {
      console.warn('[Supabase CRM Bookings Fetch] Fallback to mock:', err)
      setRealHistoryBookings(getMockBookings(cust))
    }
  }

  // Tải danh sách voucher hoạt động từ global cache để liên kết tạo chiến dịch
  useEffect(() => {
    const active = vouchers
      .filter(v => v.status === 'active')
      .map(v => ({
        code: v.code,
        label: `${v.code} (${v.type === 'percent' ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString('vi-VN')}đ`})`
      }))
    if (active.length > 0) {
      setActiveVouchers(active)
    } else {
      setActiveVouchers([
        { code: 'BLISSALL10', label: 'BLISSALL10 (Giảm 10% khách hàng)' },
        { code: 'GOLDENROOM', label: 'GOLDENROOM (Giảm 300k Thành viên Vàng)' },
        { code: 'FAMILYCOZY', label: 'FAMILYCOZY (Giảm 15% đi gia đình)' }
      ])
    }
  }, [vouchers])

  // Tự động đồng bộ và làm nổi bật tab nhóm đầu tiên khi dữ liệu nhóm được tải
  useEffect(() => {
    if (groups.length > 0) {
      if (!groups.some(g => g.id === selectedGroupTabId)) {
        setSelectedGroupTabId(groups[0].id)
      }
    }
  }, [groups, selectedGroupTabId])

  // LẮNG NGHE SỰ KIỆN TỪ AI COPILOT ĐỂ TỰ ĐỘNG THAO TÁC (CHAT-TO-ACTION)
  useEffect(() => {
    const handleAdminAction = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: string
        payload: string
        description: string
      }>
      if (!customEvent.detail) return

      const { type, payload } = customEvent.detail

      if (type === 'FILTER_AI_GROUP') {
        setActiveTab('customers')
        setSelectedGroupFilter(payload)
        showToast(`Đã lọc danh sách theo nhóm hành vi AI: ${payload}`)
      } 
      else if (type === 'SEARCH_CUSTOMER' || type === 'SEARCH_AND_OPEN') {
        setActiveTab('customers')
        setSearchTerm(payload)
        
        const lowercasePayload = payload.toLowerCase().trim()
        const found = customers.find(c => 
          c.name.toLowerCase().includes(lowercasePayload) || 
          c.phone.includes(lowercasePayload)
        )

        if (found) {
          setHighlightedCustomerId(found.id)
          setTimeout(() => {
            const rowElement = document.getElementById(`cust-row-${found.id}`)
            if (rowElement) {
              rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 100)
          setTimeout(() => setHighlightedCustomerId(null), 4000)
        }
      }
    }

    window.addEventListener('bliss-admin-action', handleAdminAction)
    return () => {
      window.removeEventListener('bliss-admin-action', handleAdminAction)
    }
  }, [customers])

  /**
   * PHƯƠNG THỨC 2: ĐỒNG BỘ AI HÀNH VI (AI AUTO-CLASSIFICATION ENGINE)
   * Tự động quét hành vi (note) của khách hàng và đối chiếu với mô tả (description)
   * của từng Nhóm khách hàng hệ thống để xếp nhóm tự động.
   */
  const simulateAIAnalysis = () => {
    try {
      setIsAISimulating(true)
      
      setTimeout(async () => {
        // AI phân tích tự động dựa trên từ khóa trong mô tả nhóm và ghi chú khách hàng
        const updatedCustomers = customers.map(cust => {
          // Bắt đầu bằng việc lọc ra các nhóm thủ công (giữ nguyên nhóm thủ công của admin gán)
          const adminAssignedGroups = cust.groupIds.filter(gId => {
            const g = groups.find(group => group.id === gId)
            return g ? g.type === 'manual' : false
          })

          // OR LOGIC: Nếu khách đã được Admin chỉ định gán nhóm thủ công đặc biệt -> Giữ nguyên, KHÔNG xếp thêm nhóm AI
          if (adminAssignedGroups.length > 0) {
            return {
              ...cust,
              groupIds: adminAssignedGroups
            }
          }

          const matchedAIGroupIds: string[] = []

          // Quét qua các nhóm có kiểu 'ai' hiện đang được quản lý
          groups.filter(g => g.type === 'ai').forEach(aiGroup => {
            const descLower = aiGroup.description.toLowerCase()
            const nameLower = aiGroup.name.toLowerCase()
            const noteLower = cust.notes.join(' ').toLowerCase()

            // Các từ khóa tương ứng
            const keywords: string[] = []
            if (nameLower.includes('gia đình') || descLower.includes('gia đình')) keywords.push('gia đình', 'bbq', 'nướng')
            if (nameLower.includes('yên tĩnh') || descLower.includes('yên tĩnh')) keywords.push('yên tĩnh', 'cặp đôi', 'cách âm')
            if (nameLower.includes('giờ') || descLower.includes('giờ')) keywords.push('giờ', 'ngắn hạn', 'netflix', 'máy chiếu')

            // Nếu ghi chú khách hàng chứa bất kỳ từ khóa nào liên quan đến mô tả nhóm, AI sẽ tự động xếp vào nhóm đó!
            const isMatch = keywords.some(keyword => noteLower.includes(keyword))
            if (isMatch) {
              matchedAIGroupIds.push(aiGroup.id)
            }
          })

          return {
            ...cust,
            groupIds: matchedAIGroupIds
          }
        })

        // Đồng bộ dữ liệu vào bảng quan hệ customer_group_relations trên Supabase
        try {
          const supabase = getSupabase()
          
          const allRelations: { customer_id: string, group_id: string }[] = []
          for (const cust of updatedCustomers) {
            for (const gid of cust.groupIds) {
              allRelations.push({ customer_id: cust.id, group_id: gid })
            }
          }

          const currentCustIds = customers.map(c => c.id)
          if (currentCustIds.length > 0) {
            const { error: delRelErr } = await supabase
              .from('customer_group_relations')
              .delete()
              .in('customer_id', currentCustIds)

            if (delRelErr) throw delRelErr
          }

          if (allRelations.length > 0) {
            const { error: insRelErr } = await supabase
              .from('customer_group_relations')
              .insert(allRelations)

            if (insRelErr) throw insRelErr
          }
        } catch (dbErr) {
          console.warn('[Supabase AI Sync Database] Không thể lưu quan hệ nhóm AI:', dbErr)
        }

        setCustomers(updatedCustomers)
        setIsAISimulating(false)
        showToast('🤖 AI đã phân tích hành vi khách hàng & tự động phân nhóm dựa trên mô tả thành công (Bảo toàn nhóm thủ công)!')
      }, 800)

    } catch (e) {
      console.error(e)
      setIsAISimulating(false)
    }
  }

  /**
   * Mở Modal Chỉnh Sửa Thông Tin Khách Hàng & Gán Nhóm
   */
  const openEditCustomerModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditCustomerName(customer.name)
    setEditCustomerPhone(customer.phone)
    setEditCustomerNote(customer.notes.join('\n'))
    setAssignedGroupIds([...customer.groupIds])
    setIsAssignModalOpen(true)
  }

  /**
   * Lưu thay đổi thông tin khách hàng & gán nhóm
   */
  const handleSaveCustomerEdits = async () => {
    if (!selectedCustomer) return
    if (!editCustomerName.trim() || !editCustomerPhone.trim()) {
      alert('Tên và Số điện thoại không được bỏ trống!')
      return
    }
    const originalCustomers = [...customers]

    try {
      const updatedNotes = editCustomerNote.split('\n').map(n => n.trim()).filter(Boolean)
      const supabase = getSupabase()

      // 1. Cập nhật thông tin khách hàng trong Supabase customers table
      const { error: updateCustErr } = await supabase
        .from('customers')
        .update({
          name: editCustomerName.trim(),
          phone: editCustomerPhone.trim(),
          notes: updatedNotes
        })
        .eq('id', selectedCustomer.id)

      if (updateCustErr) throw updateCustErr

      // 2. Cập nhật quan hệ nhóm trong customer_group_relations table
      // Xóa quan hệ cũ
      const { error: delRelErr } = await supabase
        .from('customer_group_relations')
        .delete()
        .eq('customer_id', selectedCustomer.id)

      if (delRelErr) throw delRelErr

      // Thêm quan hệ mới
      if (assignedGroupIds.length > 0) {
        const relations = assignedGroupIds.map(gid => ({
          customer_id: selectedCustomer.id,
          group_id: gid
        }))
        const { error: insRelErr } = await supabase
          .from('customer_group_relations')
          .insert(relations)

        if (insRelErr) throw insRelErr
      }

      setCustomers(prev => 
        prev.map(c => c.id === selectedCustomer.id 
          ? { 
              ...c, 
              name: editCustomerName.trim(), 
              phone: editCustomerPhone.trim(), 
              notes: updatedNotes, 
              groupIds: assignedGroupIds 
            } 
          : c
        )
      )

      // Đồng bộ hiển thị nếu Detailed History Modal đang mở
      if (selectedHistoryCustomer && selectedHistoryCustomer.id === selectedCustomer.id) {
        setSelectedHistoryCustomer(prev => prev ? {
          ...prev,
          name: editCustomerName.trim(),
          phone: editCustomerPhone.trim(),
          notes: updatedNotes,
          groupIds: assignedGroupIds
        } : null)
      }

      setIsAssignModalOpen(false)
      showToast(`Đã cập nhật thông tin khách hàng ${editCustomerName.trim()} thành công!`)

    } catch (e: any) {
      console.error('Lỗi khi lưu chỉnh sửa khách hàng:', e)
      setCustomers(originalCustomers)
      alert(`Không thể lưu chỉnh sửa hồ sơ. Lỗi: ${e.message || e}`)
    }
  }

  /**
   * Thêm khách hàng mới thủ công
   */
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return

    try {
      const supabase = getSupabase()
      
      const { data: dbNewCust, error: createCustError } = await supabase
        .from('customers')
        .insert([{
          name: newCustomerName.trim(),
          phone: newCustomerPhone.trim(),
          notes: newCustomerNote.trim() ? [newCustomerNote.trim()] : [],
          total_spent: 0,
          total_bookings: 0,
          last_active: new Date().toISOString()
        }])
        .select()
        .single()

      if (createCustError) throw createCustError

      const newCustObj: Customer = {
        id: dbNewCust.id,
        name: dbNewCust.name,
        phone: dbNewCust.phone,
        totalBookings: 0,
        totalSpent: 0,
        lastActive: new Date().toLocaleDateString('vi-VN'),
        notes: dbNewCust.notes || [],
        groupIds: []
      }

      setCustomers(prev => [newCustObj, ...prev])
      setIsAddCustomerOpen(false)
      
      // Reset form
      setNewCustomerName('')
      setNewCustomerPhone('')
      setNewCustomerNote('')

      showToast(`Đã thêm khách hàng mới thành công!`)
    } catch (error: any) {
      console.error(error)
      // Fallback offline
      const newId = `c0000000-0000-0000-0000-${String(customers.length + 100).padStart(12, '0')}`
      const newCustObjFallback: Customer = {
        id: newId,
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        totalBookings: 0,
        totalSpent: 0,
        lastActive: new Date().toLocaleDateString('vi-VN'),
        notes: newCustomerNote.trim() ? [newCustomerNote.trim()] : [],
        groupIds: []
      }
      setCustomers(prev => [newCustObjFallback, ...prev])
      setIsAddCustomerOpen(false)
      setNewCustomerName('')
      setNewCustomerPhone('')
      setNewCustomerNote('')
      showToast(`Đã thêm khách hàng mới ở chế độ Offline!`)
    }
  }

  /**
   * Tạo nhóm khách hàng mới (AI hoặc Thủ công)
   */
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || !newGroupDesc.trim()) return

    try {
      const supabase = getSupabase()
      const { data: dbNewGroup, error: createGrpErr } = await supabase
        .from('customer_groups')
        .insert([{
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          type: newGroupType
        }])
        .select()
        .single()

      if (createGrpErr) throw createGrpErr

      const newGroupObj: CustomerGroup = {
        id: dbNewGroup.id,
        name: dbNewGroup.name,
        description: dbNewGroup.description || '',
        type: dbNewGroup.type || 'manual'
      }

      setGroups(prev => [...prev, newGroupObj])
      setIsAddGroupOpen(false)
      
      // Reset form
      setNewGroupName('')
      setNewGroupDesc('')
      
      showToast(`Đã tạo nhóm khách hàng mới: ${newGroupObj.name}`)
    } catch (error: any) {
      console.error(error)
      // Fallback offline
      const newId = `d0000000-0000-0000-0000-${String(groups.length + 100).padStart(12, '0')}`
      const newGroupObjFallback: CustomerGroup = {
        id: newId,
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        type: newGroupType
      }
      setGroups(prev => [...prev, newGroupObjFallback])
      setIsAddGroupOpen(false)
      setNewGroupName('')
      setNewGroupDesc('')
      showToast(`Đã tạo nhóm khách hàng mới ở chế độ Offline!`)
    }
  }

  /**
   * Xóa nhóm khách hàng (Xóa liên đới khóa ngoại của khách hàng)
   */
  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhóm "${groupName}" không? Hành động này sẽ tự động gỡ nhóm khỏi toàn bộ khách hàng đang được áp dụng.`)) return

    try {
      const supabase = getSupabase()
      
      // Do PostgreSQL CASCADE hoặc delete trigger, deleting the group in Supabase will automatically cascade-delete in customer_group_relations!
      const { error: delErr } = await supabase
        .from('customer_groups')
        .delete()
        .eq('id', groupId)

      if (delErr) throw delErr

      // 1. Xóa nhóm trong state
      setGroups(prev => prev.filter(g => g.id !== groupId))
      
      // 2. Gỡ liên kết khóa ngoại từ khách hàng trong state
      setCustomers(prev => 
        prev.map(c => ({
          ...c,
          groupIds: c.groupIds.filter(gId => gId !== groupId)
        }))
      )

      showToast(`Đã xóa nhóm "${groupName}" và đồng bộ gỡ liên kết khách hàng!`)
    } catch (error: any) {
      console.error(error)
      alert(`Không thể xóa nhóm này. Lỗi: ${error.message || error}`)
    }
  }

  /**
   * Chỉnh sửa thông tin nhóm khách hàng
   */
  const handleEditGroup = async () => {
    if (!editingGroup || !editGroupName.trim()) return

    try {
      const supabase = getSupabase()
      
      const { error: updateErr } = await supabase
        .from('customer_groups')
        .update({
          name: editGroupName.trim(),
          description: editGroupDesc.trim(),
          type: editGroupType
        })
        .eq('id', editingGroup.id)

      if (updateErr) throw updateErr

      setGroups(prev => prev.map(g => {
        if (g.id === editingGroup.id) {
          return {
            ...g,
            name: editGroupName.trim(),
            description: editGroupDesc.trim(),
            type: editGroupType
          }
        }
        return g
      }))
      
      setIsEditGroupOpen(false)
      setEditingGroup(null)
      showToast(`Đã cập nhật nhóm khách hàng: ${editGroupName.trim()}`)
    } catch (error: any) {
      console.error(error)
      // Fallback offline
      setGroups(prev => prev.map(g => {
        if (g.id === editingGroup.id) {
          return {
            ...g,
            name: editGroupName.trim(),
            description: editGroupDesc.trim(),
            type: editGroupType
          }
        }
        return g
      }))
      setIsEditGroupOpen(false)
      setEditingGroup(null)
      showToast(`Đã cập nhật nhóm khách hàng ở chế độ Offline!`)
    }
  }

  /**
   * Tạo chiến dịch marketing liên kết nhanh từ Nhóm khách hàng
   */
  const handleCreateMarketingCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    const activeGroup = groups.find(g => g.id === selectedGroupTabId)
    if (!activeGroup) return
    if (!marketingCampName.trim() || !marketingCampContent.trim()) {
      alert('Vui lòng điền đầy đủ tên chiến dịch và nội dung!')
      return
    }

    try {
      const supabase = getSupabase()
      
      const { error } = await supabase
        .from('campaigns')
        .insert([{
          name: marketingCampName.trim(),
          channel: marketingCampChannel,
          target_audience: `Nhóm: ${cleanGroupName(activeGroup.name)}`,
          status: 'draft',
          sent_count: 0,
          click_rate: 0,
          budget: Number(marketingCampBudget) || 0,
          message_content: marketingCampContent.trim(),
          voucher_code: marketingCampVoucher || null
        }])

      if (error) throw error

      showToast(`🚀 Chiến dịch "${marketingCampName.trim()}" đã được tạo thành công dưới dạng bản nháp cho nhóm "${cleanGroupName(activeGroup.name)}"!`)
      setIsMarketingModalOpen(false)
    } catch (err: any) {
      console.error('[CRM Quick Marketing Campaign] Fallback active:', err)
      showToast(`🚀 Tạo chiến dịch thành công cho nhóm "${cleanGroupName(activeGroup.name)}" (Chế độ offline)!`)
      setIsMarketingModalOpen(false)
    }
  }

  /**
   * Gỡ khách hàng ra khỏi nhóm
   */
  const handleRemoveCustomerFromGroup = async (customerId: string, groupId: string) => {
    try {
      const supabase = getSupabase()
      
      const { error: relErr } = await supabase
        .from('customer_group_relations')
        .delete()
        .eq('customer_id', customerId)
        .eq('group_id', groupId)

      if (relErr) throw relErr

      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            groupIds: c.groupIds.filter(gId => gId !== groupId)
          }
        }
        return c
      }))
      
      showToast(`Đã gỡ khách hàng khỏi nhóm thành công!`)
    } catch (error: any) {
      console.error(error)
      // Fallback offline
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            groupIds: c.groupIds.filter(gId => gId !== groupId)
          }
        }
        return c
      }))
      showToast(`Đã gỡ khách hàng khỏi nhóm (Offline)`)
    }
  }

  /**
   * Chuyển khách hàng từ nhóm cũ sang nhóm mới chỉ định
   */
  const handleTransferCustomerGroup = async (customerId: string, fromGroupId: string, toGroupId: string) => {
    try {
      const supabase = getSupabase()
      
      // 1. Xóa quan hệ nhóm cũ
      const { error: delErr } = await supabase
        .from('customer_group_relations')
        .delete()
        .eq('customer_id', customerId)
        .eq('group_id', fromGroupId)

      if (delErr) throw delErr

      // 2. Thêm quan hệ nhóm mới
      const { error: insErr } = await supabase
        .from('customer_group_relations')
        .insert({ customer_id: customerId, group_id: toGroupId })

      if (insErr) throw insErr

      // 3. Cập nhật state local
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            groupIds: [...c.groupIds.filter(gId => gId !== fromGroupId), toGroupId]
          }
        }
        return c
      }))

      const fromGroupName = groups.find(g => g.id === fromGroupId)?.name || 'Nhóm cũ'
      const toGroupName = groups.find(g => g.id === toGroupId)?.name || 'Nhóm mới'
      showToast(`Đã chuyển khách hàng từ "${fromGroupName}" sang "${toGroupName}" thành công!`)
    } catch (error: any) {
      console.error(error)
      // Fallback offline
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            groupIds: [...c.groupIds.filter(gId => gId !== fromGroupId), toGroupId]
          }
        }
        return c
      }))
      showToast(`Đã chuyển nhóm ở chế độ Offline!`)
    }
  }

  /**
   * Thêm khách hàng vào nhóm chỉ định
   */
  const handleAddCustomerToGroup = async (customerId: string, groupId: string) => {
    try {
      const supabase = getSupabase()
      
      // 1. Thêm quan hệ nhóm mới
      const { error: insErr } = await supabase
        .from('customer_group_relations')
        .insert({ customer_id: customerId, group_id: groupId })

      if (insErr) throw insErr

      // 2. Cập nhật state local
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            groupIds: [...new Set([...c.groupIds, groupId])]
          }
        }
        return c
      }))

      const groupName = groups.find(g => g.id === groupId)?.name || 'Nhóm'
      showToast(`Đã thêm khách hàng vào nhóm "${groupName}" thành công!`)
    } catch (error: any) {
      console.error(error)
      // Fallback offline
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            groupIds: [...new Set([...c.groupIds, groupId])]
          }
        }
        return c
      }))
      showToast(`Đã thêm khách vào nhóm ở chế độ Offline!`)
    }
  }

  const toggleGroupSelection = (groupId: string) => {
    if (assignedGroupIds.includes(groupId)) {
      setAssignedGroupIds(prev => prev.filter(id => id !== groupId))
    } else {
      setAssignedGroupIds(prev => [...prev, groupId])
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 3500)
    return () => clearTimeout(timer)
  }

  // Lọc danh sách khách hàng
  const filteredCustomers = customers.filter(c => {
    const query = searchTerm.toLowerCase().trim()
    const matchSearch = !query || c.name.toLowerCase().includes(query) || c.phone.includes(query)
    const matchGroup = selectedGroupFilter === 'all' || c.groupIds.includes(selectedGroupFilter)

    return matchSearch && matchGroup
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative">
      
      {/* 🔮 CUSTOM TOAST SYSTEM */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-white dark:text-zinc-950 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white">
            <Check size={11} className="stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER CRM AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
            Khách Hàng & CRM
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            Quản lý quan hệ khách hàng đa tầng, tổ chức các nhóm hành vi tiếp thị và đồng bộ phân hạng hội viên bằng AI.
          </p>
        </div>

        {/* Cụm nút thao tác đầu trang */}
        <div className="flex gap-2">
          {activeTab === 'customers' ? (
            <>
              <button
                onClick={simulateAIAnalysis}
                disabled={isLoading}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-4 py-2.5 rounded-xl font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all duration-200 disabled:opacity-55"
              >
                <Sparkles size={13} className={`text-purple-600 ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
                <span>🔄 Đồng Bộ AI Hành Vi</span>
              </button>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition flex-shrink-0"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Thêm Khách Hàng</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={simulateAIAnalysis}
                disabled={isLoading}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-4 py-2.5 rounded-xl font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all duration-200 disabled:opacity-55"
              >
                <Sparkles size={13} className={`text-purple-600 ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
                <span>🔮 Đồng Bộ AI Hành Vi</span>
              </button>
              <button
                onClick={() => setIsAddGroupOpen(true)}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition flex-shrink-0"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Tạo Nhóm Mới</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* TAB NAVIGATION BUTTONS (CHUYỂN TAB DANH SÁCH / DANH MỤC NHÓM) */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1.5">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-black border-b-2 cursor-pointer transition ${
            activeTab === 'customers' 
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' 
              : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
          }`}
        >
          👤 Danh sách khách hàng ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-black border-b-2 cursor-pointer transition ${
            activeTab === 'groups' 
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' 
              : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
          }`}
        >
          🗂️ Danh mục nhóm khách hàng ({groups.length})
        </button>
      </div>

      {/* ================= TAB 1: DANH SÁCH KHÁCH HÀNG CRM ================= */}
      {activeTab === 'customers' && (
        <div className="flex flex-col gap-5">
          {/* SEARCH BAR & LỌC TÀI CRM */}
          <div className={`flex flex-col md:flex-row gap-3 items-center justify-between border p-4 rounded-3xl transition duration-200 ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-800/80 shadow-none' : 'bg-white border-zinc-200 shadow-2xs'
          }`}>
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm khách hàng theo Tên hoặc SĐT..."
                className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none transition ${
                  theme === 'dark'
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300 focus:border-zinc-650 focus:bg-zinc-900'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 focus:border-zinc-400 focus:bg-white'
                }`}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            </div>

            {/* Filter by Group */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider hidden sm:inline">Lọc theo nhóm:</span>
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className={`border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer transition ${
                  theme === 'dark'
                    ? 'bg-zinc-850 text-zinc-200 border-zinc-700 focus:border-zinc-600'
                    : 'bg-white text-zinc-700 border-zinc-200 focus:border-zinc-400'
                }`}
              >
                <option value="all">Tất cả nhóm</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{cleanGroupName(g.name)} ({g.type === 'ai' ? 'AI' : 'Thủ công'})</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE DATA */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
                Đang đồng bộ cơ sở dữ liệu khách hàng...
              </span>
            </div>
          ) : (
            <div className={`border rounded-3xl shadow-sm overflow-hidden flex flex-col transition duration-200 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Mã Khách</th>
                      <th className="py-4 px-5">Khách Hàng</th>
                      <th className="py-4 px-5 text-center">Lịch Sử Đặt Đơn</th>
                      <th className="py-4 px-5">Ghi Chú Hành Vi Thực Tế</th>
                      <th className="py-4 px-5">Nhóm Khách Hàng Áp Dụng</th>
                      <th className="py-4 px-6 text-center">Hoạt Động Cuối</th>
                      <th className="py-4 px-6 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle size={24} className="text-stone-300" />
                            <span>Không tìm thấy thông tin khách hàng nào khớp.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const isRowHighlighted = highlightedCustomerId === cust.id

                        return (
                          <tr 
                            key={cust.id}
                            id={`cust-row-${cust.id}`}
                            className={`transition-all duration-700 ${
                              isRowHighlighted 
                                ? 'bg-emerald-50/75 border-y-2 border-emerald-500 animate-pulse relative z-10' 
                                : 'hover:bg-zinc-50/40 dark:bg-zinc-900/30'
                            }`}
                          >
                            <td className="py-4 px-6 font-mono text-zinc-500 dark:text-zinc-400 font-extrabold">{cust.id}</td>
                            <td className="py-4 px-5">
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => openHistoryModal(cust)}
                                  className="font-extrabold text-zinc-800 dark:text-zinc-200 text-sm hover:text-zinc-900 dark:text-zinc-100 hover:underline text-left cursor-pointer transition border-none bg-transparent p-0 block"
                                  title="Xem hồ sơ chi tiết khách hàng"
                                >
                                  {cust.name}
                                </button>
                                <span className="text-[10px] text-zinc-550 dark:text-zinc-400 font-bold font-mono flex items-center gap-0.5 mt-0.5">
                                  <Phone size={10} /> {cust.phone}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <div className="flex flex-col gap-0.5 justify-center">
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">{cust.totalBookings} đơn đặt phòng</span>
                                <span className="text-[10px] text-zinc-550 dark:text-zinc-400 font-bold font-mono">Tích lũy: {formatVND(cust.totalSpent)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 max-w-[200px]">
                              <p className="text-zinc-550 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2 italic" title={cust.notes.join(' | ')}>
                                "{cust.notes[cust.notes.length - 1] || 'Chưa có ghi chú'}"
                              </p>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-1.5 flex-wrap max-w-[220px]">
                                {cust.groupIds.length === 0 ? (
                                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold italic select-none">Chưa gán nhóm</span>
                                ) : (
                                  cust.groupIds.map(gId => {
                                    const g = groups.find(group => group.id === gId)
                                    if (!g) return null
                                    return (
                                      <span 
                                        key={gId} 
                                        className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border flex items-center gap-0.5 shadow-3xs bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
                                      >
                                        {g.type === 'ai' && <Bot size={9} className="text-zinc-500 dark:text-zinc-400" />}
                                        {cleanGroupName(g.name)}
                                      </span>
                                    )
                                  })
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center text-zinc-600 dark:text-zinc-400 font-mono font-bold">
                              <span className="inline-flex items-center gap-1">
                                <Calendar size={11} className="text-zinc-500 dark:text-zinc-400" />
                                {cust.lastActive}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditCustomerModal(cust)}
                                  className="w-9 h-9 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white flex items-center justify-center border border-purple-100 hover:border-purple-600 transition cursor-pointer shadow-sm"
                                  title="Chỉnh sửa thông tin & nhóm"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => openHistoryModal(cust)}
                                  className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 hover:border-stone-300 transition cursor-pointer shadow-sm"
                                  title="Xem lịch sử đặt phòng trực quan"
                                >
                                  <Eye size={15} />
                                </button>
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
        </div>
      )}

      {/* ================= TAB 2: QUẢN LÝ DANH MỤC NHÓM KHÁCH HÀNG ================= */}
      {activeTab === 'groups' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">

          {/* HORIZONTAL SHEET TABS (Google Sheets Style) */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto gap-2 bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded-2xl">
            {groups.map((group) => {
              const isActive = selectedGroupTabId === group.id
              const membersCount = customers.filter(c => c.groupIds.includes(group.id)).length

              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupTabId(group.id)
                    setIsAddMemberOpen(false)
                  }}
                  className={`flex items-center gap-2 px-6 py-3.5 text-xs md:text-sm font-bold transition-all border rounded-xl cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-white border-zinc-900 dark:border-zinc-100 shadow-md font-extrabold' 
                      : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-stone-900 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span>{cleanGroupName(group.name)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {membersCount}
                  </span>
                </button>
              )
            })}
          </div>

          {/* DYNAMIC CONTENT FOR THE SELECTED SHEET */}
          {(() => {
            const activeGroup = groups.find(g => g.id === selectedGroupTabId) || groups[0]
            if (!activeGroup) {
              return (
                <div className="text-center py-10 text-zinc-400 dark:text-zinc-500 text-xs font-semibold">
                  Chưa cấu hình danh mục nhóm khách hàng. Vui lòng bấm "Tạo Nhóm Mới" ở trên đầu.
                </div>
              )
            }

            const groupMembers = customers.filter(c => c.groupIds.includes(activeGroup.id))
            const groupSpent = groupMembers.reduce((sum, c) => sum + c.totalSpent, 0)
            const totalCrmSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0) || 1
            const contributionPercentage = ((groupSpent / totalCrmSpent) * 100).toFixed(1)
            const isAI = activeGroup.type === 'ai'

            return (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                {/* INLINE GROUP METADATA & FINANCIAL KPIs PANEL */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden bg-zinc-500/10 dark:bg-zinc-500/15">
                  <div className="flex flex-col gap-2 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm md:text-base font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase tracking-wide">{cleanGroupName(activeGroup.name)}</h4>
                      
                      {/* Help / Guide Tooltip */}
                      <div className="relative group/desc flex items-center">
                        <button className="bg-transparent border-none p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 cursor-pointer flex items-center justify-center transition" title="Xem mô tả đặc tính nhóm">
                          <HelpCircle size={14} className="stroke-[2.5]" />
                        </button>
                        
                        {/* Tooltip Popup container */}
                        <div className="absolute left-0 bottom-full mb-2 w-72 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-white text-[10px] leading-relaxed p-3.5 rounded-2xl shadow-xl z-40 opacity-0 pointer-events-none group-hover/desc:opacity-100 group-hover/desc:pointer-events-auto transition-all duration-200 border border-stone-800/80">
                          <div className="font-extrabold mb-1 uppercase tracking-wide text-sky-300 flex items-center gap-1">
                            <HelpCircle size={10} /> Hướng Dẫn & Đặc Tính Nhóm:
                          </div>
                          <div className="font-semibold text-stone-200">{activeGroup.description}</div>
                          {/* Triangle arrow */}
                          <div className="absolute top-full left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-stone-900"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial KPIs and Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto flex-shrink-0">
                    <div className="flex gap-3">
                      <div className="bg-card border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 rounded-2xl flex flex-col min-w-[110px]">
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                          <Coins size={10} className="text-zinc-500 dark:text-zinc-400" /> Doanh Thu Nhóm
                        </span>
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-mono mt-0.5">
                          {formatVND(groupSpent)}
                        </span>
                      </div>
                      <div className="bg-card border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 rounded-2xl flex flex-col min-w-[110px]">
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                          <TrendingUp size={10} className="text-emerald-500" /> Tỷ lệ Đóng Góp
                        </span>
                        <span className="text-xs font-black text-emerald-600 font-mono mt-0.5">
                          {contributionPercentage}% doanh số
                        </span>
                      </div>
                    </div>

                    {/* Group settings actions */}
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => {
                          const cleanName = cleanGroupName(activeGroup.name)
                          setMarketingCampName(`Chiến dịch đặc biệt cho nhóm: ${cleanName}`)
                          setMarketingCampChannel('Zalo ZNS')
                          setMarketingCampVoucher(activeVouchers[0]?.code || '')
                          
                          // Đề xuất nội dung tùy hành vi của nhóm
                          let defaultMsg = `Chào {ten_khach}, Bliss Home gửi tặng bạn ưu đãi nghỉ dưỡng đặc biệt! Dùng mã {ma_voucher} để đặt phòng và nhận quà tặng chào mừng nhé!`
                          if (cleanName.includes('Gia đình') || cleanName.includes('gia đình')) {
                            defaultMsg = `Chào {ten_khach}, Bliss Home dành tặng ưu đãi sum vầy đặc biệt cho cả nhà! Nhập mã {ma_voucher} để được ưu tiên nâng phòng VIP miễn phí và setup bếp BBQ ngoài trời nhé!`
                          } else if (cleanName.includes('Yên tĩnh') || cleanName.includes('yên tĩnh')) {
                            defaultMsg = `Chào {ten_khach}, trốn phố thị xô bồ tìm lại bình yên cùng Bliss Home cuối tuần này nhé! Nhập mã {ma_voucher} để nhận ưu đãi giảm 15% phòng nghỉ biệt lập ngắm hoàng hôn cực chill.`
                          }
                          setMarketingCampContent(defaultMsg)
                          setMarketingCampBudget(500000)
                          setIsMarketingModalOpen(true)
                        }}
                        className="px-3.5 py-2.5 rounded-xl border-none cursor-pointer transition flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] gap-1.5 shadow-md active:scale-95 whitespace-nowrap"
                        title="Tạo chiến dịch tiếp thị cá nhân hóa cho nhóm này"
                      >
                        <Megaphone size={12} className="stroke-[2.5]" />
                        <span>Tạo Chiến Dịch</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingGroup(activeGroup)
                          setEditGroupName(cleanGroupName(activeGroup.name))
                          setEditGroupDesc(activeGroup.description)
                          setEditGroupType(activeGroup.type)
                          setIsEditGroupOpen(true)
                        }}
                        className="p-2.5 rounded-xl border-none cursor-pointer transition flex items-center justify-center bg-white border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/10 dark:bg-zinc-500/15 hover:text-zinc-900 dark:text-zinc-100"
                        title="Chỉnh sửa danh mục"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(activeGroup.id, cleanGroupName(activeGroup.name))}
                        className="p-2.5 bg-white hover:bg-red-50 text-zinc-400 dark:text-zinc-500 hover:text-red-600 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer transition flex items-center justify-center"
                        title="Xóa danh mục nhóm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* MEMBERS DATA SHEET AND ACTIONS */}
                <div className={`border rounded-3xl p-5 md:p-6 flex flex-col gap-4 shadow-2xs transition duration-200 ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800 shadow-none' : 'bg-white border-zinc-200 shadow-2xs'
                }`}>
                  {/* Table Header Controls */}
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase tracking-wider">
                      Danh sách khách hàng ({groupMembers.length})
                    </h3>

                    {/* Add Customer Trigger Button */}
                    <div className="relative">
                      <button
                        onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
                        className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white border-none rounded-xl transition cursor-pointer flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 shadow-md shadow-stone-800/10"
                      >
                        <Plus size={11} className="stroke-[3]" /> Thêm khách hàng
                      </button>

                      {/* Add Member Popover Overlay */}
                      {isAddMemberOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 z-40 animate-in slide-in-from-top-2 duration-150 flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Chọn khách hàng</span>
                            <button 
                              onClick={() => { setIsAddMemberOpen(false); setSearchMemberTerm(''); }}
                              className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 bg-none border-none text-[10px] cursor-pointer"
                            >
                              ✕ Đóng
                            </button>
                          </div>
                          
                          {/* Search box inside popover */}
                          <div className="relative flex items-center">
                            <Search size={11} className="text-zinc-400 dark:text-zinc-500 absolute left-2.5 pointer-events-none" />
                            <input
                              type="text"
                              value={searchMemberTerm}
                              onChange={(e) => setSearchMemberTerm(e.target.value)}
                              placeholder="Tìm tên hoặc số điện thoại..."
                              className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-7 pr-3 py-1.5 text-[10px] font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                            />
                          </div>

                          {/* Customer list to add */}
                          <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 pr-1">
                            {(() => {
                              const eligibleCustomers = customers.filter(
                                c => !c.groupIds.includes(activeGroup.id) &&
                                (searchMemberTerm.trim() === '' || 
                                 c.name.toLowerCase().includes(searchMemberTerm.toLowerCase()) ||
                                 c.phone.includes(searchMemberTerm))
                              )

                              if (eligibleCustomers.length === 0) {
                                return (
                                  <div className="text-center py-6 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                                    Không tìm thấy khách hàng phù hợp.
                                  </div>
                                )
                              }

                              return eligibleCustomers.map(cust => (
                                <button
                                  key={cust.id}
                                  onClick={async () => {
                                    await handleAddCustomerToGroup(cust.id, activeGroup.id)
                                    setIsAddMemberOpen(false)
                                    setSearchMemberTerm('')
                                  }}
                                  className="w-full flex items-center justify-between p-2 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-left transition cursor-pointer bg-card border-zinc-200 dark:border-zinc-800"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 leading-tight">{cust.name}</span>
                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">{cust.phone}</span>
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    + Thêm
                                  </span>
                                </button>
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Members Table */}
                  {groupMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-zinc-400 dark:text-zinc-500 gap-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                      <Users size={36} className="stroke-[1.5] text-stone-300 animate-pulse" />
                      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 text-center leading-relaxed max-w-lg">
                        Nhấn nút <strong>Đồng bộ hành vi bằng AI</strong> để tự động phân nhóm dựa trên dữ liệu hành vi người dùng đã thu thập hoặc bạn có thể tự thêm khách hàng.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-100/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                            <th className="py-3 pl-4 w-[40px]"></th>
                            <th className="py-3 px-3">Khách hàng</th>
                            <th className="py-3 px-3 hidden sm:table-cell">Lượt đặt phòng</th>
                            <th className="py-3 px-3 text-right">Chi tiêu tích lũy</th>
                            <th className="py-3 px-3 text-center w-[120px]">Hạng thành viên</th>
                            <th className="py-3 px-3 text-center w-[100px]">Phân lớp</th>
                            <th className="py-3 px-3 text-center w-[160px]">Chuyển nhóm</th>
                            <th className="py-3 pr-4 text-right w-[60px]">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs font-semibold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
                          {groupMembers.map((member) => {
                            const tierInfo = getCustomerTier(member.totalSpent)
                            const isMemberAI = activeGroup.type === 'ai'
                            const isHovered = hoveredCustomerId === member.id

                            return (
                              <tr 
                                key={member.id}
                                className="group hover:bg-zinc-50/40 dark:bg-zinc-900/30 transition duration-150 relative"
                                onMouseEnter={() => setHoveredCustomerId(member.id)}
                                onMouseLeave={() => setHoveredCustomerId(null)}
                              >
                                {/* Avatar */}
                                <td className="py-3.5 pl-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-inner uppercase ${
                                    tierInfo.colorTheme === 'violet' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' :
                                    tierInfo.colorTheme === 'amber' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' :
                                    tierInfo.colorTheme === 'slate' ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300' :
                                    'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                  }`}>
                                    {member.name.charAt(0)}
                                  </div>
                                </td>

                                {/* Member details */}
                                <td className="py-3.5 px-3 relative">
                                  <div className="flex flex-col">
                                    <button
                                      onClick={() => openHistoryModal(member)}
                                      className="font-extrabold text-zinc-800 dark:text-zinc-200 text-sm hover:text-zinc-900 dark:text-zinc-100 hover:underline text-left cursor-pointer transition border-none bg-transparent p-0 block leading-tight font-sans"
                                      title="Xem hồ sơ chi tiết khách hàng"
                                    >
                                      {member.name}
                                    </button>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                                      {member.phone}
                                    </span>
                                  </div>

                                  {/* AI BEHAVIOR TOOLTIP (Hover triggering) */}
                                  {isHovered && isMemberAI && (
                                    <div className="absolute left-0 top-full mt-1 w-72 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl shadow-xl p-3.5 z-45 animate-in fade-in duration-200 border border-purple-500/20">
                                      <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
                                        <Bot size={11} className="text-purple-300 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-wider text-purple-300">Ghi chú hành vi của AI</span>
                                      </div>
                                      <p className="text-[10px] leading-relaxed font-medium text-purple-100">
                                        {member.notes.length > 0 
                                          ? `"${member.notes.join(', ')}"` 
                                          : 'Không có ghi chú hành vi cụ thể.'}
                                      </p>
                                    </div>
                                  )}
                                </td>

                                {/* Bookings count */}
                                <td className="py-3.5 px-3 hidden sm:table-cell font-bold font-mono">
                                  {member.totalBookings}
                                </td>

                                {/* Spent amount */}
                                <td className="py-3.5 px-3 text-right font-black font-mono">
                                  {formatVND(member.totalSpent)}
                                </td>

                                {/* Tier badge */}
                                <td className="py-3.5 px-3 text-center">
                                  <div className="flex justify-center">
                                    <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-2xs whitespace-nowrap ${
                                      tierInfo.colorTheme === 'violet' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/40' :
                                      tierInfo.colorTheme === 'amber' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40' :
                                      tierInfo.colorTheme === 'slate' ? 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-zinc-350 border-slate-200 dark:border-zinc-800' :
                                      'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                    }`}>
                                      {renderTierIcon(tierInfo.colorTheme, 9)}
                                      {tierInfo.name.split('(')[0]}
                                    </span>
                                  </div>
                                </td>

                                {/* Source classification badge */}
                                <td className="py-3.5 px-3 text-center">
                                  <div className="flex justify-center">
                                    {isMemberAI ? (
                                      <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-2xs cursor-default">
                                        <Bot size={8} /> AI Phân
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-2xs cursor-default">
                                        <Users size={8} /> Thủ công
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Group Transfer selector */}
                                <td className="py-3.5 px-3 text-center">
                                  <div className="flex justify-center">
                                    <select
                                      value={activeGroup.id}
                                      onChange={(e) => {
                                        const targetGroupId = e.target.value
                                        if (targetGroupId !== activeGroup.id) {
                                          handleTransferCustomerGroup(member.id, activeGroup.id, targetGroupId)
                                        }
                                      }}
                                      className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-1 text-[10px] font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 transition cursor-pointer max-w-[140px]"
                                    >
                                      <option value={activeGroup.id} disabled>— Chuyển nhóm —</option>
                                      {groups.filter(g => g.id !== activeGroup.id).map(g => (
                                        <option key={g.id} value={g.id}>{cleanGroupName(g.name)}</option>
                                      ))}
                                    </select>
                                  </div>
                                </td>

                                {/* Actions (Delete/Remove) */}
                                <td className="py-3.5 pr-4 text-right">
                                  <button
                                    onClick={() => handleRemoveCustomerFromGroup(member.id, activeGroup.id)}
                                    className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-red-650 dark:text-red-450 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 border border-red-200/50 dark:border-red-900/40 rounded-xl transition cursor-pointer"
                                    title="Gỡ khỏi nhóm hiện tại"
                                  >
                                    Gỡ
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ================= MODAL CHỈNH SỬA THÔNG TIN KHÁCH HÀNG & GÁN NHÓM (EDIT CUSTOMER & GROUPS) ================= */}
      {isAssignModalOpen && selectedCustomer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsAssignModalOpen(false)}
        >
          <div 
            className="bg-card border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center shadow-inner">
                <Pencil size={18} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase leading-none">Chỉnh Sửa Hồ Sơ Khách Hàng</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider uppercase">MÃ KHÁCH HÀNG: {selectedCustomer.id}</span>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4 text-xs font-semibold text-zinc-900 dark:text-zinc-100 overflow-y-auto pr-1">
              
              {/* 1. Phần thông tin cơ bản */}
              <div className="flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-[9px] text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-black block border-b border-zinc-200 dark:border-zinc-800 pb-1">1. Thông tin liên hệ cơ bản</span>
                
                {/* Tên & SĐT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Họ và Tên *</label>
                    <input 
                      type="text"
                      required
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Số Điện Thoại *</label>
                    <input 
                      type="text"
                      required
                      value={editCustomerPhone}
                      onChange={(e) => setEditCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                    />
                  </div>
                </div>

                {/* Ghi chú hành vi */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Ghi Chú Đặc Tính Hành Vi (AI CRM Profile)</label>
                  <textarea 
                    rows={2}
                    value={editCustomerNote}
                    onChange={(e) => setEditCustomerNote(e.target.value)}
                    placeholder="Ví dụ: Thích yên tĩnh tuyệt đối, đi cùng gia đình lớn, thích ăn BBQ ngoài ban công..."
                    className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                  />
                  <span className="text-[8px] text-zinc-400 dark:text-zinc-500 italic block font-medium">Lưu ý: Mô tả hành vi này sẽ được AI sử dụng để tự động phân tích và kết nạp nhóm khi đồng bộ AI.</span>
                </div>
              </div>

              {/* 2. Phần gán nhóm */}
              <div className="flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-h-[25vh] overflow-y-auto">
                <span className="text-[9px] text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-black block border-b border-zinc-200 dark:border-zinc-800 pb-1">2. Danh mục nhóm áp dụng</span>
                
                <div className="flex flex-col gap-2.5 mt-1">
                  {groups.map((group) => {
                    const isSelected = assignedGroupIds.includes(group.id)
                    return (
                      <button
                        type="button"
                        key={group.id}
                        onClick={() => toggleGroupSelection(group.id)}
                        className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50/50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-900/40 text-purple-900 dark:text-purple-300 shadow-3xs'
                            : 'bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition ${
                            isSelected 
                              ? 'bg-purple-600 border-purple-600 text-white' 
                              : 'border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                          }`}>
                            {isSelected && <Check size={10} className="stroke-[3]" />}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5 flex-grow">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-xs">{cleanGroupName(group.name)}</span>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 border rounded-full ${
                              group.type === 'ai' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                            }`}>
                              {group.type === 'ai' ? 'AI' : 'Thủ công'}
                            </span>
                          </div>
                          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium mt-0.5">
                            {group.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Hàng nút gửi */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-grow py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomerEdits}
                  className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={12} className="stroke-[3]" /> Lưu Hồ Sơ Khách Hàng
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO NHÓM MỚI (ADD CUSTOMER GROUP MODAL) ================= */}
      {isAddGroupOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsAddGroupOpen(false)}
        >
          <div 
            className={`w-full max-w-md rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 border text-zinc-800 dark:text-zinc-250 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-150'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setIsAddGroupOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center shadow-inner">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase leading-none">Tạo Nhóm Khách Hàng</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider">CẤU HÌNH DANH MỤC NHÓM CRM MỚI</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              
              {/* Tên nhóm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tên nhóm khách hàng *</label>
                <input 
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ví dụ: Đặt phòng VIP CS5 💎"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                />
              </div>

              {/* Loại nhóm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Hình thức phân nhóm *</label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                >
                  <option value="ai">🤖 AI Tự Động (Phân loại dựa trên mô tả & hành vi)</option>
                  <option value="manual">👤 Thủ công (Admin chỉ định từng người)</option>
                </select>
              </div>

              {/* Mô tả nhóm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Mô tả đặc tính nhóm (Dành cho AI đối chiếu hành vi) *</label>
                <textarea 
                  required
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Ví dụ: Khách hàng đi nghỉ dưỡng lớn cùng gia đình, yêu cầu nướng BBQ, hoặc bồn Hinoki lớn ngoài ban công..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300 leading-relaxed placeholder:font-normal"
                />
              </div>

              {/* Nút gửi form */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGroupOpen(false)}
                  className="flex-grow py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={12} className="stroke-[3]" /> Tạo Nhóm Danh Mục
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL LỊCH SỬ ĐẶT PHÒNG CHI TIẾT (CUSTOMER BOOKING HISTORY MODAL) ================= */}
      {isHistoryModalOpen && selectedHistoryCustomer && (() => {
        const cust = selectedHistoryCustomer
        const tierInfo = getCustomerTier(cust.totalSpent)
        const bookings = getMockBookings(cust)

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={() => setIsHistoryModalOpen(false)}
          >
            <div 
              className="bg-card border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nút Đóng Modal */}
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
              >
                ✕
              </button>

              {/* Title & Customer Badge */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-white rounded-2xl flex items-center justify-center shadow-inner font-black text-base uppercase">
                    {cust.name.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 tracking-tight leading-none">{cust.name}</h3>
                      <button
                        onClick={() => {
                          setIsHistoryModalOpen(false)
                          openEditCustomerModal(cust)
                        }}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer flex items-center gap-1 active:scale-95 transition"
                        title="Chỉnh sửa thông tin & nhóm"
                      >
                        <Pencil size={10} /> Chỉnh sửa
                      </button>
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1.5 tracking-wider uppercase">Mã khách: {cust.id} | SĐT: {cust.phone}</span>
                  </div>
                </div>

                {/* Badge Nhóm */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cust.groupIds.map(gId => {
                    const g = groups.find(group => group.id === gId)
                    if (!g) return null
                    return (
                      <span 
                        key={gId} 
                        className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border flex items-center gap-0.5 shadow-3xs bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
                      >
                        {g.type === 'ai' && <Bot size={10} className="text-zinc-500 dark:text-zinc-400" />}
                        {cleanGroupName(g.name)}
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Hạng Thành Viên */}
                <div className={`bg-gradient-to-br rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-sm border ${getTierThemeClasses(tierInfo.colorTheme)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest font-black opacity-70">Hạng Thành Viên</span>
                    {renderTierIcon(tierInfo.colorTheme, 16)}
                  </div>
                  <strong className="text-sm font-black tracking-tight leading-none">{tierInfo.name.split('(')[0]}</strong>
                </div>

                {/* 2. Tổng Tích Lũy */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-xs">
                  <div className="flex items-center justify-between animate-pulse">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">Tích Lũy Chi Tiêu</span>
                    <TrendingUp size={14} className="text-emerald-500" />
                  </div>
                  <strong className="text-base font-black font-sans leading-none text-zinc-900 dark:text-zinc-100">{formatVND(cust.totalSpent)}</strong>
                </div>

                {/* 3. Tổng Đơn Đặt */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">Tổng Số Đơn Đặt</span>
                    <Calendar size={14} className="text-indigo-500" />
                  </div>
                  <strong className="text-base font-black font-sans leading-none text-zinc-900 dark:text-zinc-100">{cust.totalBookings} đơn phòng</strong>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4 flex flex-col gap-2.5 shadow-2xs text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
                <span className="text-[10px] text-purple-750 uppercase tracking-widest font-black flex items-center gap-1 border-b border-purple-100/60 pb-1.5">
                  📝 Ghi chú
                </span>
                
                {/* Danh sách các ghi chú đã lưu trước đó */}
                <div className="flex flex-col gap-2 max-h-[14vh] overflow-y-auto pr-1">
                  {cust.notes.length === 0 ? (
                    <span className="text-xs text-purple-400 italic font-semibold font-sans">Chưa có ghi chú nào được lưu cho hội viên.</span>
                  ) : (
                    cust.notes.map((n, idx) => (
                      <div key={idx} className={`rounded-xl p-2.5 text-xs font-semibold italic relative leading-relaxed font-sans shadow-3xs border ${
                        theme === 'dark'
                          ? 'bg-purple-950/20 border-purple-900/40 text-purple-200'
                          : 'bg-white border-purple-100 text-purple-950'
                      }`}>
                        "{n}"
                      </div>
                    ))
                  )}
                </div>

                {/* 1 dòng thêm ghi chú mới */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!newDetailNote.trim()) return
                    
                    const updatedNotes = [...cust.notes, newDetailNote.trim()]
                    
                    try {
                      const supabase = getSupabase()
                      const { error: noteUpdateErr } = await supabase
                        .from('customers')
                        .update({ notes: updatedNotes })
                        .eq('id', cust.id)
                      
                      if (noteUpdateErr) throw noteUpdateErr
                    } catch (dbErr) {
                      console.warn('[Supabase Add Note] Failed to save note:', dbErr)
                    }
                    
                    // Cập nhật State danh sách khách hàng
                    setCustomers(prev => 
                      prev.map(c => c.id === cust.id ? { ...c, notes: updatedNotes } : c)
                    )
                    
                    // Cập nhật State khách hàng đang xem chi tiết
                    setSelectedHistoryCustomer({
                      ...cust,
                      notes: updatedNotes
                    })
                    
                    setNewDetailNote('')
                    showToast('Đã thêm ghi chú mới thành công!')
                  }}
                  className="flex gap-2 mt-1"
                >
                  <input 
                    type="text"
                    value={newDetailNote}
                    onChange={(e) => setNewDetailNote(e.target.value)}
                    placeholder="Nhập ghi chú mới để lưu..."
                    className="flex-grow bg-card border border-purple-200 dark:border-purple-900/40 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500 text-zinc-800 dark:text-zinc-200 font-sans"
                  />
                  <button
                    type="submit"
                    className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-white font-extrabold text-xs px-4 py-2 rounded-xl border-none cursor-pointer active:scale-95 transition flex-shrink-0 font-sans"
                  >
                    Thêm
                  </button>
                </form>
              </div>

              {/* Timeline Lịch sử Đặt phòng */}
              <div className="flex flex-col gap-3 flex-grow overflow-hidden">
                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <History size={14} className="text-zinc-900 dark:text-zinc-100" /> Lịch Sử Đặt Phòng Gần Nhất
                </h4>

                <div className="overflow-y-auto pr-2 max-h-[32vh] flex flex-col gap-4 relative">
                  {bookings.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs font-semibold flex flex-col items-center gap-2">
                      <AlertCircle size={20} className="text-stone-300" />
                      <span>Không tìm thấy lịch sử đặt phòng nào cho khách hàng này.</span>
                    </div>
                  ) : (
                    bookings.map((bk, index) => (
                      <div key={bk.id} className="flex gap-4 relative">
                        {/* Timeline Connector Line */}
                        {index < bookings.length - 1 && (
                          <div className="absolute left-[15px] top-8 bottom-[-20px] w-0.5 bg-zinc-100 dark:bg-zinc-800"></div>
                        )}
                        
                        {/* Dot Icon */}
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 z-10 text-zinc-900 dark:text-zinc-100">
                          <Clock size={12} />
                        </div>

                        {/* Booking Card Content */}
                        <div className={`border rounded-2xl p-4 flex-grow shadow-2xs hover:shadow-xs transition duration-200 flex flex-col gap-2.5 ${
                          theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-xs sm:text-sm">{bk.roomName}</span>
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-bold flex items-center gap-1">
                                Mã đơn: {bk.id} | Chi nhánh: {bk.branch}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono">{formatVND(bk.amount)}</span>
                              <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 select-none font-sans font-extrabold">
                                Thành công
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 font-bold text-zinc-600 dark:text-zinc-400 font-sans">
                            <div>
                              <span className="text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider font-extrabold text-[8px] mb-0.5">Thời gian check-in</span>
                              <span>{bk.checkIn}</span>
                            </div>
                            {bk.checkOut && bk.checkOut !== bk.checkIn && (
                              <div>
                                <span className="text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider font-extrabold text-[8px] mb-0.5">Thời gian check-out</span>
                                <span>{bk.checkOut}</span>
                              </div>
                            )}
                          </div>

                          {bk.specialRequest && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic pl-2.5 border-l-2 border-zinc-200 dark:border-zinc-800">
                              Lưu ý: "{bk.specialRequest}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {cust.totalBookings > bookings.length && (
                    <div className="text-center py-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 mt-2 font-sans">
                      Hiển thị {bookings.length} trên {cust.totalBookings} đơn đặt phòng gần nhất của khách hàng.
                    </div>
                  )}
                </div>
              </div>

              {/* Close / Action Footer */}
              <div className="flex gap-2.5 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsHistoryModalOpen(false)
                    openEditCustomerModal(cust)
                  }}
                  className="flex-grow py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-black text-xs border border-purple-200 cursor-pointer text-center font-sans transition flex items-center justify-center gap-1 active:scale-95"
                >
                  <Pencil size={12} /> Chỉnh Sửa Hồ Sơ & Nhóm
                </button>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer text-center font-sans"
                >
                  Đóng Cửa Sổ Chi Tiết
                </button>
              </div>

            </div>
          </div>
        )
      })()}

      {/* ================= MODAL THÊM KHÁCH HÀNG MỚI (ADD NEW CUSTOMER MODAL) ================= */}
      {isAddCustomerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsAddCustomerOpen(false)}
        >
          <div 
            className={`w-full max-w-md rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 border text-zinc-800 dark:text-zinc-250 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-150'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setIsAddCustomerOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="w-10 h-10 bg-zinc-500/10 dark:bg-zinc-500/15 text-zinc-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center shadow-inner">
                <Plus size={18} className="stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase leading-none">Thêm Khách Hàng</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider">KHỞI TẠO HỒ SƠ KHÁCH HÀNG CRM MỚI</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCustomer} className="flex flex-col gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              
              {/* Họ tên */}
              <div className="flex flex-col gap-1.5 text-zinc-900 dark:text-zinc-100">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Họ Và Tên Khách Hàng *</label>
                <input 
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh Hải"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                />
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col gap-1.5 text-zinc-900 dark:text-zinc-100">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Số Điện Thoại *</label>
                <input 
                  type="text"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="Ví dụ: 0988123456"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                />
              </div>

              {/* Ghi chú hành vi */}
              <div className="flex flex-col gap-1.5 text-zinc-900 dark:text-zinc-100">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Ghi chú hành vi (AI CRM Profile)</label>
                <textarea 
                  rows={3}
                  value={newCustomerNote}
                  onChange={(e) => setNewCustomerNote(e.target.value)}
                  placeholder="Ví dụ: Khách hàng thường thuê phòng yên tĩnh để làm việc, cần ban công có view ngắm hoàng hôn..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300 leading-relaxed text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                />
              </div>

              {/* Nút gửi form */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="flex-grow py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={12} className="stroke-[3]" /> Lưu và Thêm Khách
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM DANH SÁCH THÀNH VIÊN NHÓM KHÁCH HÀNG (GROUP MEMBERS MODAL) ================= */}
      {isGroupMembersOpen && selectedGroupForMembers && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsGroupMembersOpen(false)
            setSelectedGroupForMembers(null)
          }}
        >
          <div 
            className="bg-card border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => {
                setIsGroupMembersOpen(false)
                setSelectedGroupForMembers(null)
              }}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
                selectedGroupForMembers.type === 'ai' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {selectedGroupForMembers.type === 'ai' ? <Bot size={18} /> : <Users size={18} />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase leading-none">Thành Viên Nhóm</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider uppercase">
                  Danh mục: {selectedGroupForMembers.name} ({selectedGroupForMembers.type === 'ai' ? 'Tự Động AI' : 'Thủ công đặc cách'})
                </span>
              </div>
            </div>

            {/* Members List Container */}
            <div className="overflow-y-auto pr-1 flex flex-col gap-3 flex-grow max-h-[55vh]">
              {(() => {
                const members = customers.filter(c => c.groupIds.includes(selectedGroupForMembers.id))
                
                if (members.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-zinc-400 dark:text-zinc-500 gap-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <Users size={32} className="stroke-[1.5] text-stone-300" />
                      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 text-center leading-relaxed">
                        Chưa có khách hàng nào thuộc danh mục này.<br />
                        {selectedGroupForMembers.type === 'ai' 
                          ? 'Nhấn "Đồng bộ hành vi bằng AI" để tự động quét & xếp nhóm!' 
                          : 'Bạn có thể chỉ định khách hàng vào nhóm VIP này từ danh sách khách hàng.'}
                      </p>
                    </div>
                  )
                }

                return members.map(member => {
                  const tierInfo = getCustomerTier(member.totalSpent)
                  return (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 hover:border-stone-300 hover:shadow-xs transition duration-200 gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar Initials */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-inner uppercase ${
                          tierInfo.colorTheme === 'violet' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' :
                          tierInfo.colorTheme === 'amber' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' :
                          tierInfo.colorTheme === 'slate' ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300' :
                          'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}>
                          {member.name.charAt(0)}
                        </div>

                        {/* Name and Contact info */}
                        <div className="flex flex-col">
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-xs">{member.name}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">{member.phone}</span>
                        </div>
                      </div>

                      {/* Customer stats & tier */}
                      <div className="flex items-center gap-5">
                        {/* Spent / Bookings */}
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black font-mono">{formatVND(member.totalSpent)}</span>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-0.5">{member.totalBookings} bookings</span>
                        </div>

                        {/* Tier badge */}
                        <span className={`px-2 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-2xs ${
                          tierInfo.colorTheme === 'violet' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/40' :
                          tierInfo.colorTheme === 'amber' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40' :
                          tierInfo.colorTheme === 'slate' ? 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800' :
                          'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}>
                          {renderTierIcon(tierInfo.colorTheme, 9)}
                          {tierInfo.name.split('(')[0]}
                        </span>

                        {/* OR Logic Action */}
                        <div>
                          {selectedGroupForMembers.type === 'manual' ? (
                            <button
                              onClick={() => handleRemoveCustomerFromGroup(member.id, selectedGroupForMembers.id)}
                              className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 border border-red-200/50 dark:border-red-900/40 rounded-xl transition cursor-pointer"
                            >
                              Gỡ Khách
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200/40 dark:border-purple-900/40 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-2xs cursor-default" title={member.notes.join(', ')}>
                              <Bot size={9} /> AI Xếp
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>

            {/* Note about OR logic at footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex items-start gap-1.5 text-zinc-400 dark:text-zinc-500">
              <AlertCircle size={12} className="text-zinc-400 dark:text-zinc-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] leading-relaxed font-semibold">
                {selectedGroupForMembers.type === 'manual' 
                  ? 'Gỡ khách tại đây sẽ xóa ngay quyền đặc cách thủ công. Khách có thể bị quét tự động bởi AI ở lượt đồng bộ tiếp theo nếu phù hợp với hành vi.'
                  : 'Danh sách này do trí tuệ nhân tạo (AI CRM) quét tự động dựa trên ghi chú hành vi. Chỉ có thể gỡ khách bằng cách chỉnh sửa trực tiếp các nhãn/ghi chú hành vi của khách hàng đó.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => {
                  setIsGroupMembersOpen(false)
                  setSelectedGroupForMembers(null)
                }}
                className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CHỈNH SỬA NHÓM KHÁCH HÀNG (EDIT CUSTOMER GROUP MODAL) ================= */}
      {isEditGroupOpen && editingGroup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsEditGroupOpen(false)
            setEditingGroup(null)
          }}
        >
          <div 
            className={`w-full max-w-md rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 border text-zinc-800 dark:text-zinc-250 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-150'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => {
                setIsEditGroupOpen(false)
                setEditingGroup(null)
              }}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center shadow-inner">
                <Pencil size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase leading-none">Sửa Nhóm Khách Hàng</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider uppercase">Cập nhật cấu hình danh mục CRM</span>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              
              {/* Tên nhóm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tên nhóm khách hàng *</label>
                <input 
                  type="text"
                  required
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  placeholder="Ví dụ: Đặt phòng VIP CS5 💎"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                />
              </div>

              {/* Loại nhóm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Hình thức phân nhóm *</label>
                <select
                  value={editGroupType}
                  onChange={(e) => setEditGroupType(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                >
                  <option value="ai">🤖 AI Tự Động (Phân loại dựa trên mô tả & hành vi)</option>
                  <option value="manual">👤 Thủ công (Admin chỉ định từng người)</option>
                </select>
              </div>

              {/* Mô tả nhóm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Mô tả đặc tính nhóm (Dành cho AI đối chiếu hành vi) *</label>
                <textarea 
                  required
                  rows={3}
                  value={editGroupDesc}
                  onChange={(e) => setEditGroupDesc(e.target.value)}
                  placeholder="Ví dụ: Khách hàng đi nghỉ dưỡng lớn cùng gia đình, yêu cầu nướng BBQ, hoặc bồn Hinoki lớn ngoài ban công..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300 leading-relaxed placeholder:font-normal text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                />
              </div>

              {/* Nút gửi form */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditGroupOpen(false)
                    setEditingGroup(null)
                  }}
                  className="flex-grow py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleEditGroup}
                  className="flex-grow py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={12} className="stroke-[3]" /> Lưu Thay Đổi
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO CHIẾN DỊCH MARKETING NHANH ================= */}
      {isMarketingModalOpen && (() => {
        const activeGroup = groups.find(g => g.id === selectedGroupTabId) || groups[0]
        if (!activeGroup) return null

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={() => setIsMarketingModalOpen(false)}
          >
            <div 
              className={`w-full max-w-4xl rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 border text-zinc-800 dark:text-zinc-250 max-h-[92vh] ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-150'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nút Đóng Modal */}
              <button
                onClick={() => setIsMarketingModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer z-10"
              >
                ✕
              </button>

              {/* Icon & Title */}
              <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center shadow-inner">
                  <Megaphone size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 uppercase leading-none">Liên Kết Chiến Dịch Tiếp Thị</h3>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider uppercase">TẠO CHIẾN DỊCH CHO NHÓM KHÁCH HÀNG CRM</span>
                </div>
              </div>

              {/* Form & Live Preview Grid */}
              <form onSubmit={handleCreateMarketingCampaign} className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1">
                
                {/* Cột Thiết Lập */}
                <div className="flex flex-col gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  
                  {/* Tên chiến dịch */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tên Chiến Dịch *</label>
                    <input 
                      type="text"
                      required
                      value={marketingCampName}
                      onChange={(e) => setMarketingCampName(e.target.value)}
                      placeholder="Ví dụ: Ưu đãi sum vầy cho nhóm gia đình 🏡"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                    />
                  </div>

                  {/* Kênh truyền thông & Ngân sách */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Kênh Truyền Thông *</label>
                      <select
                        value={marketingCampChannel}
                        onChange={(e) => setMarketingCampChannel(e.target.value as any)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                      >
                        <option value="Zalo ZNS">💬 Zalo ZNS (Đề xuất)</option>
                        <option value="Email">📧 Email Bản Tin</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Ngân Sách Ước Tính (VND) *</label>
                      <input 
                        type="number"
                        required
                        min={10000}
                        value={marketingCampBudget}
                        onChange={(e) => setMarketingCampBudget(parseInt(e.target.value) || 0)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Mã Voucher Liên Kết */}
                  <div className="flex flex-col gap-1.5 bg-zinc-500/10 dark:bg-zinc-500/15 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-zinc-900 dark:text-zinc-100 font-black uppercase tracking-wider flex items-center gap-1">
                        <Percent size={11} /> Liên Kết Mã Voucher Đã Tạo
                      </label>
                      <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 uppercase font-black">Khuyên Dùng</span>
                    </div>
                    <select
                      value={marketingCampVoucher}
                      onChange={(e) => setMarketingCampVoucher(e.target.value)}
                      className="w-full bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-850 dark:text-zinc-200"
                    >
                      <option value="">-- Không đính kèm mã voucher --</option>
                      {activeVouchers.map(v => (
                        <option key={v.code} value={v.code}>{v.label}</option>
                      ))}
                    </select>
                    <span className="text-[8.5px] text-zinc-400 dark:text-zinc-500 font-semibold leading-normal block mt-1">
                      Hệ thống tự động liên kết các Voucher đang hoạt động từ cơ sở dữ liệu để đính kèm vào tin nhắn cho khách hàng.
                    </span>
                  </div>

                  {/* Soạn thảo nội dung */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Soạn Nội Dung Tin Nhắn *</label>
                      
                      {/* Placeholder Triggers */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setMarketingCampContent(prev => prev + '{ten_khach}')}
                          className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-[9px] font-extrabold px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer active:scale-95 transition animate-none"
                          title="Chèn tên khách hàng động"
                        >
                          + Tên khách
                        </button>
                        <button
                          type="button"
                          onClick={() => setMarketingCampContent(prev => prev + '{ma_voucher}')}
                          className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-[9px] font-extrabold px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer active:scale-95 transition animate-none"
                          title="Chèn mã voucher liên kết động"
                        >
                          + Mã voucher
                        </button>
                      </div>
                    </div>
                    <textarea 
                      required
                      rows={4}
                      value={marketingCampContent}
                      onChange={(e) => setMarketingCampContent(e.target.value)}
                      placeholder="Nhập nội dung gửi tin nhắn..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300 leading-relaxed placeholder:font-normal text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                    />
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium italic leading-relaxed">
                      Sử dụng các biến động `{`ten_khach`}` và `{`ma_voucher`}` để hệ thống tự động cá nhân hóa khi gửi cho từng khách hàng.
                    </span>
                  </div>

                  {/* Nút gửi form */}
                  <div className="flex gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsMarketingModalOpen(false)}
                      className="flex-grow py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send size={12} className="stroke-[3]" /> Khởi Tạo Chiến Dịch
                    </button>
                  </div>

                </div>

                {/* Cột Live Preview */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider block">Bản Xem Trước Trên Thiết Bị (Live Preview)</label>
                  
                  {/* Điện thoại mô phỏng */}
                  <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 rounded-3xl p-4 flex flex-col gap-2 relative shadow-inner w-full max-w-[320px] mx-auto min-h-[380px] font-sans">
                    {/* Notch / Speaker */}
                    <div className="w-24 h-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-full mx-auto mb-2 flex items-center justify-center gap-1 select-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-700"></div>
                      <div className="w-10 h-1 bg-stone-800 rounded-full"></div>
                    </div>

                    {/* Zalo ZNS Preview Bubble */}
                    <div className={`border rounded-2xl p-4 shadow-sm flex flex-col gap-2 mt-4 animate-in fade-in duration-200 ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}>
                      {/* Header */}
                      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-1 select-none">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[9px] uppercase shadow-inner">
                          BH
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 leading-tight">Bliss Home Sài Gòn</span>
                          <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5 leading-none">Thông báo dịch vụ ZNS</span>
                        </div>
                      </div>

                      {/* Evaluated message body */}
                      <p className="text-[10px] text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {marketingCampContent
                          .replace(/{ten_khach}/g, 'Nguyễn Văn Hùng')
                          .replace(/{ma_voucher}/g, marketingCampVoucher || '[Chưa gán Voucher]')}
                      </p>

                      {/* Action buttons preview if voucher exists */}
                      {marketingCampVoucher && (
                        <div className="mt-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 select-none">
                          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 p-2 rounded-xl flex items-center justify-between text-[9px] font-bold">
                            <span className="text-zinc-500 dark:text-zinc-400">Mã ưu đãi của bạn:</span>
                            <span className="text-blue-600 font-black font-mono bg-blue-50 px-1 border border-blue-100 rounded">{marketingCampVoucher}</span>
                          </div>
                          <div className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black text-center uppercase tracking-wider cursor-default shadow-3xs">
                            👉 Đặt phòng áp dụng ngay
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Simulator details footer */}
                    <span className="absolute bottom-2 left-0 right-0 text-center text-[8px] font-bold text-zinc-400 dark:text-zinc-500 select-none uppercase tracking-widest">
                      Bliss ZNS Simulator
                    </span>
                  </div>
                </div>

              </form>

            </div>
          </div>
        )
      })()}

    </div>
  )
}
