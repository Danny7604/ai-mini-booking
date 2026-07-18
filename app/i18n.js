const vi = {
  brand: 'Dancin Home Booking',
  stepLabels: ['Thời gian', 'Chi nhánh', 'Phòng', 'Xác nhận'],
  back: '← Quay lại',
  next: 'Tiếp theo →',
  submit: 'Gửi yêu cầu',
  submitting: 'Đang phân tích...',
  errorDefault: 'Có lỗi xảy ra, vui lòng thử lại.',

  step1Title: 'Chọn thời gian',
  step1Desc: 'Chọn ngày và khung giờ nhận phòng.',
  dateLabel: 'Ngày',
  timeLabel: 'Giờ',
  morning: 'Sáng',
  afternoon: 'Chiều',

  step2Title: 'Chọn chi nhánh',
  step2Desc: 'Chọn quận nơi bạn muốn đặt homestay.',

  step3Title: 'Chọn phòng',
  step3Desc: 'Chọn homestay yêu thích tại {{branch}}.',

  step4Title: 'Thông tin & Lời nhắn',
  step4Desc: 'Điền thông tin của bạn và gửi yêu cầu.',
  nameLabel: 'Họ tên',
  namePlaceholder: 'Nguyễn Văn A',
  phoneLabel: 'Số điện thoại',
  phonePlaceholder: '0963 212 579',
  noteLabel: 'Lời nhắn / Yêu cầu thêm',
  notePlaceholder: 'Ví dụ: Tôi cần phòng yên tĩnh, có bồn tắm...',

  tagsTitle: 'Nhu cầu được phát hiện:',

  branches: [
    { id: 'q1', name: 'Quận 1', desc: 'Trung tâm, nhiều tiện ích' },
    { id: 'q3', name: 'Quận 3', desc: 'Yên tĩnh, gần trung tâm' },
    { id: 'q5', name: 'Quận 5', desc: 'Khu người Hoa, ẩm thực' },
    { id: 'q7', name: 'Quận 7', desc: 'Phú Mỹ Hưng, cao cấp' },
    { id: 'binh-thanh', name: 'Bình Thạnh', desc: 'Gần Landmark, sầm uất' },
    { id: 'tan-binh', name: 'Tân Bình', desc: 'Gần sân bay, di chuyển dễ' },
    { id: 'phu-nhuan', name: 'Phú Nhuận', desc: 'Nhiều quán xá, trẻ trung' },
  ],

  spaces: [
    { id: 'sunrise-villa', name: 'Sunrise Villa', desc: 'Máy chiếu, bồn tắm, bếp đầy đủ' },
    { id: 'garden-bungalow', name: 'Garden Bungalow', desc: 'Bồn tắm, phòng xông hơi, ban công' },
    { id: 'lake-view', name: 'Lake View', desc: 'Bếp, máy giặt, view thành phố' },
    { id: 'mountain-retreat', name: 'Mountain Retreat', desc: 'PlayStation 5, máy chiếu, cách âm' },
    { id: 'cozy-studio', name: 'Cozy Studio', desc: 'Bồn tắm, bếp nhỏ, wifi tốc độ cao' },
    { id: 'sky-cabin', name: 'Sky Cabin', desc: 'Phòng xông hơi, bồn tắm, sân thượng' },
  ],
}

const en = {
  brand: 'Dancin Home Booking',
  stepLabels: ['Time', 'Branch', 'Room', 'Confirm'],
  back: '← Back',
  next: 'Next →',
  submit: 'Submit',
  submitting: 'Analyzing...',
  errorDefault: 'Something went wrong, please try again.',

  step1Title: 'Select Time',
  step1Desc: 'Choose your check-in date and time slot.',
  dateLabel: 'Date',
  timeLabel: 'Time',
  morning: 'Morning',
  afternoon: 'Afternoon',

  step2Title: 'Select Branch',
  step2Desc: 'Choose a district for your homestay.',

  step3Title: 'Select Room',
  step3Desc: 'Pick your favorite homestay in {{branch}}.',

  step4Title: 'Info & Message',
  step4Desc: 'Fill in your details and submit your request.',
  nameLabel: 'Full Name',
  namePlaceholder: 'John Doe',
  phoneLabel: 'Phone Number',
  phonePlaceholder: '0963 212 579',
  noteLabel: 'Message / Special Requests',
  notePlaceholder: 'e.g. I need a quiet room with a bathtub...',

  tagsTitle: 'Detected needs:',

  branches: [
    { id: 'q1', name: 'District 1', desc: 'Central, many amenities' },
    { id: 'q3', name: 'District 3', desc: 'Quiet, near city center' },
    { id: 'q5', name: 'District 5', desc: 'Chinatown, great food' },
    { id: 'q7', name: 'District 7', desc: 'Phu My Hung, upscale' },
    { id: 'binh-thanh', name: 'Binh Thanh', desc: 'Near Landmark, vibrant' },
    { id: 'tan-binh', name: 'Tan Binh', desc: 'Near airport, easy travel' },
    { id: 'phu-nhuan', name: 'Phu Nhuan', desc: 'Lots of cafes, young vibe' },
  ],

  spaces: [
    { id: 'sunrise-villa', name: 'Sunrise Villa', desc: 'Projector, bathtub, full kitchen' },
    { id: 'garden-bungalow', name: 'Garden Bungalow', desc: 'Bathtub, sauna, balcony' },
    { id: 'lake-view', name: 'Lake View', desc: 'Kitchen, washer, city view' },
    { id: 'mountain-retreat', name: 'Mountain Retreat', desc: 'PlayStation 5, projector, soundproof' },
    { id: 'cozy-studio', name: 'Cozy Studio', desc: 'Bathtub, kitchenette, high-speed WiFi' },
    { id: 'sky-cabin', name: 'Sky Cabin', desc: 'Sauna, bathtub, rooftop' },
  ],
}

export const langs = { vi, en }
