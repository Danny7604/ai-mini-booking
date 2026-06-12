'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAdminData } from '../AdminDataContext'
import { 
  Search, 
  Plus, 
  Ticket, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

// Định nghĩa kiểu dữ liệu Voucher
interface Voucher {
  id: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  usageCount: number
  maxUsage: number
  expiryDate: string
  status: 'active' | 'paused' | 'expired'
  targetType: 'all' | 'group' | 'tier' | 'event'
  targetValue: string
}

// 1. Khởi tạo danh sách Voucher đa tầng cao cấp đại diện cho 4 nhóm đối tượng áp dụng
const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'VOUCH-01',
    code: 'BLISSALL10',
    type: 'percent',
    value: 10,
    usageCount: 45,
    maxUsage: 100,
    expiryDate: '2026-07-31',
    status: 'active',
    targetType: 'all',
    targetValue: 'Tất cả khách hàng'
  },
  {
    id: 'VOUCH-02',
    code: 'GOLDENROOM',
    type: 'fixed',
    value: 300000,
    usageCount: 18,
    maxUsage: 20,
    expiryDate: '2026-06-15',
    status: 'active',
    targetType: 'tier',
    targetValue: 'Thành viên Vàng'
  },
  {
    id: 'VOUCH-03',
    code: 'FAMILYCOZY',
    type: 'percent',
    value: 15,
    usageCount: 8,
    maxUsage: 50,
    expiryDate: '2026-08-30',
    status: 'active',
    targetType: 'group',
    targetValue: 'Nhóm đi gia đình'
  },
  {
    id: 'VOUCH-04',
    code: 'SUMMER304',
    type: 'fixed',
    value: 200000,
    usageCount: 10,
    maxUsage: 10,
    expiryDate: '2026-05-10',
    status: 'expired',
    targetType: 'event',
    targetValue: 'Đại lễ 30/4 - 1/5'
  }
]

const formatVND = (val: number) => {
  return val.toLocaleString('vi-VN') + 'đ'
}

export default function VouchersManagementPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Voucher['status']>('all')
  const [targetFilter, setTargetFilter] = useState<'all' | Voucher['targetType']>('all')

  // States Form tạo Voucher mới
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newType, setNewType] = useState<Voucher['type']>('percent')
  const [newValue, setNewValue] = useState(10)
  const [newMaxUsage, setNewMaxUsage] = useState(50)
  const [newExpiryDate, setNewExpiryDate] = useState('2026-06-30')
  const [newTargetType, setNewTargetType] = useState<Voucher['targetType']>('all')
  const [newTargetValue, setNewTargetValue] = useState('Tất cả khách hàng')

  // Dropdown phụ thuộc trạng thái (Conditional state options)
  const [selectedTier, setSelectedTier] = useState('Đồng')
  const [selectedGroupTag, setSelectedGroupTag] = useState('Thích yên tĩnh')
  const [typedEventName, setTypedEventName] = useState('')

  // Toast thành công & copy
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // Highlight từ Copilot AI
  const [highlightedVoucherId, setHighlightedVoucherId] = useState<string | null>(null)
  const [highlightedFilter, setHighlightedFilter] = useState<string | null>(null)

  // Nạp dữ liệu thực tế từ Supabase
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setIsLoading(true)
        const supabase = getSupabase()
        const { data: dbVouchers, error } = await supabase
          .from('vouchers')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (dbVouchers && dbVouchers.length > 0) {
          const mappedVouchers: Voucher[] = dbVouchers.map((v: any) => ({
            id: v.code, // code làm ID duy nhất luôn
            code: v.code,
            type: v.type,
            value: Number(v.value),
            usageCount: v.usage_count || 0,
            maxUsage: v.max_usage || 100,
            expiryDate: v.expiry_date,
            status: v.status === 'disabled' ? 'paused' : v.status === 'expired' ? 'expired' : 'active',
            targetType: v.target_type,
            targetValue: v.target_value || 'Tất cả'
          }))
          setVouchers(mappedVouchers)
        } else {
          setVouchers(INITIAL_VOUCHERS)
        }
      } catch (err) {
        console.warn('[Supabase Vouchers Fetch] Fallback active:', err)
        setVouchers(INITIAL_VOUCHERS)
      } finally {
        setIsLoading(false)
      }
    }
    loadVouchers()
  }, [])

  // Theo dõi cập nhật dynamic form targetValue khi người dùng đổi loại targetType
  useEffect(() => {
    if (newTargetType === 'all') {
      setNewTargetValue('Tất cả khách hàng')
    } else if (newTargetType === 'tier') {
      setNewTargetValue(`Hạng thành viên: ${selectedTier}`)
    } else if (newTargetType === 'group') {
      setNewTargetValue(`Nhóm khách hàng: ${selectedGroupTag}`)
    } else if (newTargetType === 'event') {
      setNewTargetValue(typedEventName.trim() || 'Sự kiện chưa đặt tên')
    }
  }, [newTargetType, selectedTier, selectedGroupTag, typedEventName])

  // LẮNG NGHE LỆNH TỪ BLISS COPILOT AI (CHAT-TO-ACTION)
  useEffect(() => {
    const handleAdminAction = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: string
        payload: string
        description: string
      }>
      if (!customEvent.detail) return

      const { type, payload } = customEvent.detail

      // 1. Lọc theo trạng thái Voucher
      if (type === 'FILTER_STATUS') {
        const targetStatus = payload as any
        setStatusFilter(targetStatus)
        setHighlightedFilter('status-' + targetStatus)
        setTimeout(() => setHighlightedFilter(null), 3000)
      } 
      // 2. Lọc theo Phân loại đối tượng áp dụng
      else if (type === 'FILTER_TARGET') {
        const targetType = payload as any
        setTargetFilter(targetType)
        setHighlightedFilter('target-' + targetType)
        setTimeout(() => setHighlightedFilter(null), 3000)
      } 
      // 3. Tìm mã voucher và highlight dòng dữ liệu
      else if (type === 'SEARCH_VOUCHER' || type === 'SEARCH_AND_OPEN') {
        setSearchTerm(payload)
        const lowercasePayload = payload.toLowerCase().trim()
        const found = vouchers.find(v => v.code.toLowerCase().includes(lowercasePayload))

        if (found) {
          setHighlightedVoucherId(found.id)
          
          // Cuộn mượt mà đến voucher
          setTimeout(() => {
            const rowElement = document.getElementById(`vouch-row-${found.id}`)
            if (rowElement) {
              rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 100)

          // Xóa phát sáng sau 4 giây
          setTimeout(() => setHighlightedVoucherId(null), 4000)
        }
      }
    }

    window.addEventListener('bliss-admin-action', handleAdminAction)
    return () => {
      window.removeEventListener('bliss-admin-action', handleAdminAction)
    }
  }, [vouchers])

  /**
   * Sao chép mã voucher vào Clipboard
   */
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      showToast(`Đã sao chép mã ${code} vào bộ nhớ tạm!`)
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Bật/Tắt trạng thái hoạt động nhanh (Optimistic status toggle)
   */
  const handleToggleStatus = async (id: string) => {
    const originalVouchers = [...vouchers]
    const target = vouchers.find(v => v.id === id)
    if (!target) return

    const nextDbStatus = target.status === 'active' ? 'disabled' : 'active'

    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('vouchers')
        .update({ status: nextDbStatus })
        .eq('code', target.code)

      if (error) throw error

      setVouchers(prev => 
        prev.map(v => {
          if (v.id === id) {
            const nextStatus = v.status === 'active' ? 'paused' : 'active'
            return { ...v, status: nextStatus }
          }
          return v
        })
      )
      
      showToast(`Đã chuyển đổi trạng thái Voucher thành công!`)
    } catch (e: any) {
      console.error(e)
      setVouchers(originalVouchers)
      alert(`Không thể chuyển đổi trạng thái voucher. Lỗi: ${e.message || e}`)
    }
  }

  /**
   * Lưu form tạo voucher mới
   */
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode.trim()) return

    // Thu thập giá trị cuối cùng tùy theo targetType
    let finalTargetVal = newTargetValue
    if (newTargetType === 'tier') {
      finalTargetVal = `Hạng TV: ${selectedTier}`
    } else if (newTargetType === 'group') {
      finalTargetVal = `Nhóm: ${selectedGroupTag}`
    } else if (newTargetType === 'event') {
      finalTargetVal = `Dịp lễ: ${typedEventName.trim() || 'Dịp Sale Đặc Biệt'}`
    } else {
      finalTargetVal = 'Đại trà: Tất cả'
    }

    try {
      const supabase = getSupabase()
      
      const { data: dbVouch, error } = await supabase
        .from('vouchers')
        .insert([{
          code: newCode.trim().toUpperCase(),
          type: newType,
          value: Number(newValue),
          max_usage: Number(newMaxUsage),
          expiry_date: newExpiryDate,
          status: 'active',
          target_type: newTargetType,
          target_value: finalTargetVal,
          usage_count: 0
        }])
        .select()
        .single()

      if (error) throw error

      const newVouchObj: Voucher = {
        id: dbVouch.code,
        code: dbVouch.code,
        type: dbVouch.type,
        value: Number(dbVouch.value),
        usageCount: 0,
        maxUsage: dbVouch.max_usage || 50,
        expiryDate: dbVouch.expiry_date,
        status: 'active',
        targetType: dbVouch.target_type,
        targetValue: dbVouch.target_value
      }

      setVouchers(prev => [newVouchObj, ...prev])
      setIsModalOpen(false)
      
      // Reset Forms
      setNewCode('')
      setNewValue(10)
      setNewMaxUsage(50)
      setNewTargetType('all')
      setTypedEventName('')

      showToast(`Đã đăng ký Voucher mới thành công! Mã: ${newVouchObj.code}`)
    } catch (error: any) {
      console.error('Lỗi khi tạo Voucher:', error)
      alert(`Không thể đăng ký Voucher mới. Lỗi: ${error.message || error}`)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Thuật toán lọc tích hợp
  const filteredVouchers = vouchers.filter(v => {
    const query = searchTerm.toLowerCase().trim()
    const matchSearch = !query || v.code.toLowerCase().includes(query) || v.targetValue.toLowerCase().includes(query)
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    const matchTarget = targetFilter === 'all' || v.targetType === targetFilter

    return matchSearch && matchStatus && matchTarget
  })

  // Định nghĩa style màu sắc tinh tế cho các Badge phân loại đa tầng
  const getTargetBadgeStyle = (targetType: Voucher['targetType']) => {
    switch (targetType) {
      case 'all':
        return 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
      case 'tier':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-350 border border-amber-200 dark:border-amber-900/40'
      case 'group':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40'
      case 'event':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-350 border border-rose-200 dark:border-rose-900/40'
    }
  }

  const getTargetLabel = (type: Voucher['targetType']) => {
    switch (type) {
      case 'all': return 'Đại trà'
      case 'tier': return 'Hạng Thành Viên'
      case 'group': return 'Nhóm Hành Vi'
      case 'event': return 'Sự Kiện'
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative">

      {/* 🔮 CUSTOM TOAST SYSTEM */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-white dark:text-zinc-950 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <Check size={11} className="stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
            Quản Lý Khuyến Mãi (Vouchers)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            Tạo lập chiến dịch phát hành voucher đa tầng, kích thích đặt phòng sớm và tri ân thành viên thân thiết.
          </p>
        </div>

        {/* Nút Tạo Voucher */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:bg-zinc-200 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Tạo Voucher Đa Tầng</span>
        </button>
      </div>

      {/* THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC ĐA NĂNG */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl shadow-2xs dark:shadow-none transition duration-200">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã voucher hoặc đối tượng..."
            className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300 transition"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-2">
          
          {/* Lọc đối tượng áp dụng */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider hidden sm:inline">Đối tượng:</span>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value as any)}
              className={`bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 cursor-pointer transition ${
                highlightedFilter?.startsWith('target-') ? 'ring-4 ring-emerald-500/80 scale-[1.05] animate-pulse duration-150' : ''
              }`}
            >
              <option value="all">Tất cả phân loại</option>
              <option value="all">Đại trà (Mọi khách)</option>
              <option value="tier">Hạng Thành Viên</option>
              <option value="group">Nhóm Hành Vi</option>
              <option value="event">Sự Kiện/Lễ Hội</option>
            </select>
          </div>

          {/* Lọc Trạng thái */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider hidden sm:inline">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 cursor-pointer transition ${
                highlightedFilter?.startsWith('status-') ? 'ring-4 ring-emerald-500/80 scale-[1.05] animate-pulse duration-150' : ''
              }`}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động (Active)</option>
              <option value="paused">Tạm dừng (Paused)</option>
              <option value="expired">Đã hết hạn (Expired)</option>
            </select>
          </div>

        </div>
      </div>

      {/* HIỂN THỊ LOADING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-8 h-8 border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
            Đang đồng bộ cổng khuyến mãi Bliss...
          </span>
        </div>
      ) : (
        /* DANH SÁCH VOUCHERS TABLE */
        <div className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Mã Voucher</th>
                  <th className="py-4 px-5 text-center">Mức Giảm</th>
                  <th className="py-4 px-5">Phân Loại / Đối Tượng</th>
                  <th className="py-4 px-5 text-center">Hạn Sử Dụng</th>
                  <th className="py-4 px-5">Tiến Độ Sử Dụng</th>
                  <th className="py-4 px-6 text-center">Trạng Thái</th>
                  <th className="py-4 px-6 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={24} className="text-stone-300" />
                        <span>Không tìm thấy chương trình voucher nào.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((vouch) => {
                    const isRowHighlighted = highlightedVoucherId === vouch.id
                    const progressPercent = Math.min(100, Math.round((vouch.usageCount / vouch.maxUsage) * 100))

                    return (
                      <tr 
                        key={vouch.id}
                        id={`vouch-row-${vouch.id}`}
                        className={`transition-all duration-500 border-b border-zinc-100 dark:border-zinc-800/60 ${
                          isRowHighlighted 
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/5 border-y-2 border-emerald-500 animate-pulse relative z-10' 
                            : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40'
                        }`}
                      >
                        
                        {/* Mã Code & Copy Icon */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 font-mono text-zinc-800 dark:text-zinc-200 font-black tracking-wider text-sm">
                            <span>{vouch.code}</span>
                            <button
                              onClick={() => handleCopyCode(vouch.code)}
                              className="p-1 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-450 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 rounded-md border-none transition cursor-pointer"
                              title="Sao chép mã"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </td>

                        {/* Mức giảm */}
                        <td className="py-4 px-5 text-center font-extrabold text-zinc-900 dark:text-zinc-100 text-sm">
                          {vouch.type === 'percent' ? (
                            <span className="inline-flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 font-black">
                              {vouch.value}% <Percent size={10} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 font-black">
                              -{formatVND(vouch.value)}
                            </span>
                          )}
                        </td>

                        {/* Phân loại đối tượng */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-0.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider w-max ${getTargetBadgeStyle(vouch.targetType)}`}>
                              <Layers size={9} /> {getTargetLabel(vouch.targetType)}
                            </span>
                            <span className="text-zinc-800 dark:text-zinc-200 font-extrabold block mt-1 text-[11px]">{vouch.targetValue}</span>
                          </div>
                        </td>

                        {/* Hạn sử dụng */}
                        <td className="py-4 px-5 text-center text-zinc-650 dark:text-zinc-400 font-mono font-bold">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} className="text-zinc-500 dark:text-zinc-400" />
                            {vouch.expiryDate.split('-').reverse().join('/')}
                          </span>
                        </td>

                        {/* Tiến độ sử dụng */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-1.5 w-40">
                            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                              <span>Tiến độ: {progressPercent}%</span>
                              <span>{vouch.usageCount}/{vouch.maxUsage} đơn</span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progressPercent >= 90 
                                    ? 'bg-rose-500' 
                                    : progressPercent >= 60 
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            vouch.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : vouch.status === 'paused'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-450 border border-zinc-200 dark:border-zinc-700'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-450 border border-rose-500/20 font-mono'
                          }`}>
                            {vouch.status === 'active' ? 'Đang chạy' :
                             vouch.status === 'paused' ? 'Tạm dừng' : 'Hết hạn'}
                          </span>
                        </td>

                        {/* Thao tác Toggle status */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center">
                            {vouch.status === 'expired' ? (
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold italic select-none">Vô hiệu</span>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(vouch.id)}
                                className={`p-1 bg-transparent border-none cursor-pointer transition active:scale-90 ${
                                  vouch.status === 'active' ? 'text-emerald-600' : 'text-zinc-500 dark:text-zinc-500'
                                }`}
                                title={vouch.status === 'active' ? 'Tạm dừng hoạt động' : 'Bật hoạt động trở lại'}
                              >
                                {vouch.status === 'active' ? (
                                  <ToggleRight size={26} className="stroke-[1.5]" />
                                ) : (
                                  <ToggleLeft size={26} className="stroke-[1.5]" />
                                )}
                              </button>
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

      {/* ================= MODAL TẠO VOUCHER MỚI (SMART CONDITIONAL FORM) ================= */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-card border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-zinc-800 dark:text-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-inner">
                <Ticket size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 uppercase leading-none">Tạo Voucher Mới</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 tracking-wider">PHÁT HÀNH CHIẾN DỊCH KHUYẾN MÃI ĐA TẦNG</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateVoucher} className="flex flex-col gap-4 text-xs font-semibold">
              
              {/* Mã code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Mã khuyến mãi (Code) *</label>
                <input 
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: EASTER2026"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-black tracking-wider focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-200 placeholder:font-normal uppercase"
                />
              </div>

              {/* Loại voucher & Đơn giá giảm */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Hình thức giảm *</label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      const t = e.target.value as any
                      setNewType(t)
                      setNewValue(t === 'percent' ? 10 : 100000)
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Mức giảm *</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    value={newValue}
                    onChange={(e) => setNewValue(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              {/* Giới hạn sử dụng & Ngày hết hạn */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Số lượng tối đa *</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    value={newMaxUsage}
                    onChange={(e) => setNewMaxUsage(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Hạn sử dụng *</label>
                  <input 
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              {/* ================= PHẦN DYNAMIC THAY ĐỔI THEO LOẠI ĐỐI TƯỢNG (targetType) ================= */}
              <div className="flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-purple-500 dark:text-purple-400 font-black uppercase tracking-wider">Loại Đối Tượng Áp Dụng *</label>
                  <select
                    value={newTargetType}
                    onChange={(e) => setNewTargetType(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="all">Đại trà (Tất cả khách hàng)</option>
                    <option value="tier">Hạng Thành Viên (Loyalty Tier)</option>
                    <option value="group">Nhóm Hành Vi (Behavioral Tags)</option>
                    <option value="event">Sự Kiện / Lễ Sale (Event Campaign)</option>
                  </select>
                </div>

                {/* CONDITIONAL RENDERING 1: Hạng thành viên */}
                {newTargetType === 'tier' && (
                  <div className="flex flex-col gap-1.5 animate-in slide-in-from-top duration-200">
                    <label className="text-[10px] text-amber-500 dark:text-amber-400 font-black uppercase tracking-wider">Chọn Hạng Thành Viên Áp Dụng *</label>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="Đồng">Đồng (Bronze)</option>
                      <option value="Bạc">Bạc (Silver)</option>
                      <option value="Vàng">Vàng (Gold)</option>
                      <option value="VIP">Thành viên VIP</option>
                    </select>
                  </div>
                )}

                {/* CONDITIONAL RENDERING 2: Nhóm hành vi */}
                {newTargetType === 'group' && (
                  <div className="flex flex-col gap-1.5 animate-in slide-in-from-top duration-200">
                    <label className="text-[10px] text-purple-500 dark:text-purple-400 font-black uppercase tracking-wider">Chọn Nhóm Nhãn Khách Hàng *</label>
                    <select
                      value={selectedGroupTag}
                      onChange={(e) => setSelectedGroupTag(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="Thích yên tĩnh">Thích yên tĩnh 🤫</option>
                      <option value="Đi gia đình">Đi gia đình / Nghỉ mát 🏡</option>
                      <option value="Check-in sớm">Check-in sớm / Check-out muộn ⏰</option>
                      <option value="Thích View săn mây">Săn mây / View đồi xanh ☁️</option>
                    </select>
                  </div>
                )}

                {/* CONDITIONAL RENDERING 3: Sự kiện / Lễ Sale */}
                {newTargetType === 'event' && (
                  <div className="flex flex-col gap-1.5 animate-in slide-in-from-top duration-200">
                    <label className="text-[10px] text-rose-500 dark:text-rose-400 font-black uppercase tracking-wider">Nhập Tên Sự Kiện / Dịp Lễ *</label>
                    <input 
                      type="text"
                      required
                      value={typedEventName}
                      onChange={(e) => setTypedEventName(e.target.value)}
                      placeholder="Ví dụ: Đại lễ Quốc Khánh 2/9"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-rose-500 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                )}

              </div>

              {/* Nút gửi form */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-grow py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-400 rounded-xl font-bold text-xs transition border-none shadow-2xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={12} className="stroke-[3]" /> Phát Hành Voucher
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
