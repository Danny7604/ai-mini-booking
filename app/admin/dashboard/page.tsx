'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  CalendarRange, 
  Ticket, 
  Users, 
  Megaphone, 
  Sparkles, 
  RefreshCw, 
  Coins, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Percent,
  MessageSquare,
  Mail,
  Bot,
  Flame,
  CheckCircle,
  Building2
} from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

// Định nghĩa kiểu khoảng thời gian lọc
type TimeFilter = 'week' | 'month' | 'quarter' | 'year'

// Định nghĩa kiểu dữ liệu thống kê
interface KPIStats {
  revenue: number
  bookings: number
  newCustomers: number
  returningCustomers: number
  vouchersIssued: number
  vouchersUsed: number
  growth: {
    revenue: number
    bookings: number
    newCust: number
    returningCust: number
  }
}

// Cấu trúc dữ liệu cho biểu đồ Line
interface LineDataPoint {
  label: string
  bookings: number
  newCustomers: number
  returningCustomers: number
}

// Cấu trúc dữ liệu cho biểu đồ Bar
interface BarDataPoint {
  label: string
  issued: number
  used: number
}

// Cấu trúc phân bổ doanh thu
interface RevenueDistribution {
  groupName: string
  revenue: number
  percentage: number
  color: string
}

interface RoomPerformance {
  name: string
  branch: string
  revenue: number
  bookingsCount: number
  occupancy: number
  status: 'excellent' | 'good' | 'poor'
}

interface CampaignPerformance {
  id: string
  name: string
  targetGroup: string
  channel: 'Zalo ZNS' | 'Email'
  ctr: number
  status: 'excellent' | 'normal' | 'low'
  sentCount: number
}

// ================= DỮ LIỆU MẪU CAO CẤP TƯƠNG THÍCH THEO TIME FILTERS =================

const STATS_BY_PERIOD: Record<TimeFilter, KPIStats> = {
  week: {
    revenue: 14200000,
    bookings: 9,
    newCustomers: 5,
    returningCustomers: 4,
    vouchersIssued: 35,
    vouchersUsed: 12,
    growth: { revenue: 8.5, bookings: 12, newCust: 5, returningCust: 15 }
  },
  month: {
    revenue: 68450000,
    bookings: 42,
    newCustomers: 26,
    returningCustomers: 16,
    vouchersIssued: 150,
    vouchersUsed: 58,
    growth: { revenue: 14.2, bookings: 18.5, newCust: 10.4, returningCust: 22.8 }
  },
  quarter: {
    revenue: 204500000,
    bookings: 132,
    newCustomers: 82,
    returningCustomers: 50,
    vouchersIssued: 480,
    vouchersUsed: 198,
    growth: { revenue: 22.1, bookings: 25.4, newCust: 14.8, returningCust: 38.6 }
  },
  year: {
    revenue: 818000000,
    bookings: 540,
    newCustomers: 342,
    returningCustomers: 198,
    vouchersIssued: 1850,
    vouchersUsed: 785,
    growth: { revenue: 38.4, bookings: 42.1, newCust: 28.5, returningCust: 54.2 }
  }
}

const LINE_DATA_BY_PERIOD: Record<TimeFilter, LineDataPoint[]> = {
  week: [
    { label: 'Thứ 2', bookings: 1, newCustomers: 1, returningCustomers: 0 },
    { label: 'Thứ 3', bookings: 1, newCustomers: 0, returningCustomers: 1 },
    { label: 'Thứ 4', bookings: 0, newCustomers: 0, returningCustomers: 0 },
    { label: 'Thứ 5', bookings: 2, newCustomers: 1, returningCustomers: 1 },
    { label: 'Thứ 6', bookings: 2, newCustomers: 2, returningCustomers: 0 },
    { label: 'Thứ Bảy', bookings: 3, newCustomers: 1, returningCustomers: 2 },
    { label: 'Chủ Nhật', bookings: 0, newCustomers: 0, returningCustomers: 0 }
  ],
  month: [
    { label: 'Tuần 1', bookings: 9, newCustomers: 6, returningCustomers: 3 },
    { label: 'Tuần 2', bookings: 12, newCustomers: 7, returningCustomers: 5 },
    { label: 'Tuần 3', bookings: 11, newCustomers: 8, returningCustomers: 3 },
    { label: 'Tuần 4', bookings: 10, newCustomers: 5, returningCustomers: 5 }
  ],
  quarter: [
    { label: 'Tháng 3', bookings: 38, newCustomers: 24, returningCustomers: 14 },
    { label: 'Tháng 4', bookings: 45, newCustomers: 28, returningCustomers: 17 },
    { label: 'Tháng 5', bookings: 49, newCustomers: 30, returningCustomers: 19 }
  ],
  year: [
    { label: 'Quý 1', bookings: 110, newCustomers: 72, returningCustomers: 38 },
    { label: 'Quý 2', bookings: 145, newCustomers: 92, returningCustomers: 53 },
    { label: 'Quý 3', bookings: 165, newCustomers: 105, returningCustomers: 60 },
    { label: 'Quý 4', bookings: 120, newCustomers: 73, returningCustomers: 47 }
  ]
}

const BAR_DATA_BY_PERIOD: Record<TimeFilter, BarDataPoint[]> = {
  week: [
    { label: 'T2', issued: 5, used: 2 },
    { label: 'T3', issued: 4, used: 1 },
    { label: 'T4', issued: 3, used: 0 },
    { label: 'T5', issued: 6, used: 3 },
    { label: 'T6', issued: 8, used: 2 },
    { label: 'T7', issued: 9, used: 4 },
    { label: 'CN', issued: 0, used: 0 }
  ],
  month: [
    { label: 'T1', issued: 35, used: 12 },
    { label: 'T2', issued: 40, used: 18 },
    { label: 'T3', issued: 38, used: 15 },
    { label: 'T4', issued: 37, used: 13 }
  ],
  quarter: [
    { label: 'Tháng 3', issued: 150, used: 58 },
    { label: 'Tháng 4', issued: 165, used: 72 },
    { label: 'Tháng 5', issued: 165, used: 68 }
  ],
  year: [
    { label: 'Q1', issued: 420, used: 180 },
    { label: 'Q2', issued: 510, used: 215 },
    { label: 'Q3', issued: 520, used: 235 },
    { label: 'Q4', issued: 400, used: 155 }
  ]
}

const REVENUE_DIST_BY_PERIOD: Record<TimeFilter, RevenueDistribution[]> = {
  week: [
    { groupName: 'Đi gia đình', revenue: 7100000, percentage: 50, color: '#18181b' },
    { groupName: 'Thích yên tĩnh', revenue: 4260000, percentage: 30, color: '#10b981' },
    { groupName: 'Thuê ngắn giờ', revenue: 2130000, percentage: 15, color: '#f59e0b' },
    { groupName: 'Đại trà / Khác', revenue: 710000, percentage: 5, color: '#ef4444' }
  ],
  month: [
    { groupName: 'Đi gia đình', revenue: 34225000, percentage: 50, color: '#18181b' },
    { groupName: 'Thích yên tĩnh', revenue: 20535000, percentage: 30, color: '#10b981' },
    { groupName: 'Thuê ngắn giờ', revenue: 10267500, percentage: 15, color: '#f59e0b' },
    { groupName: 'Đại trà / Khác', revenue: 3422500, percentage: 5, color: '#ef4444' }
  ],
  quarter: [
    { groupName: 'Đi gia đình', revenue: 102250000, percentage: 50, color: '#18181b' },
    { groupName: 'Thích yên tĩnh', revenue: 61350000, percentage: 30, color: '#10b981' },
    { groupName: 'Thuê ngắn giờ', revenue: 30675000, percentage: 15, color: '#f59e0b' },
    { groupName: 'Đại trà / Khác', revenue: 10225000, percentage: 5, color: '#ef4444' }
  ],
  year: [
    { groupName: 'Đi gia đình', revenue: 409000000, percentage: 50, color: '#18181b' },
    { groupName: 'Thích yên tĩnh', revenue: 245400000, percentage: 30, color: '#10b981' },
    { groupName: 'Thuê ngắn giờ', revenue: 122700000, percentage: 15, color: '#f59e0b' },
    { groupName: 'Đại trà / Khác', revenue: 40900000, percentage: 5, color: '#ef4444' }
  ]
}

const ROOM_PERFORMANCE: RoomPerformance[] = [
  { name: 'Cozy Wooden Cabin CS3', branch: 'Quận 5', revenue: 28450000, bookingsCount: 18, occupancy: 92, status: 'excellent' },
  { name: 'Sunset Panorama CS2', branch: 'Quận 10', revenue: 21900000, bookingsCount: 12, occupancy: 88, status: 'excellent' },
  { name: 'Pine Forest Loft CS1', branch: 'Tân Bình', revenue: 10800000, bookingsCount: 8, occupancy: 65, status: 'good' },
  { name: 'Valley View Suite CS2', branch: 'Quận 10', revenue: 5400000, bookingsCount: 3, occupancy: 50, status: 'poor' },
  { name: 'Sunlit Glass House CS4', branch: 'Gò Vấp', revenue: 1900000, bookingsCount: 1, occupancy: 20, status: 'poor' }
]

const CAMPAIGNS_PERFORMANCE: CampaignPerformance[] = [
  { id: 'MKT-02', name: 'Chào hè rực rỡ - Tặng Voucher Gold 200k ☀️', targetGroup: 'Hạng: Gold (Vàng) 🥇', channel: 'Zalo ZNS', ctr: 38.2, status: 'excellent', sentCount: 450 },
  { id: 'MKT-04', name: 'Mừng sinh nhật Hội viên Diamond đặc quyền 💎', targetGroup: 'Hạng: Diamond 💎', channel: 'Zalo ZNS', ctr: 34.6, status: 'excellent', sentCount: 85 },
  { id: 'MKT-01', name: 'Trở về với mộc mạc - Giảm 15% 🌿', targetGroup: 'Nhóm: Thích yên tĩnh 🤫', channel: 'Zalo ZNS', ctr: 24.5, status: 'normal', sentCount: 120 },
  { id: 'MKT-03', name: 'Trải nghiệm Cabin gỗ - Tiệc nướng BBQ 🥩', targetGroup: 'Nhóm: Đi gia đình 🏡', channel: 'Email', ctr: 9.8, status: 'low', sentCount: 160 }
]

// ================= AI ANALYSES Markdowns =================

const AI_ANALYSIS_WEEKLY = `
### 🔮 BÁO CÁO PHÂN TÍCH NHANH BLISS COPILOT AI (WEEKLY REPORT)

Dựa trên dữ liệu tuần này, Bliss Copilot AI xin gửi tới quý quản lý các nhận định và kế hoạch hành động tối ưu hóa công suất buồng phòng tại Bliss Home Sài Gòn:

#### 1. Đánh giá sức khỏe kinh doanh trong tuần:
* **Tăng trưởng Doanh thu đạt +8.5%:** Tuần này ghi nhận tổng doanh thu **14.200.000đ** với **9 đơn đặt phòng thành công**. 
* **Pine Forest Loft CS1 (Tân Bình) đang đạt công suất tốt:** Các phòng gia đình tiếp tục làm chủ đạo, tuy nhiên, **Sunlit Glass House CS4 (Gò Vấp)** đang có dấu hiệu trống lịch đột ngột do thiếu lượng booking theo giờ ngắn hạn trong các ngày giữa tuần (thứ 4 trống hoàn toàn đơn booking).

#### 2. Hiệu năng Vouchers & Chiến dịch Marketing:
* **Tỉ lệ quy đổi Voucher là 34.2% (12/35 dùng):** Mã \`BLISSHE2026\` có CTR rất ấn tượng. Ngược lại, chiến dịch \`MKT-03\` gửi qua Email đạt CTR chỉ 9.8% - đây là kênh có hiệu quả thấp nhất do tiêu đề chưa kích thích khách hàng hành động.

#### 3. Đề xuất Kế hoạch Hành động Marketing & Sales (Kế hoạch Gửi tin Tuần tới):
1. **Dồn toàn lực cho chiến dịch Zalo ZNS:** Gửi thông báo tự động đính kèm mã giảm giá giờ thấp điểm 20% cho nhóm khách hàng **"Thích yên tĩnh"** vào ngày thứ Ba và thứ Tư tuần tới nhằm lấp trống lịch phòng tại chi nhánh **Gò Vấp (CS4)**.
2. **Setup ưu đãi kép cho nhóm "Đi gia đình":** Tạo gói tặng miễn phí dọn dẹp và nướng BBQ cho các booking cuối tuần đặt trước 3 ngày.
3. **Cải tiến kênh Email:** Thay đổi tiêu đề chiến dịch \`MKT-03\` thành *"🥩 Trọn gói tiệc nướng BBQ miễn phí cho gia đình bạn cuối tuần này"* và gửi lại thử nghiệm cho 150 khách hàng.
`

const AI_ANALYSIS_MONTHLY = `
### 🔮 BÁO CÁO PHÂN TÍCH CHUYÊN SÂU BLISS COPILOT AI (MONTHLY REPORT)

Hệ thống AI vừa hoàn thành tổng hợp và khai thác dữ liệu hoạt động kinh doanh của Bliss Home Sài Gòn trong tháng qua. Báo cáo cụ thể như sau:

#### 1. Nhận định Hoạt động Kinh doanh & Công suất Chi nhánh:
* **Doanh thu đạt mốc ấn tượng 68.450.000đ (+14.2%):** Với **42 đơn phòng**, tháng này ghi nhận sự bùng nổ của nhóm khách hàng **"Đi gia đình"** đóng góp tới **50% doanh thu** (khoảng **34.225.000đ**).
* **Đơn vị Kinh doanh Xuất Sắc:** **Cozy Wooden Cabin CS3 (Quận 5)** đạt tỉ lệ lấp đầy kỷ lục **92%**, thu về **28.450.000đ**. Đây là chi nhánh hoạt động hiệu quả nhất nhờ tích hợp xuất sắc gói dịch vụ gia đình BBQ và bồn tắm gỗ Hinoki.
* **Đơn vị Cần Cải Thiện Khẩn Cấp:** **Sunlit Glass House CS4 (Gò Vấp)** chỉ thu về **1.900.000đ** với tỉ lệ lấp đầy vỏn vẹn **20%**. Phòng này đang bị bỏ ngỏ do thiết kế chủ đạo là kính ngắm nắng, gây e ngại về sự riêng tư vào ban ngày đối với tệp khách nghỉ ngơi ngắn hạn.

#### 2. Hiệu suất Tiếp thị Đa kênh (Marketing & Vouchers):
* **Zalo ZNS đại thắng:** Chiến dịch \`MKT-02\` (chăm sóc hội viên Gold) gửi tới 450 khách hàng đạt CTR ấn tượng **38.2%**. Kênh Zalo ZNS chứng minh tính chuyển đổi vượt trội so với Email truyền thống (chỉ đạt 9.8% ở chiến dịch \`MKT-03\`).
* **Voucher tiêu dùng đạt 58/150 mã phát hành:** Tỷ lệ lấp đầy khoảng 38.6%, chứng tỏ chính sách ưu đãi đa tầng đang kích thích khách hàng rất tốt.

#### 3. Đề xuất Chiến Lược Marketing & Sales Plan cho Tháng Tới:
1. **Khắc phục ngay chi nhánh Gò Vấp (CS4):**
   - Thiết lập thêm rèm sáo tre cách âm hoặc rèm tự động để tạo không gian kín đáo đối với phòng kính Sunlit Glass House.
   - Tạo gói khuyến mãi flash sale giờ nghỉ trưa đặc biệt cho nhóm **"Thuê ngắn giờ"** tại Gò Vấp với mức giảm 25% (Mã: \`GLASSMIDDAY\`). Gửi tin nhắn qua Zalo ZNS ZNS.
2. **Nhân rộng mô hình Cabin gỗ Quận 5 (CS3):**
   - Áp dụng ngay gói nâng phòng Hinoki ban công cho chi nhánh Tân Bình (CS1) đối với nhóm khách hàng **"Đi gia đình"** có doanh số trên 5 triệu đồng.
3. **Tối ưu hóa ngân sách chiến dịch:** Tạm dừng hoàn toàn chiến dịch email tiếp thị \`MKT-03\` để chuyển 100% ngân sách quảng cáo sang kênh Zalo ZNS đính kèm mã code giảm giá giờ thấp điểm giữa tuần.
`

const AI_ANALYSIS_QUARTERLY = `
### 🔮 BÁO CÁO PHÂN TÍCH QUÝ BLISS COPILOT AI (QUARTERLY REPORT)

Chào quý quản lý, Bliss Copilot AI xin gửi báo cáo phân tích hiệu suất kinh doanh quý vừa qua và chiến lược phát triển trung hạn cho hệ thống Homestay Bliss Home:

#### 1. Phân tích tài chính & Cơ cấu Doanh thu:
* **Tổng doanh thu quý đạt 204.500.000đ (+22.1%):** Doanh số tăng trưởng đều đặn qua các tháng, chủ yếu nhờ việc giữ chân khách hàng cũ rất tốt.
* **Tỉ lệ khách quay lại đạt mức cao (50 khách hàng trên 132 booking):** Khách hàng trung thành quay lại giúp giảm chi phí tìm kiếm khách mới lên đến 30%.
* **Doanh thu theo nhóm khách hàng ổn định:** Nhóm **"Đi gia đình"** duy trì vị thế đầu bảng đóng góp **102.250.000đ** (50%), theo sát là nhóm **"Thích yên tĩnh"** đóng góp **61.350.000đ** (30%).

#### 2. Điểm sáng & Góc tối hoạt động:
* **Cozy Wooden Cabin CS3 (Quận 5)** tiếp tục khẳng định vị thế dẫn đầu với doanh thu tích lũy **28.450.000đ**, tỉ lệ phòng chạy thực tế luôn trên **90%**.
* **Sunlit Glass House CS4 (Gò Vấp)** cần cấu trúc lại toàn diện do tỉ lệ trống phòng quá cao, gây hao phí tài nguyên vận hành điện nước cố định.

#### 3. Đề xuất Kế hoạch Sale & Marketing Trung Hạn (3 Tháng Tới):
1. **Thiết lập Chương trình VIP Loyalty tri ân sâu sắc:** Triển khai chiến dịch Zalo ZNS tự động tặng voucher tri ân độc quyền **300.000đ** (Mã: \`VIPGOLD300\`) trực tiếp cho các khách hàng đạt thứ hạng Gold/Diamond nhân dịp lễ sắp tới.
2. **Cải tiến thiết kế và truyền thông cho CS4 (Gò Vấp):** Tổ chức chụp hình lại phòng kính vào khung giờ hoàng hôn ấm áp ("Golden Hour Concept") thay vì chụp ban ngày chói nắng. Gửi tin quảng bá cho nhóm **"Thích yên tĩnh"** kèm ưu đãi tặng gói trà chiều lãng mạn.
3. **Phân phối Voucher tự động bằng AI:** Thiết lập kịch bản tự động gửi mã giảm giá 15% cho khách hàng mới ngay khi họ kết thúc đặt phòng lần đầu tiên, khuyến khích họ quay lại đặt phòng lần hai trong vòng 30 ngày.
`

const AI_ANALYSIS_YEARLY = `
### 🔮 BÁO CÁO HOẠT ĐỘNG THƯỜNG NIÊN BLISS COPILOT AI (YEARLY REPORT)

Hệ thống AI xin gửi lời chúc mừng quý ban quản lý Bliss Home Sài Gòn đã có một năm kinh doanh tăng trưởng rực rỡ! Dưới đây là báo cáo tổng kết thường niên và định hướng kế hoạch sales dài hạn cho năm tới:

#### 1. Tổng quan các chỉ số tài chính & Phân khúc thị trường:
* **Doanh thu đạt mốc đột phá 818.000.000đ (+38.4%):** Một năm gặt hái thành công ngoài mong đợi với **540 lượt booking**. 
* **Khách hàng trung thành làm đòn bẩy:** Có tới **198 lượt khách hàng quay lại**, duy trì dòng tiền ổn định cho homestay.
* Phân khúc **"Đi gia đình"** đóng góp **409.000.000đ** doanh thu thường niên. Phân khúc **"Thích yên tĩnh"** giữ ổn định **245.400.000đ**.

#### 2. Xếp hạng chi nhánh & Hiệu quả buồng phòng:
* **Chi nhánh CS3 (Quận 5)** và **CS2 (Quận 10)** là hai động cơ sinh lời chính, hoạt động ổn định ở mức công suất trên **85% quanh năm**.
* **CS4 (Gò Vấp)** và **CS1 (Tân Bình)** cần được làm mới về hình ảnh, concept trang trí phòng để tạo thêm tính mới mẻ cho khách hàng cũ đặt lại.

#### 3. Chiến lược Sales & Marketing Dài Hạn Cho Năm Mới:
1. **Triển khai Mô Hình Booking Trực Tuyến Đa Kênh Tự Động:** Tăng cường kết nối cổng thanh toán, đồng bộ hóa các chương trình khuyến mãi chéo với các đối tác lữ hành du lịch.
2. **Cá nhân hóa tin nhắn tự động theo chu kỳ:** Gửi tin nhắn SMS/Zalo chúc mừng sinh nhật kèm voucher giảm giá 20% cho toàn bộ khách hàng trung thành trước ngày sinh nhật 7 ngày.
3. **Thử nghiệm mô hình "Combo Nghỉ Dưỡng Trải Nghiệm":** Phát hành các gói combo lưu trú cabin gỗ kết hợp workshop làm gốm hoặc cắm hoa tại chỗ cho nhóm khách hàng nghỉ dưỡng.
`

export default function AnalyticsDashboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; label: string; values: string[] } | null>(null)

  // Nạp dữ liệu giả lập có độ trễ mượt mà
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [timeFilter, refreshTrigger])

  const stats = STATS_BY_PERIOD[timeFilter]
  const lineData = LINE_DATA_BY_PERIOD[timeFilter]
  const barData = BAR_DATA_BY_PERIOD[timeFilter]
  const revenueDist = REVENUE_DIST_BY_PERIOD[timeFilter]

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + 'đ'
  }

  // Khởi chạy Bliss Copilot AI phân tích dữ liệu
  const handleTriggerAIAnalysis = () => {
    setIsAnalyzing(true)
    setAiAnalysis(null)

    setTimeout(() => {
      setIsAnalyzing(false)
      if (timeFilter === 'week') setAiAnalysis(AI_ANALYSIS_WEEKLY)
      else if (timeFilter === 'month') setAiAnalysis(AI_ANALYSIS_MONTHLY)
      else if (timeFilter === 'quarter') setAiAnalysis(AI_ANALYSIS_QUARTERLY)
      else setAiAnalysis(AI_ANALYSIS_YEARLY)
    }, 1500) // Giả lập quét biểu đồ trong 1.5s
  }

  // Tự động tắt phân tích cũ khi đổi filter thời gian
  useEffect(() => {
    setAiAnalysis(null)
  }, [timeFilter])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative text-zinc-700 dark:text-zinc-300">
      
      {/* HEADER & TIME FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/60 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
            Báo Cáo & Phân Tích Dữ Liệu
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Dữ liệu trực quan hóa về doanh số, buồng phòng, khách hàng quay lại và hiệu suất tiếp thị Bliss Home.
          </p>
        </div>

        {/* Bộ lọc thời gian phẳng Google Sheets style */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start md:self-auto border border-zinc-200 dark:border-zinc-750">
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-4 py-2 text-[10px] md:text-xs font-extrabold border-none rounded-lg cursor-pointer transition ${
              timeFilter === 'week' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs' : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 text-[10px] md:text-xs font-extrabold border-none rounded-lg cursor-pointer transition ${
              timeFilter === 'month' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs' : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Tháng
          </button>
          <button
            onClick={() => setTimeFilter('quarter')}
            className={`px-4 py-2 text-[10px] md:text-xs font-extrabold border-none rounded-lg cursor-pointer transition ${
              timeFilter === 'quarter' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs' : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Quý
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`px-4 py-2 text-[10px] md:text-xs font-extrabold border-none rounded-lg cursor-pointer transition ${
              timeFilter === 'year' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs' : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Năm
          </button>
        </div>
      </div>

      {isLoading ? (
        /* LOADING SYSTEM STATE */
        <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-12 shadow-xs">
          <div className="w-9 h-9 border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest animate-pulse">
            Đang xử lý dữ liệu và vẽ biểu đồ SVG...
          </span>
        </div>
      ) : (
        <>
          {/* 📊 1. FOUR GENERAL STAT TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            
            {/* Tile 1: Doanh Thu */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-xs transition-all duration-200 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Doanh Thu Tổng Hợp</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Coins size={14} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <strong className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-mono leading-none">
                  {formatVND(stats.revenue)}
                </strong>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold flex items-center gap-0.5 mt-1 select-none">
                  <ArrowUpRight size={12} className="stroke-[3]" /> +{stats.growth.revenue}% so với kỳ trước
                </span>
              </div>
            </div>

            {/* Tile 2: Đơn Booking */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-xs transition-all duration-200 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Số Lượng Đơn Booking</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <CalendarRange size={14} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <strong className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-mono leading-none">
                  {stats.bookings} đơn
                </strong>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold flex items-center gap-0.5 mt-1 select-none">
                  <ArrowUpRight size={12} className="stroke-[3]" /> +{stats.growth.bookings}% so với kỳ trước
                </span>
              </div>
            </div>

            {/* Tile 3: Khách Mới vs Quay Lại */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-xs transition-all duration-200 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Khách Mới / Quay Lại</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Users size={14} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <strong className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-mono leading-none">
                  {stats.newCustomers} / {stats.returningCustomers}
                </strong>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold flex items-center gap-0.5 mt-1 select-none">
                  <ArrowUpRight size={12} className="stroke-[3]" /> +{stats.growth.returningCust}% khách quay lại
                </span>
              </div>
            </div>

            {/* Tile 4: Voucher Phát Hành / Dùng */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-xs transition-all duration-200 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Tỉ Lệ Tiêu Dùng Voucher</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                  <Ticket size={14} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <strong className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-mono leading-none">
                  {stats.vouchersUsed} / {stats.vouchersIssued}
                </strong>
                <span className="text-[9px] text-purple-700 dark:text-purple-400 font-bold flex items-center gap-0.5 mt-1 select-none">
                  🎯 CTR sử dụng: {((stats.vouchersUsed / stats.vouchersIssued) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

          </div>

          {/* 📈 2. VISUAL SVG CHARTS SECTION (TWO-COLUMN GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CHART A: LINE & AREA TREND (Xu Hướng Booking & Loại Khách) */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-850 dark:text-zinc-200 uppercase tracking-wider">📈 Xu hướng Booking & Loại Khách</h3>
                  <span className="text-[9.5px] text-muted-foreground font-semibold block mt-0.5">Biểu đồ biểu diễn tăng trưởng tệp khách hàng theo thời gian</span>
                </div>
                {/* Legends */}
                <div className="flex items-center gap-2 text-[9px] font-extrabold select-none">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-sm"></span>Booking</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-emerald-500 rounded-sm"></span>Khách mới</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-amber-500 rounded-sm"></span>Quay lại</span>
                </div>
              </div>

              {/* Native Responsive SVG Chart */}
              <div className="w-full h-64 mt-2 relative select-none">
                <svg className="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="40" y1="30" x2="480" y2="30" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="1.5" />
                  <line x1="40" y1="80" x2="480" y2="80" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="1.5" />
                  <line x1="40" y1="130" x2="480" y2="130" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="1.5" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="1.5" />

                  {/* SVG Paths Generator */}
                  {(() => {
                    const pointsCount = lineData.length
                    const segmentWidth = 440 / (pointsCount - 1)
                    
                    // Helper to map values to coordinates
                    const maxVal = Math.max(...lineData.map(d => Math.max(d.bookings, d.newCustomers, d.returningCustomers))) || 1
                    const getX = (i: number) => 40 + i * segmentWidth
                    const getY = (v: number) => 180 - (v / maxVal) * 140

                    // Path strings
                    const bookingPath = lineData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.bookings)}`).join(' ')
                    const newCustPath = lineData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.newCustomers)}`).join(' ')
                    const returningCustPath = lineData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.returningCustomers)}`).join(' ')

                    // Area strings for bookings
                    const bookingArea = bookingPath + ` L ${getX(pointsCount - 1)} 180 L 40 180 Z`

                    return (
                      <>
                        {/* Shaded Area for Bookings */}
                        <path d={bookingArea} fill="url(#monoGrad)" opacity="0.08" />

                        {/* Curved Paths */}
                        <path d={bookingPath} fill="none" stroke="currentColor" className="text-zinc-900 dark:text-zinc-50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={newCustPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
                        <path d={returningCustPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Gradient Definitions */}
                        <defs>
                          <linearGradient id="monoGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" className="text-zinc-900 dark:text-zinc-100" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>

                        {/* Node Dots & Active Interactive Area triggers */}
                        {lineData.map((d, i) => {
                          const bx = getX(i)
                          const by = getY(d.bookings)
                          const ncx = getX(i)
                          const ncy = getY(d.newCustomers)
                          const rcx = getX(i)
                          const rcy = getY(d.returningCustomers)

                          return (
                            <g key={i} className="cursor-pointer group/node">
                              {/* Thin vertical grid highlight line */}
                              <line x1={bx} y1="30" x2={bx} y2="180" stroke="currentColor" className="text-zinc-300 dark:text-zinc-700 opacity-0 group-hover/node:opacity-50 transition duration-150" strokeWidth="1" strokeDasharray="2 2" />
                              
                              {/* Pulse effect rings */}
                              <circle cx={bx} cy={by} r="7" className="text-zinc-900 dark:text-zinc-100 fill-current opacity-0 group-hover/node:opacity-20 transition duration-150" />
                              <circle cx={bx} cy={by} r="4.5" className="text-zinc-900 dark:text-zinc-100 fill-current stroke-white dark:stroke-zinc-950" strokeWidth="1.5" />
                              
                              <circle cx={ncx} cy={ncy} r="3.5" fill="#10b981" className="stroke-white dark:stroke-zinc-950" strokeWidth="1" />
                              <circle cx={rcx} cy={rcy} r="3.5" fill="#f59e0b" className="stroke-white dark:stroke-zinc-950" strokeWidth="1" />

                              {/* Interactive Hover Area (Invisible wider slice) */}
                              <rect 
                                x={bx - segmentWidth/2} 
                                y="30" 
                                width={segmentWidth} 
                                height="170" 
                                fill="transparent" 
                                onMouseEnter={(e) => {
                                  setActiveTooltip({
                                    x: bx,
                                    y: by - 10,
                                    label: d.label,
                                    values: [
                                      `📋 Số bookings: ${d.bookings} lượt`,
                                      `🌱 Khách hàng mới: ${d.newCustomers} người`,
                                      `🔄 Khách quay lại: ${d.returningCustomers} người`
                                    ]
                                  })
                                }}
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                            </g>
                          )
                        })}

                        {/* X-Axis labels */}
                        {lineData.map((d, i) => (
                          <text 
                            key={i} 
                            x={getX(i)} 
                            y="202" 
                            textAnchor="middle" 
                            className="fill-zinc-400 dark:fill-zinc-500 font-bold text-[9px]"
                          >
                            {d.label}
                          </text>
                        ))}
                      </>
                    )
                  })()}

                  {/* Y-Axis Line */}
                  <line x1="40" y1="30" x2="40" y2="180" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1.5" />
                </svg>

                {/* Shared Interactive Tooltip Card Overlay */}
                {activeTooltip && (
                  <div 
                    className="absolute bg-stone-900 border border-stone-800 text-white rounded-2xl p-3 shadow-xl z-30 animate-in fade-in duration-100 flex flex-col gap-1 w-44 pointer-events-none"
                    style={{ left: `${Math.min(activeTooltip.x - 30, 310)}px`, top: `${Math.max(activeTooltip.y - 80, 5)}px` }}
                  >
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">{activeTooltip.label}</span>
                    <div className="flex flex-col text-[10px] leading-relaxed font-bold mt-1 text-stone-200 font-sans gap-0.5">
                      {activeTooltip.values.map((v, index) => <span key={index}>{v}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CHART B: VOUCHER PERFORMANCE (Hiệu Suất Phát Hành & Sử Dụng) */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-850 dark:text-zinc-200 uppercase tracking-wider">🎟️ Thống kê phát hành & Sử dụng Voucher</h3>
                  <span className="text-[9.5px] text-muted-foreground font-semibold block mt-0.5">Tỷ lệ tương quan phát hành so với mức tiêu dùng khuyến mãi thực tế</span>
                </div>
                {/* Legends */}
                <div className="flex items-center gap-2 text-[9px] font-extrabold select-none">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-500 rounded-xs"></span>Phát hành</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>Khách dùng</span>
                </div>
              </div>

              {/* Native Responsive SVG Multi-Series Bar Chart */}
              <div className="w-full h-64 mt-2 relative select-none">
                <svg className="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="40" y1="30" x2="480" y2="30" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="1.5" />
                  <line x1="40" y1="80" x2="480" y2="80" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="1.5" />
                  <line x1="40" y1="130" x2="480" y2="130" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="1.5" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="1.5" />

                  {/* SVG Bar Generator */}
                  {(() => {
                    const pointsCount = barData.length
                    const segmentWidth = 440 / pointsCount
                    const barWidth = Math.max(8, segmentWidth * 0.22)
                    
                    const maxVal = Math.max(...barData.map(d => Math.max(d.issued, d.used))) || 1

                    return (
                      <>
                        {barData.map((d, i) => {
                          const groupCenterX = 40 + i * segmentWidth + segmentWidth / 2
                          const xIssued = groupCenterX - barWidth - 2
                          const xUsed = groupCenterX + 2
                          
                          const hIssued = (d.issued / maxVal) * 140
                          const hUsed = (d.used / maxVal) * 140
                          
                          const yIssued = 180 - hIssued
                          const yUsed = 180 - hUsed

                          return (
                            <g key={i} className="cursor-pointer group/bar">
                              {/* Issued Bar */}
                              <rect 
                                x={xIssued} 
                                y={yIssued} 
                                width={barWidth} 
                                height={hIssued} 
                                fill="#0ea5e9" 
                                rx="3"
                                className="hover:opacity-85 transition"
                              />

                              {/* Used Bar */}
                              <rect 
                                x={xUsed} 
                                y={yUsed} 
                                width={barWidth} 
                                height={hUsed} 
                                fill="#10b981" 
                                rx="3"
                                className="hover:opacity-85 transition"
                              />

                              {/* X Axis Tick Labels */}
                              <text 
                                x={groupCenterX} 
                                y="202" 
                                textAnchor="middle" 
                                className="fill-zinc-400 dark:fill-zinc-500 font-bold text-[9px]"
                              >
                                {d.label}
                              </text>

                              {/* Interactive Hover Trigger Area for Bar Details */}
                              <rect 
                                x={40 + i * segmentWidth} 
                                y="30" 
                                width={segmentWidth} 
                                height="170" 
                                fill="transparent" 
                                onMouseEnter={(e) => {
                                  setActiveTooltip({
                                    x: groupCenterX,
                                    y: Math.min(yIssued, yUsed) - 10,
                                    label: `🎟️ Kỳ: ${d.label}`,
                                    values: [
                                      `Phát hành: ${d.issued} vouchers`,
                                      `Khách dùng: ${d.used} lượt`,
                                      `Hiệu năng dùng: ${((d.used / d.issued) * 100).toFixed(1)}%`
                                    ]
                                  })
                                }}
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                            </g>
                          )
                        })}
                      </>
                    )
                  })()}

                  {/* Y Axis Line */}
                  <line x1="40" y1="30" x2="40" y2="180" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1.5" />
                </svg>

                {/* Shared Interactive Tooltip Card Overlay for Chart B */}
                {activeTooltip && activeTooltip.label.startsWith('🎟️') && (
                  <div 
                    className="absolute bg-zinc-950 border border-zinc-800 text-white rounded-2xl p-3 shadow-xl z-30 animate-in fade-in duration-100 flex flex-col gap-1 w-44 pointer-events-none text-xs font-semibold"
                    style={{ left: `${Math.min(activeTooltip.x - 30, 310)}px`, top: `${Math.max(activeTooltip.y - 80, 5)}px` }}
                  >
                    <span className="text-[10px] font-black text-zinc-450 uppercase tracking-wider">{activeTooltip.label}</span>
                    <div className="flex flex-col text-[10px] leading-relaxed font-bold mt-1 text-zinc-200 font-sans gap-0.5">
                      {activeTooltip.values.map((v, index) => <span key={index}>{v}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 🏢 3. REVENUE BREAKDOWN & CAMP PERFORMANCE WIDGETS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* WIDGET C1: REVENUE BY CUSTOMER CRM GROUPS */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-850 dark:text-zinc-200 uppercase tracking-wider">🎯 Phân Bổ Doanh Thu CRM</h3>
                  <span className="text-[9.5px] text-muted-foreground font-semibold block mt-0.5">Thống kê doanh số theo nhóm đối tượng khách hàng</span>
                </div>
              </div>

              {/* Donut Chart (Customer Group Shares) */}
              <div className="flex flex-col items-center gap-5 mt-2">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/40" strokeWidth="3" />
                    
                    {/* Dynamic Cohort Percentages Stroke Dasharray */}
                    {(() => {
                      let accumulatedPercent = 0
                      return revenueDist.map((item, i) => {
                        const strokeDash = `${item.percentage} ${100 - item.percentage}`
                        const strokeOffset = 100 - accumulatedPercent
                        accumulatedPercent += item.percentage

                        // Replace brand color dynamically if it matches dark zinc
                        const displayColor = item.color === '#18181b' ? 'currentColor' : item.color;
                        const classText = item.color === '#18181b' ? 'text-zinc-900 dark:text-zinc-100' : '';

                        return (
                          <circle 
                            key={i}
                            cx="18" 
                            cy="18" 
                            r="15.915" 
                            fill="transparent" 
                            stroke={displayColor} 
                            className={`${classText} hover:stroke-[4.2] transition duration-200 cursor-pointer`}
                            strokeWidth="3.5" 
                            strokeDasharray={strokeDash}
                            strokeDashoffset={strokeOffset}
                          >
                            <title>{`${item.groupName}: ${item.percentage}%`}</title>
                          </circle>
                        )
                      })
                    })()}
                  </svg>
                  {/* Donut hole center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Tổng Thu</span>
                    <strong className="text-sm font-black text-zinc-900 dark:text-zinc-50 font-mono mt-0.5">
                      {formatVND(stats.revenue)}
                    </strong>
                  </div>
                </div>

                {/* Custom Cohort list legends */}
                <div className="flex flex-col gap-1.5 w-full">
                  {revenueDist.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-bold border-b border-zinc-100 dark:border-zinc-850 pb-1">
                      <span className="flex items-center gap-1.5 text-zinc-650 dark:text-zinc-400">
                        <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.color }} />
                        {item.groupName}
                      </span>
                      <div className="flex gap-2 font-mono">
                        <span className="text-zinc-800 dark:text-zinc-200 font-black">{formatVND(item.revenue)}</span>
                        <span className="text-muted-foreground font-extrabold">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WIDGET C2: ROOMS & BRANCHES PERFORMANCE RANKING */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-850 dark:text-zinc-200 uppercase tracking-wider">🏢 Hiệu Suất Buồng Phòng</h3>
                  <span className="text-[9.5px] text-muted-foreground font-semibold block mt-0.5">Xếp hạng doanh thu và công suất chi nhánh</span>
                </div>
              </div>

              {/* Branch occupancy ranks (Top performer vs Underperformer) */}
              <div className="flex flex-col gap-2 mt-2">
                {ROOM_PERFORMANCE.map((perf, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-xl border flex justify-between items-center transition ${
                      perf.status === 'excellent' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                        : perf.status === 'good'
                        ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-450'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <strong className="text-xs font-bold leading-none tracking-tight">{perf.name}</strong>
                      <span className="text-[9.5px] text-zinc-555 dark:text-zinc-400 font-medium leading-none">Chi nhánh: {perf.branch} | {perf.bookingsCount} đặt phòng</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 font-mono text-xs">
                      <strong className="font-extrabold text-zinc-900 dark:text-zinc-50 leading-none">{formatVND(perf.revenue)}</strong>
                      
                      {/* Occupancy Indicator badge */}
                      <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                        perf.status === 'excellent' ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400' :
                        perf.status === 'good' ? 'bg-zinc-150 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' :
                        'bg-rose-500/20 text-rose-800 dark:text-rose-400'
                      }`}>
                        ⚡ lấp {perf.occupancy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET C3: MARKETING CAMPAIGNS SUCCESS AND FAILURES (1 col width) */}
            <div className="bg-card border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-850 dark:text-zinc-200 uppercase tracking-wider">📢 Phân Tích Chiến Dịch Marketing</h3>
                  <span className="text-[9.5px] text-muted-foreground font-semibold block mt-0.5">Bảng đo hiệu suất chuyển đổi tin nhắn (CTR)</span>
                </div>
              </div>

              {/* Campaign performance cards */}
              <div className="flex flex-col gap-3 font-sans">
                {CAMPAIGNS_PERFORMANCE.map((camp, i) => (
                  <div key={i} className="flex flex-col gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 p-3 rounded-xl transition hover:shadow-2xs">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        <strong className="text-[10.5px] font-bold text-zinc-850 dark:text-zinc-200 truncate block" title={camp.name}>
                          {camp.name}
                        </strong>
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wide leading-none">
                          Tệp: {camp.targetGroup} | {camp.sentCount} tin gửi
                        </span>
                      </div>
                      
                      {/* Success / Conversion Status tag */}
                      <span className={`px-2 py-0.5 border rounded-md text-[8.5px] font-black uppercase tracking-wider ${
                        camp.status === 'excellent' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/20' :
                        camp.status === 'normal' ? 'bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' :
                        'bg-rose-500/10 text-rose-700 dark:text-rose-455 border-rose-500/20'
                      }`}>
                        {camp.status === 'excellent' ? 'Thành công 🚀' :
                         camp.status === 'normal' ? 'Bình thường ✅' : 'Tối ưu ⚠️'}
                      </span>
                    </div>

                    {/* Progress conversion bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-grow bg-zinc-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-200/40 dark:border-zinc-700/40">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            camp.status === 'excellent' ? 'bg-emerald-500 dark:bg-emerald-400' :
                            camp.status === 'normal' ? 'bg-zinc-500 dark:bg-zinc-400' :
                            'bg-rose-500 dark:bg-rose-400'
                          }`}
                          style={{ width: `${camp.ctr}%` }}
                        />
                      </div>
                      <span className="text-[10.5px] font-extrabold font-mono text-zinc-900 dark:text-zinc-50 min-w-[36px] text-right">
                        {camp.ctr}% CTR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 🔮 4. INTERACTIVE AI COPILOT ANALYST & MARKETING RECOMMENDATION PANEL */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-2xl p-5 md:p-8 flex flex-col gap-5 md:gap-6 shadow-xl relative overflow-hidden border border-zinc-800 select-none">
            
            {/* Background glowing pattern */}
            <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-emerald-550/5 blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
                  <Bot size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider text-white">Bliss Copilot AI Analytics</h3>
                  <span className="text-[10px] text-white/50 font-bold block mt-0.5 tracking-wider uppercase">ĐỀ XUẤT KẾ HOẠCH SALE & MARKETING TỰ ĐỘNG</span>
                </div>
              </div>

              {/* Trigger Button */}
              <button
                onClick={handleTriggerAIAnalysis}
                disabled={isAnalyzing}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black text-xs px-5 py-3 rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-500/10 active:scale-95 transition-all duration-200"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang Đọc Biểu Đồ & Thống Kê...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-white" />
                    <span>Phân Tích Dữ Liệu Bằng AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Analytics Area */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 animate-in fade-in duration-300 select-none">
                <Flame size={32} className="text-emerald-550 animate-bounce" />
                <span className="text-[10px] text-white/60 font-black tracking-widest uppercase animate-pulse">
                  AI đang quét doanh thu từng chi nhánh và đo lường CTR chiến dịch...
                </span>
              </div>
            )}

            {!isAnalyzing && !aiAnalysis && (
              <div className="text-center py-10 text-white/40 font-semibold text-xs border border-dashed border-white/10 rounded-2xl select-none">
                Nhấp nút "Phân Tích Dữ Liệu Bằng AI" ở góc trên để khởi chạy báo cáo đề xuất thông minh!
              </div>
            )}

            {!isAnalyzing && aiAnalysis && (
              <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl leading-relaxed animate-in slide-in-from-bottom duration-300 max-h-[480px] overflow-y-auto pr-1">
                {/* Structured reports inside custom Markdown view */}
                <div className="prose prose-invert prose-xs text-xs text-zinc-200 select-text selection:bg-emerald-600 font-sans">
                  
                  {/* Executive Summary */}
                  <div className="mb-5 border-b border-white/5 pb-4">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle size={13} /> 1. Đánh giá sức khỏe kinh doanh & công suất chi nhánh:
                    </h4>
                    <p className="font-medium text-zinc-300 leading-relaxed pl-5">
                      {timeFilter === 'week' && 'Tuần này ghi nhận doanh số ổn định 14.200.000đ từ 9 lượt booking thành công, cải thiện +8.5% so với tuần trước.'}
                      {timeFilter === 'month' && 'Doanh thu tháng này ghi nhận cột mốc bùng nổ 68.450.000đ (+14.2% so với tháng trước), với phân khúc "Đi gia đình" làm động cơ sinh lời cốt lõi (chiếm 50% doanh thu).'}
                      {timeFilter === 'quarter' && 'Doanh thu quý đạt tốc độ tăng trưởng ổn định vượt mong đợi 204.500.000đ (+22.1%), với lượng khách hàng trung thành quay lại đặt đơn đạt tỷ lệ cao trên 38%.'}
                      {timeFilter === 'year' && 'Doanh thu thường niên chạm mốc đột phá vượt trội 818.000.000đ (+38.4%), ghi dấu một năm hoạt động vô cùng hiệu quả với 540 đơn booking thành công.'}
                    </p>
                    <p className="font-medium text-zinc-300 leading-relaxed pl-5 mt-2">
                      <strong className="text-emerald-300 font-bold">Điểm Sáng Vận Hành:</strong> Cozy Wooden Cabin CS3 (Quận 5) đạt công suất buồng phòng xuất sắc trên 90%, dẫn đầu về doanh số nhờ các combo setup nướng BBQ Hinoki tiện ích gia đình cực vui.
                    </p>
                    <p className="font-medium text-zinc-300 leading-relaxed pl-5 mt-2">
                      <strong className="text-rose-300 font-bold">Điểm Cần Cải Thiện:</strong> Sunlit Glass House CS4 (Gò Vấp) đang chịu hiệu suất lấp đầy rất thấp (~20%). Thiết kế kính ngắm nắng hoàn toàn ngoài trời đang tạo rào cản lớn về tính bảo mật riêng tư vào ban ngày của tệp khách lẻ, cần sớm có giải pháp khắc phục che chắn.
                    </p>
                  </div>

                  {/* Campaigns & Promotions Analysis */}
                  <div className="mb-5 border-b border-white/5 pb-4">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle size={13} /> 2. Đánh giá chiến dịch marketing & voucher đa tầng:
                    </h4>
                    <ul className="list-disc pl-9 flex flex-col gap-1.5 font-medium text-zinc-300">
                      <li><strong className="text-zinc-100 font-bold">💬 Kênh truyền thông Zalo ZNS đại thắng:</strong> Chiến dịch chăm sóc hội viên Gold <code className="bg-white/10 px-1 rounded text-emerald-300 font-mono text-[10px]">MKT-02</code> đạt tỷ lệ CTR chuyển đổi kỷ lục lên đến <strong className="text-emerald-400 font-bold">38.2%</strong>. Đây là kênh tin nhắn chủ lực mang lại hiệu quả vượt trội.</li>
                      <li><strong className="text-zinc-100 font-bold">📧 Kênh Email cần xem xét điều chỉnh:</strong> Chiến dịch email tiếp thị <code className="bg-white/10 px-1 rounded text-emerald-300 font-mono text-[10px]">MKT-03</code> chỉ đạt CTR <strong className="text-rose-400 font-bold">9.8%</strong>. Lý do cốt lõi nằm ở tiêu đề gửi chưa tạo tính tò mò và chưa chèn đúng biến voucher cá nhân hóa.</li>
                    </ul>
                  </div>

                  {/* Strategic Sales & Marketing Action Plans */}
                  <div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle size={13} /> 3. Đề xuất kế hoạch hành động Sales & Marketing cụ thể:
                    </h4>
                    <div className="flex flex-col gap-3.5 pl-5 mt-3 font-medium text-zinc-300 leading-relaxed">
                      
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex gap-2.5">
                        <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 font-black text-[11px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                        <p>
                          <strong className="text-zinc-100 block font-bold mb-1">Cải tạo và kích cầu khẩn cấp cho chi nhánh Gò Vấp (CS4):</strong>
                          Tiến hành bổ sung rèm tự động hoặc rèm tre mỹ thuật tại Sunlit Glass House để tạo không gian kín đáo ban ngày. Thiết lập chiến dịch Zalo ZNS flash sale giảm giá 25% giờ thấp điểm trưa giữa tuần dành riêng cho nhóm khách hàng <strong>"Thuê ngắn giờ"</strong> để lấp trống phòng.
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex gap-2.5">
                        <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 font-black text-[11px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                        <p>
                          <strong className="text-zinc-100 block font-bold mb-1">Nhân rộng mô hình "Cabin Sum Vầy" sang chi nhánh Tân Bình (CS1):</strong>
                          Tạo gói đặt phòng cuối tuần sum họp đính kèm ưu đãi miễn phí nướng BBQ và setup bồn Hinoki tặng rèm che ngoài trời cho nhóm khách hàng <strong>"Đi gia đình"</strong> có doanh số cao trong quý.
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex gap-2.5">
                        <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 font-black text-[11px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                        <p>
                          <strong className="text-zinc-100 block font-bold mb-1">Dịch chuyển ngân sách sang kênh Zalo ZNS ZNS đính kèm voucher động:</strong>
                          Tạm dừng các chiến dịch email thủ công CTR thấp. Kích hoạt tính năng gửi tin nhắn cá nhân hóa tự động mừng sinh nhật khách hàng VIP Gold/Diamond trước 7 ngày, đính kèm mã code giảm giá 20% tự động để gia tăng tỷ lệ khách quay lại đặt phòng dài lâu.
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}
