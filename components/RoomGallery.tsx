'use client'

import { useState, useEffect } from 'react'

interface Room {
  id: string
  name: string
  price: number
  hourlyPrice: number // Bổ sung giá phòng theo giờ
  rating: number
  reviews: number
  area: number
  capacity: number
  bed: string
  badge: string
  description: string
  amenities: string[]
  tags: string[]
  images: string[]
  branch: string // Thêm thuộc tính chi nhánh
  address: string // Thêm địa chỉ chi nhánh
  isPublished?: boolean
  isFeatured?: boolean
}

const rooms: Room[] = [
  {
    id: "pine-forest-loft",
    name: "Pine Forest Loft (Tân Bình CS1)",
    price: 1200000,
    hourlyPrice: 120000,
    rating: 4.8,
    reviews: 32,
    area: 32,
    capacity: 2,
    bed: "1 Giường King lớn",
    badge: "BÁN CHẠY 🔥",
    branch: "Dancin Home - Tân Bình (CS1) 🏡",
    address: "71 Xuân Hồng, Phường 12, Quận Tân Bình",
    description: "Ẩn mình trên tầng cao nhất dưới mái ngói dốc, Pine Forest Loft mang đến cho bạn cảm giác gác mái châu Âu ấm áp với khung cửa sổ tròn ngắm trọn thành phố. Điểm nhấn tuyệt hảo nhất là bồn tắm gỗ Hinoki thơm nhẹ ngoài ban công, nơi bạn có thể ngâm mình trong nước ấm giữa tiết trời Sài Gòn se lạnh lúc đêm muộn.",
    amenities: [
      "Bồn tắm gỗ ngoài trời",
      "Máy pha cà phê espresso",
      "Ban công ngắm thành phố",
      "Trà thảo mộc miễn phí",
      "Loa Bluetooth Marshall",
      "Lò sưởi mô phỏng ấm áp"
    ],
    tags: ["bath", "couple", "forest", "budget"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1565538810844-1e1194826c01?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "valley-view-suite",
    name: "Valley View Suite (Quận 10 CS2)",
    price: 1800000,
    hourlyPrice: 180000,
    rating: 4.9,
    reviews: 48,
    area: 45,
    capacity: 2,
    bed: "1 Giường King siêu lớn",
    badge: "SỐNG ẢO CỰC CHILL ☁️",
    branch: "Dancin Home - Quận 10 (CS2) 🏙️",
    address: "25a Đường 3/2, Phường 11, Quận 10",
    description: "Valley View Suite là thiên đường cho các tín độ yêu thích ngắm nhìn nhịp sống đô thị. Căn phòng sở hữu hệ cửa kính kịch trần góc rộng 180 độ hướng ra trung tâm thành phố. Mỗi sớm thức dậy hay khi đêm về, bạn chỉ cần kéo nhẹ rèm là cả một khoảng trời rực rỡ ùa vào tầm mắt. Phòng được trang bị bồn tắm kính sang trọng sát cửa sổ và máy chiếu phim thông minh HD riêng.",
    amenities: [
      "Bồn tắm kính sang trọng",
      "Máy chiếu phim HD & Netflix",
      "Ban công kính panorama",
      "Bữa sáng phục vụ tại phòng",
      "Khu vực tiếp khách riêng",
      "Quầy bar mini miễn phí"
    ],
    tags: ["bath", "couple", "cloud"],
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "cozy-wooden-cabin",
    name: "Cozy Wooden Cabin (Quận 5 CS3)",
    price: 2200000,
    hourlyPrice: 220000,
    rating: 4.7,
    reviews: 26,
    area: 60,
    capacity: 4,
    bed: "2 Giường Queen rộng rãi",
    badge: "CHO GIA ĐÌNH 🏡",
    branch: "Dancin Home - Quận 5 (CS3) 🪟",
    address: "2N Đường Phạm Hữu Chí, Phường 12, Quận 5",
    description: "Được dựng hoàn toàn từ những thân gỗ thông mộc mạc nguyên khối mang lại hương thơm tự nhiên và cảm giác ấm cúng đặc biệt ngay giữa lòng phố Hoa Quận 5 cổ kính. Với thiết kế 2 giường lớn rộng rãi, lò sưởi giả lập siêu ấm áp và khoảng ban công nướng BBQ riêng tư, đây là lựa chọn số một cho gia đình nhỏ hoặc nhóm bạn thân muốn cùng nhau tụ họp.",
    amenities: [
      "Lò sưởi giả lập ấm áp",
      "Sân nướng BBQ riêng biệt",
      "Bếp nấu ăn đầy đủ dụng cụ",
      "Bàn ăn gia đình rộng rãi",
      "Máy giặt & máy sấy",
      "Trò chơi board game giải trí"
    ],
    tags: ["family", "forest"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1445262102387-5febbff96d67?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "sunlit-glass-house",
    name: "Sunlit Glass House (Gò Vấp CS4)",
    price: 1500000,
    hourlyPrice: 150000,
    rating: 4.8,
    reviews: 41,
    area: 38,
    capacity: 2,
    bed: "1 Giường King ngập nắng",
    badge: "SỐNG NGHỆ THUẬT 📸",
    branch: "Dancin Home - Gò Vấp (CS4) 🌸",
    address: "331/16 Đường Phan Huy Ích, Phường 14, Quận Gò Vấp",
    description: "Nhà kính ngập nắng được bao bọc bởi 4 bề kính cường lực cao cấp, ẩn mình giữa khu vườn hoa thơ mộng của Dancin Home Gò Vấp. Căn phòng ngập tràn ánh sáng tự nhiên vào ban ngày và là đài quan sát sao trời cực đỉnh khi đêm xuống. Bồn tắm sứ kiểu cổ điển đặt ngay trung tâm phòng sẽ mang đến những bức ảnh check-in sống ảo triệu tim.",
    amenities: [
      "Bồn tắm sứ nghệ thuật",
      "Kính ngắm sao trời ban đêm",
      "Hiên thưởng trà giữa vườn hoa",
      "Hệ thống loa âm trần",
      "Tinh dầu xông thảo mộc",
      "Kính râm chống nắng tự động"
    ],
    tags: ["bath", "couple", "budget"],
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1496062031256-47a19c702c62?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "riverside-nest",
    name: "Riverside Nest (Bình Thạnh CS5)",
    price: 950000,
    hourlyPrice: 95000,
    rating: 4.6,
    reviews: 19,
    area: 28,
    capacity: 2,
    bed: "1 Giường đôi ấm cúng",
    badge: "GIÁ TỐT CỰC CHILL 🍃",
    branch: "Dancin Home - Bình Thạnh (CS5) 🌿",
    address: "217/70/5 Đường Bùi Đình Túy, Phường 14, Quận Bình Thạnh",
    description: "Riverside Nest nằm khép mình sát bên khoảng sân xanh mát rợp bóng tre. Đây là nơi trú ẩn lý tưởng cho những tâm hồn mệt mỏi muốn trốn chạy khỏi ồn ào đô hội. Ban công của phòng được thiết kế võng lưới cực đại treo đè ra khoảng không tĩnh lặng, là vị trí tuyệt vời để bạn nằm đọc sách, thưởng tách trà nóng và lắng nghe âm thanh rì rào.",
    amenities: [
      "Ban công võng lưới ngoài trời",
      "Ấm trà gốm mộc mạc",
      "Đèn đọc sách ấm áp",
      "Xịt chống côn trùng tự nhiên",
      "Cần câu cá thư giãn",
      "Quạt hơi nước êm dịu"
    ],
    tags: ["couple", "budget"],
    images: [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "sunset-panorama",
    name: "Sunset Panorama (Quận 10 CS2)",
    price: 2900000,
    hourlyPrice: 290000,
    rating: 4.95,
    reviews: 54,
    area: 80,
    capacity: 6,
    bed: "3 Giường King sang xịn",
    badge: "BỂ BƠI VÔ CỰC 🏊‍♂️",
    branch: "Dancin Home - Quận 10 (CS2) 🏙️",
    address: "25a Đường 3/2, Phường 11, Quận 10",
    description: "Sunset Panorama đại diện cho sự sang trọng bậc nhất tại Dancin Home Quận 10. Căn hộ rộng lớn sở hữu sân hiên vô cực rộng 40m² cùng bể bơi mini nước ấm vô cực ngoài trời ngắm trọn hoàng hôn Sài Gòn rực rỡ. Nằm tại vị trí đắc địa cao tầng, bạn có thể thưởng thức ly cocktail mát lạnh và chiêm ngưỡng bầu trời đô thị chuyển sắc lộng lẫy.",
    amenities: [
      "Bể bơi vô cực ngoài trời",
      "Quầy bar mini với cocktail kit",
      "Sân hiên tắm nắng siêu rộng",
      "Hệ thống âm thanh hi-end",
      "Phòng tắm xông hơi đá muối",
      "Dịch vụ BBQ phục vụ tại phòng"
    ],
    tags: ["pool", "family", "cloud"],
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1495616811223-4d98c6e968ab?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
    ]
  }
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

interface RoomGalleryProps {
  currentFilter: string
  filterLabel: string
  onClearFilter: () => void

  checkinDate: string
  setCheckinDate: (val: string) => void
  checkinTime: string
  setCheckinTime: (val: string) => void
  checkoutDate: string
  setCheckoutDate: (val: string) => void
  checkoutTime: string
  setCheckoutTime: (val: string) => void

  // State đồng bộ hóa tìm kiếm hợp nhất
  selectedBranch: string
  selectedRoomId: string
  autoOpenTrigger: number

  // Props mã giảm giá
  promoCode: string
  setPromoCode: (val: string) => void

  // Bộ lọc đa đặc điểm phòng
  selectedFeatures: string[]
}

export default function RoomGallery({
  currentFilter,
  filterLabel,
  onClearFilter,
  checkinDate,
  setCheckinDate,
  checkinTime,
  setCheckinTime,
  checkoutDate,
  setCheckoutDate,
  checkoutTime,
  setCheckoutTime,
  selectedBranch,
  selectedRoomId,
  autoOpenTrigger,
  promoCode,
  setPromoCode,
  selectedFeatures
}: RoomGalleryProps) {
  const timeSlots = generateTimeSlots()
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  const [nights, setNights] = useState(1)
  const [isHourly, setIsHourly] = useState(false)
  const [hours, setHours] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [showBill, setShowBill] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [bookingCode, setBookingCode] = useState('')
  const [isDoubleBooked, setIsDoubleBooked] = useState(false)
  const [alternativeRoom, setAlternativeRoom] = useState<Room | null>(null)
  
  // States thanh toán tự động VietQR
  const [isPaid, setIsPaid] = useState(false)
  const [isProcessingWebhook, setIsProcessingWebhook] = useState(false)

  // States mã giảm giá trong Popup
  const [promoInput, setPromoInput] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [promoIsValid, setPromoIsValid] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Danh sách phòng hoạt động thực tế từ Supabase
  const [activeRooms, setActiveRooms] = useState<Room[]>(rooms)

  // Fetch phòng hoạt động từ Supabase
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
          // Trộn thông tin động từ DB vào thông tin thẩm mỹ tĩnh của rooms
          const mergedRooms = dbRooms.map((dbRoom: any) => {
            let parsedMeta: any = null
            if (dbRoom.thumbnail && dbRoom.thumbnail.trim().startsWith('{')) {
              try {
                parsedMeta = JSON.parse(dbRoom.thumbnail)
              } catch (e) {
                console.error('Error parsing room thumbnail metadata in RoomGallery:', e)
              }
            }

            // Tìm room tĩnh tương ứng theo tên gần giống
            const cleanDbName = dbRoom.name.split('(')[0].trim().toLowerCase()
            const staticRoom = rooms.find(r => r.name.toLowerCase().includes(cleanDbName))
            
            if (staticRoom) {
              const rImages = parsedMeta?.imageUrl ? [parsedMeta.imageUrl] : staticRoom.images
              return {
                ...staticRoom,
                id: dbRoom.id, // Sử dụng UUID thật từ DB
                name: dbRoom.name,
                price: Number(dbRoom.price),
                hourlyPrice: parsedMeta?.hourlyPrice || Math.round(Number(dbRoom.price) / 10),
                capacity: dbRoom.capacity,
                branch: dbRoom.branch.includes('CS1') ? 'Dancin Home - Tân Bình (CS1) 🏡' 
                      : dbRoom.branch.includes('CS2') ? 'Dancin Home - Quận 10 (CS2) 🏙️'
                      : dbRoom.branch.includes('CS3') ? 'Dancin Home - Quận 5 (CS3) 🪟'
                      : dbRoom.branch.includes('CS4') ? 'Dancin Home - Gò Vấp (CS4) 🌸'
                      : 'Dancin Home - Bình Thạnh (CS5) 🌿',
                description: parsedMeta?.description || staticRoom.description,
                amenities: (parsedMeta?.amenities && parsedMeta.amenities.length > 0) ? parsedMeta.amenities : staticRoom.amenities,
                tags: (parsedMeta?.tags && parsedMeta.tags.length > 0) ? parsedMeta.tags : staticRoom.tags,
                images: rImages,
                isPublished: parsedMeta?.isPublished !== undefined ? parsedMeta.isPublished : true,
                isFeatured: parsedMeta?.isFeatured || false
              }
            } else {
              // Phòng mới tự tạo chưa có trong static rooms
              const customImageUrl = parsedMeta?.imageUrl || parsedMeta?.url || dbRoom.thumbnail || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80"
              const displayBranch = dbRoom.branch.includes('CS1') ? 'Dancin Home - Tân Bình (CS1) 🏡'
                                  : dbRoom.branch.includes('CS2') ? 'Dancin Home - Quận 10 (CS2) 🏙️'
                                  : dbRoom.branch.includes('CS3') ? 'Dancin Home - Quận 5 (CS3) 🪟'
                                  : dbRoom.branch.includes('CS4') ? 'Dancin Home - Gò Vấp (CS4) 🌸'
                                  : dbRoom.branch
              return {
                id: dbRoom.id,
                name: dbRoom.name,
                price: Number(dbRoom.price),
                hourlyPrice: parsedMeta?.hourlyPrice || Math.round(Number(dbRoom.price) / 10),
                rating: 4.8,
                reviews: 12,
                area: dbRoom.capacity * 15,
                capacity: dbRoom.capacity,
                bed: dbRoom.capacity <= 2 ? "1 Giường King lớn" : "2 Giường Queen rộng rãi",
                badge: parsedMeta?.isFeatured ? "NỔI BẬT 🔥" : "PHÒNG MỚI ✨",
                branch: displayBranch,
                address: displayBranch,
                description: parsedMeta?.description || `Trải nghiệm căn phòng ${dbRoom.name} tuyệt đẹp tại chi nhánh Dancin Home.`,
                amenities: (parsedMeta?.amenities && parsedMeta.amenities.length > 0) ? parsedMeta.amenities : ["Máy pha cà phê", "Trà miễn phí", "Loa Bluetooth", "Wifi tốc độ cao"],
                tags: (parsedMeta?.tags && parsedMeta.tags.length > 0) ? parsedMeta.tags : ["bath", "couple"],
                images: [customImageUrl],
                isPublished: parsedMeta?.isPublished !== undefined ? parsedMeta.isPublished : true,
                isFeatured: parsedMeta?.isFeatured || false
              }
            }
          })

          // Lọc bỏ phòng lưu nháp / ẩn
          const publishedRooms = mergedRooms.filter((r: any) => r.isPublished !== false)

          // Chèn các phòng nổi bật lên đầu trang chủ
          publishedRooms.sort((a: any, b: any) => {
            const aFeat = a.isFeatured ? 1 : 0
            const bFeat = b.isFeatured ? 1 : 0
            return bFeat - aFeat // Nổi bật xếp trước
          })

          setActiveRooms(publishedRooms)
        }
      } catch (err) {
        console.warn('[Supabase Rooms Fetch] Fallback to static rooms:', err)
        setActiveRooms(rooms)
      }
    }
    fetchRooms()
  }, [])

  // 1. Phản hồi tự động mở Modal khi khách hàng chọn một phòng cụ thể và nhấn nút Tìm phòng trên thanh công cụ
  useEffect(() => {
    if (autoOpenTrigger > 0 && selectedRoomId !== 'all') {
      const target = activeRooms.find(r => r.id === selectedRoomId)
      if (target) {
        openModal(target)
      }
    }
  }, [autoOpenTrigger])

  // 2. Logic Lọc Danh Sách Phòng hợp nhất thông minh (Unified Filter Engine)
  const filteredRooms = activeRooms.filter(room => {
    // A. Lọc theo Chi nhánh (nếu không chọn 'Tất cả')
    if (selectedBranch !== 'all' && room.branch !== selectedBranch) {
      return false
    }
    // B. Lọc theo Tên phòng (nếu không chọn 'Tất cả')
    if (selectedRoomId !== 'all' && room.id !== selectedRoomId) {
      return false
    }
    // C. Lọc theo tag của AI Chat (nếu không chọn 'Tất cả')
    if (currentFilter !== 'all' && !room.tags.includes(currentFilter)) {
      return false
    }
    // D. Lọc theo Bộ lọc đa đặc điểm (Chọn nhiều đặc điểm đồng thời - AND match)
    if (selectedFeatures && selectedFeatures.length > 0) {
      const matchesAllFeatures = selectedFeatures.every(featId => room.tags.includes(featId))
      if (!matchesAllFeatures) {
        return false
      }
    }
    return true
  })

  const openModal = (room: Room) => {
    setSelectedRoom(room)
    setCurrentImgIndex(0)
    setShowSuccess(false)
    setIsDoubleBooked(false)
    setAlternativeRoom(null)
    setIsPaid(false)
    setIsProcessingWebhook(false)
    
    // Tự động điền (Auto-fill) thông tin khách hàng từ localStorage
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('dancin_customer_name') : null
    const savedPhone = typeof window !== 'undefined' ? localStorage.getItem('dancin_customer_phone') : null
    setFullName(savedName || '')
    setPhoneNumber(savedPhone || '')
    setNotes('')

    // Khởi tạo mã giảm giá từ trang chủ
    setPromoInput(promoCode)
    if (promoCode) {
      const discountPercent = getDiscountPercent(promoCode)
      if (discountPercent > 0) {
        setPromoIsValid(true)
        setPromoMessage(`Áp dụng mã ${promoCode} thành công! Giảm ${discountPercent * 100}% ✨`)
      } else {
        setPromoIsValid(false)
        setPromoMessage('Mã giảm giá không hợp lệ')
      }
    } else {
      setPromoIsValid(false)
      setPromoMessage('')
    }
  }

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) {
      setPromoCode('')
      setPromoIsValid(false)
      setPromoMessage('')
      return
    }

    const discountPercent = getDiscountPercent(code)
    if (discountPercent > 0) {
      setPromoCode(code) // Đồng bộ ra trang chủ
      setPromoIsValid(true)
      setPromoMessage(`Áp dụng mã ${code} thành công! Giảm ${discountPercent * 100}% ✨`)
    } else {
      setPromoCode('')
      setPromoIsValid(false)
      setPromoMessage('Mã giảm giá không hợp lệ ❌')
    }
  }

  const getDiscountPercent = (code: string) => {
    const cleanCode = code.trim().toUpperCase()
    if (cleanCode === 'DANCINSUMMER') return 0.1  // 10%
    if (cleanCode === 'DANCIN20') return 0.2      // 20%
    if (cleanCode === 'DANCIN50') return 0.5      // 50%
    return 0
  }

  const getPromoPrice = (price: number, code: string) => {
    const pct = getDiscountPercent(code)
    if (pct > 0) {
      return price - Math.round(price * pct)
    }
    return price
  }

  // Tự động tính toán số đêm & chi phí dựa trên Props Ngày + Giờ chốt đầu trang và mã giảm giá
  useEffect(() => {
    if (!selectedRoom || !checkinDate || !checkoutDate || !checkinTime || !checkoutTime) return

    const d1 = new Date(`${checkinDate}T${checkinTime}`)
    const d2 = new Date(`${checkoutDate}T${checkoutTime}`)

    if (d2 > d1) {
      const diffTime = d2.getTime() - d1.getTime()
      const diffHours = diffTime / (1000 * 60 * 60)
      
      let subtotal = 0
      let computedNights = 1
      let computedHours = 0
      let hourlyMode = false

      if (checkinDate === checkoutDate) {
        hourlyMode = true
        computedHours = Math.max(1, Math.ceil(diffHours))
        subtotal = (selectedRoom.hourlyPrice || (selectedRoom.price * 0.1)) * computedHours
      } else {
        computedNights = Math.max(1, Math.ceil(diffHours / 24))
        subtotal = selectedRoom.price * computedNights
      }

      const discountPercent = getDiscountPercent(promoCode)
      const disc = Math.round(subtotal * discountPercent)
      setDiscount(disc)
      setTotalPrice(subtotal - disc)
      setNights(hourlyMode ? 0 : computedNights)
      setHours(hourlyMode ? computedHours : 0)
      setIsHourly(hourlyMode)
      setShowBill(true)
    } else {
      setShowBill(false)
    }
  }, [checkinDate, checkoutDate, checkinTime, checkoutTime, selectedRoom, promoCode])

  const prevImg = () => {
    if (!selectedRoom) return
    setCurrentImgIndex((prev) =>
      prev === 0 ? selectedRoom.images.length - 1 : prev - 1
    )
  }

  const nextImg = () => {
    if (!selectedRoom) return
    setCurrentImgIndex((prev) =>
      prev === selectedRoom.images.length - 1 ? 0 : prev + 1
    )
  }

  const findAlternativeRoom = (currentRoom: Room) => {
    const candidates = activeRooms.filter(r => r.id !== currentRoom.id)
    const sameBranch = candidates.find(r => r.branch === currentRoom.branch)
    if (sameBranch) return sameBranch
    const sameCapacity = candidates.find(r => r.capacity >= currentRoom.capacity)
    if (sameCapacity) return sameCapacity
    return candidates[0] || null
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom || !fullName.trim() || !phoneNumber.trim()) return

    // Kiểm tra mô phỏng trùng lịch (AI Cứu vãn Retention)
    const phoneTrimmed = phoneNumber.trim()
    const noteTrimmed = notes.trim().toLowerCase()
    
    if (phoneTrimmed.startsWith('0999') || noteTrimmed.includes('trùng') || noteTrimmed.includes('trung')) {
      setIsSubmitting(true)
      await new Promise(resolve => setTimeout(resolve, 800)) // Giả lập chờ API
      setIsSubmitting(false)
      
      const alt = findAlternativeRoom(selectedRoom)
      setAlternativeRoom(alt)
      setIsDoubleBooked(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const code = "DANCIN-" + Math.floor(100000 + Math.random() * 900000)
    setBookingCode(code)

    const formattedNote = isHourly 
      ? `[Mã đơn: ${code}] [Thuê theo giờ: ${hours} giờ | Trả phòng: ${checkoutDate} ${checkoutTime}] ${notes.trim()}`
      : `[Mã đơn: ${code}] [Thuê theo đêm | Trả phòng: ${checkoutDate} ${checkoutTime}] ${notes.trim()}`

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: fullName.trim(),
          phone: phoneNumber.trim(),
          check_in: `${checkinDate} ${checkinTime}`,
          room_type: selectedRoom.name,
          note: formattedNote,
          ai_tags: currentFilter !== 'all' ? currentFilter : null,
          status: 'pending',
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
          total_price: totalPrice,
          voucher_code: promoCode.trim() || null
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Đã xảy ra lỗi khi lưu thông tin đặt phòng.')
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('dancin_customer_name', fullName.trim())
        localStorage.setItem('dancin_customer_phone', phoneNumber.trim())
      }

      setShowSuccess(true)
    } catch (err: any) {
      console.error('Supabase submit fallback active. Error:', err)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('dancin_customer_name', fullName.trim())
        localStorage.setItem('dancin_customer_phone', phoneNumber.trim())
      }
      
      setShowSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- TRÌNH GIẢ LẬP BANK WEBHOOK CHUYỂN KHOẢN TỰ ĐỘNG ---
  const simulatePaymentWebhook = async () => {
    setIsProcessingWebhook(true)
    try {
      const response = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gateway: 'mbbank',
          amount: totalPrice,
          content: `DANCIN ${bookingCode}`,
          transactionDate: new Date().toISOString()
        })
      })

      if (response.ok) {
        setIsPaid(true)
      } else {
        alert('Giả lập webhook ngân hàng thất bại. Vui lòng kiểm tra API!')
      }
    } catch (e) {
      console.error(e)
      alert('Không thể kết nối đến máy chủ webhook giả lập.')
    } finally {
      setIsProcessingWebhook(false)
    }
  }

  const formatVND = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ'
  }

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  const featuredRooms = filteredRooms.filter(room => room.isFeatured)
  const regularRooms = filteredRooms.filter(room => !room.isFeatured)

  const renderRoomCard = (room: Room, isFeaturedCard = false) => {
    const isSelected = selectedRoomId === room.id
    const cardBorderClass = isFeaturedCard
      ? isSelected ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-amber-100/70 hover:border-amber-300'
      : isSelected ? 'border-[#0D3149] border-2' : 'border-stone-100 hover:border-stone-200'
    
    const cardShadowClass = isFeaturedCard
      ? 'shadow-xs hover:shadow-xl hover:shadow-amber-100/40 hover:-translate-y-1.5'
      : 'shadow-xs hover:shadow-lg hover:-translate-y-1.5'

    return (
      <div
        key={room.id}
        className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col group relative ${cardBorderClass} ${cardShadowClass}`}
      >
        {/* Thumbnail phòng */}
        <div 
          className="h-52 overflow-hidden relative cursor-pointer"
          onClick={() => openModal(room)}
        >
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
            loading="lazy"
          />
          
          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
            {isFeaturedCard ? (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-sans shadow-md flex items-center gap-1 animate-pulse">
                👑 NỔI BẬT 🔥
              </span>
            ) : (
              <span className="bg-stone-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
                {room.badge}
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-extrabold text-stone-850 shadow-xs flex items-center gap-0.5">
            ⭐ {room.rating}
          </div>
        </div>

        {/* Thông tin phòng */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 
            onClick={() => openModal(room)}
            className={`font-extrabold text-stone-850 text-base md:text-lg transition duration-350 cursor-pointer line-clamp-1 ${
              isFeaturedCard ? 'group-hover:text-amber-800' : 'group-hover:text-[#0D3149]'
            }`}
          >
            {room.name}
          </h3>
          <p className="text-xs md:text-sm text-stone-500 mt-2 line-clamp-2 min-h-[40px] leading-relaxed">
            {room.description}
          </p>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 my-4 py-3 border-y border-dashed border-stone-100 text-center">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider text-stone-400">Diện tích</span>
              <strong className="text-stone-700 text-xs mt-0.5">{room.area}m²</strong>
            </div>
            <div className="flex flex-col items-center justify-center border-x border-stone-100">
              <span className="text-[9px] uppercase tracking-wider text-stone-400">Sức chứa</span>
              <strong className="text-stone-700 text-xs mt-0.5">{room.capacity} khách</strong>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider text-stone-400">Giường</span>
              <strong className="text-stone-700 text-xs mt-0.5 truncate max-w-full px-1">{room.bed.split(' ')[2] || 'King'}</strong>
            </div>
          </div>

          {/* Giá tiền & Nút Đặt */}
          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm md:text-base font-extrabold text-[#0D3149] font-sans leading-tight">
                {getDiscountPercent(promoCode) > 0 ? (
                  <>
                    <span className="text-stone-400 line-through text-xs font-normal mr-1.5">{formatVND(room.price)}</span>
                    <span>{formatVND(getPromoPrice(room.price, promoCode))}</span>
                  </>
                ) : (
                  formatVND(room.price)
                )}
                <span className="text-[10px] text-stone-400 font-normal uppercase tracking-wider"> / đêm</span>
              </span>
              <span className="text-xs text-stone-500 font-semibold leading-none">
                {getDiscountPercent(promoCode) > 0 ? (
                  <>
                    <span className="text-stone-400 line-through text-[10px] font-normal mr-1">{formatVND(room.hourlyPrice)}</span>
                    <span>{formatVND(getPromoPrice(room.hourlyPrice, promoCode))}</span>
                  </>
                ) : (
                  formatVND(room.hourlyPrice)
                )}
                <span className="text-[9px] text-stone-400 font-normal uppercase tracking-wider"> / giờ</span>
              </span>
            </div>
            
            <button
              onClick={() => openModal(room)}
              className={`px-4 py-2.5 text-white rounded-xl text-xs md:text-sm font-bold transition duration-300 flex items-center gap-1 shadow-xs border-none cursor-pointer ${
                isFeaturedCard 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/10'
                  : 'bg-[#0D3149] hover:bg-[#124263]'
              }`}
            >
              Xem chi tiết & Đặt phòng ➜
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-200/50">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#0D3149] block mb-1">
            Không gian độc bản
          </span>
          <h2 className="text-2xl font-black text-stone-850 font-sans tracking-tight">
            {selectedRoomId !== 'all' ? 'Căn Phòng Bạn Đã Chọn' : 'Các mẫu không gian tại Dancin'}
          </h2>
        </div>

        {currentFilter !== 'all' && (
          <div className="flex items-center gap-2.5 bg-blue-50/60 border border-blue-100/50 py-1.5 px-3 rounded-full text-xs font-medium text-blue-850 animate-in fade-in slide-in-from-right-3 duration-300">
            <span>Đang tìm: <strong>{filterLabel}</strong></span>
            <button
              onClick={onClearFilter}
              className="w-4 h-4 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-950 transition-all font-sans font-bold cursor-pointer border-none"
              title="Hiện tất cả"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Grid danh sách các phòng */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-100 shadow-sm flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🏕️</span>
          <h3 className="font-bold text-stone-850 text-base">Không tìm thấy phòng phù hợp</h3>
          <p className="text-sm text-stone-500 max-w-sm leading-relaxed">
            Trợ lý Dancin help center chưa tìm thấy phòng nào có đặc tính này ở bộ lọc hiện tại. Bạn hãy đổi bộ lọc ngày giờ, chi nhánh hoặc mô tả lại phòng khác nhé!
          </p>
          <button
            onClick={onClearFilter}
            className="mt-2 px-4 py-2 bg-[#0D3149] hover:bg-[#124263] text-white rounded-xl text-xs font-bold shadow-sm transition border-none cursor-pointer"
          >
            Hiện tất cả phòng nghỉ
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* A. BỘ SƯU TẬP NỔI BẬT / FEATURED COLLECTION */}
          {featuredRooms.length > 0 && (
            <div className="p-6 md:p-8 rounded-[36px] bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 border border-amber-200/60 shadow-[0_16px_40px_-16px_rgba(245,158,11,0.08)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Glowing gradient backdrops */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-amber-100/10 rounded-full blur-3xl -z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-100/10 rounded-full blur-3xl -z-10 pointer-events-none" />
              
              <div className="flex items-center gap-3.5 mb-6">
                <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-100/70 border border-amber-200/40 text-xl shadow-xs">
                  👑
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-xl font-black text-amber-950 font-sans tracking-tight">
                      Không Gian Nổi Bật Độc Bản
                    </h3>
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-pulse">
                      Hot 🔥
                    </span>
                  </div>
                  <p className="text-xs text-amber-850/80 font-bold mt-0.5">
                    Những căn phòng được yêu thích nhất với tầm nhìn đẹp và dịch vụ thượng hạng.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {featuredRooms.map((room) => renderRoomCard(room, true))}
              </div>
            </div>
          )}

          {/* B. BỘ SƯU TẬP TIÊU CHUẨN / OTHER ROOMS */}
          {regularRooms.length > 0 && (
            <div className="flex flex-col gap-6">
              {featuredRooms.length > 0 && (
                <div className="flex items-center gap-3 pt-4 pb-2">
                  <span className="w-1.5 h-6 rounded-full bg-[#0D3149]"></span>
                  <h3 className="text-lg font-extrabold text-stone-850 font-sans tracking-tight">
                    🌳 Bộ Sưu Tập Không Gian Khác
                  </h3>
                  <span className="text-xs text-stone-400 font-medium">({regularRooms.length} phòng)</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {regularRooms.map((room) => renderRoomCard(room, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= POPUP MODAL CHÌA KHÓA CHI TIẾT & FORM ĐẶT PHÒNG ================= */}
      {selectedRoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedRoom(null)}
        >
          <div 
            className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-350 flex flex-col lg:flex-row h-full max-h-[85vh] lg:h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-4 right-4 text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 w-8 h-8 rounded-full flex items-center justify-center transition shadow-md z-30 font-bold cursor-pointer"
              title="Đóng"
            >
              ✕
            </button>

            {/* BÊN TRÁI: ALBUM ẢNH CHUYỂN SLIDE MƯỢT MÀ */}
            <div className="w-full lg:w-7/12 bg-black flex flex-col justify-between h-[300px] lg:h-full relative min-h-[300px]">
              <button
                onClick={prevImg}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border-none transition cursor-pointer shadow-md z-10 text-sm font-bold"
              >
                ◀
              </button>
              <button
                onClick={nextImg}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border-none transition cursor-pointer shadow-md z-10 text-sm font-bold"
              >
                ▶
              </button>

              {/* Ảnh lớn */}
              <div className="w-full h-full">
                <img
                  src={selectedRoom.images[currentImgIndex]}
                  alt={`${selectedRoom.name} - Ảnh ${currentImgIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>

              {/* Số đếm slide */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md z-10">
                Ảnh {currentImgIndex + 1} / {selectedRoom.images.length}
              </div>

              {/* Thumbnails khay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex gap-2 overflow-x-auto z-10">
                {selectedRoom.images.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`mini-${i}`}
                    onClick={() => setCurrentImgIndex(i)}
                    className={`w-12 h-9 object-cover rounded-sm cursor-pointer border-2 transition ${
                      i === currentImgIndex ? 'border-[#0D3149] opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-85'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* BÊN PHẢI: CHI TIẾT PHÒNG & FORM ĐIỀN THÔNG TIN USER */}
            <div className="w-full lg:w-5/12 p-6 md:p-8 overflow-y-auto flex flex-col gap-5 h-full bg-white">
              {/* Header phòng */}
              <div>
                <span className="bg-blue-50 border border-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  {selectedRoom.badge}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-stone-850 mt-1 leading-tight">{selectedRoom.name}</h3>
                <div className="flex items-center gap-1 text-xs text-stone-500 mt-1 font-semibold">
                  ⭐ <strong className="text-stone-800">{selectedRoom.rating}</strong> ({selectedRoom.reviews} đánh giá)
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 bg-stone-50 border border-stone-100/50 p-2.5 rounded-xl text-center">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Diện tích</span>
                  <strong className="text-stone-700 text-xs">{selectedRoom.area} m²</strong>
                </div>
                <div className="border-x border-stone-200">
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Sức chứa</span>
                  <strong className="text-stone-700 text-xs">{selectedRoom.capacity} khách</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Giường</span>
                  <strong className="text-stone-700 text-xs block truncate px-1">{selectedRoom.bed.split(' ')[2] || 'King'}</strong>
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 border-l-2 border-[#0D3149] pl-2 mb-1.5">Mô tả căn phòng</h4>
                <p className="text-xs md:text-sm text-stone-600 leading-relaxed">{selectedRoom.description}</p>
              </div>

              {/* TÓM TẮT ĐẶT PHÒNG VÀ ĐIỀU CHỈNH HÀNH TRÌNH */}
              <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-4 flex flex-col gap-3.5 text-xs">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0D3149] mb-0.5">🗓️ Thông tin hành trình (Có thể điều chỉnh)</h4>
                
                {/* Chi nhánh & Địa chỉ */}
                <div className="flex flex-col gap-1.5 border-b border-stone-200/30 pb-2 text-[11px]">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-stone-450">🏢 Chi nhánh:</span>
                    <strong className="text-stone-750 text-right font-semibold">{selectedRoom.branch}</strong>
                  </div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-stone-450">📍 Địa chỉ:</span>
                    <span className="text-stone-700 text-right font-medium">{selectedRoom.address}</span>
                  </div>
                </div>

                {/* Giờ / Ngày Nhận phòng */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-stone-450 font-bold">📅 Nhận phòng:</span>
                  <div className="grid grid-cols-12 gap-2">
                    <input
                      type="date"
                      value={checkinDate}
                      onChange={(e) => setCheckinDate(e.target.value)}
                      onClick={(e) => { try { if ('showPicker' in e.currentTarget) { (e.currentTarget as any).showPicker(); } } catch (err) {} }}
                      className="col-span-8 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-750 font-semibold focus:border-[#0D3149] outline-none cursor-pointer"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <select
                      value={checkinTime}
                      onChange={(e) => setCheckinTime(e.target.value)}
                      className="col-span-4 bg-white border border-stone-200 rounded-lg px-1.5 py-1.5 text-xs text-stone-750 font-semibold focus:border-[#0D3149] outline-none cursor-pointer"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Giờ / Ngày Trả phòng */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-stone-450 font-bold">📅 Trả phòng:</span>
                  <div className="grid grid-cols-12 gap-2">
                    <input
                      type="date"
                      value={checkoutDate}
                      onChange={(e) => setCheckoutDate(e.target.value)}
                      onClick={(e) => { try { if ('showPicker' in e.currentTarget) { (e.currentTarget as any).showPicker(); } } catch (err) {} }}
                      className="col-span-8 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-750 font-semibold focus:border-[#0D3149] outline-none cursor-pointer"
                      min={checkinDate || new Date().toISOString().split('T')[0]}
                    />
                    <select
                      value={checkoutTime}
                      onChange={(e) => setCheckoutTime(e.target.value)}
                      className="col-span-4 bg-white border border-stone-200 rounded-lg px-1.5 py-1.5 text-xs text-stone-750 font-semibold focus:border-[#0D3149] outline-none cursor-pointer"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* BIỂU MẪU ĐIỀN THÔNG TIN USER (FORM USER BOOKING) */}
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Đơn giá:</span>
                  <div className="flex items-end gap-0.5">
                    <strong className="text-base md:text-lg font-extrabold text-[#0D3149] font-sans leading-none">
                      {formatVND(isHourly ? selectedRoom.hourlyPrice : selectedRoom.price)}
                    </strong>
                    <span className="text-[10px] text-stone-400">/ {isHourly ? 'giờ' : 'đêm'}</span>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3.5">
                  {isDoubleBooked && alternativeRoom && (
                    <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2 text-amber-850">
                        <span className="text-xl">⚠️</span>
                        <strong className="text-xs uppercase tracking-wider font-bold">Thông báo lịch bận</strong>
                      </div>
                      <p className="text-[11px] md:text-xs text-amber-900 leading-relaxed font-medium">
                        Rất tiếc ạ! Căn phòng <strong>{selectedRoom.name}</strong> đã có khách đặt trước vào khung giờ <strong>{checkinTime} ngày {formatFriendlyDate(checkinDate)}</strong> mất rồi.
                      </p>
                      <div className="bg-white border border-amber-200 rounded-xl p-3 flex flex-col gap-2 text-xs text-stone-750">
                        <span className="text-[10px] font-extrabold text-amber-850 uppercase tracking-widest block">💡 Đề xuất từ Dancin help center</span>
                        <p className="leading-relaxed text-[11px] font-medium text-stone-600">
                          Bạn có muốn chuyển đặt phòng sang căn <strong>{alternativeRoom.name}</strong> ({alternativeRoom.branch}) cũng có sức chứa tương đương (<strong>{alternativeRoom.capacity} khách</strong>) và đang còn trống lịch không ạ? 🌸
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoom(alternativeRoom)
                            setIsDoubleBooked(false)
                            setAlternativeRoom(null)
                          }}
                          className="mt-1 w-full py-2 bg-[#0D3149] hover:bg-[#124263] text-white rounded-lg font-bold text-xs transition border-none shadow-sm cursor-pointer"
                        >
                          ✨ Đồng ý đổi sang phòng đề xuất
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Họ tên */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase flex items-center gap-1">
                      👤 Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên khách hàng..."
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs text-stone-700 outline-none focus:border-[#0D3149] font-medium"
                      required
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase flex items-center gap-1">
                      📞 Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Nhập số điện thoại liên hệ..."
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs text-stone-700 outline-none focus:border-[#0D3149] font-medium"
                      required
                    />
                  </div>

                  {/* Ghi chú */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase flex items-center gap-1">
                      📝 Ghi chú yêu cầu thêm
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ví dụ: Cần lò nướng BBQ, trang trí kỉ niệm, check-in sớm..."
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs text-stone-700 outline-none focus:border-[#0D3149] resize-none font-medium"
                      rows={2}
                    />
                  </div>

                  {/* Ô nhập mã giảm giá trong Popup */}
                  <div className="flex flex-col gap-1.5 border-t border-dashed border-stone-200 pt-3">
                    <label className="text-[10px] font-bold text-stone-600 uppercase flex items-center gap-1">
                      🎟️ Mã ưu đãi / Mã giảm giá
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Ví dụ: DANCINSUMMER..."
                        className="flex-grow bg-white border border-stone-200 rounded-lg p-2 text-xs text-stone-700 outline-none focus:border-[#0D3149] font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-3 bg-[#0D3149] hover:bg-[#124263] text-white rounded-lg text-xs font-bold transition border-none cursor-pointer flex-shrink-0"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {promoMessage && (
                      <span className={`text-[10px] font-bold ${promoIsValid ? 'text-blue-700 animate-pulse' : 'text-red-500'}`}>
                        {promoMessage}
                      </span>
                    )}
                  </div>

                  {/* Phân tích giá cả và chốt hóa đơn */}
                  {showBill && (
                    <div className="bg-white border border-blue-100/30 rounded-xl p-3 text-xs flex flex-col gap-1.5 mt-1 shadow-inner">
                      <div className="flex justify-between text-stone-550">
                        <span>Hình thức thuê:</span>
                        <strong className="text-[#0D3149] font-bold">{isHourly ? 'Theo giờ' : 'Theo đêm'}</strong>
                      </div>
                      <div className="flex justify-between text-stone-550">
                        <span>Thời gian lưu trú:</span>
                        <strong>{isHourly ? `${hours} giờ` : `${nights} đêm`}</strong>
                      </div>
                      {isHourly && (
                        <div className="text-[10px] text-blue-800 bg-blue-50 px-2 py-1.5 rounded-lg font-semibold border border-blue-100/40 -mt-0.5 animate-pulse leading-normal">
                          💡 Dancin Home áp dụng thời gian thuê theo giờ tối thiểu từ 2 tiếng/lần.
                        </div>
                      )}
                      <div className="flex justify-between text-stone-550">
                        <span>Chi phí ban đầu:</span>
                        <span>{formatVND(isHourly ? (selectedRoom.hourlyPrice * hours) : (selectedRoom.price * nights))}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-blue-700 font-semibold animate-in fade-in duration-300">
                          <span>Mã giảm giá ({promoCode}):</span>
                          <span>-{formatVND(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-extrabold text-stone-850 border-t border-dashed border-stone-100 pt-1.5 mt-1">
                        <span>Tổng số tiền:</span>
                        <span className="text-[#0D3149]">{formatVND(totalPrice)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 md:py-3 bg-[#0D3149] hover:bg-[#124263] disabled:bg-stone-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer border-none mt-2 flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Đang kết nối Supabase...
                      </span>
                    ) : (
                      <>
                        <span>Xác nhận Đặt phòng ngay</span> ✨
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS MODAL CHỨA TOÀN BỘ DỮ LIỆU ĐẶT PHÒNG ================= */}
      {showSuccess && selectedRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg p-6 md:p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-350 my-8 max-h-[90vh] overflow-y-auto">
            
            {isPaid ? (
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-3xl font-semibold border border-emerald-100/50 animate-bounce">
                ✓
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 text-3xl font-semibold border border-blue-100/50">
                ⏳
              </div>
            )}
            
            <h2 className="text-xl md:text-2xl font-black text-stone-850">
              {isPaid ? 'Đã Thanh Toán Thành Công! 🚀' : 'Đơn Phòng Đang Chờ Thanh Toán!'}
            </h2>
            <p className="text-xs md:text-sm text-stone-500 leading-relaxed -mt-1.5 max-w-sm">
              {isPaid 
                ? `Tuyệt vời! Dancin Home đã nhận thanh toán tự động thành công cho phòng ${selectedRoom.name}.`
                : `Vui lòng quét mã QR chuyển khoản Napas bên dưới hoặc giả lập chuyển khoản để kích hoạt đặt cọc tự động.`}
            </p>

            <div className="w-full bg-stone-50 border border-stone-200/50 rounded-2xl p-4 text-left text-xs flex flex-col gap-2.5 my-2 leading-relaxed">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-200 pb-1.5">🎟️ Chi tiết hóa đơn</h3>
              <div className="flex justify-between">
                <span className="text-stone-450">👤 Khách hàng đặt:</span>
                <strong className="text-stone-800 font-bold">{fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-450">🏢 Chi nhánh đặt:</span>
                <strong className="text-stone-800 font-bold">{selectedRoom.branch}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-450">🏡 Loại phòng:</span>
                <strong className="text-stone-800 font-bold text-right">{selectedRoom.name}</strong>
              </div>
              
              <div className="flex justify-between items-center border-t border-dashed border-stone-200 pt-2.5 mt-1">
                <span className="text-[#0D3149] uppercase tracking-wider text-[9px] font-extrabold">Tổng chi phí chốt:</span>
                <strong className="text-[#0D3149] text-lg font-extrabold">{formatVND(totalPrice)}</strong>
              </div>
              
              <div className="flex justify-between items-center border-t border-stone-200/50 pt-2">
                <span className="text-stone-450 uppercase tracking-wider text-[9px] font-bold">Mã xác nhận:</span>
                <strong className="text-stone-750 font-mono text-sm tracking-wider">{bookingCode}</strong>
              </div>
            </div>

            {/* PHẦN THANH TOÁN TỰ ĐỘNG (DỌN DÒNG TIỀN VIETQR) */}
            {!isPaid ? (
              <div className="flex flex-col items-center gap-3 border-t border-stone-100 pt-4 w-full">
                <span className="text-[10px] font-bold text-[#0D3149] uppercase tracking-widest flex items-center gap-1">
                  📸 Quét mã chuyển khoản VietQR Napas
                </span>
                
                <div className="w-44 h-44 bg-white border-2 border-[#0D3149]/20 rounded-2xl p-2 shadow-inner flex items-center justify-center relative overflow-hidden group">
                  <img
                    src={`https://img.vietqr.io/image/mbbank-0901234567-compact2.png?amount=${totalPrice}&addInfo=DANCIN%20${bookingCode}&accountName=DANCIN%20HOME%20HOMESTAY`}
                    alt="VietQR Payment Transfer Code"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  {/* Flashing scan layer */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 shadow-lg shadow-emerald-500 animate-[bounce_2s_infinite]" />
                </div>

                <div className="text-[10px] text-stone-600 leading-relaxed font-semibold bg-stone-50 border border-stone-200/50 p-2.5 rounded-xl w-full text-center">
                  🏦 MBBank • Số TK: <strong>0901234567</strong> • <strong>DANCIN HOME HOMESTAY</strong> <br />
                  Nội dung chuyển khoản: <strong className="text-blue-800 font-mono select-all">DANCIN {bookingCode}</strong>
                </div>

                <div className="text-[9px] text-stone-450 font-medium animate-pulse">
                  ⚡ Hệ thống đang tự động rà soát tài khoản ngân hàng để kích hoạt booking...
                </div>

                {/* NÚT GIẢ LẬP WEBHOOK THANH TOÁN CHUYỂN KHOẢN */}
                <button
                  type="button"
                  onClick={simulatePaymentWebhook}
                  disabled={isProcessingWebhook}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-400 text-white rounded-xl font-bold text-xs shadow-sm transition border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isProcessingWebhook ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang truyền tín hiệu Webhook...
                    </>
                  ) : (
                    <>
                      <span>⚡ Giả Lập Chuyển Khoản Thành Công (Test Webhook)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* KHI ĐÃ THANH TOÁN THÀNH CÔNG: HIỂN THỊ MÃ QR CHECK-IN NHANH */
              <div className="flex flex-col items-center gap-2 border-t border-stone-100 pt-4 w-full animate-in fade-in zoom-in-95 duration-300">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  🎉 THANH TOÁN THÀNH CÔNG • MÃ CHECK-IN
                </span>
                
                <div className="w-32 h-32 bg-white border border-stone-200 rounded-2xl p-2 shadow-inner flex items-center justify-center mt-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${bookingCode}`}
                    alt={`QR Code Booking ${bookingCode}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-[9px] text-stone-450 font-medium">Đưa mã QR cho lễ tân chi nhánh hoặc nhập tự check-in để nhận phòng lập tức 🚀</span>
                
                <p className="text-[10px] text-stone-450 leading-relaxed italic mt-1 max-w-sm">
                  Dancin Home đã tự động đặt cọc và khóa phòng Cozy Cabin. Hẹn gặp bạn sớm tại homestay! 🌲✨
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowSuccess(false)
                setSelectedRoom(null)
              }}
              className="w-full py-2.5 bg-[#0D3149] hover:bg-[#124263] text-white rounded-xl font-bold text-sm shadow-md transition border-none cursor-pointer mt-2"
            >
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
