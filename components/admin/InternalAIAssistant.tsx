'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, X, Terminal, Zap, Check, CornerDownRight } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

interface Message {
  id: string
  text: string
  sender: 'user' | 'system' | 'bot'
  time: string
  action?: {
    type: 'FILTER_STATUS' | 'SEARCH_AND_OPEN' | 'HIGHLIGHT_STAT'
    payload: string
    description: string
  }
  actionExecuted?: boolean
}

interface InternalAIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export default function InternalAIAssistant({ isOpen, onClose }: InternalAIAssistantProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Xin chào Admin! Tôi là **Bliss Copilot**, trợ lý vận hành nội bộ của Bliss Home Sài Gòn. 🔐 Tôi có thể hỗ trợ bạn kiểm tra hiệu suất phòng, soạn thảo chiến dịch voucher, tóm tắt trạng thái booking hoặc phân tích chi nhánh quá tải. Bạn muốn kiểm tra hạng mục nào hôm nay?',
      time: 'Vừa xong'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isTyping])

  /**
   * Xử lý thực thi hành động giao diện
   * 1. Điều hướng đến đúng trang đích nếu admin đang ở trang khác
   * 2. Phát sự kiện Window CustomEvent 'bliss-admin-action'
   */
  const handleExecuteAction = async (msgId: string, action: NonNullable<Message['action']>) => {
    try {
      // 1. Xác định trang cần nhảy đến
      const targetPage = (action.type === 'FILTER_STATUS' || action.type === 'SEARCH_AND_OPEN') 
        ? '/admin/bookings' 
        : '/admin'

      if (pathname !== targetPage) {
        // Chuyển trang
        router.push(targetPage)
        // Chờ 250ms cho trang load xong và gắn event listener
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // 2. Dispatch Custom Event
      const event = new CustomEvent('bliss-admin-action', {
        detail: {
          type: action.type,
          payload: action.payload,
          description: action.description
        }
      })
      window.dispatchEvent(event)

      // 3. Đánh dấu hành động đã thực thi
      setMessages(prev => 
        prev.map(msg => msg.id === msgId ? { ...msg, actionExecuted: true } : msg)
      )

    } catch (error) {
      console.error('Lỗi khi thực thi lệnh giao diện Bliss Copilot:', error)
    }
  }

  /**
   * Xử lý bỏ qua hành động
   */
  const handleIgnoreAction = (msgId: string) => {
    setMessages(prev => 
      prev.map(msg => msg.id === msgId ? { ...msg, actionExecuted: true } : msg)
    )
  }

  /**
   * Xử lý gửi tin nhắn của Admin
   * Có bọc try...catch nghiêm ngặt và tự động bóc tách lệnh [ACTION: ...]
   */
  const handleSendMessage = async () => {
    const text = inputText.trim()
    if (!text) return

    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const userMsgId = 'admin-' + Date.now()

    try {
      // 1. Thêm tin nhắn của Admin vào luồng chat
      setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text, time }])
      setInputText('')
      setIsTyping(true)

      // 2. Gọi API Backend `/api/copilot` thực tế (Supabase + Gemini API)
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const resData = await response.json()
      let botResponse = resData.text || 'Dạ tôi không nhận được phản hồi phù hợp.'
      let action: Message['action'] = undefined

      // Bóc tách action tag [ACTION: ...]
      const actionRegex = /\[ACTION:\s*({[\s\S]*?})\]/
      const match = botResponse.match(actionRegex)
      if (match) {
        try {
          action = JSON.parse(match[1])
          // Xóa action tag khỏi phần tin nhắn hiển thị
          botResponse = botResponse.replace(actionRegex, '').trim()
        } catch (e) {
          console.error('Lỗi phân tích hành động AI gửi về:', e)
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'copilot-' + Date.now(),
          sender: 'bot',
          text: botResponse,
          action,
          actionExecuted: false,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } catch (error) {
      console.error('Lỗi nghiêm trọng khi Bliss Copilot xử lý tin nhắn:', error)
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'system',
          text: '❌ **Lỗi Copilot**: Trợ lý AI gặp gián đoạn kết nối với máy chủ Bliss Home. Vui lòng thử lại sau giây lát hoặc kiểm tra kết nối mạng của bạn.',
          time
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
      
      {/* HEADER KHUNG CHAT AI COPILOT */}
      <div className="bg-zinc-50 dark:bg-zinc-900 p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center text-white dark:text-zinc-900 shadow-inner">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase flex items-center gap-1.5">
              Bliss Copilot <span className="text-[8px] bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">INTERNAL AI</span>
            </h3>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block -mt-0.5 font-mono flex items-center gap-1">
              <Terminal size={8} className="text-zinc-650 dark:text-zinc-450" /> Hệ thống sẵn sàng vận hành RAG & Actionable
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-none text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition"
          title="Đóng ngăn kéo"
        >
          <X size={14} />
        </button>
      </div>

      {/* KHU VỰC TIN NHẮN ĐÀM THOẠI (CHAT LIST) */}
      <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 bg-zinc-50/30 dark:bg-zinc-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] flex flex-col gap-1.5 ${
              msg.sender === 'user' ? 'self-end' : 'self-start'
            }`}
          >
            <div className="flex items-center gap-1 text-[9px] text-zinc-500 dark:text-zinc-400 font-bold px-1">
              {msg.sender === 'user' ? (
                <>
                  <span>Quản trị viên</span> <User size={8} />
                </>
              ) : msg.sender === 'system' ? (
                <span className="text-rose-500 font-mono">⚠️ Hệ Thống</span>
              ) : (
                <>
                  <Bot size={8} className="text-zinc-600 dark:text-zinc-400" /> <span>Bliss Copilot</span>
                </>
              )}
            </div>
            
            {/* Hộp nội dung văn bản */}
            <div
              className={`px-3 py-2.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs font-medium ${
                msg.sender === 'user'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-tr-none border border-zinc-900 dark:border-zinc-100'
                  : msg.sender === 'system'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-tl-none font-mono'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none'
              }`}
            >
              {/* Parse in đậm markdown giả lập */}
              {msg.text.split('**').map((part, i) => (
                i % 2 === 1 ? <strong key={i} className="text-zinc-950 dark:text-white font-bold">{part}</strong> : part
              ))}
            </div>

            {/* RENDER THẺ THAO TÁC (GENERATIVE ACTION CARD - NẾU CÓ) */}
            {msg.action && !msg.actionExecuted && (
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 flex flex-col gap-2.5 mt-1 shadow-md animate-in slide-in-from-bottom duration-300 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
                <div className="flex items-start gap-2">
                  <Zap size={14} className="text-zinc-900 dark:text-zinc-100 animate-pulse mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">Hành Động Khuyên Dùng</span>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{msg.action.description}</span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end items-center">
                  <button
                    onClick={() => handleIgnoreAction(msg.id)}
                    className="px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-400 rounded-lg text-[10px] font-bold transition border-none cursor-pointer"
                  >
                    Bỏ qua
                  </button>
                  <button
                    onClick={() => handleExecuteAction(msg.id, msg.action!)}
                    className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-[10px] font-black tracking-wider uppercase transition shadow-md border-none flex items-center gap-1 cursor-pointer"
                  >
                    <CornerDownRight size={10} /> Đồng ý thực thi
                  </button>
                </div>
              </div>
            )}

            {/* RENDER TRẠNG THÁI ĐÃ THỰC THI (NẾU CÓ) */}
            {msg.action && msg.actionExecuted && (
              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl px-3 py-2 flex items-center gap-2 mt-0.5 text-zinc-500 select-none transition">
                <Check size={11} className="text-zinc-600 dark:text-zinc-400 font-bold" />
                <span className="text-[10px] font-semibold italic">Đã đồng ý thực thi thao tác tự động</span>
              </div>
            )}

            <span className={`text-[8px] text-zinc-400 dark:text-zinc-500 px-1 mt-0.5 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              {msg.time}
            </span>
          </div>
        ))}

        {/* AI TYPING INDICATOR */}
        {isTyping && (
          <div className="self-start max-w-[80%] flex flex-col gap-1">
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold flex items-center gap-1">
              <Bot size={8} className="text-zinc-600 dark:text-zinc-400 animate-spin" /> Bliss Copilot đang phân tích dữ liệu...
            </span>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-xs flex gap-1 items-center justify-center w-14">
              <span className="w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô NHẬP LIỆU CHAT COPILOT */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Hỏi về doanh thu, phòng trống, vouchers..."
          className="flex-grow border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 font-sans"
        />
        <button
          onClick={handleSendMessage}
          className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 flex items-center justify-center cursor-pointer transition border-none shadow-xs flex-shrink-0"
          title="Gửi yêu cầu"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
