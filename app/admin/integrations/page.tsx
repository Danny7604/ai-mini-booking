'use client'

import { useState } from 'react'
import { 
  Settings, 
  Key, 
  RefreshCw, 
  Check, 
  Copy, 
  Smartphone, 
  Send, 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Globe, 
  ShieldCheck, 
  Eye,
  Lock,
  Server
} from 'lucide-react'

// Định nghĩa kiểu dữ liệu Mẫu tin nhắn ZNS
interface ZNSTemplate {
  id: string
  name: string
  status: 'approved' | 'pending' | 'rejected'
  mappedFields: string[]
  content: string
  voucherCodeSample?: string
}

// 1. Danh sách các template ZNS mẫu đăng ký sẵn với Zalo
const MOCK_ZNS_TEMPLATES: ZNSTemplate[] = [
  {
    id: 'ZNS-01-CONFIRM',
    name: 'Xác nhận đặt đơn phòng thành công 🏨',
    status: 'approved',
    mappedFields: ['{ten_khach}', '{ma_booking}', '{ten_phong}', '{ngay_checkin}'],
    content: 'Chào {ten_khach}, Dancin Home Sài Gòn đã xác nhận đơn đặt phòng {ma_booking} thành công! Bạn sẽ check-in phòng {ten_phong} vào ngày {ngay_checkin}. Trân trọng đón tiếp!',
  },
  {
    id: 'ZNS-02-VOUCHER',
    name: 'Tặng Voucher Tri Ân Nhóm Hành Vi AI 🎁',
    status: 'approved',
    mappedFields: ['{ten_khach}', '{ma_voucher}'],
    content: 'Chào {ten_khach}, trốn thành thị xô bồ để tìm lại bình yên cùng Dancin Home Sài Gòn cuối tuần này nhé! Nhập ngay mã {ma_voucher} để nhận ưu đãi giảm 15% phòng nghỉ biệt lập cực chill.',
    voucherCodeSample: 'DANCINHE2026'
  },
  {
    id: 'ZNS-03-BIRTHDAY',
    name: 'Chúc mừng sinh nhật Hội viên Vàng/Kim cương 🎂',
    status: 'approved',
    mappedFields: ['{ten_khach}', '{ma_voucher}'],
    content: 'Dancin Home gửi tặng quý hội viên {ten_khach} đặc quyền mừng sinh nhật rực rỡ! Tặng mã giảm giá {ma_voucher} trị giá 200k khi đặt phòng gia đình Hinoki.',
    voucherCodeSample: 'VIPBIRTHDAY'
  },
  {
    id: 'ZNS-04-SURVEY',
    name: 'Khảo sát chất lượng dịch vụ sau check-out ⭐',
    status: 'pending',
    mappedFields: ['{ten_khach}', '{ma_booking}'],
    content: 'Kính chào {ten_khach}, Dancin Home hy vọng bạn đã có một kỳ nghỉ tuyệt vời! Vui lòng dành 1 phút đánh giá đơn đặt phòng {ma_booking} để giúp chúng tôi cải thiện chất lượng tốt hơn.',
  }
]

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'zalo' | 'zns' | 'email'>('zalo')
  
  // States Zalo OA
  const [oaId, setOaId] = useState('284018249821849182')
  const [secretKey, setSecretKey] = useState('••••••••••••••••••••••••••••••••')
  const [accessToken, setAccessToken] = useState('ZaloAccessToken_DancinHome_2026_SecureKeyStringLength_XYZ')
  const [refreshToken, setRefreshToken] = useState('ZaloRefreshToken_DancinHome_2026_SecureKey')
  const [isZaloConnected, setIsZaloConnected] = useState(true)
  const [isZaloLoading, setIsZaloLoading] = useState(false)
  const [showOaKeys, setShowOaKeys] = useState(false)

  // States ZNS Templates
  const [templates, setTemplates] = useState<ZNSTemplate[]>(MOCK_ZNS_TEMPLATES)
  const [isSyncingZNS, setIsSyncingZNS] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<ZNSTemplate | null>(null)

  // States Email Configuration
  const [emailProvider, setEmailProvider] = useState<'resend' | 'sendgrid' | 'ses' | 'smtp'>('resend')
  const [emailApiKey, setEmailApiKey] = useState('re_9xK2A8bJ_L7sD2M3nQp5wTzYc6rE9vU1m')
  const [senderEmail, setSenderEmail] = useState('thuongvn.work@gmail.com')
  const [senderName, setSenderName] = useState('Dancin Home Sài Gòn')
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isDkimVerified, setIsDkimVerified] = useState(true)

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }

  // Sao chép Webhook Link
  const copyWebhookUrl = () => {
    try {
      navigator.clipboard.writeText('https://dancinhome.vn/api/webhooks/zalo')
      showToast('📋 Đã sao chép link Webhook Zalo vào Clipboard!')
    } catch (e) {
      console.error(e)
      alert('Không thể sao chép tự động. Webhook URL: https://dancinhome.vn/api/webhooks/zalo')
    }
  }

  // Giả lập kết nối lại Zalo OA (Refresh OAuth 2.0)
  const handleConnectZalo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsZaloLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500)) // Giả lập trễ mạng oauth
      setIsZaloConnected(true)
      setIsZaloLoading(false)
      showToast('🟢 Kết nối và cập nhật Token Zalo OA thành công!')
      console.log('[Integration API] Kết nối thành công Zalo OA ID:', oaId)
    } catch (error) {
      console.error(error)
      setIsZaloLoading(false)
      alert('Lỗi kết nối Zalo OA!')
    }
  }

  // Hủy kết nối Zalo OA
  const handleDisconnectZalo = () => {
    if (!confirm('Bạn có chắc chắn muốn ngắt kết nối với Zalo OA của Dancin Home không? Các tiến trình gửi tin ZNS tự động sẽ bị đình chỉ.')) return
    setIsZaloConnected(false)
    showToast('⚠️ Đã ngắt kết nối Zalo OA!')
  }

  // Đồng bộ Template ZNS từ cổng Zalo Cloud
  const handleSyncZNSTemplates = async () => {
    try {
      setIsSyncingZNS(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Đồng bộ giả lập thêm template mới hoặc cập nhật trạng thái
      setTemplates(prev => {
        const hasSurveyApproved = prev.map(t => t.id === 'ZNS-04-SURVEY' ? { ...t, status: 'approved' as const } : t)
        return hasSurveyApproved
      })
      
      setIsSyncingZNS(false)
      showToast('🔄 Đồng bộ danh sách Mẫu tin ZNS từ ZCA thành công!')
    } catch (e) {
      console.error(e)
      setIsSyncingZNS(false)
    }
  }

  // Giả lập lưu cấu hình Email
  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsEmailLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEmailLoading(false)
      showToast('📧 Đã lưu thông số cấu hình cổng gửi Email thành công!')
    } catch (e) {
      console.error(e)
      setIsEmailLoading(false)
    }
  }

  // Gửi email thử nghiệm
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmailAddress.trim()) {
      alert('Vui lòng nhập địa chỉ email nhận tin thử nghiệm!')
      return
    }

    try {
      setIsEmailLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsEmailLoading(false)
      showToast(`🚀 Đã gửi email thử nghiệm thành công tới ${testEmailAddress}!`)
      setTestEmailAddress('')
    } catch (e) {
      console.error(e)
      setIsEmailLoading(false)
      alert('Gửi email thử nghiệm thất bại!')
    }
  }

  // Tạo bong bóng xem trước ZNS thực tế
  const renderZnsLivePreview = (template: ZNSTemplate) => {
    const evaluated = template.content
      .replace(/{ten_khach}/g, 'Trần Anh Tuấn')
      .replace(/{ma_booking}/g, 'BH-2026-9821')
      .replace(/{ten_phong}/g, 'Rustic Forest Cabin CS1 🌲')
      .replace(/{ngay_checkin}/g, '12/06/2026')
      .replace(/{ma_voucher}/g, template.voucherCodeSample || '[CHƯA CẤU HÌNH VOUCHER]')

    return (
      <div className="flex flex-col gap-2 font-sans text-xs">
        {/* Banner Zalo ZNS Header */}
        <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-1 select-none">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[9px] uppercase shadow-inner">
            DH
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 leading-tight">Dancin Home Sài Gòn</span>
            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5 leading-none">Thông báo dịch vụ ZNS</span>
          </div>
        </div>

        {/* Nội dung đã gán biến */}
        <p className="text-[11px] text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap font-sans">
          {evaluated}
        </p>

        {/* Khối Button Call To Action giả lập nếu có voucher */}
        {template.voucherCodeSample && (
          <div className="mt-2.5 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5 font-sans select-none">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl flex items-center justify-between text-[10px] font-bold">
              <span className="text-zinc-500 dark:text-zinc-400">Mã ưu đãi áp dụng:</span>
              <span className="text-blue-600 font-black font-mono bg-blue-50 px-1.5 py-0.5 border border-blue-105 rounded">
                {template.voucherCodeSample}
              </span>
            </div>
            <div className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black text-center uppercase tracking-wider cursor-pointer shadow-3xs">
              👉 Sử dụng đặt đơn ngay
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative text-zinc-700 dark:text-zinc-300 font-sans">
      
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
            Tích Hợp Hệ Thống
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            Cấu hình bảo mật khóa API, kết nối Zalo Official Account, đồng bộ ZNS Templates và dịch vụ gửi Email Marketing.
          </p>
        </div>
      </div>

      {/* 3-TABS NAVIGATION CONTROLS */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab('zalo')}
          className={`px-5 py-3 text-xs md:text-sm font-extrabold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'zalo'
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <MessageSquare size={15} />
          <span>Kết nối Zalo OA</span>
        </button>

        <button
          onClick={() => setActiveTab('zns')}
          className={`px-5 py-3 text-xs md:text-sm font-extrabold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'zns'
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <Layers size={15} />
          <span>Mẫu tin ZNS (Templates)</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-5 py-3 text-xs md:text-sm font-extrabold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'email'
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <Mail size={15} />
          <span>Dịch vụ Email (ESP)</span>
        </button>
      </div>

      {/* TAB CONTENTS CONTENT */}
      <div className="bg-white border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs">
        
        {/* ================= TAB 1: KẾT NỐI ZALO OA ================= */}
        {activeTab === 'zalo' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">Kết nối Zalo Official Account (OA)</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Kích hoạt phân hệ gửi tin chăm sóc khách hàng tự động và ZNS qua cổng xác thực Zalo Developers.
              </p>
            </div>

            {/* Trạng thái kết nối hiển thị */}
            <div className={`p-4.5 rounded-2xl border flex items-center justify-between gap-4 ${
              isZaloConnected 
                ? 'bg-green-50/50 border-green-200 text-green-800' 
                : 'bg-amber-50/50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  isZaloConnected ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {isZaloConnected ? 'Trạng thái: Đã kết nối với Zalo OA' : 'Trạng thái: Chưa được kết nối'}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block mt-0.5">
                    {isZaloConnected 
                      ? 'Đồng bộ API Zalo OA Dancin Home Sài Gòn hoạt động bình thường.' 
                      : 'Vui lòng thiết lập các thông số khóa bảo mật bên dưới để bắt đầu.'
                    }
                  </span>
                </div>
              </div>
              
              {isZaloConnected && (
                <button
                  type="button"
                  onClick={handleDisconnectZalo}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-xl cursor-pointer transition active:scale-95"
                >
                  Ngắt kết nối
                </button>
              )}
            </div>

            {/* Form cài đặt API */}
            <form onSubmit={handleConnectZalo} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                    <Key size={11} /> Zalo OA ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={oaId}
                    onChange={(e) => setOaId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                      <Lock size={11} /> Secret Key *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOaKeys(!showOaKeys)}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer border-none bg-transparent"
                    >
                      {showOaKeys ? 'Ẩn khóa' : 'Hiện khóa'}
                    </button>
                  </div>
                  <input
                    type={showOaKeys ? 'text' : 'password'}
                    required
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                  />
                </div>
              </div>

              {/* Tokens OAuth 2.0 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Access Token *</label>
                <input
                  type="text"
                  required
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Refresh Token *</label>
                <input
                  type="text"
                  required
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                />
              </div>

              {/* Webhook Configuration */}
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2 mt-2">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                  <Globe size={12} className="text-zinc-500 dark:text-zinc-400" /> Cấu hình Webhook Callback URL
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  Cung cấp URL này vào bảng cấu hình ứng dụng Zalo Developers của bạn để nhận sự kiện phản hồi trạng thái tin gửi và click.
                </span>
                <div className="flex items-center gap-2 bg-white border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 mt-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 flex-grow select-all overflow-x-auto whitespace-nowrap pr-2">
                    https://dancinhome.vn/api/webhooks/zalo
                  </span>
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="p-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 rounded-lg border-none text-zinc-600 dark:text-zinc-400 cursor-pointer transition active:scale-95"
                    title="Sao chép liên kết"
                  >
                    <Copy size={11} />
                  </button>
                </div>
              </div>

              {/* Nút lưu kết nối */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isZaloLoading}
                  className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isZaloLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Đang xác thực cổng Zalo...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={13} />
                      <span>{isZaloConnected ? 'Làm mới kết nối & Token' : 'Kết nối Zalo OA'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ================= TAB 2: MẪU TIN ZNS (TEMPLATES) ================= */}
        {activeTab === 'zns' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">Quản lý Mẫu Tin Zalo ZNS</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Danh sách mẫu tin được Zalo duyệt phục vụ các sự kiện CSKH và marketing tự động hóa.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSyncZNSTemplates}
                disabled={isSyncingZNS}
                className="bg-zinc-500/10 dark:bg-zinc-500/15 hover:bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-zinc-900 dark:text-zinc-100 hover:text-white border border-zinc-900 dark:border-zinc-100/20 font-extrabold text-xs px-4.5 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={12} className={isSyncingZNS ? 'animate-spin' : ''} />
                <span>Đồng bộ từ Zalo Cloud</span>
              </button>
            </div>

            {/* Bảng danh sách templates */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <thead>
                    <tr className="bg-zinc-100/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800/80 text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-5">Template ID</th>
                      <th className="py-3 px-5">Tên Mẫu Tin</th>
                      <th className="py-3 px-4">Tham Số Động (Variables)</th>
                      <th className="py-3 px-4 text-center">Trạng Thái Zalo</th>
                      <th className="py-3 px-5 text-center">Xem Trước</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {templates.map((temp) => (
                      <tr key={temp.id} className="hover:bg-zinc-50/40 dark:bg-zinc-900/30 transition">
                        {/* ID */}
                        <td className="py-3.5 px-5 font-mono font-bold text-zinc-500 dark:text-zinc-400">{temp.id}</td>
                        {/* Tên mẫu */}
                        <td className="py-3.5 px-5 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-extrabold">{temp.name}</td>
                        {/* Biến */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {temp.mappedFields.map((f) => (
                              <span key={f} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* Trạng thái */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            temp.status === 'approved' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : temp.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {temp.status === 'approved' ? '● Đang áp dụng' : temp.status === 'pending' ? '● Chờ duyệt' : '● Bị từ chối'}
                          </span>
                        </td>
                        {/* Thao tác */}
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => setPreviewTemplate(temp)}
                            className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:text-white rounded-lg flex items-center justify-center border-none text-zinc-600 dark:text-zinc-400 cursor-pointer transition shadow-3xs"
                            title="Xem trước cấu trúc tin nhắn"
                          >
                            <Eye size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= MODAL XEM TRƯỚC TEMPLATE BONG BÓNG ZALO ================= */}
            {previewTemplate && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
                onClick={() => setPreviewTemplate(null)}
              >
                <div 
                  className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col gap-4 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/80 border-none w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition shadow-2xs font-bold text-xs"
                  >
                    ✕
                  </button>

                  <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-[9px] text-zinc-900 dark:text-zinc-100 font-black uppercase tracking-wider">{previewTemplate.id}</span>
                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 leading-tight mt-0.5">{previewTemplate.name}</h4>
                  </div>

                  {/* Bong bóng chat giả lập điện thoại */}
                  <div className="bg-zinc-200 dark:bg-zinc-800/80 rounded-2xl p-4 border border-stone-300/40 shadow-inner mt-1">
                    <div className="bg-white rounded-2xl p-3.5 shadow-md border border-zinc-200 dark:border-zinc-800 flex flex-col">
                      {renderZnsLivePreview(previewTemplate)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    className="w-full py-2 bg-zinc-200 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-xs border-none cursor-pointer mt-2"
                  >
                    Đóng khung
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: DỊCH VỤ EMAIL (ESP) ================= */}
        {activeTab === 'email' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cột trái: Cấu hình cổng gửi */}
            <div className="lg:col-span-2 flex flex-col gap-6 max-w-2xl">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">Cổng Gửi Email Marketing & Giao Dịch</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Kết nối hạ tầng qua nhà cung cấp SMTP / Cloud ESP để tối đa hóa hiệu suất hộp thư đến của khách đặt phòng.
                </p>
              </div>

              <form onSubmit={handleSaveEmailConfig} className="flex flex-col gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Lựa chọn nhà cung cấp */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                      <Server size={11} /> Nhà cung cấp cổng *
                    </label>
                    <select
                      value={emailProvider}
                      onChange={(e) => setEmailProvider(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
                    >
                      <option value="resend">Resend (Gợi ý tối giản Next.js)</option>
                      <option value="sendgrid">SendGrid (Phổ thông)</option>
                      <option value="ses">Amazon SES (Khối lượng lớn / Tiết kiệm)</option>
                      <option value="smtp">Custom SMTP Server (Cá nhân hóa)</option>
                    </select>
                  </div>

                  {/* Địa chỉ gửi đại diện */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Địa chỉ Email Gửi *</label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>
                </div>

                {/* API Key */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Khóa API Bảo Mật *</label>
                  <input
                    type="password"
                    required
                    value={emailApiKey}
                    onChange={(e) => setEmailApiKey(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                  />
                </div>

                {/* Tên hiển thị người gửi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Tên Người Gửi Hiển Thị *</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                  />
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isEmailLoading}
                    className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Check size={12} className="stroke-[3]" />
                    <span>Lưu Cấu Hình Cổng</span>
                  </button>
                </div>
              </form>

              {/* KHỐI PHÂN HỆ GỬI THỬ NGHIỆM */}
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-3 mt-2">
                <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Send size={13} /> Thử nghiệm cổng gửi tức thời
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  Nhập một địa chỉ email khả dụng của bạn để kiểm thử cấu hình gửi thư thực tế trước khi kích hoạt chiến dịch hàng loạt.
                </span>
                <form onSubmit={handleSendTestEmail} className="flex gap-2 items-center mt-1">
                  <input
                    type="email"
                    required
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="ví dụ: admin.test@gmail.com"
                    className="bg-white border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 flex-grow shadow-3xs"
                  />
                  <button
                    type="submit"
                    disabled={isEmailLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl border-none cursor-pointer transition active:scale-95 shadow-3xs disabled:opacity-50"
                  >
                    Gửi tin thử
                  </button>
                </form>
              </div>
            </div>

            {/* Cột phải: Trạng thái tên miền */}
            <div className="flex flex-col gap-5 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider block">BẢO MẬT & XÁC THỰC</span>
                <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">Xác thực tên miền: dancinhome.vn</h4>
              </div>

              {/* Bản ghi SPF */}
              <div className="flex flex-col gap-2 bg-white border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">SPF Record (Sender Policy Framework)</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-green-50 text-green-700 border border-green-200">
                    Khớp 🟢
                  </span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded border border-zinc-200 dark:border-zinc-800/80 block break-all leading-tight select-all">
                  v=spf1 include:resend.com ~all
                </span>
              </div>

              {/* Bản ghi DKIM */}
              <div className="flex flex-col gap-2 bg-white border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">DKIM Key (DomainKeys Identified Mail)</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-green-50 text-green-700 border border-green-200">
                    Khớp 🟢
                  </span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded border border-zinc-200 dark:border-zinc-800/80 block break-all leading-tight select-all">
                  resend-key._domainkey.dancinhome.vn
                </span>
              </div>

              {/* Bản ghi DMARC */}
              <div className="flex flex-col gap-2 bg-white border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">DMARC Policy (Domain-based Auth)</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-green-50 text-green-700 border border-green-200">
                    Kích hoạt 🟢
                  </span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded border border-zinc-200 dark:border-zinc-800/80 block break-all leading-tight select-all">
                  v=DMARC1; p=quarantine; pct=100;
                </span>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200 text-blue-800 rounded-2xl flex gap-2.5 mt-2">
                <ShieldCheck size={20} className="text-blue-600 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider">Độ uy tín tên miền cao</span>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                    Tên miền của bạn đã vượt qua tất cả các bộ lọc chính của Gmail và Microsoft, giảm tối đa khả năng rơi vào thư rác.
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
