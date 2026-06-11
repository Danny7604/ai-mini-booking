'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  time: string
}

interface Suggestion {
  filter: string
  label: string
  icon: string
}

const suggestions: Suggestion[] = [
  { filter: 'bath', label: 'Có bồn tắm chill', icon: '🛁' },
  { filter: 'cloud', label: 'View săn mây cực đỉnh', icon: '☁️' },
  { filter: 'couple', label: 'Cho cặp đôi lãng mạn', icon: '👩‍❤️‍👨' },
  { filter: 'family', label: 'Thích hợp gia đình', icon: '🏡' },
  { filter: 'budget', label: 'Tiết kiệm (Dưới 1.5tr)', icon: '🏷️' },
  { filter: 'pool', label: 'Có hồ bơi vô cực', icon: '🏊‍♂️' }
]

interface AIAssistantProps {
  currentFilter: string
  onFilterChange: (filter: string, label: string) => void
  onAISearchSync: (branch: string, roomId: string) => void // Callback đồng bộ hai cổng
}

export default function AIAssistant({ currentFilter, onFilterChange, onAISearchSync }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Xin chào! Mình là **Bliss help center**, trợ lý ảo của Bliss Home. 🌸 mình có thể giúp bạn tìm căn phòng ưng ý nhất tại đây. Bạn muốn căn phòng như thế nào? Hãy mô tả bằng tiếng Việt hoặc chọn nhanh các gợi ý phía dưới nhé!',
      time: 'Vừa xong'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cuộn tin nhắn xuống cuối cùng khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Lời chào bổ sung sau khi trang load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        setMessages(prev => [
          ...prev,
          {
            id: 'welcome-2',
            sender: 'bot',
            text: '🌸 Hiện tại đang là mùa săn mây ngập tràn vô cùng thơ mộng tại Bliss Home đó ạ! Bạn có muốn tìm phòng **có bồn tắm gỗ Hinoki** ngoài trời hay căn **view hoàng hôn góc siêu rộng** không ạ? 👇',
            time
          }
        ])
      }, 1000)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Trích xuất chi nhánh và phòng từ tin nhắn để đồng bộ hóa lên Header Selects
  const parseAndSyncSearch = (text: string) => {
    const cleanText = text.toLowerCase()
    let detectedBranch = ''
    let detectedRoom = ''

    // 1. Phân tích Chi nhánh
    if (cleanText.includes('tân bình') || cleanText.includes('cs1') || cleanText.includes('xuân hồng')) {
      detectedBranch = 'Bliss Home - Tân Bình (CS1) 🏡'
    } else if (cleanText.includes('quận 10') || cleanText.includes('cs2') || cleanText.includes('ba tháng hai') || cleanText.includes('3/2')) {
      detectedBranch = 'Bliss Home - Quận 10 (CS2) 🏙️'
    } else if (cleanText.includes('quận 5') || cleanText.includes('cs3') || cleanText.includes('phạm hữu chí')) {
      detectedBranch = 'Bliss Home - Quận 5 (CS3) 🪟'
    } else if (cleanText.includes('gò vấp') || cleanText.includes('cs4') || cleanText.includes('phan huy ích')) {
      detectedBranch = 'Bliss Home - Gò Vấp (CS4) 🌸'
    } else if (cleanText.includes('bình thạnh') || cleanText.includes('cs5') || cleanText.includes('bùi đình túy')) {
      detectedBranch = 'Bliss Home - Bình Thạnh (CS5) 🌿'
    }

    // 2. Phân tích Phòng nghỉ
    if (cleanText.includes('pine forest loft') || cleanText.includes('gác mái') || cleanText.includes('loft')) {
      detectedRoom = 'pine-forest-loft'
    } else if (cleanText.includes('valley view suite') || cleanText.includes('valley view') || cleanText.includes('suite')) {
      detectedRoom = 'valley-view-suite'
    } else if (cleanText.includes('cozy wooden cabin') || cleanText.includes('wooden cabin') || cleanText.includes('cabin')) {
      detectedRoom = 'cozy-wooden-cabin'
    } else if (cleanText.includes('sunlit glass house') || cleanText.includes('glass house') || cleanText.includes('nhà kính')) {
      detectedRoom = 'sunlit-glass-house'
    } else if (cleanText.includes('riverside nest') || cleanText.includes('tổ chim') || cleanText.includes('riverside')) {
      detectedRoom = 'riverside-nest'
    } else if (cleanText.includes('sunset panorama') || cleanText.includes('panorama') || cleanText.includes('bể bơi') || cleanText.includes('vô cực')) {
      detectedRoom = 'sunset-panorama'
    }

    if (detectedBranch || detectedRoom) {
      onAISearchSync(detectedBranch, detectedRoom)
    }
  }

  // Xử lý gửi tin nhắn tự do
  const handleSendMessage = () => {
    const text = inputText.trim()
    if (!text) return

    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const userMsgId = 'user-' + Date.now()
    
    // 1. Thêm tin nhắn của User
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text, time }])
    setInputText('')
    
    // Đồng bộ tức thời lên Header Form nếu tìm thấy chi nhánh/phòng trong từ khóa
    parseAndSyncSearch(text)
    
    // 2. Kích hoạt hiệu ứng gõ chữ
    setIsTyping(true)

    // 3. Xử lý phản hồi RAG chống ảo giác và phản hồi theo từ khóa
    setTimeout(() => {
      setIsTyping(false)
      const botTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      const cleanText = text.toLowerCase()
      let botResponse = ''
      let newFilter = 'all'
      let newLabel = 'Tất cả phòng nghỉ'

      // RAG Anti-Hallucination Guardrails
      const relevantKeywords = [
        'phòng', 'room', 'chào', 'hi', 'helo', 'hello', 'tắm', 'mây', 'view', 
        'cặp', 'đôi', 'gia đình', 'rẻ', 'tiết kiệm', 'bể bơi', 'hồ bơi', 'pool', 
        'chi nhánh', 'địa chỉ', 'giá', 'giờ', 'đêm', 'đặt', 'book', 'saigon', 
        'sài gòn', 'bliss', 'home', 'tân bình', 'quận 10', 'quận 5', 'gò vấp', 
        'bình thạnh', 'loft', 'suite', 'cabin', 'glass', 'nest', 'panorama', 
        'bồn', 'tắm', 'hinoki', 'marshall', 'nướng', 'bbq', 'netflix', 'ăn', 
        'uống', 'giúp', 'hỗ trợ', 'reset', 'làm mới', 'cảm ơn', 'thanks', 'tuyệt', 
        'ok', 'được', 'yes'
      ]
      
      const isRelevant = relevantKeywords.some(kw => cleanText.includes(kw))

      if (!isRelevant) {
        botResponse = 'Ui da, chủ đề này "hack não" Bé Bliss quá! 🧠💦 Hiện tại Bé Bliss chỉ giỏi tư vấn phòng đi trốn ở Bliss Home thôi hà. Hay là mình thử tìm mấy phòng có bồn tắm gỗ Hinoki ngoài trời sang chảnh, view săn mây đồi núi hoặc hỏi về 5 chi nhánh của Bliss Home nha!'
      } else {
        if (cleanText.includes('bồn tắm') || cleanText.includes('tắm') || cleanText.includes('bath') || cleanText.includes('jacuzzi')) {
          newFilter = 'bath'
          newLabel = 'Có bồn tắm chill'
          botResponse = 'Úi chà, gu ngâm mình thư giãn ngắm cảnh đúng không nè? 🛁 Bé Bliss đã lọc ngay các căn phòng có bồn tắm đắt giá nhất Bliss Home rồi đây. Đặc biệt căn **Pine Forest Loft** có bồn tắm Hinoki ngoài trời cho bạn tha hồ "sống ảo" xà phòng bay phấp phới luôn! Lướt xem liền nha!'
        } else if (cleanText.includes('mây') || cleanText.includes('thung lũng') || cleanText.includes('săn mây') || cleanText.includes('view đồi') || cleanText.includes('panorama')) {
          newFilter = 'cloud'
          newLabel = 'View săn mây cực đỉnh'
          botResponse = 'Muốn làm "thần tiên tỉ tỉ" bay bổng giữa biển mây đúng không? ☁️ Đã lọc ngay các căn view đỉnh chóp rồi nè! Điển hình là căn **Valley View Suite** ngắm mây 180 độ. Sáng ngủ dậy kéo nhẹ rèm là mây ùa vào mát rượi, nằm lười ôm gối ngủ tiếp là hết sảy!'
        } else if (cleanText.includes('cặp đôi') || cleanText.includes('2 người') || cleanText.includes('lãng mạn') || cleanText.includes('yêu') || cleanText.includes('vợ chồng') || cleanText.includes('hai người')) {
          newFilter = 'couple'
          newLabel = 'Cho cặp đôi lãng mạn'
          botResponse = 'Hí hí, có mùi "cẩu lương" đâu đây nha! 👩‍❤️‍👨 Đã lọc ngay các căn phòng siêu lãng mạn, ấm cúng và kín đáo để hai bạn tha hồ sưởi ấm tình cảm nhé. Đề xuất nhiệt tình căn **Sunlit Glass House (Nhà kính ngập nắng)** giữa vườn hoa cực kỳ thơ mộng!'
        } else if (cleanText.includes('gia đình') || cleanText.includes('4 người') || cleanText.includes('trẻ em') || cleanText.includes('nhóm') || cleanText.includes('đông người') || cleanText.includes('family')) {
          newFilter = 'family'
          newLabel = 'Thích hợp gia đình'
          botResponse = 'Chào cả nhà mình ạ! Biệt đội đi trốn thế giới tụ họp đông đủ chưa nè? 🏡 Bé Bliss đã lọc ngay các căn rộng rãi, đầy đủ bếp núc cho các chiến thần trổ tài nấu nướng. Căn cabin gỗ **Cozy Wooden Cabin** có lò sưởi ấm áp và hiên nướng BBQ sẽ là nơi lý tưởng để "tám" xuyên màn đêm đó!'
        } else if (cleanText.includes('rẻ') || cleanText.includes('tiết kiệm') || cleanText.includes('giá tốt') || cleanText.includes('ít tiền') || cleanText.includes('budget') || cleanText.includes('dưới 1.5 triệu')) {
          newFilter = 'budget'
          newLabel = 'Tiết kiệm (Dưới 1.5tr)'
          botResponse = 'Đang "xẹp ví" nhưng tâm hồn vẫn muốn bay bổng đi trốn? Bé Bliss hiểu mà! 💸 Đã gom ngay danh sách các phòng siêu hạt dẻ dưới 1.5 triệu/đêm. Cực kỳ đề xuất căn **Riverside Nest (Tổ chim ven suối)** chỉ 950k/đêm để bạn tha hồ chill mà không lo "cháy túi"!'
        } else if (cleanText.includes('hồ bơi') || cleanText.includes('bể bơi') || cleanText.includes('pool') || cleanText.includes('bơi')) {
          newFilter = 'pool'
          newLabel = 'Có hồ bơi vô cực'
          botResponse = 'Đắm mình giữa làn nước ấm ngắm hoàng hôn buông xuống rừng thông thì sang chảnh thôi rồi! 🏊‍♂️ Đã lọc ngay căn **Sunset Panorama** VIP có bể bơi nước ấm vô cực riêng. Chuẩn bị bikini để thả dáng sống ảo triệu like thôi bạn ơi!'
        } else if (cleanText.includes('công') || cleanText.includes('địa chỉ') || cleanText.includes('chi nhánh') || cleanText.includes('ở đâu') || cleanText.includes('vị trí')) {
          botResponse = 'Nghe đồn bạn muốn tìm tọa độ đi trốn? Bliss Home đang phủ sóng 5 chi nhánh siêu gần ngay tại Sài Gòn đây: \n\n📍 **CS1 (Tân Bình)**: 71 Xuân Hồng, P.12.\n📍 **CS2 (Quận 10)**: 25a Đường 3/2, P.11.\n📍 **CS3 (Quận 5)**: 2N Đường Phạm Hữu Chí, P.12.\n📍 **CS4 (Gò Vấp)**: 331/16 Đường Phan Huy Ích, P.14.\n📍 **CS5 (Bình Thạnh)**: 217/70/5 Đường Bùi Đình Tuý, P.14.\n\nChọn một điểm rồi Bé Bliss dắt đi trốn nhé! 🏡'
        } else if (cleanText.includes('chào') || cleanText.includes('hi') || cleanText.includes('hello') || cleanText.includes('helo') || cleanText.includes('alo')) {
          botResponse = 'Dạ lô bạn yêu! Rất vui được gặp bạn nè. 🌸 Bạn muốn tìm căn phòng nào để trốn deadline, trốn thế giới hay trốn... nợ? Hãy miêu tả căn phòng trong mơ hoặc chọn nhanh gợi ý phía dưới để Bé Bliss dẫn lối nha!'
        } else if (cleanText.includes('cảm ơn') || cleanText.includes('thank') || cleanText.includes('tuyệt') || cleanText.includes('ok')) {
          botResponse = 'Hì hì, không có chi nè! Niềm vui của Bé Bliss là được hỗ trợ bạn tìm phòng đi trốn deadline. Chúc bạn tìm được căn phòng ưng ý tại Bliss Home nha! 🌸✨'
        } else {
          botResponse = `A ha! Nhận được tín hiệu vũ trụ từ bạn rồi nè: *" ${text} "*. ✨ Dựa trên tần số này, Bé Bliss đã lọc ra những phòng nghỉ chill nhất, gần gũi thiên nhiên nhất tại Bliss Home. Bạn xem chi tiết các phòng ở danh sách bên cạnh nha!`
        }
      }

      onFilterChange(newFilter, newLabel)
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: botResponse,
          time: botTime
        }
      ])
    }, 800)
  }

  // Xử lý click thẻ gợi ý (Suggestion chips)
  const handleSuggestionClick = (filter: string, label: string) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const userMsgId = 'user-' + Date.now()

    // 1. Thêm tin nhắn user tự động
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: `Tìm phòng: ${label}`,
        time
      }
    ])

    setIsTyping(true)

    // 2. Trả lời cụ thể của Bot Bliss help center và lọc phòng
    setTimeout(() => {
      setIsTyping(false)
      const botTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      let botResponse = ''

      switch (filter) {
        case 'bath':
          botResponse = 'Bé Bliss đã lọc các phòng **có bồn tắm cực kỳ thư giãn**. Ngâm mình ngắm rừng thông hay thung lũng mây bay thì còn gì chill bằng đúng không bạn! 🛁🌲'
          break
        case 'cloud':
          botResponse = 'Biển mây đang đợi bạn! Bé Bliss vừa mở bộ lọc những phòng **săn mây đẹp nhất**. Kéo nhẹ rèm là thấy mây ùa vào tận giường nằm luôn đó nha! ☁️✨'
          break
        case 'couple':
          botResponse = 'Tình yêu bay bổng trong không gian bình yên! Bé Bliss đã lựa ra các góc nhỏ ấm áp, lãng mạn **thích hợp nhất cho 2 người** du lịch cùng nhau. 👩‍❤️‍👨'
          break
        case 'family':
          botResponse = 'Chuyến đi gắn kết của cả nhà! Bé Bliss đã lọc các căn cabin gỗ rộng lớn, có bếp nấu nướng và sân nướng BBQ sưởi ấm rất **phù hợp cho gia đình từ 4-6 người**.'
          break
        case 'budget':
          botResponse = 'Đi trốn thế giới nhưng chi phí cực kỳ nhẹ nhàng! Bé Bliss đã lọc các căn có **giá vô cùng hạt dẻ chỉ dưới 1.5 triệu/đêm** để bạn vui chơi không lo nghĩ.'
          break
        case 'pool':
          botResponse = 'Thư thái vẫy vùng giữa mây ngàn! Bé Bliss đã lọc căn phòng hoàng hôn có **bể bơi nước ấm vô cực mini ngoài trời** siêu VIP cho bạn trải nghiệm.'
          break
        default:
          botResponse = 'Bé Bliss hiển thị danh sách các phòng lý tưởng cho bạn nhé!'
      }

      onFilterChange(filter, label)
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: botResponse,
          time: botTime
        }
      ])
    }, 600)
  }

  // Xóa lịch sử chat
  const handleResetChat = () => {
    onFilterChange('all', 'Tất cả phòng nghỉ')
    setMessages([
      {
        id: 'reset-1',
        sender: 'bot',
        text: 'Lịch sử hội thoại đã được làm mới. Mình là **Bliss help center**, trợ lý ảo của Bliss Home. 🌸 Bạn có muốn mình hỗ trợ tìm phòng view đẹp hay bồn tắm ngâm mình không ạ?',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  return (
    <div className="bg-white/85 backdrop-blur-md border border-stone-200/50 rounded-3xl shadow-sm flex flex-col h-[500px] lg:h-[660px] overflow-hidden">
      {/* Header Khung Chat */}
      <div className="bg-gradient-to-br from-stone-900 to-[#0D3149] p-4 flex items-center justify-between text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Bliss help center Avatar"
              className="w-full h-full object-contain rounded-full border-2 border-white/20 bg-white p-1"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 border border-stone-900 rounded-full"></span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm leading-tight text-white font-sans">Bliss help center</h4>
            <span className="text-[10px] text-white/60 block mt-0.5">Trực tuyến • Phản hồi 24/7</span>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border-none text-white flex items-center justify-center cursor-pointer transition"
          title="Làm mới chat"
        >
          🔄
        </button>
      </div>

      {/* Khu vực Tin nhắn cuộn */}
      <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth bg-stone-50/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              msg.sender === 'user' ? 'self-end' : 'self-start'
            }`}
          >
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-xs md:text-sm shadow-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0D3149] text-white rounded-br-xs'
                  : 'bg-white text-stone-800 border border-stone-100 rounded-bl-xs'
              }`}
            >
              {/* Render in đậm markdown giả lập */}
              {msg.text.split('**').map((part, i) => (i % 2 === 1 ? <strong key={i} className={msg.sender === 'user' ? 'text-blue-100' : 'text-[#0D3149] font-bold'}>{part}</strong> : part))}
            </div>
            <span className={`text-[9px] text-stone-400 px-1 mt-0.5 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              {msg.time}
            </span>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="self-start max-w-[80%] flex flex-col gap-0.5">
            <div className="bg-white border border-stone-100 px-3.5 py-3 rounded-2xl rounded-bl-xs shadow-xs flex gap-1 items-center justify-center w-14">
              <span className="w-1.5 h-1.5 bg-[#0D3149] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-[#0D3149] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-[#0D3149] rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="p-3 bg-stone-50/60 border-t border-stone-100 flex flex-col gap-2 flex-shrink-0">
        <span className="text-[10px] font-bold text-[#0D3149] tracking-wider uppercase flex items-center gap-1">
          ⚡ Gợi ý tìm nhanh
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-[78px] overflow-y-auto">
          {suggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(chip.filter, chip.label)}
              className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                currentFilter === chip.filter
                  ? 'bg-[#0D3149] border-[#0D3149] text-white'
                  : 'bg-white border-stone-200/80 text-stone-700 hover:border-[#0D3149] hover:text-[#0D3149]'
              }`}
            >
              {chip.icon} {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center flex-shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Gõ mô tả phòng (vd: bồn tắm, săn mây)..."
          className="flex-grow border border-stone-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-[#0D3149] focus:border-[#0D3149] font-sans"
        />
        <button
          onClick={handleSendMessage}
          className="w-9 h-9 rounded-xl bg-[#0D3149] hover:bg-[#124263] text-white flex items-center justify-center cursor-pointer transition border-none shadow-sm flex-shrink-0 font-bold"
        >
          ➔
        </button>
      </div>
    </div>
  )
}
