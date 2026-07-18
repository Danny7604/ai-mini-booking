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
        sessionStorage.setItem('dancin_admin', JSON.stringify(authenticatedUser))
        
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased text-zinc-900 dark:text-zinc-50">
      
      {/* HỌA TIẾT NỀN MINIMALIST */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.06] pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-10 left-10 w-48 h-48 rounded-full border border-zinc-200 dark:border-zinc-800 opacity-20 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full border border-zinc-200 dark:border-zinc-800 opacity-20 pointer-events-none" />

      {/* CUSTOM TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-white dark:text-zinc-950 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5 animate-in slide-in-from-top duration-300 font-sans">
          <div className="w-5 h-5 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100">
            <Check size={11} className="stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* CARD ĐĂNG NHẬP CHÍNH */}
      <div className="w-full max-w-md bg-card border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 rounded-2xl shadow-xs flex flex-col gap-6 animate-in zoom-in-95 duration-300 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3.5 text-center">
          <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center p-2.5 shadow-xs">
            <img src="/logo.png" alt="Dancin Home Logo" className="w-full h-full object-contain filter dark:invert" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-wider text-zinc-900 dark:text-zinc-50 uppercase">Dancin Home</h1>
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase block mt-1 font-bold">Admin Portal Security</span>
          </div>
        </div>

        <div className="border-t border-zinc-150 dark:border-zinc-800 pt-5">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 text-center tracking-wide">
            Đăng Nhập Quản Trị
          </h2>
          <p className="text-xs text-muted-foreground text-center mt-1.5 leading-relaxed">
            Vui lòng điền thông tin tài khoản để truy cập hệ thống quản trị Dancin Home Sài Gòn.
          </p>
        </div>

        {/* Khung hiển thị lỗi */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl flex gap-2 items-start text-xs font-semibold animate-in shake duration-300">
            <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Biểu mẫu đăng nhập */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs font-semibold">
          
          {/* Tài khoản */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} /> Tên Tài Khoản
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ví dụ: admintest"
                className="w-full bg-zinc-50 hover:bg-zinc-100/80 dark:bg-zinc-900 dark:hover:bg-zinc-900/80 focus:bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-3.5 text-xs font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition duration-200"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={12} /> Mật Khẩu Truy Cập
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ví dụ: admin123"
                className="w-full bg-zinc-50 hover:bg-zinc-100/80 dark:bg-zinc-900 dark:hover:bg-zinc-900/80 focus:bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-3.5 text-xs font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition duration-200 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent border-none cursor-pointer p-0"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Nút gửi form */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 border-none shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
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

        {/* Demo Account Indicator */}
        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-4.5 rounded-xl flex flex-col gap-2 mt-1 select-none">
          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Sparkles size={11} className="text-amber-500" /> Tài khoản kiểm thử
          </span>
          <div className="flex flex-col gap-1.5 text-[10px] text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-semibold leading-relaxed">
            <div className="flex justify-between border-b border-zinc-200/40 dark:border-zinc-800/40 pb-1.5">
              <span className="text-muted-foreground">Tài khoản:</span>
              <span className="font-bold font-mono">admintest</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-muted-foreground">Mật khẩu:</span>
              <span className="font-bold font-mono">admin123</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
