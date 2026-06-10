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
  Moon,
  Menu,
  X
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
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center flex flex-col items-center gap-3 my-6 mx-4">
          <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldAlert size={24} />
          </div>
          <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base">Hệ thống ghi nhận lỗi hiển thị</h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-white font-sans">
        <div className="w-10 h-10 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest animate-pulse">
          Đang kiểm tra bảo mật...
        </span>
      </div>
    )
  }

  return (
    <div className="h-screen max-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans antialiased text-zinc-800 dark:text-zinc-200 relative overflow-hidden">
      
      {/* 1. SIDEBAR CO-EX FIXED/STICKY & SCROLLABLE */}
      <aside className={`hidden md:flex bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex-col flex-shrink-0 border-r border-zinc-200 dark:border-zinc-850 shadow-xs z-20 transition-all duration-300 h-screen overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        
        {/* Logo & Brand Title (Collapsible Header Layout) */}
        <div className={`border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between bg-zinc-100/30 dark:bg-zinc-900/20 transition-all duration-300 flex-shrink-0 ${
          isCollapsed ? 'flex-col gap-3.5 px-3 py-5' : 'pl-6 pr-3 py-5'
        }`}>
          {isCollapsed ? (
            <>
              <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center p-1 overflow-hidden shadow-inner">
                <img src="/logo.png" alt="Bliss Home Logo" className="w-full h-full object-contain" />
              </div>
              <button 
                onClick={toggleSidebar} 
                className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-card flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition active:scale-90 cursor-pointer shadow-xs"
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
                  <h1 className="text-base font-black tracking-tight leading-none uppercase text-zinc-900 dark:text-zinc-50">Bliss Home</h1>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase block mt-0.5 font-bold">Admin Portal</span>
                </div>
              </div>
              <button 
                onClick={toggleSidebar} 
                className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-card flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition active:scale-90 cursor-pointer shadow-xs translate-x-1"
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
                          isActive ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-xs' : 'text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`
                      : `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all border-none text-left cursor-pointer ${
                          isActive ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs' : 'text-zinc-650 dark:text-zinc-450 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-zinc-950 dark:hover:text-zinc-100'
                        }`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={isCollapsed ? 20 : 16} className={isActive ? 'text-white dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-450'} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
                
                {/* Render children submenus if not collapsed and main item has children and is active */}
                {!isCollapsed && 'children' in item && item.children && isActive && (
                  <div className="flex flex-col gap-1 pl-7 pr-1 py-1 border-l border-zinc-200 dark:border-zinc-800 ml-6 animate-in slide-in-from-top-1 duration-200">
                    {item.children.map((child) => {
                      const isSubActive = isChildActive(child.path)
                      return (
                        <button
                          key={child.id}
                          onClick={() => router.push(child.path)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11.5px] font-semibold transition-all border-none text-left cursor-pointer ${
                            isSubActive ? 'bg-zinc-200/50 dark:bg-zinc-900/60 text-zinc-950 dark:text-zinc-50 font-bold' : 'text-zinc-500 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30'
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
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-100/30 dark:bg-zinc-900/10 flex flex-col gap-2.5 flex-shrink-0">
          {/* Cài đặt (Linked to integrations path) */}
          <button
            onClick={() => router.push('/admin/integrations')}
            className={
              isCollapsed
                ? `w-12 h-12 mx-auto rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    pathname === '/admin/integrations' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-xs' : 'text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`
                : `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all border-none text-left cursor-pointer ${
                    pathname === '/admin/integrations' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs' : 'text-zinc-650 dark:text-zinc-450 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-zinc-950 dark:hover:text-zinc-100'
                  }`
            }
            title={isCollapsed ? "Cài đặt" : undefined}
          >
            <Settings size={isCollapsed ? 20 : 16} className={pathname === '/admin/integrations' ? 'text-white dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-450'} />
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

          <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-mono block text-center select-none mt-1">
            {isCollapsed ? 'v2.4' : 'Version 2.4.0 • Dancin Builder'}
          </span>
        </div>
      </aside>

      {/* Mobile Sidebar overlay backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar drawer */}
      <aside className={`fixed inset-y-0 left-0 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-850 shadow-xl z-50 transition-transform duration-300 md:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between pl-6 pr-3 py-5 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-100/30 dark:bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1 overflow-hidden flex-shrink-0 shadow-inner">
              <img src="/logo.png" alt="Bliss Home Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none uppercase text-zinc-900 dark:text-zinc-50">Bliss Home</h1>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase block mt-0.5 font-bold">Admin Portal</span>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-card flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow p-4 flex flex-col gap-1.5 mt-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === 'marketing'
              ? pathname.startsWith('/admin/automation')
              : pathname === item.path

            const isChildActive = (childPath: string) => pathname === childPath

            return (
              <div key={item.id} className="flex flex-col gap-1 w-full">
                <button
                  onClick={() => {
                    router.push(item.path)
                    setIsMobileOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all border-none text-left cursor-pointer ${
                    isActive ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs' : 'text-zinc-650 dark:text-zinc-450 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-zinc-950 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-450'} />
                  <span>{item.label}</span>
                </button>

                {!isActive && item.children && (
                  <div className="border-l border-zinc-200 dark:border-zinc-800 ml-6 animate-in slide-in-from-top-1 duration-200">
                    {item.children.map((child) => {
                      const isSubActive = isChildActive(child.path)
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            router.push(child.path)
                            setIsMobileOpen(false)
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11.5px] font-semibold transition-all border-none text-left cursor-pointer ${
                            isSubActive ? 'bg-zinc-200/50 dark:bg-zinc-900/60 text-zinc-950 dark:text-zinc-50 font-bold' : 'text-zinc-500 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30'
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

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-100/30 dark:bg-zinc-900/10 flex flex-col gap-2.5 flex-shrink-0">
          <button
            onClick={() => {
              router.push('/admin/integrations')
              setIsMobileOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all border-none text-left cursor-pointer ${
              pathname === '/admin/integrations' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs' : 'text-zinc-650 dark:text-zinc-455 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-zinc-950 dark:hover:text-zinc-100'
            }`}
          >
            <Settings size={16} className={pathname === '/admin/integrations' ? 'text-white dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-450'} />
            <span>Cài đặt</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold text-rose-600 hover:bg-rose-500/10 transition border-none text-left cursor-pointer"
          >
            <UserCircle2 size={16} />
            <span>Đăng xuất</span>
          </button>

          <span className="text-[9px] text-zinc-455 dark:text-zinc-500 font-mono block text-center select-none mt-1">
            Version 2.4.0 • Dancin Builder
          </span>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER AREA (Header stays frozen, Content scrolls) */}
      <div className="flex-grow flex flex-col h-screen max-h-screen relative overflow-hidden">
        
        {/* TOP HEADER CONTROLS (Always fixed at the top) */}
        <header className="bg-card border-b border-zinc-200 dark:border-zinc-850 h-16 px-6 md:px-8 flex items-center justify-between flex-shrink-0 shadow-xs select-none">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition cursor-pointer shadow-xs"
              title="Mở menu"
            >
              <Menu size={18} />
            </button>
            <h2 className="text-sm md:text-base font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              Hệ Thống Quản Trị Bliss Home
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* NÚT TOGGLE KÍCH HOẠT BLISS COPILOT AI */}
            <button
              onClick={() => setIsAIOpen(!isAIOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-sm border cursor-pointer flex items-center gap-1.5 ${
                isAIOpen ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-xs' : 'bg-card border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-700 dark:text-zinc-350'
              }`}
            >
              <Sparkles size={13} className={isAIOpen ? 'text-white animate-spin' : 'text-emerald-500'} />
              <span>Bliss Copilot 🤖</span>
            </button>

            {/* NÚT CHUYỂN ĐỔI LIGHT/DARK MODE */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer"
              title={theme === 'light' ? "Chuyển sang Chế độ tối" : "Chuyển sang Chế độ sáng"}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-inner overflow-hidden">
                <UserCircle2 size={20} />
              </div>
              <span className="hidden sm:inline text-xs font-extrabold text-zinc-900 dark:text-zinc-50 uppercase">{adminName}</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT WRAPPER */}
        <div className="flex-grow p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-950/20 overflow-y-auto">
          {renderChildrenSafely()}
        </div>
      </div>

      {/* 3. INTERNAL AI SLIDE-OVER CO-PILOT */}
      <InternalAIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  )
}
