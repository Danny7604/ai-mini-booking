'use client'

import { useState, useEffect } from 'react'
import RoomGallery from '@/components/RoomGallery'
import AIAssistant from '@/components/AIAssistant'

const branches = [
  { value: 'all', label: 'Tất cả chi nhánh 📍' },
  { value: 'Bliss Home - Tân Bình (CS1) 🏡', label: 'Bliss Home - Tân Bình (CS1) 🏡' },
  { value: 'Bliss Home - Quận 10 (CS2) 🏙️', label: 'Bliss Home - Quận 10 (CS2) 🏙️' },
  { value: 'Bliss Home - Quận 5 (CS3) 🪟', label: 'Bliss Home - Quận 5 (CS3) 🪟' },
  { value: 'Bliss Home - Gò Vấp (CS4) 🌸', label: 'Bliss Home - Gò Vấp (CS4) 🌸' },
  { value: 'Bliss Home - Bình Thạnh (CS5) 🌿', label: 'Bliss Home - Bình Thạnh (CS5) 🌿' }
]

export const ROOM_FEATURES = [
  { id: 'bath', label: 'Bồn tắm 🛁' },
  { id: 'cloud', label: 'View săn mây ☁️' },
  { id: 'couple', label: 'Cặp đôi lãng mạn 👩‍❤️‍👨' },
  { id: 'family', label: 'Gia đình / Nhóm 🏡' },
  { id: 'budget', label: 'Tiết kiệm (Dưới 1.5tr) 🏷️' },
  { id: 'pool', label: 'Hồ bơi vô cực 🏊‍♂️' },
  { id: 'forest', label: 'Mộc mạc ấm cúng 🌲' }
]

const generateTimeSlots = () => {
  const slots = []
  for (let h = 0; h < 24; h++) {
    const hourStr = String(h).padStart(2, '0')
    slots.push(`${hourStr}:00`)
    slots.push(`${hourStr}:30`)
  }
  return slots
}

export default function Home() {
  const [currentFilter, setCurrentFilter] = useState('all')
  const [filterLabel, setFilterLabel] = useState('Tất cả phòng nghỉ')

  // States tìm kiếm đầu trang
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedRoomId, setSelectedRoomId] = useState('all')
  
  const [checkinDate, setCheckinDate] = useState('')
  const [checkinTime, setCheckinTime] = useState('14:00')
  const [checkoutDate, setCheckoutDate] = useState('')
  const [checkoutTime, setCheckoutTime] = useState('12:00')
  const [promoCode, setPromoCode] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  // Danh sách phòng nghỉ hoạt động thực tế phục vụ dropdown
  const [availableRoomsList, setAvailableRoomsList] = useState<{ id: string, name: string, branch: string }[]>([
    { id: 'pine-forest-loft', name: 'Pine Forest Loft (Tân Bình CS1) 🏡', branch: 'Bliss Home - Tân Bình (CS1) 🏡' },
    { id: 'valley-view-suite', name: 'Valley View Suite (Quận 10 CS2) 🏙️', branch: 'Bliss Home - Quận 10 (CS2) 🏙️' },
    { id: 'cozy-wooden-cabin', name: 'Cozy Wooden Cabin (Quận 5 CS3) 🪟', branch: 'Bliss Home - Quận 5 (CS3) 🪟' },
    { id: 'sunlit-glass-house', name: 'Sunlit Glass House (Gò Vấp CS4) 🌸', branch: 'Bliss Home - Gò Vấp (CS4) 🌸' },
    { id: 'riverside-nest', name: 'Riverside Nest (Bình Thạnh CS5) 🌿', branch: 'Bliss Home - Bình Thạnh (CS5) 🌿' },
    { id: 'sunset-panorama', name: 'Sunset Panorama (Quận 10 CS2) 🏙️', branch: 'Bliss Home - Quận 10 (CS2) 🏙️' }
  ])

  // Fetch danh sách phòng trống thực tế từ database để đồng bộ dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { getSupabase } = await import('@/lib/supabase')
        const supabase = getSupabase()
        const { data: dbRooms, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('status', 'available')
        
        if (error) throw error

        if (dbRooms && dbRooms.length > 0) {
          const mappedDropdownRooms = dbRooms.map((r: any) => {
            const displayBranch = r.branch.includes('CS1') ? 'Bliss Home - Tân Bình (CS1) 🏡' 
                                : r.branch.includes('CS2') ? 'Bliss Home - Quận 10 (CS2) 🏙️'
                                : r.branch.includes('CS3') ? 'Bliss Home - Quận 5 (CS3) 🪟'
                                : r.branch.includes('CS4') ? 'Bliss Home - Gò Vấp (CS4) 🌸'
                                : 'Bliss Home - Bình Thạnh (CS5) 🌿'
            return {
              id: r.id,
              name: `${r.name}`,
              branch: displayBranch
            }
          })
          setAvailableRoomsList(mappedDropdownRooms)
        }
      } catch (err) {
        console.warn('[Supabase Page Rooms Dropdown] Fallback active:', err)
      }
    }
    fetchRooms()
  }, [])

  // Trigger tự động mở Modal cho khách chốt thẳng phòng
  const [autoOpenTrigger, setAutoOpenTrigger] = useState(0)

  const timeSlots = generateTimeSlots()

  // Khởi tạo ngày checkin hôm nay và checkout ngày mai
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const formatDate = (date: Date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    setCheckinDate(formatDate(today))
    setCheckoutDate(formatDate(tomorrow))
  }, [])

  // Tự động chuẩn hóa và ràng buộc logic ngày/giờ Nhận & Trả phòng
  useEffect(() => {
    if (!checkinDate || !checkoutDate || !checkinTime || !checkoutTime) return

    // 1. Nếu ngày nhận phòng lớn hơn ngày trả phòng -> tự động đẩy ngày trả phòng lên bằng ngày nhận phòng
    if (checkinDate > checkoutDate) {
      setCheckoutDate(checkinDate)
      return
    }

    // 2. Nếu nhận và trả cùng ngày -> bắt buộc giờ trả phòng phải sau giờ nhận phòng tối thiểu 2 tiếng
    if (checkinDate === checkoutDate) {
      const [hIn, mIn] = checkinTime.split(':').map(Number)
      const [hOut, mOut] = checkoutTime.split(':').map(Number)
      
      const timeInMinutes = hIn * 60 + mIn
      const timeOutMinutes = hOut * 60 + mOut

      if (timeOutMinutes < timeInMinutes + 120) {
        let targetMinutes = timeInMinutes + 120
        if (targetMinutes >= 24 * 60) {
          targetMinutes = 24 * 60 - 30 // Giới hạn tối đa trong ngày là 23:30
        }
        const targetH = Math.floor(targetMinutes / 60)
        const targetM = targetMinutes % 60
        const newTime = `${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}`
        setCheckoutTime(newTime)
      }
    }
  }, [checkinDate, checkoutDate, checkinTime, checkoutTime])

  // ==========================================================================
  // LOGIC ĐỒNG BỘ PHẢN ỨNG THÔNG MINH HAI CHIỀU (REACTIVE SYNC)
  // ==========================================================================

  // Khi chọn Chi nhánh: Lọc lại dropdown phòng. Nếu phòng hiện tại không khớp chi nhánh mới -> Reset về 'all'
  const handleBranchChange = (branchVal: string) => {
    setSelectedBranch(branchVal)
    if (branchVal !== 'all') {
      const currentRoomMapping = availableRoomsList.find(r => r.id === selectedRoomId)
      if (currentRoomMapping && currentRoomMapping.branch !== branchVal) {
        setSelectedRoomId('all')
      }
    }
  }

  // Khi chọn thẳng phòng: Tự động nhảy ô Chi nhánh về chi nhánh chứa phòng đó
  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId)
    if (roomId !== 'all') {
      const roomMapping = availableRoomsList.find(r => r.id === roomId)
      if (roomMapping) {
        setSelectedBranch(roomMapping.branch)
      }
    }
  }

  // Lọc danh sách phòng hiển thị trong dropdown chọn phòng dựa vào Chi nhánh được chọn
  const filteredRoomsDropdown = selectedBranch === 'all'
    ? availableRoomsList
    : availableRoomsList.filter(r => r.branch === selectedBranch)

  const handleFilterChange = (filter: string, label: string) => {
    setCurrentFilter(filter)
    setFilterLabel(label)
  }

  const handleAISearchSync = (branchVal: string, roomId: string) => {
    if (branchVal && branchVal !== 'all') {
      setSelectedBranch(branchVal)
    }
    if (roomId && roomId !== 'all') {
      setSelectedRoomId(roomId)
      const roomMapping = availableRoomsList.find(r => r.id === roomId)
      if (roomMapping) {
        setSelectedBranch(roomMapping.branch)
      }
    }
  }

  // Xử lý khi nhấn nút tìm kiếm
  const handleSearchSubmit = () => {
    // Nếu chọn một phòng cụ thể ➜ Kích hoạt mở thẳng Modal đặt phòng
    if (selectedRoomId !== 'all') {
      setAutoOpenTrigger(Date.now())
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F6F5] flex flex-col font-sans antialiased">
      
      {/* HEADER TOP BAR */}
      <header className="w-full bg-[#0A273A] text-white py-4 px-4 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 gap-3 shadow-md">
        <div className="flex items-center gap-3">
          {/* HIGH-FIDELITY BRAND LOGO */}
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner p-1 overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Bliss Home Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none font-sans text-white uppercase">Bliss Home</h1>
          </div>
        </div>
        <div className="text-xs md:text-sm bg-white/10 backdrop-blur-md py-1.5 px-3.5 rounded-full font-medium border border-white/10 flex items-center gap-1.5">
          🎁 Ưu đãi hè 10%: <strong className="text-amber-300 font-extrabold">BLISSSUMMER</strong>
        </div>
      </header>

      {/* THANH TÌM KIẾM HỢP NHẤT THÔNG MINH (UNIFIED INTELLIGENT SEARCH WIDGET) */}
      <section className="w-full max-w-full px-4 lg:px-8 xl:px-12 mt-6">
        <div className="w-full bg-white border border-stone-200/60 rounded-3xl p-5 md:p-6 shadow-md flex flex-col gap-4">
          <h2 className="text-sm font-bold text-stone-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
            🔑 Lên Kế Hoạch Kỳ Nghỉ Tại Bliss Home
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-4 items-end">
            
            {/* HÀNG 1: CHI NHÁNH - PHÒNG NGHĨ - MÃ GIẢM GIÁ */}
            {/* 1. Chọn Chi Nhánh (lg:col-span-4) */}
            <div className="flex flex-col gap-1.5 lg:col-span-4">
              <label className="text-sm md:text-base font-extrabold text-stone-600 uppercase">📍 Chi Nhánh</label>
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200/85 rounded-xl px-3 py-2.5 text-sm md:text-base text-stone-750 outline-none focus:border-[#0A273A] font-bold cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* 2. Chọn Phòng Nghỉ (lg:col-span-4) */}
            <div className="flex flex-col gap-1.5 lg:col-span-4">
              <label className="text-sm md:text-base font-extrabold text-stone-600 uppercase">🚪 Phòng Nghỉ</label>
              <select
                value={selectedRoomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200/85 rounded-xl px-3 py-2.5 text-sm md:text-base text-stone-750 outline-none focus:border-[#0A273A] font-bold cursor-pointer"
              >
                <option value="all">Tất cả phòng nghỉ 🚪</option>
                {filteredRoomsDropdown.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Ô Nhập Mã Giảm Giá (lg:col-span-4) */}
            <div className="flex flex-col gap-1.5 lg:col-span-4">
              <label className="text-sm md:text-base font-extrabold text-stone-600 uppercase">🎟️ Mã Giảm Giá</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã ưu đãi (vd: BLISSSUMMER)..."
                className="w-full bg-stone-50 border border-stone-200/85 rounded-xl px-3 py-2.5 text-sm md:text-base text-stone-750 outline-none focus:border-[#0A273A] font-bold"
              />
            </div>

            {/* HÀNG 2: THỜI GIAN NHẬN / TRẢ & NÚT HÀNH ĐỘNG */}
            {/* 4. Ngày Nhận (lg:col-span-3) */}
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-sm md:text-base font-extrabold text-stone-600 uppercase">📅 Ngày Nhận</label>
              <input
                type="date"
                value={checkinDate}
                onChange={(e) => setCheckinDate(e.target.value)}
                onClick={(e) => { try { if ('showPicker' in e.currentTarget) { (e.currentTarget as any).showPicker(); } } catch (err) {} }}
                className="w-full bg-stone-50 border border-stone-200/85 rounded-xl px-3 py-2.5 text-sm md:text-base text-stone-750 outline-none focus:border-[#0A273A] font-bold cursor-pointer"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* 5. Giờ Nhận (lg:col-span-2) */}
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <label className="text-sm md:text-base font-extrabold text-stone-600 uppercase">⏰ Giờ Nhận</label>
              <select
                value={checkinTime}
                onChange={(e) => setCheckinTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200/85 rounded-xl px-2 py-2.5 text-sm md:text-base text-stone-750 outline-none focus:border-[#0A273A] font-bold cursor-pointer"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* 6. Ngày Trả (lg:col-span-3) */}
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-sm md:text-base font-extrabold text-stone-600 uppercase">📅 Ngày Trả</label>
              <input
                type="date"
                value={checkoutDate}
                onChange={(e) => setCheckoutDate(e.target.value)}
                onClick={(e) => { try { if ('showPicker' in e.currentTarget) { (e.currentTarget as any).showPicker(); } } catch (err) {} }}
                className="w-full bg-stone-50 border border-stone-200/85 rounded-xl px-3 py-2.5 text-sm md:text-base text-stone-750 outline-none focus:border-[#0A273A] font-bold cursor-pointer"
                min={checkinDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* 7. Giờ Trả (lg:col-span-2) */}
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <label className="text-sm md:text-base font-extrabold text-stone-600 uppercase">⏰ Giờ Trả</label>
              <select
                value={checkoutTime}
                onChange={(e) => setCheckoutTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200/85 rounded-xl px-2 py-2.5 text-sm md:text-base text-stone-750 outline-none focus:border-[#0A273A] font-bold cursor-pointer"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* 8. Nút tìm kiếm / đặt nhanh (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <button
                onClick={handleSearchSubmit}
                className="w-full bg-[#0A273A] hover:bg-[#124263] text-white font-extrabold text-base md:text-lg py-2 rounded-xl transition duration-300 shadow-md border-none flex items-center justify-center gap-1.5 cursor-pointer h-[46px]"
              >
                <span>Tìm Phòng Trống</span>
              </button>
            </div>
          </div>

          {/* BỘ LỌC ĐẶC ĐIỂM NỔI BẬT (MULTIPLE FEATURES FILTER) */}
          <div className="border-t border-stone-100 pt-4 mt-2 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs md:text-sm font-extrabold text-[#0A273A] uppercase tracking-wider flex items-center gap-1.5">
                ✨ Lọc theo đặc điểm nổi bật (Chọn nhiều đặc điểm đồng thời):
              </span>
              {selectedFeatures.length > 0 && (
                <button
                  onClick={() => setSelectedFeatures([])}
                  className="text-[11px] font-bold text-red-500 hover:text-red-750 transition flex items-center gap-1 bg-red-50 hover:bg-red-100/80 px-2.5 py-1 rounded-full border border-red-200/40 cursor-pointer"
                >
                  ✕ Xóa tất cả bộ lọc đặc điểm
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {ROOM_FEATURES.map((feat) => {
                const isSelected = selectedFeatures.includes(feat.id)
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFeatures(selectedFeatures.filter(id => id !== feat.id))
                      } else {
                        setSelectedFeatures([...selectedFeatures, feat.id])
                      }
                    }}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-[#0A273A] border-[#0A273A] text-white ring-2 ring-[#0A273A]/20'
                        : 'bg-stone-50 border-stone-250 text-stone-700 hover:border-[#0A273A] hover:text-[#0A273A] hover:bg-white'
                    }`}
                  >
                    {isSelected && <span className="text-[10px]">✓</span>}
                    {feat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER CHIA CỘT */}
      <main className="w-full max-w-full px-4 lg:px-8 xl:px-12 py-6 flex-grow flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* 2/3 Bên trái: Danh sách phòng */}
        <div className="w-full lg:w-2/3 order-2 lg:order-1 flex-grow">
          <RoomGallery 
            currentFilter={currentFilter} 
            filterLabel={filterLabel}
            onClearFilter={() => handleFilterChange('all', 'Tất cả phòng nghỉ')}
            
            checkinDate={checkinDate}
            setCheckinDate={setCheckinDate}
            checkinTime={checkinTime}
            setCheckinTime={setCheckinTime}
            checkoutDate={checkoutDate}
            setCheckoutDate={setCheckoutDate}
            checkoutTime={checkoutTime}
            setCheckoutTime={setCheckoutTime}

            // Đồng bộ dữ liệu tìm kiếm thông minh
            selectedBranch={selectedBranch}
            selectedRoomId={selectedRoomId}
            autoOpenTrigger={autoOpenTrigger}

            // Đồng bộ mã giảm giá hai cổng
            promoCode={promoCode}
            setPromoCode={setPromoCode}

            // Bộ lọc đa đặc điểm phòng
            selectedFeatures={selectedFeatures}
          />
        </div>

        {/* 1/3 Bên phải: AI Chat */}
        <div className="w-full lg:w-1/3 order-1 lg:order-2 flex-shrink-0 lg:pt-[92px]">
          <div className="lg:sticky lg:top-6">
            <AIAssistant 
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
              onAISearchSync={handleAISearchSync}
            />
          </div>
        </div>
      </main>

      {/* RICH BRAND FOOTER */}
      <footer className="w-full bg-[#1A1C19] text-stone-400 py-12 px-4 lg:px-8 xl:px-12 border-t border-stone-800 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Logo & Slogan */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner p-1 overflow-hidden flex-shrink-0">
                <img src="/logo.png" alt="Bliss Home Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-wide uppercase text-white font-sans leading-none">Bliss Home</h3>
              </div>
            </div>
            <p className="text-stone-500 text-xs leading-relaxed max-w-sm">
              Bliss Home Homestay cung cấp chuỗi không gian lưu trú độc bản, tiện nghi và ấm cúng tọa lạc tại các vị trí đắc địa khắp Tp. Hồ Chí Minh.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-stone-400 mt-2">
              <span className="flex items-center gap-1.5">
                📸 Instagram: <strong className="text-white hover:text-sky-300 transition cursor-pointer">@Blisshomestay.Saigon</strong>
              </span>
              <span className="flex items-center gap-1.5">
                🎵 TikTok: <strong className="text-white hover:text-sky-300 transition cursor-pointer">@Bliss.homestay.saigon</strong>
              </span>
            </div>
          </div>

          {/* Chi nhánh & Địa chỉ */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-stone-850 pb-2">
              📍 Hệ Thống Chi Nhánh Bliss Home Sài Gòn
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="flex flex-col gap-2">
                <p>
                  🏠 <strong className="text-white">CS1 (Tân Bình):</strong> 71 Xuân Hồng, Phường 12, Quận Tân Bình.
                </p>
                <p>
                  🏠 <strong className="text-white">CS2 (Quận 10):</strong> 25a Đường 3/2, Phường 11, Quận 10.
                </p>
                <p>
                  🏠 <strong className="text-white">CS3 (Quận 5):</strong> 2N Đường Phạm Hữu Chí, Phường 12, Quận 5.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p>
                  🏠 <strong className="text-white">CS4 (Gò Vấp):</strong> 331/16 Đường Phan Huy ích, Phường 14, Quận Gò Vấp.
                </p>
                <p>
                  🏠 <strong className="text-white">CS5 (Bình Thạnh):</strong> 217/70/5 Đường Bùi Đình Tuý, Phường 14, Quận Bình Thạnh.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-stone-850 text-center text-[10px] text-stone-600">
          <p>&copy; 2026 Bliss Home. Tất cả quyền được bảo lưu. Thiết kế & Phát triển kỹ thuật bởi Dancin Builder.</p>
        </div>
      </footer>
    </div>
  )
}
