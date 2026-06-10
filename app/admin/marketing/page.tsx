'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { 
  Megaphone,
  Search, 
  Plus, 
  Check, 
  X, 
  AlertCircle, 
  Trash2, 
  Play, 
  Pause, 
  BarChart3, 
  Eye, 
  Settings, 
  Smartphone, 
  Send, 
  Layers, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  Mail, 
  MessageSquare, 
  Pencil
} from 'lucide-react'

// Định nghĩa kiểu dữ liệu Chiến dịch Marketing
interface Campaign {
  id: string
  name: string
  channel: 'Zalo ZNS' | 'Email'
  targetAudience: string
  status: 'draft' | 'active' | 'completed'
  sentCount: number
  clickRate: number
  budget: number
  messageContent: string
  voucherCode?: string
}

// 1. Dữ liệu chiến dịch tiếp thị giả lập cao cấp đạt chuẩn Bliss Home
const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'MKT-01',
    name: 'Trở về với mộc mạc - Giảm 15% cuối tuần 🌿',
    channel: 'Zalo ZNS',
    targetAudience: 'Nhóm AI: Thích yên tĩnh 🤫',
    status: 'active',
    sentCount: 120,
    clickRate: 24.5,
    budget: 500000,
    messageContent: 'Chào {ten_khach}, trốn thành thị xô bồ để tìm lại bình yên cùng Bliss Home Sài Gòn cuối tuần này nhé! Nhập ngay mã {ma_voucher} để nhận ưu đãi giảm 15% phòng nghỉ biệt lập ngắm hoàng hôn cực chill.',
    voucherCode: 'BLISSHE2026'
  },
  {
    id: 'MKT-02',
    name: 'Chào hè rực rỡ - Tặng Voucher Gold 200k ☀️',
    channel: 'Zalo ZNS',
    targetAudience: 'Hạng: Gold (Vàng) 🥇',
    status: 'completed',
    sentCount: 450,
    clickRate: 38.2,
    budget: 1200000,
    messageContent: 'Bliss Home gửi tặng quý hội viên Vàng {ten_khach} đặc quyền chào hè rực rỡ! Tặng mã giảm giá {ma_voucher} trị giá 200k khi đặt phòng gia đình có ban công rộng rãi và bồn Hinoki gỗ thơm ngát.',
    voucherCode: 'VIPBIRTHDAY'
  },
  {
    id: 'MKT-03',
    name: 'Trải nghiệm Cabin gỗ - Chill cùng tiệc nướng BBQ 🥩',
    channel: 'Email',
    targetAudience: 'Nhóm AI: Đi gia đình 🏡',
    status: 'draft',
    sentCount: 0,
    clickRate: 0,
    budget: 800000,
    messageContent: 'Kính gửi {ten_khach},\n\nMùa hè này dắt bé và cả nhà đi nghỉ dưỡng lớn tại Cozy Wooden Cabin CS3 của Bliss Home nhé! Trọn gói đã bao gồm setup bếp nướng BBQ ngoài trời cực vui, bồn tắm Hinoki sảng khoái và vườn tược rộn rã. Dùng mã {ma_voucher} để được ưu tiên nâng hạng phòng miễn phí.\n\nThân ái,\nBliss Home Sài Gòn',
    voucherCode: 'COZYSTAY'
  },
  {
    id: 'MKT-04',
    name: 'Mừng sinh nhật Hội viên Diamond đặc quyền 💎',
    channel: 'Zalo ZNS',
    targetAudience: 'Hạng: Diamond (Kim Cương) 💎',
    status: 'active',
    sentCount: 85,
    clickRate: 45.6,
    budget: 1500000,
    messageContent: 'Chúc mừng sinh nhật {ten_khach} - Thượng khách Diamond của Bliss Home! Trân trọng gửi tặng bạn 1 đêm nghỉ dưỡng hoàn toàn miễn phí nhân tuần lễ sinh nhật đặc quyền. Nhập mã {ma_voucher} để quy đổi đặc quyền đưa đón sân bay 2 chiều và buffet sáng.',
    voucherCode: 'DIAMONDBDAY'
  }
]

// Các nhóm đối tượng CRM mẫu tương thích
const TARGETS = [
  'Nhóm AI: Thích yên tĩnh 🤫',
  'Nhóm AI: Đi gia đình 🏡',
  'Nhóm AI: Thuê ngắn giờ ⏰',
  'Hạng: Gold (Vàng) 🥇',
  'Hạng: Diamond (Kim Cương) 💎',
  'Hạng: Silver (Bạc) 🥈',
  'Hạng: Bronze (Đồng) 🥉',
  'Tất cả khách hàng CRM 👥'
]

// Danh sách các voucher hoạt động để gán
const AVAILABLE_VOUCHERS = [
  { code: 'BLISSHE2026', label: 'BLISSHE2026 (Giảm 15% phòng nghỉ)' },
  { code: 'VIPBIRTHDAY', label: 'VIPBIRTHDAY (Tặng 200k Sinh nhật)' },
  { code: 'COZYSTAY', label: 'COZYSTAY (Nâng hạng phòng miễn phí)' },
  { code: 'DIAMONDBDAY', label: 'DIAMONDBDAY (Đặc quyền Diamond 2 chiều)' },
  { code: 'WINTERCHILL', label: 'WINTERCHILL (Giảm 10% mùa đông)' }
]

// Định dạng tiền tệ VND hoisted lên đầu
const formatVND = (val: number) => {
  return val.toLocaleString('vi-VN') + 'đ'
}

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // States quản lý Modal tạo chiến dịch mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newCampName, setNewCampName] = useState('')
  const [newCampChannel, setNewCampChannel] = useState<'Zalo ZNS' | 'Email'>('Zalo ZNS')
  const [newCampTarget, setNewCampTarget] = useState(TARGETS[0])
  const [newCampVoucher, setNewCampVoucher] = useState('')
  const [newCampBudget, setNewCampBudget] = useState(500000)
  const [newCampContent, setNewCampContent] = useState('')

  // State chỉnh sửa chiến dịch nhanh
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [editCampName, setEditCampName] = useState('')
  const [editCampChannel, setEditCampChannel] = useState<'Zalo ZNS' | 'Email'>('Zalo ZNS')
  const [editCampTarget, setEditCampTarget] = useState('')
  const [editCampVoucher, setEditCampVoucher] = useState('')
  const [editCampBudget, setEditCampBudget] = useState(0)
  const [editCampContent, setEditCampContent] = useState('')

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Nạp dữ liệu thực tế từ Supabase
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true)
        const supabase = getSupabase()
        const { data: dbCampaigns, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (dbCampaigns && dbCampaigns.length > 0) {
          const mappedCampaigns: Campaign[] = dbCampaigns.map((c: any) => ({
            id: c.id, // giữ UUID làm ID chính xác
            name: c.name,
            channel: c.channel || 'Zalo ZNS',
            targetAudience: c.target_audience || 'Tất cả',
            status: c.status || 'draft',
            sentCount: c.sent_count || 0,
            clickRate: Number(c.click_rate || 0),
            budget: Number(c.budget || 0),
            messageContent: c.message_content || '',
            voucherCode: c.voucher_code || ''
          }))
          setCampaigns(mappedCampaigns)
        } else {
          setCampaigns(INITIAL_CAMPAIGNS)
        }
      } catch (err) {
        console.warn('[Supabase Campaigns Fetch] Fallback active:', err)
        setCampaigns(INITIAL_CAMPAIGNS)
      } finally {
        setIsLoading(false)
      }
    }
    loadCampaigns()
  }, [])

  // Thao tác hiển thị thông báo toast nhanh
  const showToast = (msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 3500)
    return () => clearTimeout(timer)
  }

  /**
   * Tạo chiến dịch mới thủ công
   */
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCampName.trim() || !newCampContent.trim()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc!')
      return
    }

    try {
      const supabase = getSupabase()
      
      const { data: dbNewCamp, error } = await supabase
        .from('campaigns')
        .insert([{
          name: newCampName.trim(),
          channel: newCampChannel,
          target_audience: newCampTarget,
          status: 'draft',
          sent_count: 0,
          click_rate: 0,
          budget: Number(newCampBudget) || 0,
          message_content: newCampContent.trim(),
          voucher_code: newCampVoucher || null
        }])
        .select()
        .single()

      if (error) throw error

      const newCampObj: Campaign = {
        id: dbNewCamp.id,
        name: dbNewCamp.name,
        channel: dbNewCamp.channel,
        targetAudience: dbNewCamp.target_audience,
        status: 'draft',
        sentCount: 0,
        clickRate: 0,
        budget: Number(dbNewCamp.budget) || 0,
        messageContent: dbNewCamp.message_content,
        voucherCode: dbNewCamp.voucher_code || ''
      }

      setCampaigns(prev => [newCampObj, ...prev])
      setIsCreateModalOpen(false)

      // Reset form
      setNewCampName('')
      setNewCampChannel('Zalo ZNS')
      setNewCampTarget(TARGETS[0])
      setNewCampVoucher('')
      setNewCampBudget(500000)
      setNewCampContent('')

      showToast(`Đã tạo chiến dịch "${newCampObj.name}" thành công dưới dạng bản nháp!`)
    } catch (error: any) {
      console.error(error)
      // Fallback offline
      const newId = `f0000000-0000-0000-0000-${String(campaigns.length + 100).padStart(12, '0')}`
      const newCampObjFallback: Campaign = {
        id: newId,
        name: newCampName.trim(),
        channel: newCampChannel,
        targetAudience: newCampTarget,
        status: 'draft',
        sentCount: 0,
        clickRate: 0,
        budget: Number(newCampBudget) || 0,
        messageContent: newCampContent.trim(),
        voucherCode: newCampVoucher || ''
      }
      setCampaigns(prev => [newCampObjFallback, ...prev])
      setIsCreateModalOpen(false)
      setNewCampName('')
      setNewCampContent('')
      showToast(`Đã tạo chiến dịch ở chế độ Offline!`)
    }
  }

  /**
   * Mở modal chỉnh sửa chiến dịch
   */
  const openEditModal = (camp: Campaign) => {
    setSelectedCampaign(camp)
    setEditCampName(camp.name)
    setEditCampChannel(camp.channel)
    setEditCampTarget(camp.targetAudience)
    setEditCampVoucher(camp.voucherCode || '')
    setEditCampBudget(camp.budget)
    setEditCampContent(camp.messageContent)
    setIsEditModalOpen(true)
  }

  /**
   * Lưu cập nhật chỉnh sửa chiến dịch
   */
  const handleSaveCampaignEdits = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaign) return
    if (!editCampName.trim() || !editCampContent.trim()) {
      alert('Tên chiến dịch và nội dung không được để trống!')
      return
    }

    const originalCampaigns = [...campaigns]
    try {
      setCampaigns(prev => 
        prev.map(c => c.id === selectedCampaign.id 
          ? {
              ...c,
              name: editCampName.trim(),
              channel: editCampChannel,
              targetAudience: editCampTarget,
              budget: Number(editCampBudget) || 0,
              messageContent: editCampContent.trim(),
              voucherCode: editCampVoucher || undefined
            }
          : c
        )
      )

      setIsEditModalOpen(false)
      showToast(`Đã cập nhật chiến dịch "${editCampName.trim()}" thành công!`)
      console.log(`[Marketing API] Cập nhật chiến dịch ${selectedCampaign.id}`)

      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(error)
      setCampaigns(originalCampaigns)
      alert('Không thể lưu chỉnh sửa chiến dịch. Vui lòng thử lại!')
    }
  }

  /**
   * Đổi nhanh trạng thái Chạy/Tạm dừng chiến dịch (Play/Pause)
   */
  const handleToggleStatus = async (id: string, currentStatus: Campaign['status']) => {
    const originalCampaigns = [...campaigns]
    const nextStatus: Campaign['status'] = currentStatus === 'active' ? 'draft' : 'active'
    const statusText = nextStatus === 'active' ? 'Đang chạy 🟢' : 'Tạm dừng ⏸️'

    try {
      // Optimistic update
      setCampaigns(prev => 
        prev.map(c => c.id === id ? { ...c, status: nextStatus, sentCount: nextStatus === 'active' && c.sentCount === 0 ? Math.floor(50 + Math.random() * 100) : c.sentCount } : c)
      )

      showToast(`Chiến dịch đã chuyển sang trạng thái: ${statusText}`)
      console.log(`[Marketing API] Đổi trạng thái ${id} -> ${nextStatus}`)

      await new Promise(resolve => setTimeout(resolve, 150))
    } catch (e) {
      console.error(e)
      setCampaigns(originalCampaigns)
      alert('Không thể thay đổi trạng thái chiến dịch!')
    }
  }

  /**
   * Xóa chiến dịch
   */
  const handleDeleteCampaign = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chiến dịch "${name}" ra khỏi danh sách tiếp thị của Bliss Home không?`)) return
    
    try {
      setCampaigns(prev => prev.filter(c => c.id !== id))
      showToast(`Đã xóa thành công chiến dịch tiếp thị "${name}"!`)
      console.log(`[Marketing API] Xóa chiến dịch ${id}`)
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Mua giả lập gửi hàng loạt tức thời (Send Now)
   */
  const handleSendCampaignNow = async (camp: Campaign) => {
    if (camp.status === 'completed') {
      alert('Chiến dịch này đã hoàn thành gửi tin trước đó!')
      return
    }
    if (!confirm(`Bạn có muốn khởi chạy và gửi tin tức thì chiến dịch "${camp.name}" đến các khách hàng thuộc tệp "${camp.targetAudience}" không?`)) return

    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Giả lập gửi tin trễ mạng

      setCampaigns(prev => 
        prev.map(c => c.id === camp.id 
          ? { 
              ...c, 
              status: 'completed', 
              sentCount: c.sentCount === 0 ? Math.floor(80 + Math.random() * 200) : c.sentCount + Math.floor(50 + Math.random() * 100),
              clickRate: c.clickRate === 0 ? Number((15 + Math.random() * 30).toFixed(1)) : c.clickRate
            } 
          : c
        )
      )

      setIsLoading(false)
      showToast(`🚀 Gửi thành công hàng loạt chiến dịch đến tệp "${camp.targetAudience}"!`)
    } catch (e) {
      console.error(e)
      setIsLoading(false)
    }
  }

  // Chèn các placeholder biến vào nội dung tin nhắn
  const insertPlaceholder = (placeholder: string, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewCampContent(prev => prev + placeholder)
    } else {
      setEditCampContent(prev => prev + placeholder)
    }
  }

  // Giải mã đánh giá nội dung tin nhắn preview Zalo thực tế
  const renderZaloPreview = (content: string, voucher: string) => {
    if (!content.trim()) {
      return (
        <span className="text-zinc-400 dark:text-zinc-500 italic text-[11px] font-normal leading-relaxed block text-center py-6">
          Vui lòng nhập nội dung soạn thảo ở cột thiết lập để xem live preview tại đây...
        </span>
      )
    }

    const evaluated = content
      .replace(/{ten_khach}/g, 'Nguyễn Văn Hùng')
      .replace(/{ma_voucher}/g, voucher || '[Chưa gán Voucher]')

    return (
      <div className="flex flex-col gap-2">
        {/* Banner Zalo ZNS Header */}
        <div className="flex items-center gap-1.5 border-b border-zinc-250 dark:border-zinc-800 pb-2 mb-1 select-none">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[9px] uppercase shadow-inner">
            BH
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 leading-tight">Bliss Home Sài Gòn</span>
            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5 leading-none">Thông báo dịch vụ ZNS</span>
          </div>
        </div>

        {/* Nội dung Evaluated text */}
        <p className="text-[11px] text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap font-sans">
          {evaluated}
        </p>

        {/* Khối Button Call To Action giả lập nếu có voucher */}
        {voucher && (
          <div className="mt-2.5 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5 font-sans select-none">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 p-2 rounded-xl flex items-center justify-between text-[10px] font-bold">
              <span className="text-zinc-500 dark:text-zinc-400">Mã ưu đãi của bạn:</span>
              <span className="text-blue-600 font-black font-mono bg-blue-50 px-1.5 py-0.5 border border-blue-105 rounded">{voucher}</span>
            </div>
            <div className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black text-center uppercase tracking-wider cursor-pointer shadow-3xs">
              👉 Đặt phòng áp dụng ngay
            </div>
          </div>
        )}
      </div>
    )
  }

  // 1. Tính toán Stats chỉ số
  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0)
  const completedOrActive = campaigns.filter(c => c.status !== 'draft' && c.clickRate > 0)
  const avgClickRate = completedOrActive.length > 0 
    ? Number((completedOrActive.reduce((acc, c) => acc + c.clickRate, 0) / completedOrActive.length).toFixed(1))
    : 0
  const totalBudgetSpent = campaigns.reduce((acc, c) => acc + (c.status !== 'draft' ? c.budget : 0), 0)

  // Lọc kết quả tìm kiếm & dropdown filters
  const filteredCampaigns = campaigns.filter(camp => {
    const query = searchTerm.toLowerCase().trim()
    const matchSearch = !query || camp.name.toLowerCase().includes(query) || camp.targetAudience.toLowerCase().includes(query)
    const matchChannel = channelFilter === 'all' || camp.channel === channelFilter
    const matchStatus = statusFilter === 'all' || camp.status === statusFilter

    return matchSearch && matchChannel && matchStatus
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative text-zinc-700 dark:text-zinc-300">
      
      {/* 🔮 CUSTOM TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border border-blue-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <Check size={11} className="stroke-[3]" />
          </div>
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-250 dark:border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
            Chiến Dịch Marketing
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            Tạo chiến dịch tin nhắn chăm sóc tự động Zalo ZNS và Email dựa trên tệp hành vi khách hàng CRM Bliss Home.
          </p>
        </div>

        {/* Nút tạo mới chiến dịch */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all duration-200"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Tạo Chiến Dịch</span>
        </button>
      </div>

      {/* THREE STATS TILES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat 1: Tổng tin nhắn gửi */}
        <div className="bg-white border border-zinc-200 dark:border-zinc-850 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">Tin Nhắn Gửi Trong Tháng</span>
            <Send size={15} className="text-zinc-900 dark:text-zinc-100" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono leading-none">
              {totalSent.toLocaleString('vi-VN')} tin gửi
            </span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 uppercase">Đã gửi tự động qua hệ thống ZNS</span>
          </div>
        </div>

        {/* Stat 2: Tỷ lệ CTR trung bình */}
        <div className="bg-white border border-zinc-200 dark:border-zinc-850 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">CTR Trung Bình (Tỉ lệ Click)</span>
            <Percent size={15} className="text-emerald-600" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-black text-emerald-600 font-mono leading-none">
              {avgClickRate}% CTR
            </span>
            <span className="text-[9px] text-emerald-700/80 font-bold block mt-1 uppercase">Hiệu suất chuyển đổi tin nhắn cao</span>
          </div>
        </div>

        {/* Stat 3: Tổng ngân sách hoạt động */}
        <div className="bg-white border border-zinc-200 dark:border-zinc-850 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">Ngân Sách Tin Gửi Thực Tế</span>
            <DollarSign size={15} className="text-blue-600" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono leading-none">
              {formatVND(totalBudgetSpent)}
            </span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 uppercase">Ước tính phí Zalo ZNS đã chạy</span>
          </div>
        </div>
      </div>

      {/* FILTERING AREA */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-3xl shadow-2xs">
        
        {/* Tìm kiếm */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên chiến dịch hoặc đối tượng..."
            className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-700 dark:text-zinc-300 focus:bg-white transition"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-2">
          
          {/* Lọc Kênh */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider hidden sm:inline">Kênh:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-white border border-zinc-250 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 cursor-pointer transition"
            >
              <option value="all">Tất cả kênh</option>
              <option value="Zalo ZNS">💬 Zalo ZNS</option>
              <option value="Email">📧 Email</option>
            </select>
          </div>

          {/* Lọc Trạng thái */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider hidden sm:inline">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-zinc-250 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 cursor-pointer transition"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Bản nháp (Draft)</option>
              <option value="active">Đang chạy (Active)</option>
              <option value="completed">Hoàn tất (Completed)</option>
            </select>
          </div>

        </div>
      </div>

      {/* TABLE LISTING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
            Đang tải dữ liệu chiến dịch Bliss...
          </span>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 dark:border-zinc-850 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60/80 border-b border-zinc-150 dark:border-zinc-850 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Chiến Dịch</th>
                  <th className="py-4 px-5">Tệp Khách Hàng</th>
                  <th className="py-4 px-5 text-right">Ngân Sách</th>
                  <th className="py-4 px-5 text-center">Đã Gửi</th>
                  <th className="py-4 px-5 text-center">Hiệu Suất (CTR)</th>
                  <th className="py-4 px-6 text-center">Trạng Thái</th>
                  <th className="py-4 px-6 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={24} className="text-stone-300" />
                        <span>Không tìm thấy chiến dịch tiếp thị nào.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-zinc-50/40 dark:bg-zinc-900/30 transition">
                      
                      {/* Cột Tên & Kênh */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm">{camp.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono font-bold">{camp.id}</span>
                            <span 
                              className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider border flex items-center gap-0.5 ${
                                camp.channel === 'Zalo ZNS'
                                  ? 'bg-blue-50 text-blue-750 border-blue-150'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 border-zinc-250 dark:border-zinc-700'
                              }`}
                            >
                              {camp.channel === 'Zalo ZNS' ? <MessageSquare size={8} /> : <Mail size={8} />}
                              {camp.channel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột tệp khách hàng */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-zinc-700 dark:text-zinc-300">
                          <Layers size={10} className="text-zinc-500 dark:text-zinc-400" />
                          {camp.targetAudience}
                        </span>
                      </td>

                      {/* Cột ngân sách */}
                      <td className="py-4 px-5 text-right font-black font-mono text-zinc-900 dark:text-zinc-100 text-xs">
                        {formatVND(camp.budget)}
                      </td>

                      {/* Cột đã gửi */}
                      <td className="py-4 px-5 text-center font-bold font-mono text-zinc-650 dark:text-zinc-350 text-xs">
                        {camp.sentCount}
                      </td>

                      {/* Cột hiệu suất progress bar */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1 items-center justify-center max-w-[100px] mx-auto">
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-zinc-250 dark:border-zinc-800">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${camp.clickRate}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-black font-mono text-emerald-600">{camp.clickRate}% CTR</span>
                        </div>
                      </td>

                      {/* Cột trạng thái */}
                      <td className="py-4 px-6 text-center">
                        <span 
                          className={`px-2 py-0.8 rounded-full text-[9px] font-black uppercase tracking-wider border select-none ${
                            camp.status === 'active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : camp.status === 'completed'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          {camp.status === 'active' ? '● Đang chạy' : camp.status === 'completed' ? '● Hoàn tất' : '● Nháp'}
                        </span>
                      </td>

                      {/* Cột Thao tác */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Nút gửi tin ngay */}
                          <button
                            onClick={() => handleSendCampaignNow(camp)}
                            disabled={camp.status === 'completed'}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border-none transition cursor-pointer ${
                              camp.status === 'completed'
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-stone-300 cursor-not-allowed'
                                : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white shadow-2xs'
                            }`}
                            title="Gửi hàng loạt ngay lập tức"
                          >
                            <Send size={12} />
                          </button>

                          {/* Nút tạm dừng / chạy tiếp */}
                          <button
                            onClick={() => handleToggleStatus(camp.id, camp.status)}
                            disabled={camp.status === 'completed'}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border-none transition cursor-pointer ${
                              camp.status === 'completed'
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-stone-300 cursor-not-allowed'
                                : camp.status === 'active'
                                ? 'bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white shadow-2xs'
                                : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white shadow-2xs'
                            }`}
                            title={camp.status === 'active' ? 'Tạm dừng chiến dịch' : 'Kích hoạt chiến dịch'}
                          >
                            {camp.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                          </button>

                          {/* Nút Edit */}
                          <button
                            onClick={() => openEditModal(camp)}
                            className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-650 dark:text-zinc-350 hover:text-zinc-800 dark:text-zinc-200 flex items-center justify-center border-none transition cursor-pointer"
                            title="Chỉnh sửa chiến dịch"
                          >
                            <Pencil size={11} />
                          </button>

                          {/* Nút Xóa */}
                          <button
                            onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center border-none transition cursor-pointer shadow-2xs"
                            title="Xóa chiến dịch"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO CHIẾN DỊCH MỚI (SMART FORM MODAL) ================= */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-4xl rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-zinc-800 dark:text-zinc-200 max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer z-10"
            >
              ✕
            </button>

            {/* Icon & Title */}
            <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center shadow-inner">
                <Megaphone size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 uppercase leading-none">Thiết Lập Chiến Dịch Tiếp Thị</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider uppercase">CẤU HÌNH GỬI TỰ ĐỘNG ZALO ZNS & EMAIL</span>
              </div>
            </div>

            {/* Smart Form chia làm 2 cột layout trên màn hình lớn */}
            <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto text-xs font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-[72vh] pr-1">
              
              {/* CỘT TRÁI: THIẾT LẬP */}
              <div className="flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/60/50 p-4.5 rounded-2xl border border-zinc-250 dark:border-zinc-800">
                <span className="text-[9px] text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-black block border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1">
                  1. Cấu hình kỹ thuật chiến dịch
                </span>

                {/* Tên chiến dịch */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tên Chiến Dịch *</label>
                  <input 
                    type="text"
                    required
                    value={newCampName}
                    onChange={(e) => setNewCampName(e.target.value)}
                    placeholder="Ví dụ: Chào mùa đông ấm áp - Giảm 15% VIP ❄️"
                    className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-800 dark:text-zinc-200 shadow-3xs"
                  />
                </div>

                {/* Kênh & Tệp khách hàng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Kênh Truyền Thông *</label>
                    <select
                      value={newCampChannel}
                      onChange={(e) => setNewCampChannel(e.target.value as any)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650"
                    >
                      <option value="Zalo ZNS">💬 Zalo ZNS (Ưu tiên)</option>
                      <option value="Email">📧 Email</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tệp Khách Hàng Mục Tiêu *</label>
                    <select
                      value={newCampTarget}
                      onChange={(e) => setNewCampTarget(e.target.value)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650"
                    >
                      {TARGETS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Voucher đính kèm & Ngân sách */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Đính Kèm Voucher (Tùy chọn)</label>
                    <select
                      value={newCampVoucher}
                      onChange={(e) => setNewCampVoucher(e.target.value)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650"
                    >
                      <option value="">-- Không đính kèm --</option>
                      {AVAILABLE_VOUCHERS.map(v => (
                        <option key={v.code} value={v.code}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Ngân Sách Chiến Dịch (VND) *</label>
                    <input 
                      type="number"
                      required
                      min={0}
                      step={50000}
                      value={newCampBudget}
                      onChange={(e) => setNewCampBudget(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-black focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-800 dark:text-zinc-200 shadow-3xs"
                    />
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: SOẠN THẢO & PREVIEW CHUYÊN NGHIỆP */}
              <div className="flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/60/50 p-4.5 rounded-2xl border border-zinc-250 dark:border-zinc-800">
                <span className="text-[9px] text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-black block border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1">
                  2. Biên tập nội dung & Preview Zalo
                </span>

                {/* Textarea Soạn thảo tin nhắn */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Soạn Thảo Nội Dung Tin *</label>
                    
                    {/* Các nút chèn Placeholder nhanh */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => insertPlaceholder('{ten_khach}', 'new')}
                        className="bg-zinc-200 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-black text-[9px] px-1.5 py-0.5 rounded cursor-pointer border-none active:scale-95 transition"
                        title="Chèn tên khách hàng động"
                      >
                        + Tên Khách
                      </button>
                      <button
                        type="button"
                        onClick={() => insertPlaceholder('{ma_voucher}', 'new')}
                        className="bg-zinc-200 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-black text-[9px] px-1.5 py-0.5 rounded cursor-pointer border-none active:scale-95 transition"
                        title="Chèn mã voucher đã chọn"
                      >
                        + Mã Voucher
                      </button>
                    </div>
                  </div>
                  <textarea 
                    required
                    rows={4}
                    value={newCampContent}
                    onChange={(e) => setNewCampContent(e.target.value)}
                    placeholder="Sử dụng biến {ten_khach} và {ma_voucher} để tự động cá nhân hóa khi gửi Zalo ZNS..."
                    className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans shadow-3xs"
                  />
                </div>

                {/* Khung Preview mô phỏng màn hình điện thoại */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                    <Smartphone size={12} className="text-zinc-500 dark:text-zinc-400" /> Mô Phỏng Hiển Thị Live (Zalo Mobile Frame)
                  </label>
                  
                  {/* Phone Mockup bubble box */}
                  <div className="bg-zinc-200 dark:bg-zinc-800/80 rounded-2xl p-4.5 border border-stone-300/60 shadow-inner flex flex-col gap-2 max-w-[340px] mx-auto w-full relative">
                    {/* Khuyên tai loa thoại giả lập trên đầu */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-stone-400/40 rounded-full"></div>
                    
                    {/* Bong bóng tin nhắn chat */}
                    <div className="bg-white rounded-2xl p-3.5 shadow-md border border-zinc-150 dark:border-zinc-850 flex flex-col mt-2">
                      {renderZaloPreview(newCampContent, newCampVoucher)}
                    </div>
                  </div>
                </div>

                {/* Nút Gửi / Hủy Form */}
                <div className="flex gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-grow py-2.5 bg-zinc-200 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-650 dark:text-zinc-350 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={12} className="stroke-[3]" /> Khởi Tạo Chiến Dịch
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CHỈNH SỬA CHIẾN DỊCH (EDIT CAMPAIGN MODAL) ================= */}
      {isEditModalOpen && selectedCampaign && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-4xl rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-zinc-800 dark:text-zinc-200 max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer z-10"
            >
              ✕
            </button>

            {/* Icon & Title */}
            <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-750 rounded-2xl flex items-center justify-center shadow-inner">
                <Pencil size={18} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 uppercase leading-none">Chỉnh Sửa Chiến Dịch Tiếp Thị</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider uppercase">CẬP NHẬT CHI TIẾT CHIẾN DỊCH: {selectedCampaign.id}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCampaignEdits} className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto text-xs font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-[72vh] pr-1">
              
              {/* CỘT TRÁI: THIẾT LẬP CHỈNH SỬA */}
              <div className="flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/60/50 p-4.5 rounded-2xl border border-zinc-250 dark:border-zinc-800">
                <span className="text-[9px] text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-black block border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1">
                  1. Cấu hình kỹ thuật chiến dịch
                </span>

                {/* Tên chiến dịch */}
                <div className="flex flex-col gap-1.5 text-zinc-800 dark:text-zinc-200">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tên Chiến Dịch *</label>
                  <input 
                    type="text"
                    required
                    value={editCampName}
                    onChange={(e) => setEditCampName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-800 dark:text-zinc-200 shadow-3xs"
                  />
                </div>

                {/* Kênh & Tệp khách hàng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-800 dark:text-zinc-200">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Kênh Truyền Thông *</label>
                    <select
                      value={editCampChannel}
                      onChange={(e) => setEditCampChannel(e.target.value as any)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650"
                    >
                      <option value="Zalo ZNS">💬 Zalo ZNS (Ưu tiên)</option>
                      <option value="Email">📧 Email</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tệp Khách Hàng Mục Tiêu *</label>
                    <select
                      value={editCampTarget}
                      onChange={(e) => setEditCampTarget(e.target.value)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650"
                    >
                      {TARGETS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Voucher đính kèm & Ngân sách */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-800 dark:text-zinc-200">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Đính Kèm Voucher (Tùy chọn)</label>
                    <select
                      value={editCampVoucher}
                      onChange={(e) => setEditCampVoucher(e.target.value)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650"
                    >
                      <option value="">-- Không đính kèm --</option>
                      {AVAILABLE_VOUCHERS.map(v => (
                        <option key={v.code} value={v.code}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Ngân Sách Chiến Dịch (VND) *</label>
                    <input 
                      type="number"
                      required
                      min={0}
                      step={50000}
                      value={editCampBudget}
                      onChange={(e) => setEditCampBudget(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-black focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-800 dark:text-zinc-200 shadow-3xs"
                    />
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: SOẠN THẢO & PREVIEW CHỈNH SỬA */}
              <div className="flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/60/50 p-4.5 rounded-2xl border border-zinc-250 dark:border-zinc-800">
                <span className="text-[9px] text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-black block border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1">
                  2. Biên tập nội dung & Preview Zalo
                </span>

                {/* Textarea Soạn thảo tin nhắn */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Soạn Thảo Nội Dung Tin *</label>
                    
                    {/* Các nút chèn Placeholder nhanh */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => insertPlaceholder('{ten_khach}', 'edit')}
                        className="bg-zinc-200 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-black text-[9px] px-1.5 py-0.5 rounded cursor-pointer border-none active:scale-95 transition"
                        title="Chèn tên khách hàng động"
                      >
                        + Tên Khách
                      </button>
                      <button
                        type="button"
                        onClick={() => insertPlaceholder('{ma_voucher}', 'edit')}
                        className="bg-zinc-200 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-black text-[9px] px-1.5 py-0.5 rounded cursor-pointer border-none active:scale-95 transition"
                        title="Chèn mã voucher đã chọn"
                      >
                        + Mã Voucher
                      </button>
                    </div>
                  </div>
                  <textarea 
                    required
                    rows={4}
                    value={editCampContent}
                    onChange={(e) => setEditCampContent(e.target.value)}
                    className="w-full bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans shadow-3xs text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                {/* Khung Preview mô phỏng màn hình điện thoại */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                    <Smartphone size={12} className="text-zinc-500 dark:text-zinc-400" /> Mô Phỏng Hiển Thị Live (Zalo Mobile Frame)
                  </label>
                  
                  {/* Phone Mockup bubble box */}
                  <div className="bg-zinc-200 dark:bg-zinc-800/80 rounded-2xl p-4.5 border border-stone-300/60 shadow-inner flex flex-col gap-2 max-w-[340px] mx-auto w-full relative">
                    {/* Khuyên tai loa thoại giả lập trên đầu */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-stone-400/40 rounded-full"></div>
                    
                    {/* Bong bóng tin nhắn chat */}
                    <div className="bg-white rounded-2xl p-3.5 shadow-md border border-zinc-150 dark:border-zinc-850 flex flex-col mt-2">
                      {renderZaloPreview(editCampContent, editCampVoucher)}
                    </div>
                  </div>
                </div>

                {/* Nút Gửi / Hủy Form Chỉnh Sửa */}
                <div className="flex gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-grow py-2.5 bg-zinc-200 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-650 dark:text-zinc-350 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={12} className="stroke-[3]" /> Lưu Thay Đổi
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
