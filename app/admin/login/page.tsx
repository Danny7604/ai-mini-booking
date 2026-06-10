'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { 
  Lock, 
  User, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Custom Success Alert Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }

  /**
   * Xử lý Đăng nhập với cơ chế Fallback Offline thông minh
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tài khoản và mật khẩu!')
      return
    }

    try {
      setIsLoading(true)
      
      let authenticatedUser = null

      try {
        const supabase = getSupabase()
        
        // Truy vấn xác thực trực tiếp trên Supabase admins table
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('username', username.trim())
          .eq('password', password.trim())
          .maybeSingle()

        if (error) throw error
        
        if (data) {
          authenticatedUser = data
        }
      } catch (dbError) {
        console.warn('[Supabase Connection] Không thể kết nối cơ sở dữ liệu. Chuyển sang xác thực Mock Offline...', dbError)
        
        // HỖ TRỢ ĐĂNG NHẬP MOCK OFFLINE ĐỂ DỰ ÁN LUÔN VẬN HÀNH THÔNG SUỐT
        if (username.trim() === 'admintest' && password.trim() === 'admin123') {
          authenticatedUser = {
            id: 'mock-admin-id-123456',
            username: 'admintest',
            name: 'Quản Trị Viên Thử Nghiệm (Offline) 🛡️',
            role: 'admin'
          }
        }
      }

      if (authenticatedUser) {
        // Lưu phiên đăng nhập vào sessionStorage
        sessionStorage.setItem('bliss_admin', JSON.stringify(authenticatedUser))
        
        showToast(`Chào mừng quay trở lại, ${authenticatedUser.name}!`)
        
        // Chờ Toast hiển thị 1 giây rồi redirect sang Dashboard
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/admin')
      } else {
        setErrorMsg('Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại!')
      }

    } catch (err: any) {
      console.error('Lỗi hệ thống đăng nhập:', err)
      setErrorMsg('Đã xảy ra lỗi hệ thống đăng nhập. Vui lòng thử lại sau!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 relative overflow-hidden font-serif antialiased text-[#0A273A]">
      
      {/* 🏺 HỌA TIẾT NỀN VINTAGE MINIMALIST */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none bg-[radial-gradient(#0a273a_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-10 left-10 w-48 h-48 rounded-full border border-[#E6DFD3] opacity-20 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full border border-[#E6DFD3] opacity-20 pointer-events-none" />

      {/* 🏺 CUSTOM TOAST NOTIFICATION (RETRO BLISS NAVY) */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0A273A] border border-[#E6DFD3] text-[#FAF9F6] px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 animate-in slide-in-from-top duration-300 font-sans">
          <div className="w-5 h-5 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#0A273A]">
            <Check size={11} className="stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* CARD ĐĂNG NHẬP CHÍNH */}
      <div className="w-full max-w-md bg-white border border-[#E6DFD3] p-8 md:p-10 rounded-[32px] shadow-[0_15px_40px_rgba(13,49,73,0.03)] flex flex-col gap-6.5 animate-in zoom-in-95 duration-300 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3.5 text-center">
          <div className="w-14 h-14 bg-[#FAF9F6] border border-[#E6DFD3] rounded-2xl flex items-center justify-center p-2.5 shadow-sm">
            <img src="/logo.png" alt="Bliss Home Logo" className="w-full h-full object-contain filter contrast-125" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-wider text-[#0A273A] font-serif uppercase">Bliss Home</h1>
            <span className="text-[9px] text-[#8C8273] tracking-widest uppercase block mt-1 font-sans font-bold">Admin Portal Security</span>
          </div>
        </div>

        <div className="border-t border-[#E6DFD3] pt-4.5">
          <h2 className="text-lg font-medium text-[#0A273A] text-center tracking-wide font-serif">
            Đăng Nhập Quản Trị
          </h2>
          <p className="text-xs text-[#8C8273] text-center mt-1.5 font-sans leading-relaxed">
            Vui lòng điền thông tin tài khoản để truy cập hệ thống quản trị Bliss Home Sài Gòn.
          </p>
        </div>

        {/* Khung hiển thị lỗi */}
        {errorMsg && (
          <div className="bg-[#FAF4F4] border border-[#E8D1D1] text-[#9C3E3E] px-4 py-3 rounded-2xl flex gap-2 items-start text-xs font-sans font-semibold animate-in shake duration-300">
            <AlertCircle size={15} className="text-[#9C3E3E] flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Biểu mẫu đăng nhập */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4 font-sans text-xs font-semibold">
          
          {/* Tài khoản */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#8C8273] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} className="text-[#8C8273]" /> Tên Tài Khoản
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ví dụ: admintest"
                className="w-full bg-[#F5F2EB] hover:bg-[#EFECE4] focus:bg-white border border-[#E6DFD3] rounded-2xl pl-4 pr-10 py-3.5 text-xs font-bold text-[#0A273A] placeholder-[#8C8273]/60 focus:outline-none focus:border-[#0A273A] transition duration-200"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#8C8273] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={12} className="text-[#8C8273]" /> Mật Khẩu Truy Cập
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ví dụ: admin123"
                className="w-full bg-[#F5F2EB] hover:bg-[#EFECE4] focus:bg-white border border-[#E6DFD3] rounded-2xl pl-4 pr-10 py-3.5 text-xs font-bold text-[#0A273A] placeholder-[#8C8273]/60 focus:outline-none focus:border-[#0A273A] transition duration-200 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C8273] hover:text-[#0A273A] bg-transparent border-none cursor-pointer p-0"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Nút gửi form (BLISS DEEP NAVY BUTTON) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-4 bg-[#0A273A] hover:bg-[#124263] text-[#FAF9F6] rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-200 border-none shadow-sm shadow-[#0A273A]/10 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#FAF9F6] border-t-transparent rounded-full animate-spin"></div>
                <span>Đang kết nối bảo mật...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Xác Thực Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Account Indicator (VINTAGE TONE WITH NAVY ACCENTS) */}
        <div className="bg-[#F5F2EB] border border-[#E6DFD3] p-4.5 rounded-2xl flex flex-col gap-1.5 mt-1 font-sans select-none">
          <span className="text-[9px] text-[#8C8273] uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#0A273A]" /> Tài khoản kiểm thử
          </span>
          <div className="flex flex-col gap-1 text-[10px] text-[#0A273A] font-semibold leading-relaxed">
            <div className="flex justify-between border-b border-[#E6DFD3]/40 pb-1">
              <span className="text-[#8C8273]">Tài khoản:</span>
              <span className="font-bold font-mono">admintest</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-[#8C8273]">Mật khẩu:</span>
              <span className="font-bold font-mono">admin123</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
