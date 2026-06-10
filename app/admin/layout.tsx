'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  CalendarRange, 
  DoorOpen, 
  Ticket, 
  Users, 
  Megaphone, 
  Sparkles, 
  UserCircle2, 
  Settings, 
  ShieldAlert,
  Award,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react'
import InternalAIAssistant from '@/components/admin/InternalAIAssistant'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAIOpen, setIsAIOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [adminName, setAdminName] = useState('Admin CS')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Đọc theme từ localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('bliss_admin_theme') || 'light'
      setTheme(savedTheme as 'light' | 'dark')
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('bliss_admin_theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const isLoginPage = pathname === '/admin/login'

  // Đồng bộ hóa trạng thái thu gọn của Sidebar với localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('bliss_sidebar_collapsed')
      if (savedState === 'true') {
        setIsCollapsed(true)
      }
    }
  }, [])

  const toggleSidebar = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bliss_sidebar_collapsed', String(nextState))
    }
  }

  // Kiểm tra phiên đăng nhập bảo mật
  useEffect(() => {
    if (isLoginPage) {
      setIsAuthChecking(false)
      return
    }

    const checkAuth = () => {
      const adminSession = sessionStorage.getItem('bliss_admin')
      if (!adminSession) {
        router.push('/admin/login')
      } else {
        try {
          const parsed = JSON.parse(adminSession)
          if (parsed && parsed.name) {
            setAdminName(parsed.name)
          }
        } catch (e) {
          console.error(e)
        }
        setIsAuthChecking(false)
      }
    }
    
    checkAuth()
  }, [pathname, isLoginPage, router])

  const handleLogout = () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi cổng quản trị Bliss Home không?')) return
    sessionStorage.removeItem('bliss_admin')
    router.push('/admin/login')
  }

  // Danh sách các mục Menu của Sidebar Admin cùng đường dẫn cụ thể
  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin' },
    { id: 'dashboard', label: 'Báo cáo & Phân tích', icon: BarChart3, path: '/admin/dashboard' },
    { id: 'bookings', label: 'Quản lý Đơn Booking', icon: CalendarRange, path: '/admin/bookings' },
    { id: 'rooms', label: 'Quản lý Phòng', icon: DoorOpen, path: '/admin/rooms' },
    { id: 'vouchers', label: 'Quản lý Voucher', icon: Ticket, path: '/admin/vouchers' },
    { id: 'crm', label: 'Khách hàng & CRM', icon: Users, path: '/admin/customers' },
    { id: 'memberships', label: 'Hạng Thành Viên', icon: Award, path: '/admin/memberships' },
    { 
      id: 'marketing', 
      label: 'Tự Động Hóa', 
      icon: Megaphone, 
      path: '/admin/automation',
      children: [
        { id: 'automation-list', label: 'Danh sách kịch bản', path: '/admin/automation' },
        { id: 'automation-flow', label: 'Kịch bản vẽ (Canvas)', path: '/admin/automation/flow' }
      ]
    },
  ]

  /**
   * Bắt lỗi an toàn khi render Children
   * Để đảm bảo bất kỳ trang con nào có lỗi logic cũng không làm sập toàn bộ khung hệ thống
   */
  const renderChildrenSafely = () => {
    try {
      return children
    } catch (error) {
      console.error('Lỗi nghiêm trọng khi hiển thị trang con Admin:', error)
      return (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center flex flex-col items-center gap-3 my-6 mx-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-700">
            <ShieldAlert size={24} />
          </div>
          <h3 className="font-extrabold text-stone-850 text-base">Hệ thống ghi nhận lỗi hiển thị</h3>
          <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
            Dữ liệu trang con quản trị đang gặp sự cố khi xử lý dữ liệu. Vui lòng liên hệ nhóm Dancin Builder hoặc kỹ thuật viên hệ thống để kiểm tra chi tiết.
          </p>
        </div>
      )
    }
  }

  // Nếu là trang đăng nhập, bỏ qua toàn bộ khung Sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  // Nếu đang quét phiên đăng nhập, hiển thị loading screen glassmorphic
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0A273A] flex flex-col items-center justify-center gap-4 text-white font-sans">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] text-white/50 font-black uppercase tracking-widest animate-pulse">
          Đang kiểm tra bảo mật...
        </span>
      </div>
    )
  }

  return (
    <div className="h-screen max-h-screen bg-stone-50 flex font-sans antialiased text-stone-800 relative overflow-hidden">
      
      {/* 1. SIDEBAR CO-EX FIXED/STICKY & SCROLLABLE */}
      <aside className={`bg-[#0A273A] text-white flex flex-col flex-shrink-0 border-r border-white/10 shadow-lg z-20 transition-all duration-300 h-screen overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        
        {/* Logo & Brand Title (Collapsible Header Layout) */}
        <div className={`border-b border-white/10 flex items-center justify-between bg-stone-950/20 transition-all duration-300 flex-shrink-0 ${
          isCollapsed ? 'flex-col gap-3.5 px-3 py-5' : 'pl-6 pr-3 py-5'
        }`}>
          {isCollapsed ? (
            <>
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1 overflow-hidden shadow-inner">
                <img src="/logo.png" alt="Bliss Home Logo" className="w-full h-full object-contain" />
              </div>
              <button 
                onClick={toggleSidebar} 
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition active:scale-90 cursor-pointer"
                title="Mở rộng menu"
              >
                <ChevronRight size={20} />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1 overflow-hidden flex-shrink-0 shadow-inner">
                  <img src="/logo.png" alt="Bliss Home Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight leading-none uppercase text-white">Bliss Home</h1>
                  <span className="text-[9px] text-white/55 tracking-widest uppercase block mt-0.5 font-bold">Admin Portal</span>
                </div>
              </div>
              <button 
                onClick={toggleSidebar} 
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 hover:border-white/25 transition active:scale-90 cursor-pointer shadow-sm translate-x-1"
                title="Thu gọn menu"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          )}
        </div>

        {/* Menu Navigation Links (Scrolls internally if sidebar overflows) */}
        <nav className={`flex-grow p-4 flex flex-col gap-1.5 mt-2 transition-all duration-300 overflow-y-auto ${
          isCollapsed ? 'px-2' : ''
        }`}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === 'marketing'
              ? pathname.startsWith('/admin/automation')
              : pathname === item.path

            const isChildActive = (childPath: string) => pathname === childPath

            return (
              <div key={item.id} className="flex flex-col gap-1 w-full">
                <button
                  onClick={() => router.push(item.path)}
                  className={
                    isCollapsed
                      ? `w-12 h-12 mx-auto rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-950/20'
                            : 'text-stone-300 hover:text-white border-white/10 hover:border-white/25 hover:bg-white/5'
                        }`
                      : `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all border-none text-left cursor-pointer ${
                          isActive
                            ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-md'
                            : 'text-stone-300 hover:bg-white/5 hover:text-white'
                        }`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={isCollapsed ? 20 : 16} className={isActive ? 'text-white' : 'text-stone-400'} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
                
                {/* Render children submenus if not collapsed and main item has children and is active */}
                {!isCollapsed && 'children' in item && item.children && isActive && (
                  <div className="flex flex-col gap-1 pl-7 pr-1 py-1 border-l border-white/10 ml-6 animate-in slide-in-from-top-1 duration-200">
                    {item.children.map((child) => {
                      const isSubActive = isChildActive(child.path)
                      return (
                        <button
                          key={child.id}
                          onClick={() => router.push(child.path)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11.5px] font-semibold transition-all border-none text-left cursor-pointer ${
                            isSubActive
                              ? 'bg-white/10 text-white font-bold'
                              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-emerald-400 scale-110 shadow-xs' : 'bg-stone-500'}`} />
                          <span>{child.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Thin Bottom Config / Aligned Settings & Logout at the very bottom of the screen */}
        <div className="p-4 border-t border-white/10 bg-stone-950/20 flex flex-col gap-2.5 flex-shrink-0">
          {/* Cài đặt (Linked to integrations path) */}
          <button
            onClick={() => router.push('/admin/integrations')}
            className={
              isCollapsed
                ? `w-12 h-12 mx-auto rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    pathname === '/admin/integrations'
                      ? 'bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-950/20'
                      : 'text-stone-300 hover:text-white border-white/10 hover:border-white/25 hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all border-none text-left cursor-pointer ${
                    pathname === '/admin/integrations'
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-md'
                      : 'text-stone-300 hover:bg-white/5 hover:text-white'
                  }`
            }
            title={isCollapsed ? "Cài đặt" : undefined}
          >
            <Settings size={isCollapsed ? 20 : 16} className={pathname === '/admin/integrations' ? 'text-white' : 'text-stone-400'} />
            {!isCollapsed && <span>Cài đặt</span>}
          </button>

          {/* Đăng xuất */}
          <button
            onClick={handleLogout}
            className={
              isCollapsed
                ? `w-12 h-12 mx-auto rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer text-red-350 hover:text-white border-red-950/30 hover:border-red-500/30 hover:bg-red-950/20 bg-transparent`
                : `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all border-none text-left cursor-pointer text-red-350 hover:bg-red-950/25 hover:text-white bg-transparent`
            }
            title={isCollapsed ? "Đăng xuất" : undefined}
          >
            <ShieldAlert size={isCollapsed ? 20 : 16} className="text-red-400" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>

          <span className="text-[9px] text-stone-550 font-mono block text-center select-none mt-1">
            {isCollapsed ? 'v2.4' : 'Version 2.4.0 • Dancin Builder'}
          </span>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER AREA (Header stays frozen, Content scrolls) */}
      <div className="flex-grow flex flex-col h-screen max-h-screen relative overflow-hidden">
        
        {/* TOP HEADER CONTROLS (Always fixed at the top) */}
        <header className="bg-white border-b border-stone-200/80 h-16 px-6 md:px-8 flex items-center justify-between flex-shrink-0 shadow-xs select-none">
          <div>
            <h2 className="text-sm md:text-base font-extrabold text-[#0A273A] uppercase tracking-wider">
              Hệ Thống Quản Trị Bliss Home
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* NÚT TOGGLE KÍCH HOẠT BLISS COPILOT AI */}
            <button
              onClick={() => setIsAIOpen(!isAIOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-sm border cursor-pointer flex items-center gap-1.5 ${
                isAIOpen
                  ? 'bg-emerald-700 border-emerald-700 text-white shadow-emerald-700/10'
                  : 'bg-white border-stone-200 hover:border-emerald-700 hover:text-emerald-700 text-[#0a273a]'
              }`}
            >
              <Sparkles size={13} className={isAIOpen ? 'text-white animate-spin' : 'text-emerald-500'} />
              <span>Bliss Copilot 🤖</span>
            </button>

            {/* NÚT CHUYỂN ĐỔI LIGHT/DARK MODE */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-stone-200 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-emerald-700 hover:text-emerald-700 flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer"
              title={theme === 'light' ? "Chuyển sang Chế độ tối" : "Chuyển sang Chế độ sáng"}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 border border-stone-200 shadow-inner overflow-hidden">
                <UserCircle2 size={20} />
              </div>
              <span className="hidden sm:inline text-xs font-extrabold text-[#0A273A] uppercase">{adminName}</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT WRAPPER */}
        <div className="flex-grow p-6 md:p-8 bg-stone-50 overflow-y-auto">
          {renderChildrenSafely()}
        </div>
      </div>

      {/* 3. INTERNAL AI SLIDE-OVER CO-PILOT */}
      <InternalAIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  )
}
