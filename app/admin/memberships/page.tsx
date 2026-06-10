'use client'

import { useState, useEffect } from 'react'
import { 
  Award, 
  Check, 
  X, 
  Pencil, 
  Shield, 
  Gem, 
  Sparkles, 
  Coins, 
  HeartHandshake,
  AlertCircle
} from 'lucide-react'

// Định nghĩa kiểu dữ liệu Hạng Thành Viên
interface MembershipTier {
  id: 'tier-bronze' | 'tier-silver' | 'tier-gold' | 'tier-diamond'
  name: string
  minSpent: number
  discount: number
  benefits: string[]
  colorTheme: 'stone' | 'slate' | 'amber' | 'violet'
}

// 1. Khởi tạo hằng số format VND hoisted lên đầu để bảo đảm biên dịch không có lỗi tĩnh
const formatVND = (val: number) => {
  return val.toLocaleString('vi-VN') + 'đ'
}

// 2. Dữ liệu Hạng Thành Viên giả lập cao cấp đạt chuẩn Bliss Home Sài Gòn
const INITIAL_TIERS: MembershipTier[] = [
  {
    id: 'tier-bronze',
    name: 'Bronze (Đồng) 🥉',
    minSpent: 0,
    discount: 0,
    benefits: [
      'Tích điểm cơ bản nhận voucher',
      'Hỗ trợ đặt phòng trực tuyến 24/7',
      'Đăng ký tài khoản hội viên miễn phí'
    ],
    colorTheme: 'stone'
  },
  {
    id: 'tier-silver',
    name: 'Silver (Bạc) 🥈',
    minSpent: 5000000,
    discount: 5,
    benefits: [
      'Check-in sớm 2 giờ (nếu phòng trống)',
      'Tặng 1 phần đồ uống chào mừng miễn phí',
      'Ưu đãi 5% cho tất cả các chi nhánh',
      'Tích lũy điểm nhân hệ số 1.1x'
    ],
    colorTheme: 'slate'
  },
  {
    id: 'tier-gold',
    name: 'Gold (Vàng) 🥇',
    minSpent: 15000000,
    discount: 10,
    benefits: [
      'Check-in sớm & Check-out trễ linh hoạt',
      'Tặng giỏ hoa quả tươi khi nhận phòng',
      'Hỗ trợ hotline chăm sóc ưu tiên 24/7',
      'Chiết khấu trực tiếp 10% giá hóa đơn',
      'Tích lũy điểm nhân hệ số 1.3x'
    ],
    colorTheme: 'amber'
  },
  {
    id: 'tier-diamond',
    name: 'Diamond (Kim Cương) 💎',
    minSpent: 30000000,
    discount: 15,
    benefits: [
      'Đặc quyền miễn phí đưa đón sân bay 2 chiều',
      'Tự động nâng hạng phòng miễn phí (nếu trống)',
      'Tặng 1 đêm nghỉ dưỡng nhân ngày sinh nhật',
      'Giảm giá tối đa 15% tổng hóa đơn phòng',
      'Tích lũy điểm nhân hệ số 1.5x',
      'Tham gia sự kiện riêng tư của Bliss Home'
    ],
    colorTheme: 'violet'
  }
]

export default function MembershipsManagementPage() {
  const [tiers, setTiers] = useState<MembershipTier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // States quản lý chỉnh sửa luật hạng thành viên
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null)
  
  // State Form fields
  const [editMinSpent, setEditMinSpent] = useState(0)
  const [editDiscount, setEditDiscount] = useState(0)

  // Toast thông báo lưu thành công
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // Highlight của Copilot
  const [highlightedTierId, setHighlightedTierId] = useState<string | null>(null)

  // Nạp dữ liệu buồng phòng
  useEffect(() => {
    const loadTiers = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setTiers(INITIAL_TIERS)
      setIsLoading(false)
    }
    loadTiers()
  }, [])

  // LẮNG NGHE LỆNH TỪ AI COPILOT (CHAT-TO-ACTION)
  useEffect(() => {
    const handleAdminAction = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: string
        payload: string
        description: string
      }>
      if (!customEvent.detail) return

      const { type, payload } = customEvent.detail

      // 1. Highlight thẻ hạng thành viên cụ thể và cuộn tới vị trí tương ứng
      if (type === 'HIGHLIGHT_TIER' || type === 'SEARCH_ROOM') {
        const lowercasePayload = payload.toLowerCase().trim()
        let targetId: MembershipTier['id'] | null = null

        if (lowercasePayload.includes('bronze') || lowercasePayload.includes('đồng')) {
          targetId = 'tier-bronze'
        } else if (lowercasePayload.includes('silver') || lowercasePayload.includes('bạc')) {
          targetId = 'tier-silver'
        } else if (lowercasePayload.includes('gold') || lowercasePayload.includes('vàng')) {
          targetId = 'tier-gold'
        } else if (lowercasePayload.includes('diamond') || lowercasePayload.includes('kim cương')) {
          targetId = 'tier-diamond'
        }

        if (targetId) {
          setHighlightedTierId(targetId)
          
          // Cuộn mượt mà đến Card
          setTimeout(() => {
            const cardElement = document.getElementById(`tier-card-${targetId}`)
            if (cardElement) {
              cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 100)

          // Xóa phát sáng sau 4 giây
          setTimeout(() => setHighlightedTierId(null), 4000)
        }
      }
    }

    window.addEventListener('bliss-admin-action', handleAdminAction)
    return () => {
      window.removeEventListener('bliss-admin-action', handleAdminAction)
    }
  }, [tiers])

  /**
   * Bật modal chỉnh sửa luật
   */
  const openEditModal = (tier: MembershipTier) => {
    setEditingTier(tier)
    setEditMinSpent(tier.minSpent)
    setEditDiscount(tier.discount)
    setIsEditModalOpen(true)
  }

  /**
   * Cập nhật luật hạng thành viên
   */
  const handleUpdateTier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTier) return

    const originalTiers = [...tiers]

    try {
      // Optimistic update
      setTiers(prev => 
        prev.map(t => t.id === editingTier.id ? { ...t, minSpent: editMinSpent, discount: editDiscount } : t)
      )

      setIsEditModalOpen(false)
      showToast(`Đã cập nhật luật Hạng ${editingTier.name.split('(')[0]} thành công!`)

      console.log(`API Call: Cập nhật hạng ${editingTier.id} -> minSpent: ${editMinSpent}đ, discount: ${editDiscount}%`)

      // Giả lập loading trễ mạng
      await new Promise(resolve => setTimeout(resolve, 300))

    } catch (error) {
      console.error(`Sự cố khi cập nhật hạng ${editingTier.id}:`, error)
      setTiers(originalTiers)
      alert('Không thể cập nhật luật hạng thành viên. Vui lòng thử lại sau!')
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 3500)
    return () => clearTimeout(timer)
  }

  // Định nghĩa CSS màu gradient cho các thẻ dựa theo colorTheme
  const getCardThemeClasses = (colorTheme: MembershipTier['colorTheme']) => {
    switch (colorTheme) {
      case 'stone':
        return 'from-stone-900 to-stone-850 text-stone-100 shadow-stone-950/20 border border-stone-800'
      case 'slate':
        return 'from-slate-800 to-slate-700 text-slate-100 shadow-slate-900/25 border border-slate-650'
      case 'amber':
        return 'from-[#7A5B0B] via-[#5F4503] to-[#80600C] text-amber-50 shadow-amber-950/30 border border-amber-600/40'
      case 'violet':
        return 'from-indigo-900 via-purple-900 to-violet-950 text-indigo-50 shadow-indigo-950/45 border-l-4 border-l-indigo-400 border-y border-r border-indigo-950/60'
    }
  }

  // Nhãn icon đặc quyền cho từng hạng
  const getTierIcon = (colorTheme: MembershipTier['colorTheme']) => {
    switch (colorTheme) {
      case 'stone':
        return <Shield size={22} className="text-stone-400 animate-pulse" />
      case 'slate':
        return <Award size={22} className="text-blue-300 animate-pulse" />
      case 'amber':
        return <Coins size={22} className="text-yellow-400 animate-pulse" />
      case 'violet':
        return <Gem size={22} className="text-purple-300 animate-bounce" />
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative">
      
      {/* 🔮 CUSTOM TOAST SYSTEM */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0A273A] border border-indigo-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white">
            <Check size={11} className="stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/50 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#0A273A] tracking-tight font-sans">
            Luật Hạng Thành Viên (Membership Rules)
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Thiết lập điều kiện chi tiêu tích lũy tối thiểu và chiết khấu ưu đãi để hệ thống tự động phân cấp thứ hạng khách hàng.
          </p>
        </div>
      </div>

      {/* HIỂN THỊ LOADING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <div className="w-8 h-8 border-4 border-[#0A273A] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest animate-pulse">
            Đang đồng bộ luật thành viên Bliss...
          </span>
        </div>
      ) : (
        /* GRID THẺ THÀNH VIÊN QUYỀN LỰC */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier) => {
            const isHighlighted = highlightedTierId === tier.id

            return (
              <div
                key={tier.id}
                id={`tier-card-${tier.id}`}
                className={`bg-gradient-to-br rounded-[30px] p-6 flex flex-col justify-between gap-6 shadow-xl transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl ${getCardThemeClasses(tier.colorTheme)} ${
                  isHighlighted 
                    ? 'ring-4 ring-indigo-500 scale-[1.04] animate-pulse relative z-10 duration-150' 
                    : ''
                }`}
              >
                {/* Trên: Header Thẻ */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm uppercase tracking-wider">{tier.name.split('(')[0]}</span>
                  {getTierIcon(tier.colorTheme)}
                </div>

                {/* Giữa: Điều kiện chi tiêu & Chiết khấu */}
                <div className="flex flex-col gap-1.5 border-t border-dashed border-white/20 pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-white/50 uppercase tracking-widest font-black">Điều kiện tích lũy:</span>
                    <strong className="text-base md:text-lg font-black font-sans leading-none">
                      {tier.minSpent === 0 ? 'Miễn phí khởi tạo' : `Từ ${formatVND(tier.minSpent)}`}
                    </strong>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1.5">
                    <span className="text-[9px] text-white/50 uppercase tracking-widest font-black">Mức giảm hóa đơn:</span>
                    <strong className="text-2xl font-black font-sans leading-none text-emerald-400">
                      {tier.discount === 0 ? 'Không áp dụng' : `Giảm ${tier.discount}%`}
                    </strong>
                  </div>
                </div>

                {/* Dưới: Danh sách đặc quyền */}
                <div className="flex flex-col gap-2.5 mt-1 border-t border-dashed border-white/20 pt-4 flex-grow">
                  <span className="text-[9px] text-white/50 uppercase tracking-widest font-black">Đặc quyền hội viên:</span>
                  <ul className="flex flex-col gap-2 list-none p-0 m-0">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-xs font-semibold flex items-start gap-2 leading-relaxed">
                        <Check size={12} className="text-emerald-400 mt-0.5 flex-shrink-0 stroke-[3]" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dưới cùng: Nút sửa */}
                <button
                  onClick={() => openEditModal(tier)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/45 text-white rounded-2xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Pencil size={11} /> Chỉnh sửa luật
                </button>

              </div>
            )
          })}
        </div>
      )}

      {/* ================= MODAL CHỈNH SỬA LUẬT HẠNG THÀNH VIÊN ================= */}
      {isEditModalOpen && editingTier && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 border-none w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center shadow-inner">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-850 uppercase leading-none">Cấu Hình Luật Hạng</h3>
                <span className="text-[10px] text-stone-400 font-bold block mt-1 tracking-wider">HẠNG: {editingTier.name.split('(')[0].toUpperCase()}</span>
              </div>
            </div>

            {/* Biểu mẫu chỉnh sửa */}
            <form onSubmit={handleUpdateTier} className="flex flex-col gap-4 text-xs font-semibold text-stone-700">
              
              {/* Điều kiện chi tiêu */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-stone-400 font-black uppercase tracking-wider">Mức Chi Tiêu Tích Lũy Tối Thiểu (VND) *</label>
                <input 
                  type="number"
                  required
                  min={0}
                  step={500000}
                  value={editMinSpent}
                  onChange={(e) => setEditMinSpent(parseInt(e.target.value) || 0)}
                  disabled={editingTier.id === 'tier-bronze'}
                  className="w-full bg-stone-50 disabled:bg-stone-100 disabled:text-stone-400 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-black tracking-wider focus:outline-none focus:border-indigo-600 text-stone-850"
                />
                {editingTier.id === 'tier-bronze' && (
                  <span className="text-[9px] text-amber-600 block italic">Hạng khởi đầu mặc định luôn có điều kiện tích lũy là 0đ.</span>
                )}
              </div>

              {/* Mức chiết khấu */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-stone-400 font-black uppercase tracking-wider">Mức Giảm Chiết Khấu Trực Tiếp (%) *</label>
                <input 
                  type="number"
                  required
                  min={0}
                  max={90}
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(parseInt(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-black tracking-wider focus:outline-none focus:border-indigo-600 text-stone-850"
                />
              </div>

              {/* Đặc quyền xem trước */}
              <div className="flex flex-col gap-2 bg-stone-50 p-4 rounded-2xl border border-stone-200/50">
                <span className="text-[9px] text-stone-400 font-black uppercase tracking-wider">Đặc quyền được bảo lưu:</span>
                <ul className="flex flex-col gap-1.5 list-none p-0 m-0 text-stone-600 leading-relaxed font-medium">
                  {editingTier.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nút gửi */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-grow py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold text-xs transition border-none cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-[#0A273A] hover:bg-[#124263] text-white rounded-xl font-black text-xs transition border-none shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={12} className="stroke-[3]" /> Cập nhật Luật Hạng
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
