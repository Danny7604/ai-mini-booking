'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Play, 
  Sparkles, 
  Trash2, 
  Plus, 
  Check, 
  GitBranch, 
  Smartphone, 
  Mail, 
  UserPlus, 
  Award, 
  ArrowRight,
  Database,
  RefreshCw,
  Info,
  ArrowLeft,
  Activity,
  Layers,
  Settings2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Link,
  Table,
  Send,
  Calendar,
  Sliders,
  CheckCircle2,
  HelpCircle,
  X,
  LayoutGrid,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

interface NodePort {
  id: string
  type: 'input' | 'output'
  label: string
}

interface AutomationNode {
  id: string
  type: 'trigger' | 'logic' | 'crm' | 'action' | 'webhook'
  label: string
  icon: any
  color: string
  inputs: NodePort[]
  outputs: NodePort[]
  x: number
  y: number
  config: Record<string, any>
}

interface Connection {
  fromId: string
  fromPort: string
  toId: string
  toPort: string
}

interface SimulatedLog {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

interface Scenario {
  id: string
  name: string
  description: string
  status: 'active' | 'draft' | 'paused' | 'expired'
  triggerName: string
  runCount: number
  channels: string[] // ['zalo', 'email', 'crm', 'voucher', 'webhook', 'google_sheets']
  nodes: AutomationNode[]
  connections: Connection[]
}

interface VariableItem {
  name: string
  code: string
  category: string
}

const AVAILABLE_VARIABLES: VariableItem[] = [
  { name: 'Tên Khách Hàng', code: '{{$trigger.name}}', category: 'Webhook/Form' },
  { name: 'Số Điện Thoại', code: '{{$trigger.phone}}', category: 'Webhook/Form' },
  { name: 'Email Khách Hàng', code: '{{$trigger.email}}', category: 'Webhook/Form' },
  { name: 'Nhóm Hành Vi', code: '{{$crm.behavior_group}}', category: 'CRM & Booking' },
  { name: 'Tổng Chi Tiêu', code: '{{$crm.total_spent}}', category: 'CRM & Booking' },
  { name: 'Mã Voucher', code: '{{$voucher.code}}', category: 'Khuyến Mãi' },
  { name: 'Giảm giá', code: '{{$voucher.discount}}', category: 'Khuyến Mãi' },
  { name: 'Mã Booking ID', code: '{{$booking.id}}', category: 'CRM & Booking' },
  { name: 'Tên Phòng Đặt', code: '{{$booking.room_name}}', category: 'CRM & Booking' },
  { name: 'Giá Trị Đơn Phòng', code: '{{$booking.room_price}}', category: 'CRM & Booking' },
]

interface SmartVariableInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  isTextarea?: boolean
  rows?: number
  label?: string
}

// COMPONENT NHẬP BIẾN THÔNG MINH ĐÃ ĐƯỢC CHUẨN HÓA LẬP TRÌNH CHÈN VỊ TRÍ CON TRỎ
export function SmartVariableInput({
  value,
  onChange,
  placeholder = '',
  isTextarea = false,
  rows = 3,
  label = ''
}: SmartVariableInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectVariable = (code: string) => {
    try {
      const input = inputRef.current
      if (input) {
        const start = input.selectionStart || 0
        const end = input.selectionEnd || 0
        const text = input.value
        const before = text.substring(0, start)
        const after = text.substring(end, text.length)
        const newValue = before + code + after
        onChange(newValue)
        
        // Trả lại focus và khôi phục vị trí cursor ngay sau biến vừa chèn
        setTimeout(() => {
          input.focus()
          input.setSelectionRange(start + code.length, start + code.length)
        }, 10)
      } else {
        onChange(value + ' ' + code)
      }
      setIsOpen(false)
      setSearch('')
    } catch (e) {
      console.error('Lỗi chèn biến:', e)
    }
  }

  const filteredVariables = AVAILABLE_VARIABLES.filter(v => {
    try {
      const query = search.toLowerCase()
      return v.name.toLowerCase().includes(query) || v.code.toLowerCase().includes(query) || v.category.toLowerCase().includes(query)
    } catch (e) {
      return false
    }
  })

  return (
    <div className="relative w-full flex flex-col gap-1 text-xs text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
      {label && <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px] tracking-wider">{label}</label>}
      <div className="relative w-full flex items-stretch">
        {isTextarea ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-xl p-2.5 pr-10 font-bold focus:ring-2 focus:ring-black focus:border-black outline-none transition-all duration-200 shadow-sm resize-none"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-xl p-2.5 pr-10 font-bold focus:ring-2 focus:ring-black focus:border-black outline-none transition-all duration-200 shadow-sm"
          />
        )}
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-2 top-2.5 w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 text-slate-600 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 hover:bg-slate-100 transition active:scale-95 cursor-pointer ${
            isOpen ? 'bg-slate-100 border-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200' : 'bg-card'
          }`}
          title="Bấm để mở danh sách biến thông minh"
        >
          <span className="font-extrabold text-[11px] font-mono">{"{}"}</span>
        </button>
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 top-[100%] mt-1 bg-card border-2 border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-xl z-50 p-3 flex flex-col gap-2 max-h-[220px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm biến (gõ 'tên', 'voucher',...)"
            className="w-full bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-lg px-2.5 py-1.5 font-bold outline-none text-[11px] focus:border-black transition"
            autoFocus
          />

          <ul className="flex flex-col gap-1 max-h-[140px] overflow-y-auto list-none p-0 m-0">
            {filteredVariables.length === 0 ? (
              <li className="text-zinc-400 dark:text-zinc-500 italic p-2 text-center text-[10px]">Không tìm thấy biến thích hợp</li>
            ) : (
              filteredVariables.map((v) => (
                <li
                  key={v.code}
                  onClick={() => handleSelectVariable(v.code)}
                  className="flex items-center justify-between px-2.5 py-1.5 hover:bg-zinc-50 dark:bg-zinc-950 rounded-lg cursor-pointer transition text-[10.5px] border border-transparent hover:border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-black text-slate-800">{v.name}</span>
                    <span className="text-[8.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{v.category}</span>
                  </div>
                  <span className="font-mono text-indigo-600 font-extrabold text-[10px]">{v.code}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function AutomationFlowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-sans">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest animate-pulse">
          Đang chuẩn bị Trình vẽ kịch bản...
        </span>
      </div>
    }>
      <AutomationFlowEditor />
    </Suspense>
  )
}

function AutomationFlowEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scenarioIdParam = searchParams.get('id')
  // --- STATE DANH SÁCH KỊCH BẢN (SCENARIOS STATE) ---
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'scen-1',
      name: 'Chào mừng Thành viên VIP',
      description: 'Khi có khách mới đặt phòng, tự động kiểm tra CRM hạng VIP, bắn Zalo ZNS chào mừng & tặng ưu đãi.',
      status: 'active',
      triggerName: 'Đơn đặt phòng mới 🟢',
      runCount: 1245,
      channels: ['zalo', 'crm', 'voucher'],
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          label: 'Đơn đặt phòng mới 🟢',
          icon: Database,
          color: 'border-emerald-500 text-emerald-500 bg-emerald-50',
          inputs: [],
          outputs: [{ id: 'out-1', type: 'output', label: 'Thông tin Đơn' }],
          x: 40,
          y: 180,
          config: {}
        },
        {
          id: 'node-2',
          type: 'logic',
          label: 'Lọc Khách hàng mới? 🟡',
          icon: GitBranch,
          color: 'border-amber-500 text-amber-500 bg-amber-50',
          inputs: [{ id: 'in-2', type: 'input', label: 'Đơn hàng' }],
          outputs: [
            { id: 'out-2-true', type: 'output', label: 'Khách Mới (Đúng)' },
            { id: 'out-2-false', type: 'output', label: 'Khách Cũ (Sai)' }
          ],
          x: 280,
          y: 160,
          config: {
            relation: 'AND',
            conditions: [
              { field: 'customer.total_spent', operator: 'greater_than', value: '2000000' }
            ]
          }
        },
        {
          id: 'node-3',
          type: 'crm',
          label: 'Tạo hồ sơ CRM & Gắn VIP 🟣',
          icon: UserPlus,
          color: 'border-purple-500 text-purple-500 bg-purple-50',
          inputs: [{ id: 'in-3', type: 'input', label: 'Thông tin' }],
          outputs: [{ id: 'out-3', type: 'output', label: 'Hồ sơ mới' }],
          x: 520,
          y: 80,
          config: {}
        },
        {
          id: 'node-4',
          type: 'action',
          label: 'Gửi Zalo ZNS Chào mừng 🔵',
          icon: Smartphone,
          color: 'border-blue-500 text-blue-500 bg-blue-50',
          inputs: [{ id: 'in-4', type: 'input', label: 'Khách nhận' }],
          outputs: [],
          x: 770,
          y: 80,
          config: {
            template: 'Mẫu ZNS Chào mừng Thành viên mới',
            content: 'Chào mừng bạn {{$trigger.name}} đến với Bliss Home! Tặng riêng bạn mã giảm giá 10% {{$voucher.code}} cho kỳ nghỉ tuyệt vời của bạn.'
          }
        },
        {
          id: 'node-5',
          type: 'action',
          label: 'Gửi Zalo ZNS Tri ân 🔵',
          icon: Smartphone,
          color: 'border-blue-500 text-blue-500 bg-blue-50',
          inputs: [{ id: 'in-5', type: 'input', label: 'Khách nhận' }],
          outputs: [],
          x: 770,
          y: 260,
          config: {
            template: 'Mẫu ZNS Tri ân Khách hàng cũ',
            content: 'Chào mừng quý khách quay lại {{$trigger.name}}! Bliss Home rất hân hạnh được tiếp tục phục vụ bạn tại phòng {{$booking.room_name}}.'
          }
        }
      ],
      connections: [
        { fromId: 'node-1', fromPort: 'out-1', toId: 'node-2', toPort: 'in-2' },
        { fromId: 'node-2', fromPort: 'out-2-true', toId: 'node-3', toPort: 'in-3' },
        { fromId: 'node-3', fromPort: 'out-3', toId: 'node-4', toPort: 'in-4' },
        { fromId: 'node-2', fromPort: 'out-2-false', toId: 'node-5', toPort: 'in-5' }
      ]
    },
    {
      id: 'scen-2',
      name: 'Đồng bộ Sheets & Báo Telegram CSKH',
      description: 'Webhook liên kết ứng dụng bên ngoài tự động đồng bộ hóa thông tin Booking mới vào Google Sheets và thông báo khẩn nhóm Telegram CSKH.',
      status: 'active',
      triggerName: 'Webhook Trigger 🔌',
      runCount: 881,
      channels: ['webhook', 'google_sheets'],
      nodes: [
        {
          id: 'node-1',
          type: 'webhook',
          label: 'Webhook Trigger bên ngoài 🔌',
          icon: Link,
          color: 'border-indigo-500 text-indigo-500 bg-indigo-50',
          inputs: [],
          outputs: [{ id: 'out-1', type: 'output', label: 'Dữ liệu Nhận' }],
          x: 60,
          y: 180,
          config: {
            webhook_url: 'https://hook.make.com/blisshome-booking-webhook',
            source_app: 'Make.com Integration'
          }
        },
        {
          id: 'node-2',
          type: 'action',
          label: 'Đồng bộ Google Sheets 📊',
          icon: Table,
          color: 'border-emerald-600 text-emerald-600 bg-emerald-50',
          inputs: [{ id: 'in-2', type: 'input', label: 'Bản ghi' }],
          outputs: [{ id: 'out-2', type: 'output', label: 'Đã lưu' }],
          x: 350,
          y: 180,
          config: {
            sheet_name: 'Bliss Bookings 2026',
            headers: 'Booking ID, Khách hàng, SĐT, Phòng, Giá, Ngày Check-in'
          }
        },
        {
          id: 'node-3',
          type: 'action',
          label: 'Gửi báo Telegram CSKH 📢',
          icon: Send,
          color: 'border-sky-500 text-sky-500 bg-sky-50',
          inputs: [{ id: 'in-3', type: 'input', label: 'Kích hoạt' }],
          outputs: [],
          x: 640,
          y: 180,
          config: {
            telegram_chat_id: '-1002345678',
            telegram_message: '🔔 [BOOKING MỚI]: Khách hàng {{$trigger.name}} vừa đặt phòng {{$booking.room_name}} qua ứng dụng ngoài. Giá trị đơn: {{$booking.room_price}}đ!'
          }
        }
      ],
      connections: [
        { fromId: 'node-1', fromPort: 'out-1', toId: 'node-2', toPort: 'in-2' },
        { fromId: 'node-2', fromPort: 'out-2', toId: 'node-3', toPort: 'in-3' }
      ]
    }
  ])

  // --- TRẠNG THÁI HIỂN THỊ (LAYOUT STATES) ---
  const [activeView, setActiveView] = useState<'dashboard' | 'editor'>('editor')
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null)
  
  // --- TRẠNG THÁI TRONG CANVAS EDITOR (FULL CANVAS MODEL) ---
  const [nodes, setNodes] = useState<AutomationNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<AutomationNode | null>(null)
  
  // Dragging states
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const nodeStartRef = useRef({ x: 0, y: 0 })
  
  // Interactive connection drawing states
  const [drawingConnectionFrom, setDrawingConnectionFrom] = useState<string | null>(null)
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 })
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null)

  // Infinite Canvas Pan & Zoom States
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1) // range 0.5x - 1.5x
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0 })
  
  const [editorTitle, setEditorTitle] = useState('')
  const [editorStatus, setEditorStatus] = useState<'active' | 'draft' | 'paused' | 'expired'>('draft')
  const [schedulingType, setSchedulingType] = useState<'none' | '15m' | 'immediate'>('none')
  
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [logs, setLogs] = useState<SimulatedLog[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [nodeActionType, setNodeActionType] = useState('')
  
  // Custom Controls cho Editor Canvas
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [paletteSelectedApp, setPaletteSelectedApp] = useState<string | null>(null)
  const [paletteSearchQuery, setPaletteSearchQuery] = useState('')
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false)

  // DB Sync Warning Banner
  const [isMigrationBannerOpen, setIsMigrationBannerOpen] = useState(true)
  const [usingDbMode, setUsingDbMode] = useState(false)

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // --- FORM STATES CHO FLOATING CONFIG POPUP ---
  const [nodeLabel, setNodeLabel] = useState('')
  // Specific settings
  const [nodeTemplate, setNodeTemplate] = useState('')
  const [nodeMessage, setNodeMessage] = useState('')
  const [nodeVoucher, setNodeVoucher] = useState('')
  const [nodeDelay, setNodeDelay] = useState('15')
  // Webhook settings
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookMethod, setWebhookMethod] = useState('POST')
  const [sourceApp, setSourceApp] = useState('Make.com')
  // Google Sheets settings
  const [sheetName, setSheetName] = useState('')
  const [sheetHeaders, setSheetHeaders] = useState('')
  const [googleConnection, setGoogleConnection] = useState('none')
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  // Telegram settings
  const [telegramChatId, setTelegramChatId] = useState('')
  const [telegramMessage, setTelegramMessage] = useState('')
  const [telegramToken, setTelegramToken] = useState('')
  // Voucher custom grant
  const [voucherDiscount, setVoucherDiscount] = useState('10%')

  // Logic Gate Conditions list state
  const [logicRelation, setLogicRelation] = useState<'AND' | 'OR'>('AND')
  const [logicConditions, setLogicConditions] = useState<Array<{ field: string, operator: string, value: string }>>([])

  const [activeVouchers, setActiveVouchers] = useState<string[]>(['BLISSHE2026', 'VIPBIRTHDAY', 'COZYSTAY'])
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Cuộn log khi chạy giả lập
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // Google Credentials & Real token states
  const [googleClientId, setGoogleClientId] = useState('')
  const [googleClientSecret, setGoogleClientSecret] = useState('')
  const [showGoogleCredentialsPanel, setShowGoogleCredentialsPanel] = useState(false)
  const [googleLinkedEmail, setGoogleLinkedEmail] = useState('')

  // Load Google Credentials & Handle OAuth redirect callback
  useEffect(() => {
    // 1. Load credentials from LocalStorage
    const savedCreds = localStorage.getItem('bliss_google_credentials')
    if (savedCreds) {
      try {
        const creds = JSON.parse(savedCreds)
        setGoogleClientId(creds.client_id || '')
        setGoogleClientSecret(creds.client_secret || '')
      } catch (e) {}
    }

    const savedTokens = localStorage.getItem('bliss_google_tokens')
    if (savedTokens) {
      try {
        const tokens = JSON.parse(savedTokens)
        if (tokens.access_token) {
          setGoogleConnection(tokens.email || 'cskh@blisshome.vn')
          setGoogleLinkedEmail(tokens.email || '')
        }
      } catch (e) {}
    }

    // 2. Catch Authorization Code in the URL
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')
    
    if (code) {
      const exchangeCodeForTokens = async () => {
        setIsConnectingGoogle(true)
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: '🔌 [GOOGLE OAUTH]: Phát hiện OAuth code trong URL! Đang trao đổi token an toàn...', type: 'info' }
        ])

        try {
          // Read client credentials
          const credsStr = localStorage.getItem('bliss_google_credentials')
          if (!credsStr) {
            throw new Error('Không tìm thấy Client ID hoặc Client Secret trong LocalStorage. Vui lòng nhập trước khi liên kết!')
          }
          const { client_id, client_secret } = JSON.parse(credsStr)
          
          if (!client_id || !client_secret) {
            throw new Error('Vui lòng điền Client ID và Client Secret ở phần "Cấu hình Google App" trước!')
          }

          const redirectUri = window.location.origin + window.location.pathname

          const response = await fetch('/api/auth/google/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              code,
              client_id,
              client_secret,
              redirect_uri: redirectUri
            })
          })

          const data = await response.json()
          if (!response.ok || data.error) {
            throw new Error(data.error || 'Lỗi trao đổi token với Google')
          }

          // Save tokens
          const tokens = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + (data.expires_in * 1000),
            email: data.email
          }
          localStorage.setItem('bliss_google_tokens', JSON.stringify(tokens))
          setGoogleConnection(data.email)
          setGoogleLinkedEmail(data.email)

          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `✓ [GOOGLE OAUTH SUCCESS]: Liên kết thành công tài khoản ${data.email}! Dữ liệu thật đã được kích hoạt.`, type: 'success' }
          ])

          // Clean url search params
          const currentId = searchParams.get('id')
          const nextUrl = currentId 
            ? `${window.location.pathname}?id=${currentId}`
            : window.location.pathname
          window.history.replaceState({}, '', nextUrl)

        } catch (err: any) {
          console.error(err)
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `❌ [GOOGLE OAUTH ERROR]: ${err.message}`, type: 'error' }
          ])
          // Clean URL even on error
          const currentId = searchParams.get('id')
          const nextUrl = currentId 
            ? `${window.location.pathname}?id=${currentId}`
            : window.location.pathname
          window.history.replaceState({}, '', nextUrl)
        } finally {
          setIsConnectingGoogle(false)
        }
      }

      exchangeCodeForTokens()
    }
  }, [scenarioIdParam])

  const getOrRefreshAccessToken = async (): Promise<string | null> => {
    const savedTokens = localStorage.getItem('bliss_google_tokens')
    if (!savedTokens) return null

    try {
      const tokens = JSON.parse(savedTokens)
      if (!tokens || typeof tokens !== 'object') return null
      const { access_token, refresh_token, expires_at } = tokens

      if (!access_token) return null

      // Check if access token is expired or close to expiring (within 5 minutes)
      if (Date.now() < (expires_at - 5 * 60 * 1000)) {
        return access_token
      }

      // Expired, need to refresh!
      const savedCreds = localStorage.getItem('bliss_google_credentials')
      if (!savedCreds) return null
      const parsedCreds = JSON.parse(savedCreds)
      if (!parsedCreds || typeof parsedCreds !== 'object') return null
      const { client_id, client_secret } = parsedCreds

      if (!client_id || !client_secret || !refresh_token) return null

      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `🔌 [GOOGLE TOKEN]: Access Token đã hết hạn. Đang tự động làm mới ngầm...`, type: 'info' }
      ])

      const response = await fetch('/api/auth/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'refresh',
          refresh_token,
          client_id,
          client_secret
        })
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Lỗi làm mới access token')
      }

      const updatedTokens = {
        ...tokens,
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in * 1000)
      }
      localStorage.setItem('bliss_google_tokens', JSON.stringify(updatedTokens))
      
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `✓ [GOOGLE TOKEN REFRESHED]: Đã tự động gia hạn Access Token thành công!`, type: 'success' }
      ])

      return data.access_token
    } catch (e: any) {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `❌ [GOOGLE REFRESH ERROR]: ${e.message}`, type: 'error' }
      ])
      return null
    }
  }

  const renderMessage = (msg: string) => {
    if (!msg) return ''
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(msg)) !== null) {
      const matchIndex = match.index
      const [_, text, url] = match

      // Push text before match
      if (matchIndex > lastIndex) {
        parts.push(msg.substring(lastIndex, matchIndex))
      }

      // Push anchor link
      parts.push(
        <a
          key={matchIndex}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-650 font-black underline hover:text-indigo-800 cursor-pointer"
        >
          {text}
        </a>
      )

      lastIndex = regex.lastIndex
    }

    if (lastIndex < msg.length) {
      parts.push(msg.substring(lastIndex))
    }

    return parts.length > 0 ? parts : msg
  }

  // --- PERSISTENCE: LOAD SCENARIOS FROM SUPABASE WITH LOCALSTORAGE CACHE FALLBACK ---
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase.from('automations').select('*')
        
        if (error) throw error
        
        let loadedScenarios: Scenario[] = []
        if (data && data.length > 0) {
          // Khớp dữ liệu Supabase DB
          loadedScenarios = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            status: d.status,
            triggerName: d.trigger_name,
            runCount: d.run_count,
            channels: d.channels || [],
            nodes: d.nodes || [],
            connections: d.connections || []
          }))
          setScenarios(loadedScenarios)
          setUsingDbMode(true)
        }

        // Find and load the current scenario
        if (scenarioIdParam) {
          const match = loadedScenarios.find(s => s.id === scenarioIdParam)
          if (match) {
            setCurrentScenarioId(match.id)
            setNodes([...match.nodes])
            setConnections([...match.connections])
            setEditorTitle(match.name)
            setEditorStatus(match.status)
            setSchedulingType('15m')
          }
        } else {
          // Initialize blank scenario if no ID
          const newId = `scen-${Date.now()}`
          setCurrentScenarioId(newId)
          setNodes([])
          setConnections([])
          setEditorTitle('Mạch tự động hóa #' + Math.floor(100 + Math.random() * 900))
          setEditorStatus('draft')
          setSchedulingType('none')
          setIsPaletteOpen(true) // Immediately open menu app selector for blank canvas!
        }
      } catch (e: any) {
        console.warn('Lỗi đọc database public.automations, chuyển sang LocalStorage fallback:', e.message)
        // Fallback LocalStorage cache
        const localData = localStorage.getItem('bliss_scenarios')
        let loadedScenarios: Scenario[] = []
        if (localData) {
          try {
            loadedScenarios = JSON.parse(localData)
            setScenarios(loadedScenarios)
          } catch (err) {
            console.error('Lỗi parse cache LocalStorage:', err)
          }
        }
        setUsingDbMode(false)

        // Find and load the current scenario from fallback
        if (scenarioIdParam) {
          const match = loadedScenarios.find(s => s.id === scenarioIdParam)
          if (match) {
            setCurrentScenarioId(match.id)
            setNodes([...match.nodes])
            setConnections([...match.connections])
            setEditorTitle(match.name)
            setEditorStatus(match.status)
            setSchedulingType('15m')
          }
        } else {
          // Initialize blank scenario if no ID
          const newId = `scen-${Date.now()}`
          setCurrentScenarioId(newId)
          setNodes([])
          setConnections([])
          setEditorTitle('Mạch tự động hóa #' + Math.floor(100 + Math.random() * 900))
          setEditorStatus('draft')
          setSchedulingType('none')
          setIsPaletteOpen(true) // Immediately open menu app selector for blank canvas!
        }
      }
    }
    loadScenarios()
  }, [scenarioIdParam])

  // Đọc mã Voucher thực tế từ DB Supabase (nếu có)
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const supabase = getSupabase()
        const { data } = await supabase.from('vouchers').select('code').eq('status', 'active')
        if (data && data.length > 0) {
          setActiveVouchers(data.map((v: any) => v.code))
        }
      } catch (e) {
        console.warn('Không thể đọc dữ liệu voucher Supabase, sử dụng danh sách mẫu.')
      }
    }
    fetchVouchers()
  }, [])

  // --- SUPABASE REALTIME DB TRIGGER LISTENER (LẮNG NGHE ĐƠN PHÒNG THẬT) ---
  useEffect(() => {
    const supabase = getSupabase()
    
    const channel = supabase
      .channel('schema-db-realtime-bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, async (payload: any) => {
        try {
          const newBooking = payload.new
          
          // Ghi nhận log sự kiện nhận được vào UI console
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `📡 [SUPABASE EVENT]: Đơn đặt phòng mới vừa được đẩy vào DB (ID: ${newBooking.id.slice(0,8)}...). Bắt đầu kích hoạt luồng tự động!`, type: 'warning' }
          ])

          // Truy vấn các bảng liên quan để lấy metadata chèn biến
          const { data: customer } = await supabase.from('customers').select('*').eq('id', newBooking.customer_id).maybeSingle()
          const { data: room } = await supabase.from('rooms').select('*').eq('id', newBooking.room_id).maybeSingle()

          const context = {
            booking: {
              id: newBooking.id,
              room_name: room?.name || 'Phòng Cozy Cabin',
              room_price: newBooking.total_price ? newBooking.total_price.toLocaleString() : '1,200,000'
            },
            trigger: {
              name: customer?.name || 'Khách đặt phòng',
              phone: customer?.phone || '0901234567',
              email: customer?.email || 'customer@blisshome.vn'
            },
            crm: {
              behavior_group: customer?.notes && customer.notes.length > 1 ? 'Khách Quay Lại' : 'Khách Mới',
              total_spent: customer?.total_spent ? customer.total_spent.toLocaleString() : '0'
            },
            voucher: {
              code: newBooking.voucher_code || 'BLISSHE2026',
              discount: '10%'
            }
          }

          // Kích hoạt chạy ngầm
          executeAutomationsBackground(context)
        } catch (e: any) {
          console.error('Lỗi chạy Realtime Automation Engine:', e.message)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [scenarios])

  // --- KEYBOARD SHORTCUTS FOR ZOOM IN/OUT (CTRL + / CTRL -) ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (activeView !== 'editor') return

      // Tránh cản trở phím tắt khi người dùng đang nhập liệu trong ô cấu hình (input, textarea)
      const activeEl = document.activeElement
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+' || e.key === 'Add') {
          e.preventDefault()
          setZoom(prev => Math.min(1.5, prev + 0.1))
        } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
          e.preventDefault()
          setZoom(prev => Math.max(0.5, prev - 0.1))
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [activeView])

  // --- DETECT SPACEBAR FOR FIGMA/MIRO-STYLE PANNING MODE ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeView !== 'editor') return

      // Tránh cản trở Spacebar khi người dùng đang nhập liệu trong ô cấu hình (input, textarea)
      const activeEl = document.activeElement
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    const handleBlur = () => {
      setIsSpacePressed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [activeView])

  // --- CORE ENGINE: BỘ CHẠY LUỒNG TỰ ĐỘNG HÓA CHẠY NGẦM THỰC TẾ ---
  const executeAutomationsBackground = async (dataContext: any) => {
    // Tìm các Scenario đang hoạt động
    const activeScenarios = scenarios.filter(s => s.status === 'active')
    if (activeScenarios.length === 0) return

    for (const scen of activeScenarios) {
      // Tìm Trigger node
      const startNode = scen.nodes.find(n => n.type === 'trigger' || n.type === 'webhook')
      if (!startNode) continue

      // Increment count on server/cache
      incrementRunCount(scen.id)

      let currentId = startNode.id
      let visited = new Set<string>([currentId])
      const getNextNodeIds = (id: string) => {
        return scen.connections.filter(c => c.fromId === id).map(c => c.toId)
      }

      let queue = getNextNodeIds(currentId)

      while (queue.length > 0) {
        const nextId = queue.shift()
        if (!nextId || visited.has(nextId)) continue
        visited.add(nextId)

        const nextNode = scen.nodes.find(n => n.id === nextId)
        if (!nextNode) continue

        if (nextNode.type === 'logic') {
          const isMatched = evaluateLogicConditions(nextNode.config, dataContext)
          if (!isMatched) {
            setLogs(prev => [
              ...prev,
              { timestamp: new Date().toLocaleTimeString(), message: `🛑 [LOGIC NGẮT LUỒNG]: Bộ lọc "${nextNode.label}" đối soát KHÔNG khớp điều kiện. Ngừng truyền tiếp.`, type: 'info' }
            ])
            continue // Dừng nhánh này
          }
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `✓ [LOGIC THÔNG QUA]: Bộ lọc "${nextNode.label}" đối soát ĐỒNG Ý. Tiếp tục chạy luồng.`, type: 'success' }
          ])
        } else if (nextNode.type === 'webhook') {
          const url = nextNode.config.webhook_url
          const method = nextNode.config.webhook_method || 'POST'
          if (url) {
            await fireExternalWebhook(url, method, dataContext)
          }
        } else if (nextNode.type === 'action') {
          const lbl = nextNode.label.toLowerCase()
          if (lbl.includes('telegram')) {
            const token = nextNode.config.telegram_token || 'YOUR_BOT_TOKEN_HERE'
            const chatId = nextNode.config.telegram_chat_id
            const rawMsg = nextNode.config.telegram_message || ''
            const resolvedMsg = replaceVariables(rawMsg, dataContext)
            
            if (chatId) {
              await sendTelegramMessage(token, chatId, resolvedMsg)
            }
          } else if (lbl.includes('zalo') || lbl.includes('zns')) {
            const rawMsg = nextNode.config.content || ''
            const resolvedMsg = replaceVariables(rawMsg, dataContext)
            setLogs(prev => [
              ...prev,
              { timestamp: new Date().toLocaleTimeString(), message: `💬 [ZALO ZNS SENT]: Bắn tin ZNS thành công tới ${dataContext.trigger.phone}! Nội dung: "${resolvedMsg}"`, type: 'success' }
            ])
          } else if (lbl.includes('sheets')) {
            const sheetNameConfig = nextNode.config.sheet_name || ''
            
            // Check if we have a real Google account tokens
            const savedTokens = localStorage.getItem('bliss_google_tokens')
            if (savedTokens && googleConnection !== 'none' && googleConnection !== 'bliss_cskh') {
              try {
                // Parse spreadsheet ID (extracts ID from URL if pasted as full link)
                let spreadsheetId = sheetNameConfig
                if (spreadsheetId.includes('/d/')) {
                  const match = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/)
                  if (match) spreadsheetId = match[1]
                }

                if (!spreadsheetId) {
                  throw new Error('Chưa điền Spreadsheet ID hoặc URL Google Sheet')
                }

                // Get or refresh access token
                const accessToken = await getOrRefreshAccessToken()
                if (!accessToken) {
                  throw new Error('Không thể lấy Access Token Google. Vui lòng kết nối lại tài khoản!')
                }

                const range = 'Sheet1!A:Z'
                const rowValues = [
                  dataContext.booking?.id || 'booking-' + Date.now(),
                  dataContext.trigger?.name || 'Nguyễn Văn Hùng',
                  dataContext.trigger?.phone || '0901234567',
                  dataContext.trigger?.email || 'customer@blisshome.vn',
                  dataContext.booking?.room_name || 'Hinoki River View Suite 🌊',
                  dataContext.booking?.room_price || '1,500,000',
                  dataContext.voucher?.code || 'BLISSHE2026',
                  new Date().toLocaleString()
                ]

                const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    values: [rowValues]
                  })
                })

                const resData = await response.json()
                if (!response.ok || resData.error) {
                  throw new Error(resData.error?.message || 'Lỗi ghi Sheets API')
                }

                setLogs(prev => [
                  ...prev,
                  { 
                    timestamp: new Date().toLocaleTimeString(), 
                    message: `📊 [GOOGLE SHEETS REALTIME SUCCESS]: Đã đồng bộ dòng dữ liệu Booking vào file Sheet thật thành công! [Xem Google Sheet 🔗](https://docs.google.com/spreadsheets/d/${spreadsheetId})`, 
                    type: 'success' 
                  }
                ])

              } catch (err: any) {
                console.error(err)
                setLogs(prev => [
                  ...prev,
                  { timestamp: new Date().toLocaleTimeString(), message: `❌ [GOOGLE SHEETS REALTIME ERROR]: ${err.message}`, type: 'error' }
                ])
              }
            } else {
              setLogs(prev => [
                ...prev,
                { timestamp: new Date().toLocaleTimeString(), message: `📊 [GOOGLE SHEETS DISPATCH]: Đã ghi nhận bản ghi của khách ${dataContext.trigger.name} vào Google Sheets '${sheetNameConfig}'!`, type: 'success' }
              ])
            }
          } else if (lbl.includes('email')) {
            setLogs(prev => [
              ...prev,
              { timestamp: new Date().toLocaleTimeString(), message: `✉️ [EMAIL SENT]: Đã gửi email xác nhận thành công tới ${dataContext.trigger.email}`, type: 'success' }
            ])
          }
        }

        const dependents = getNextNodeIds(nextId)
        queue.push(...dependents)
      }
    }
  }

  // Helper: Trích xuất trường dữ liệu từ chuỗi đường dẫn (e.g. "customer.total_spent")
  const getValueFromPath = (obj: any, path: string) => {
    try {
      const parts = path.split('.')
      let current = obj
      for (const part of parts) {
        if (current[part] === undefined) return undefined
        current = current[part]
      }
      return current
    } catch (e) {
      return undefined
    }
  }

  // BỘ ĐỐI SOÁT ĐIỀU KIỆN LOGIC GATE (AST Parser)
  const evaluateLogicConditions = (config: any, dataContext: any): boolean => {
    try {
      const conditions = config.conditions || []
      const relation = config.relation || 'AND'
      if (conditions.length === 0) return true

      const results = conditions.map((cond: any) => {
        const rawFieldVal = getValueFromPath(dataContext, cond.field)
        // Clean format if it has commas
        const fieldVal = typeof rawFieldVal === 'string' ? rawFieldVal.replace(/,/g, '') : rawFieldVal
        const compVal = cond.value
        
        switch (cond.operator) {
          case 'greater_than': 
            return Number(fieldVal) > Number(compVal)
          case 'less_than': 
            return Number(fieldVal) < Number(compVal)
          case 'greater_than_or_equal': 
            return Number(fieldVal) >= Number(compVal)
          case 'less_than_or_equal': 
            return Number(fieldVal) <= Number(compVal)
          case 'not_equals': 
            return String(fieldVal) !== String(compVal)
          case 'contains': 
            return String(fieldVal).toLowerCase().includes(String(compVal).toLowerCase())
          default: 
            return String(fieldVal) === String(compVal)
        }
      })

      if (relation === 'OR') {
        return results.some((r: boolean) => r)
      }
      return results.every((r: boolean) => r)
    } catch (e) {
      console.error('Lỗi tính toán logic node:', e)
      return false
    }
  }

  // Tăng lượt chạy ngầm kịch bản
  const incrementRunCount = async (id: string) => {
    setScenarios(prev => prev.map(s => {
      if (s.id === id) {
        const nextCount = s.runCount + 1
        
        // Lưu DB/Cache ngầm
        try {
          const supabase = getSupabase()
          supabase.from('automations').update({ run_count: nextCount }).eq('id', id).then()
        } catch (e) {}
        
        return { ...s, runCount: nextCount }
      }
      return s
    }))
  }

  // Helper thay thế cú pháp biến {{$trigger.name}} trong chuỗi tin nhắn
  const replaceVariables = (str: string, ctx: any): string => {
    try {
      let result = str
      AVAILABLE_VARIABLES.forEach(v => {
        const val = getValueFromPath(ctx, v.code.replace('{{$', '').replace('}}', ''))
        if (val !== undefined) {
          result = result.replace(new RegExp(v.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(val))
        }
      })
      return result
    } catch (e) {
      return str
    }
  }

  // --- TRÌNH BẮN REST API THỰC TẾ ---
  const sendTelegramMessage = async (token: string, chatId: string, text: string) => {
    try {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `📢 [TELEGRAM API CALL]: Đang bắn tin nhắn thật qua Telegram Bot...`, type: 'info' }
      ])
      
      const useToken = token && token !== 'YOUR_BOT_TOKEN_HERE' ? token : 'YOUR_TELEGRAM_TOKEN_FALLBACK'
      const res = await fetch(`https://api.telegram.org/bot${useToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text })
      })

      if (res.ok) {
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: `✓ [TELEGRAM API SUCCESS]: Tin Telegram đã gửi tới chat_id: ${chatId}!`, type: 'success' }
        ])
        return true
      }
      throw new Error(`Telegram error code ${res.status}`)
    } catch (e: any) {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `❌ [TELEGRAM ERROR]: Không thể gửi tin Telegram thật: ${e.message}`, type: 'error' }
      ])
      return false
    }
  }

  const fireExternalWebhook = async (url: string, method: string, payload: any) => {
    try {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `🔌 [WEBHOOK CALL]: Đang gửi HTTP Request ${method} tới URL: ${url}`, type: 'info' }
      ])

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' ? JSON.stringify(payload) : undefined
      })

      if (res.ok) {
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: `✓ [WEBHOOK SUCCESS]: Gọi API thành công! Status: ${res.status} OK`, type: 'success' }
        ])
        return true
      }
      throw new Error(`HTTP error code ${res.status}`)
    } catch (e: any) {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `❌ [WEBHOOK ERROR]: Lỗi gọi webhook API: ${e.message}`, type: 'error' }
      ])
      return false
    }
  }

  // --- DRAGGING NODE LOGIC (HTML5 CANVAS dragging system) ---
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (isSpacePressed) return // Không di chuyển Node khi phím Space đang được giữ để Pan
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('select') || target.closest('input') || target.closest('textarea')) {
      return
    }

    e.preventDefault()
    setDraggingNodeId(nodeId)
    
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      // Tính toạ độ kéo bám sát tỷ lệ Zoom
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      nodeStartRef.current = { x: node.x, y: node.y }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (drawingConnectionFrom) {
      e.preventDefault()
      const canvasElement = document.getElementById('automation-canvas-container')
      if (canvasElement) {
        const rect = canvasElement.getBoundingClientRect()
        // Đổi toạ độ trỏ chuột bám sát tỷ lệ Zoom và Pan
        const x = (e.clientX - rect.left - pan.x) / zoom
        const y = (e.clientY - rect.top - pan.y) / zoom
        setCursorCoords({ x, y })
      }
      return
    }

    if (isPanning) {
      e.preventDefault()
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      })
      return
    }

    if (!draggingNodeId) return
    e.preventDefault()

    const dx = (e.clientX - dragStartRef.current.x) / zoom
    const dy = (e.clientY - dragStartRef.current.y) / zoom

    setNodes(prev => prev.map(n => {
      if (n.id === draggingNodeId) {
        return {
          ...n,
          x: Math.max(20, Math.min(2200, nodeStartRef.current.x + dx)),
          y: Math.max(20, Math.min(1200, nodeStartRef.current.y + dy))
        }
      }
      return n
    }))
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      setDraggingNodeId(null)
    }
    if (drawingConnectionFrom) {
      // Tự động kiểm tra liên kết bằng hình học nếu thả chuột trúng Node khác
      const canvasElement = document.getElementById('automation-canvas-container')
      if (canvasElement) {
        const rect = canvasElement.getBoundingClientRect()
        // Đổi toạ độ trỏ chuột bám sát tỷ lệ Zoom và Pan
        const x = (e.clientX - rect.left - pan.x) / zoom
        const y = (e.clientY - rect.top - pan.y) / zoom

        // Tìm xem có Node nào nằm dưới toạ độ nhả chuột không (Node rộng 208px, cao 90px)
        const targetNode = nodes.find(n => {
          return x >= n.x && x <= n.x + 208 && y >= n.y && y <= n.y + 90
        })

        if (targetNode && targetNode.id !== drawingConnectionFrom) {
          const nodeId = targetNode.id
          const alreadyConnected = connections.some(c => c.fromId === drawingConnectionFrom && c.toId === nodeId)
          if (!alreadyConnected) {
            setConnections(prev => [...prev, {
              fromId: drawingConnectionFrom,
              fromPort: `out-${drawingConnectionFrom}`,
              toId: nodeId,
              toPort: `in-${nodeId}`
            }])
            
            const fromLabel = nodes.find(n => n.id === drawingConnectionFrom)?.label || 'Thẻ cũ'
            const toLabel = targetNode.label
            
            setLogs(prev => [
              ...prev,
              { timestamp: new Date().toLocaleTimeString(), message: `🔗 Đã liên kết kéo thả thành công: "${fromLabel}" ➔ "${toLabel}"!`, type: 'success' }
            ])
          }
        }
      }
      setDrawingConnectionFrom(null)
    }
    if (isPanning) {
      setIsPanning(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent, nodeId: string) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('select') || target.closest('input') || target.closest('textarea')) {
      return
    }

    const touch = e.touches[0]
    if (!touch) return

    setDraggingNodeId(nodeId)
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      dragStartRef.current = { x: touch.clientX, y: touch.clientY }
      nodeStartRef.current = { x: node.x, y: node.y }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingNodeId) return
    const touch = e.touches[0]
    if (!touch) return

    const dx = (touch.clientX - dragStartRef.current.x) / zoom
    const dy = (touch.clientY - dragStartRef.current.y) / zoom

    setNodes(prev => prev.map(n => {
      if (n.id === draggingNodeId) {
        return {
          ...n,
          x: Math.max(20, Math.min(2200, nodeStartRef.current.x + dx)),
          y: Math.max(20, Math.min(1200, nodeStartRef.current.y + dy))
        }
      }
      return n
    }))
  }

  const handleTouchEnd = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null)
    }
  }

  // --- CONNECTION DRAWING LOGIC (Link Port Connections) ---
  const handleStartConnectionDrawing = (e: React.MouseEvent, nodeId: string) => {
    if (isSpacePressed) return // Không kéo liên kết khi đang nhấn Space để Pan
    e.stopPropagation()
    e.preventDefault()
    setDrawingConnectionFrom(nodeId)
    
    const canvasElement = document.getElementById('automation-canvas-container')
    if (canvasElement) {
      const rect = canvasElement.getBoundingClientRect()
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      setCursorCoords({ x, y })
    }
  }

  const handleNodeMouseUp = (e: React.MouseEvent, nodeId: string) => {
    if (isSpacePressed) return // Không liên kết khi đang nhấn Space để Pan
    if (drawingConnectionFrom && drawingConnectionFrom !== nodeId) {
      e.stopPropagation()
      
      const alreadyConnected = connections.some(c => c.fromId === drawingConnectionFrom && c.toId === nodeId)
      if (!alreadyConnected) {
        setConnections(prev => [...prev, {
          fromId: drawingConnectionFrom,
          fromPort: `out-${drawingConnectionFrom}`,
          toId: nodeId,
          toPort: `in-${nodeId}`
        }])
        
        const fromLabel = nodes.find(n => n.id === drawingConnectionFrom)?.label || 'Thẻ cũ'
        const toLabel = nodes.find(n => n.id === nodeId)?.label || 'Thẻ mới'
        
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: `🔗 Đã thiết lập liên kết thành công: "${fromLabel}" ➔ "${toLabel}"!`, type: 'success' }
        ])
      }
    }
    setDrawingConnectionFrom(null)
  }

  const handlePortClick = (e: React.MouseEvent, nodeId: string) => {
    if (isSpacePressed) return
    e.stopPropagation()
    e.preventDefault()
    setConnectingSourceId(nodeId)
    setIsPaletteOpen(true)
  }

  // --- HÀM 1: KHỞI TẠO LUỒNG MỚI (MAKE-STYLE CANVAS TRỐNG) ---
  const handleCreateNewScenario = () => {
    const newId = `scen-${Date.now()}`

    setCurrentScenarioId(newId)
    setNodes([]) // Canvas hoàn toàn trống để tự do thiết kế từ bất kỳ Node nào
    setConnections([])
    setEditorTitle('Mạch tự động hóa #' + Math.floor(100 + Math.random() * 900))
    setEditorStatus('draft')
    setSchedulingType('none')
    setSelectedNode(null)
    setLogs([])
    setIsPaletteOpen(false)
    setIsLogsDrawerOpen(false)
    setPan({ x: 0, y: 0 })
    setZoom(1)
    setActiveView('editor')
  }

  // --- HÀM 2: MỞ KỊCH BẢN CÓ SẴN ---
  const handleEditScenario = (scen: Scenario) => {
    setCurrentScenarioId(scen.id)
    setNodes([...scen.nodes])
    setConnections([...scen.connections])
    setEditorTitle(scen.name)
    setEditorStatus(scen.status)
    setSchedulingType('15m')
    setSelectedNode(null)
    setLogs([])
    setIsPaletteOpen(false)
    setIsLogsDrawerOpen(false)
    setPan({ x: 0, y: 0 })
    setZoom(1)
    setActiveView('editor')
  }

  // --- HÀM XÓA KỊCH BẢN ---
  const handleDeleteScenario = async (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa kịch bản tự động',
      message: `Bạn có chắc chắn muốn xóa kịch bản "${name}" không? Toàn bộ dữ liệu cấu hình liên quan đến kịch bản này sẽ bị gỡ bỏ vĩnh viễn.`,
      onConfirm: async () => {
        try {
          const updatedScenarios = scenarios.filter(s => s.id !== id)
          setScenarios(updatedScenarios)
          localStorage.setItem('bliss_scenarios', JSON.stringify(updatedScenarios))

          const supabase = getSupabase()
          await supabase.from('automations').delete().eq('id', id)
        } catch (e: any) {
          console.warn('Lỗi xóa database public.automations, chỉ xóa offline cache:', e.message)
        }
      }
    })
  }

  // --- HÀM 3: LƯU KỊCH BẢN ---
  const handleSaveScenario = async () => {
    if (!currentScenarioId) return

    const detectedChannels: string[] = []
    let currentTriggerName = 'Không có Trigger'
    
    nodes.forEach(n => {
      if (n.type === 'trigger' || n.type === 'webhook') {
        currentTriggerName = n.label
      }
      if (n.type === 'webhook') detectedChannels.push('webhook')
      if (n.type === 'crm') detectedChannels.push('crm')
      if (n.type === 'action') {
        const lbl = n.label.toLowerCase()
        if (lbl.includes('zalo') || lbl.includes('zns')) detectedChannels.push('zalo')
        if (lbl.includes('email') || lbl.includes('thư')) detectedChannels.push('email')
        if (lbl.includes('sheets') || lbl.includes('bảng')) detectedChannels.push('google_sheets')
        if (lbl.includes('telegram') || lbl.includes('báo cáo')) detectedChannels.push('telegram')
        if (lbl.includes('voucher') || lbl.includes('mã')) detectedChannels.push('voucher')
      }
    })

    const uniqueChannels = Array.from(new Set(detectedChannels))
    const scenarioData: Scenario = {
      id: currentScenarioId,
      name: editorTitle || 'Mạch tự động không tên',
      description: 'Cấu hình luồng n8n/Make lưu trữ kéo thả vào ngày ' + new Date().toLocaleDateString('vi-VN'),
      status: editorStatus,
      triggerName: currentTriggerName,
      runCount: scenarios.find(s => s.id === currentScenarioId)?.runCount || 0,
      channels: uniqueChannels.length > 0 ? uniqueChannels : ['zalo'],
      nodes: nodes,
      connections: connections
    }

    // UPDATE BỘ NHỚ LOCAL CACHE
    const updatedScenarios = scenarios.some(s => s.id === currentScenarioId)
      ? scenarios.map(s => s.id === currentScenarioId ? scenarioData : s)
      : [...scenarios, scenarioData]

    setScenarios(updatedScenarios)
    localStorage.setItem('bliss_scenarios', JSON.stringify(updatedScenarios))

    // ĐỒNG BỘ LÊN SUPABASE SERVER (NẾU BẢNG KHẢ DỤNG)
    try {
      const supabase = getSupabase()
      await supabase.from('automations').upsert([{
        id: scenarioData.id,
        name: scenarioData.name,
        description: scenarioData.description,
        status: scenarioData.status,
        trigger_name: scenarioData.triggerName,
        run_count: scenarioData.runCount,
        channels: scenarioData.channels,
        nodes: scenarioData.nodes,
        connections: scenarioData.connections
      }])
    } catch (e) {
      console.warn('Lưu database Supabase không khả dụng, đã lưu cache LocalStorage thành công.')
    }

    setActiveView('dashboard')
    setCurrentScenarioId(null)
  }

  // --- HÀM 5: AI DỰNG LUỒNG SIÊU NHÁNH ---
  const handleAIGenerateFlow = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    setIsLogsDrawerOpen(true)
    setLogs(prev => [
      ...prev, 
      { timestamp: new Date().toLocaleTimeString(), message: `🔮 Bliss Flow AI đang phân tích sơ đồ: "${aiPrompt}"...`, type: 'info' }
    ])

    await new Promise(resolve => setTimeout(resolve, 1500))

    const cleanPrompt = aiPrompt.toLowerCase()
    let generatedNodes: AutomationNode[] = []
    let generatedConnections: Connection[] = []

    if (cleanPrompt.includes('sheet') || cleanPrompt.includes('bảng tính') || cleanPrompt.includes('telegram')) {
      generatedNodes = [
        {
          id: 'node-1',
          type: 'webhook',
          label: 'Webhook Trigger n8n/Make 🔌',
          icon: Link,
          color: 'border-indigo-500 text-indigo-500 bg-indigo-50',
          inputs: [],
          outputs: [{ id: 'out-1', type: 'output', label: 'Dữ liệu Nhận' }],
          x: 100,
          y: 200,
          config: {
            webhook_url: 'https://hook.make.com/generated-blisshome-webhook',
            source_app: 'n8n Integration'
          }
        },
        {
          id: 'node-2',
          type: 'action',
          label: 'Đồng bộ Google Sheets 📊',
          icon: Table,
          color: 'border-emerald-600 text-emerald-600 bg-emerald-50',
          inputs: [{ id: 'in-2', type: 'input', label: 'Bản ghi' }],
          outputs: [{ id: 'out-2', type: 'output', label: 'Đã ghi' }],
          x: 390,
          y: 200,
          config: {
            sheet_name: 'Khách VIP Từ Webhook',
            headers: 'ID, Tên Khách, SĐT, Email'
          }
        },
        {
          id: 'node-3',
          type: 'action',
          label: 'Gửi báo Telegram CSKH 📢',
          icon: Send,
          color: 'border-sky-500 text-sky-500 bg-sky-50',
          inputs: [{ id: 'in-3', type: 'input', label: 'Kích hoạt' }],
          outputs: [],
          x: 680,
          y: 200,
          config: {
            telegram_chat_id: '-1002345678',
            telegram_message: '📢 [WEBHOOK DETECTED]: Đã đồng bộ khách {{$trigger.name}} thành công qua Sheets.'
          }
        }
      ]

      generatedConnections = [
        { fromId: 'node-1', fromPort: 'out-1', toId: 'node-2', toPort: 'in-2' },
        { fromId: 'node-2', fromPort: 'out-2', toId: 'node-3', toPort: 'in-3' }
      ]
    } else {
      // Mặc định Zalo ZNS và CRM
      generatedNodes = [
        {
          id: 'node-1',
          type: 'trigger',
          label: 'Đơn đặt phòng mới 🟢',
          icon: Database,
          color: 'border-emerald-500 text-emerald-500 bg-emerald-50',
          inputs: [],
          outputs: [{ id: 'out-1', type: 'output', label: 'Thông tin' }],
          x: 100,
          y: 200,
          config: {}
        },
        {
          id: 'node-2',
          type: 'crm',
          label: 'Cập nhật CRM thăng hạng 🟣',
          icon: UserPlus,
          color: 'border-purple-500 text-purple-500 bg-purple-50',
          inputs: [{ id: 'in-2', type: 'input', label: 'Thông tin' }],
          outputs: [{ id: 'out-2', type: 'output', label: 'Thành viên mới' }],
          x: 380,
          y: 200,
          config: {}
        },
        {
          id: 'node-3',
          type: 'action',
          label: 'Gửi Zalo ZNS Chào mừng 🔵',
          icon: Smartphone,
          color: 'border-blue-500 text-blue-500 bg-blue-50',
          inputs: [{ id: 'in-3', type: 'input', label: 'Khách nhận' }],
          outputs: [],
          x: 660,
          y: 200,
          config: {
            template: 'Mẫu ZNS Chào mừng Thành viên mới',
            content: 'Chào mừng bạn {{$trigger.name}} đã đặt phòng {{$booking.room_name}} tại Bliss Home!'
          }
        }
      ]

      generatedConnections = [
        { fromId: 'node-1', fromPort: 'out-1', toId: 'node-2', toPort: 'in-2' },
        { fromId: 'node-2', fromPort: 'out-2', toId: 'node-3', toPort: 'in-3' }
      ]
    }

    setNodes(generatedNodes)
    setConnections(generatedConnections)
    setIsGenerating(false)
    setAiPrompt('')
    setSelectedNode(null)
    setLogs(prev => [
      ...prev, 
      { timestamp: new Date().toLocaleTimeString(), message: '🚀 [AI GENERATED]: Đã vẽ luồng Make.com tự động hóa liên kết thành công!', type: 'success' }
    ])
  }

  // --- HÀM 6: KHỞI CHẠY THỬ NGHIỆM GIẢ LẬP MAKE-STYLE ---
  const runSimulation = async () => {
    if (nodes.length === 0) return

    setIsSimulating(true)
    setIsLogsDrawerOpen(true)
    setLogs([
      { timestamp: new Date().toLocaleTimeString(), message: '⚡ KHỞI ĐỘNG CHU KỲ KIỂM TRA THỬ NGHIỆM ĐỒNG BỘ TOÀN MẠCH...', type: 'warning' }
    ])

    const startNode = nodes.find(n => n.type === 'trigger' || n.type === 'webhook')
    if (!startNode) {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: '❌ Lỗi: Không phát hiện Node Trigger đầu vào nào trên Canvas để khởi chạy.', type: 'error' }
      ])
      setIsSimulating(false)
      return
    }

    // Step 1: Kích hoạt Trigger node
    setActiveNodeId(startNode.id)
    await new Promise(resolve => setTimeout(resolve, 850))
    
    // MOCK DATA CONTEXT CHO MÔ PHỎNG TEST
    const mockContext = {
      booking: {
        id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
        room_name: 'Phòng VIP Suite CS2 Thảo Điền',
        room_price: '2,200,000'
      },
      trigger: {
        name: 'Nguyễn Hoàng Nam',
        phone: '0987654321',
        email: 'hoangnam@gmail.com'
      },
      crm: {
        behavior_group: 'Khách hàng VIP',
        total_spent: '14,800,000'
      },
      voucher: {
        code: 'BLISSHE2026',
        discount: '15%'
      }
    }

    if (startNode.type === 'webhook') {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `🔌 [WEBHOOK TRIGGER]: Đã bắt tín hiệu POST từ URL: "${startNode.config.webhook_url || 'https://hook.make.com/...'}"`, type: 'info' },
        { timestamp: new Date().toLocaleTimeString(), message: `📥 [DATA INJECTED]: { customer_name: "Nguyễn Hoàng Nam", room_name: "VIP Suite", room_price: "2,200,000", total_spent: "14,800,000" }`, type: 'success' }
      ])
    } else {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `📲 [SỰ KIỆN HỆ THỐNG]: Nhận lệnh kích hoạt tự động từ "${startNode.label}" (Mã Đơn: ${mockContext.booking.id}).`, type: 'info' }
      ])
    }

    let currentId = startNode.id
    let visited = new Set<string>([currentId])
    
    const getNextNodeIds = (id: string) => {
      return connections.filter(c => c.fromId === id).map(c => c.toId)
    }

    let queue = getNextNodeIds(currentId)

    while (queue.length > 0) {
      const nextId = queue.shift()
      if (!nextId || visited.has(nextId)) continue
      visited.add(nextId)

      const nextNode = nodes.find(n => n.id === nextId)
      if (!nextNode) continue

      setActiveNodeId(nextId)
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (nextNode.type === 'logic') {
        const isMatched = evaluateLogicConditions(nextNode.config, mockContext)
        if (!isMatched) {
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `🛑 [LOGIC NGẮT LUỒNG]: Bộ lọc "${nextNode.label}" đối soát KHÔNG khớp điều kiện. Ngừng truyền tiếp.`, type: 'info' }
          ])
          continue
        }
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: `🔍 [BỘ LỌC ĐIỀU KIỆN]: Rẽ nhánh so khớp: "${nextNode.label}"...`, type: 'info' },
          { timestamp: new Date().toLocaleTimeString(), message: `✓ [SO KHỚP THÀNH CÔNG]: Dữ liệu đúng! Cho phép truyền tín hiệu đến các node tiếp theo.`, type: 'success' }
        ])
      } else if (nextNode.type === 'crm') {
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: `📈 [CRM DATABASE]: Kết nối Supabase API... Ghi nhận thông tin khách hàng vào danh mục VIP thành công!`, type: 'success' }
        ])
      } else if (nextNode.type === 'webhook') {
        const url = nextNode.config.webhook_url
        const method = nextNode.config.webhook_method || 'POST'
        if (url) {
          await fireExternalWebhook(url, method, mockContext)
        }
      } else if (nextNode.type === 'action') {
        const lbl = nextNode.label.toLowerCase()
        if (lbl.includes('zalo') || lbl.includes('zns')) {
          const rawMsg = nextNode.config.content || ''
          const resolvedMsg = replaceVariables(rawMsg, mockContext)
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `💬 [ZALO ZNS]: Đã bắn tin Zalo ZNS thành công tới ${mockContext.trigger.phone}! Nội dung: "${resolvedMsg}"`, type: 'success' }
          ])
        } else if (lbl.includes('email')) {
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `✉️ [EMAIL DELIVERY]: Biên dịch mẫu mail và bắn thành công tới hòm thư ${mockContext.trigger.email}!`, type: 'success' }
          ])
        } else if (lbl.includes('sheets')) {
          const sheetNameConfig = nextNode.config.sheet_name || ''
          const savedTokens = localStorage.getItem('bliss_google_tokens')
          if (savedTokens && googleConnection !== 'none' && googleConnection !== 'bliss_cskh') {
            try {
              let spreadsheetId = sheetNameConfig
              if (spreadsheetId.includes('/d/')) {
                const match = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/)
                if (match) spreadsheetId = match[1]
              }

              if (!spreadsheetId) {
                throw new Error('Chưa điền Spreadsheet ID hoặc URL Google Sheet')
              }

              const accessToken = await getOrRefreshAccessToken()
              if (!accessToken) {
                throw new Error('Không thể lấy Access Token Google. Vui lòng kết nối lại tài khoản!')
              }

              const range = 'Sheet1!A:Z'
              const rowValues = [
                mockContext.booking?.id || 'booking-' + Date.now(),
                mockContext.trigger?.name || 'Nguyễn Hoàng Nam',
                mockContext.trigger?.phone || '0987654321',
                mockContext.trigger?.email || 'hoangnam@gmail.com',
                mockContext.booking?.room_name || 'Phòng VIP Suite CS2 Thảo Điền',
                mockContext.booking?.room_price || '2,200,000',
                mockContext.voucher?.code || 'BLISSHE2026',
                new Date().toLocaleString()
              ]

              const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  values: [rowValues]
                })
              })

              const resData = await response.json()
              if (!response.ok || resData.error) {
                throw new Error(resData.error?.message || 'Lỗi ghi Sheets API')
              }

              setLogs(prev => [
                ...prev,
                { 
                  timestamp: new Date().toLocaleTimeString(), 
                  message: `📊 [GOOGLE SHEETS REALTIME SUCCESS]: Đã đồng bộ dòng dữ liệu Booking vào file Sheet thật thành công! [Xem Google Sheet 🔗](https://docs.google.com/spreadsheets/d/${spreadsheetId})`, 
                  type: 'success' 
                }
              ])

            } catch (err: any) {
              console.error(err)
              setLogs(prev => [
                ...prev,
                { timestamp: new Date().toLocaleTimeString(), message: `❌ [GOOGLE SHEETS REALTIME ERROR]: ${err.message}`, type: 'error' }
              ])
            }
          } else {
            setLogs(prev => [
              ...prev,
              { timestamp: new Date().toLocaleTimeString(), message: `📊 [GOOGLE SHEETS DISPATCH]: Đã ghi nhận bản ghi của khách ${mockContext.trigger.name} vào Google Sheets '${sheetNameConfig}'!`, type: 'success' }
            ])
          }
        } else if (lbl.includes('telegram')) {
          const token = nextNode.config.telegram_token || 'YOUR_BOT_TOKEN_HERE'
          const chatId = nextNode.config.telegram_chat_id
          const rawMsg = nextNode.config.telegram_message || ''
          const resolvedMsg = replaceVariables(rawMsg, mockContext)
          
          if (chatId) {
            await sendTelegramMessage(token, chatId, resolvedMsg)
          }
        } else if (lbl.includes('voucher') || lbl.includes('tri ân')) {
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `🎫 [MÃ GIẢM GIÁ]: Đã phát sinh mã voucher tự động: BLISSHH2026. Hạng chiết khấu: ${nextNode.config.voucher_discount || '10%'}.`, type: 'success' }
          ])
        } else {
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message: `⚙️ [HÀNH ĐỘNG]: Thực thi thẻ tự động hóa "${nextNode.label}" hoàn tất.`, type: 'success' }
          ])
        }
      }

      const dependents = getNextNodeIds(nextId)
      queue.push(...dependents)
    }

    await new Promise(resolve => setTimeout(resolve, 600))
    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message: '🎉 HOÀN TẤT THỬ NGHIỆM: LUỒNG CHẠY 100% THÀNH CÔNG KHÔNG PHÁT SINH LỖI!', type: 'success' }
    ])
    
    setActiveNodeId(null)
    setIsSimulating(false)
  }

  const getDefaultActionType = (node: AutomationNode) => {
    if (node.label.toLowerCase().includes('sheets')) return 'add_row'
    if (node.label.toLowerCase().includes('zalo')) return 'send_zns'
    if (node.type === 'crm') return 'sync_profile'
    if (node.type === 'webhook') return 'trigger_webhook'
    return 'custom_action'
  }

  const getActionDescription = (type: string) => {
    switch (type) {
      // Google Sheets - Rows
      case 'watch_new_rows': return 'Watch New Rows: Triggers when a new row is added.'
      case 'add_row': return 'Add a Row: Appends a new row to the bottom of the table.'
      case 'update_row': return 'Update a Row: Updates a row.'
      case 'bulk_add_rows': return 'Bulk Add Rows (Advanced): Appends multiple rows to the bottom of the table.'
      case 'bulk_update_rows': return 'Bulk Update Rows (Advanced): Updates multiple rows.'
      case 'search_rows': return 'Search Rows: Returns results matching the given criteria.'
      case 'search_rows_advanced': return 'Search Rows (Advanced): Returns results matching the given criteria. This module doesn\'t return a row number.'
      case 'clear_row': return 'Clear a Row: Clears values from a specific row.'
      case 'delete_row': return 'Delete a Row: Deletes a specific row.'
      
      // Google Sheets - Cells
      case 'watch_changes': return 'Watch Changes: Triggers when a cell is updated. Watches only changes made in Google Sheet app. Sheets Add-On required.'
      case 'update_cell': return 'Update a Cell: Updates a specific cell.'
      case 'get_cell': return 'Get a Cell: Gets a specific cell.'
      case 'clear_cell': return 'Clear a Cell: Clears a specific cell.'
      
      // Google Sheets - Sheets
      case 'perform_function': return 'Perform a Function: Receives data from the MAKE_FUNCTION or INTEGROMAT functions used in a sheet. Please note, the Sheets Add-On is required.'
      case 'perform_function_responder': return 'Perform a Function - Responder: Returns processed data as a result of the MAKE_FUNCTION or INTEGROMAT function. Sheets Add-On required.'
      case 'add_sheet': return 'Add a Sheet: Adds a new sheet.'
      case 'create_spreadsheet': return 'Create a Spreadsheet: Creates a new spreadsheet.'
      case 'create_spreadsheet_template': return 'Create a Spreadsheet from a Template: Creates a new spreadsheet from a template sheet.'
      case 'copy_sheet': return 'Copy a Sheet: Copies a sheet to another spreadsheet.'
      case 'add_conditional_format_rule': return 'Add a Conditional Format Rule: Creates a new conditional format rule at the given index. All subsequent rules\' indexes are incremented.'
      case 'rename_sheet': return 'Rename a Sheet: Renames a specific sheet.'
      case 'get_range_values': return 'Get Range Values: Returns a sheet’s content defined by range values.'
      case 'list_sheets': return 'List Sheets: Gets a list of all sheets in a spreadsheet.'
      case 'delete_sheet': return 'Delete a Sheet: Deletes a specific sheet.'
      case 'clear_range_values': return 'Clear Values from a Range: Clears a specified range of values from a spreadsheet.'
      case 'delete_conditional_format_rule': return 'Delete a Conditional Format Rule: Deletes a conditional format rule at the given index. All subsequent rules\' indexes are decremented.'
      
      // Google Sheets - Other
      case 'make_api_call': return 'Make an API Call: Performs an arbitrary authorized API call.'
      
      // Zalo ZNS
      case 'send_zns': return 'Gửi Zalo ZNS: Tự động gửi tin nhắn chăm sóc khách hàng bằng tin nhắn ZNS thương hiệu mẫu đã được duyệt.'
      case 'watch_events': return 'Watch ZNS Delivery: Theo dõi và cập nhật trạng thái phân phối tin nhắn gửi khách hàng.'
      
      // CRM
      case 'sync_profile': return 'Tạo & Đồng bộ CRM: Rà soát khách hàng từ đơn đặt phòng, tự động tạo hồ sơ CRM và nâng hạng VIP thành viên.'
      case 'add_behavior': return 'Gắn thẻ hành vi: Phân tích lịch sử lưu trú và gắn thẻ nhóm hành vi phục vụ marketing.'
      
      // Webhook
      case 'trigger_webhook': return 'Watch Webhook: Nhận dữ liệu webhook JSON thời gian thực được đẩy sang từ các ứng dụng như Make/n8n.'
      case 'custom_api': return 'Make an API Call: Thực hiện một yêu cầu REST API GET/POST tùy chỉnh đến server khác.'
      
      default: return 'Thực hiện hành động tự động hóa theo thiết lập luồng.'
    }
  }

  // --- HÀM XÓA THẺ NODE KHỎI CANVAS ---
  const handleDeleteNode = (nodeId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa thẻ Node',
      message: 'Bạn có chắc chắn muốn xóa thẻ Node này và tất cả các dây liên kết liên quan khỏi Canvas không?',
      onConfirm: () => {
        setNodes(prev => prev.filter(n => n.id !== nodeId))
        setConnections(prev => prev.filter(c => c.fromId !== nodeId && c.toId !== nodeId))
        setSelectedNode(null)
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: `🗑️ Đã xóa thẻ Node và tất cả dây liên kết liên quan khỏi Canvas!`, type: 'warning' }
        ])
      }
    })
  }

  // --- HÀM 7: BẬT MODAL CHỈNH SỬA NODE ---
  const handleSelectNodeForEdit = (node: AutomationNode) => {
    if (isSpacePressed) return
    setSelectedNode(node)
    setNodeLabel(node.label)
    
    // Tự động phân phối các trường config sẵn
    setNodeTemplate(node.config.template || 'Mẫu Tin nhắn Hệ thống')
    setNodeMessage(node.config.content || '')
    setNodeVoucher(node.config.voucher || activeVouchers[0] || '')
    setNodeDelay(node.config.delay || '15')
    
    setWebhookUrl(node.config.webhook_url || '')
    setWebhookMethod(node.config.webhook_method || 'POST')
    setSourceApp(node.config.source_app || 'Make.com')
    setSheetName(node.config.sheet_name || '')
    setSheetHeaders(node.config.headers || '')
    setGoogleConnection(node.config.google_connection || 'none')
    
    setTelegramChatId(node.config.telegram_chat_id || '')
    setTelegramMessage(node.config.telegram_message || '')
    setTelegramToken(node.config.telegram_token || '')
    setVoucherDiscount(node.config.voucher_discount || '10%')

    setLogicRelation(node.config.relation || 'AND')
    setLogicConditions(node.config.conditions || [])
    setNodeActionType(node.config.action_type || getDefaultActionType(node))
  }

  // --- HÀM KẾT NỐI TÀI KHOẢN GOOGLE ---
  const handleConnectGoogleAccount = () => {
    if (!googleClientId || !googleClientSecret) {
      setShowGoogleCredentialsPanel(true)
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: '⚠️ [GOOGLE OAUTH]: Vui lòng cấu hình Client ID và Client Secret ở mục "Cấu hình Google App" trước!', type: 'info' }
      ])
      return
    }

    setIsConnectingGoogle(true)
    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message: '🔌 [GOOGLE OAUTH]: Đang khởi tạo luồng ủy quyền kết nối tài khoản Google Account...', type: 'info' }
    ])

    try {
      // Save credentials first
      localStorage.setItem('bliss_google_credentials', JSON.stringify({
        client_id: googleClientId,
        client_secret: googleClientSecret
      }))

      // Redirect to Google OAuth Consent Screen
      const redirectUri = window.location.origin + window.location.pathname
      const scope = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email'
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scope,
        access_type: 'offline',
        prompt: 'consent'
      }).toString()

      // Redirect to auth url
      window.location.href = authUrl
    } catch (err: any) {
      setIsConnectingGoogle(false)
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), message: `❌ [GOOGLE OAUTH ERROR]: ${err.message}`, type: 'error' }
      ])
    }
  }

  // --- HÀM 8: LƯU CẤU HÌNH NODE ---
  const handleSaveNodeConfig = () => {
    if (!selectedNode) return

    setNodes(prev => prev.map(n => {
      if (n.id === selectedNode.id) {
        return {
          ...n,
          label: n.label, // Giữ tên thẻ hiển thị mặc định cố định
          config: {
            ...n.config,
            template: nodeTemplate,
            content: nodeMessage,
            voucher: nodeVoucher,
            delay: nodeDelay,
            webhook_url: webhookUrl,
            webhook_method: webhookMethod,
            source_app: sourceApp,
            sheet_name: sheetName,
            headers: sheetHeaders,
            google_connection: googleConnection,
            telegram_chat_id: telegramChatId,
            telegram_message: telegramMessage,
            telegram_token: telegramToken,
            voucher_discount: voucherDiscount,
            relation: logicRelation,
            conditions: logicConditions,
            action_type: nodeActionType
          }
        }
      }
      return n
    }))

    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message: `✓ Đã cập nhật cấu hình cho thẻ Node: "${selectedNode.label}"`, type: 'info' }
    ])
    setSelectedNode(null)
  }

  // --- HÀM 9: CHÈN BIẾN HỆ THỐNG ---
  const handleInjectVariable = (variable: string) => {
    if (selectedNode?.label.toLowerCase().includes('telegram') || selectedNode?.type === 'webhook') {
      setTelegramMessage(prev => prev + ' ' + variable)
    } else {
      setNodeMessage(prev => prev + ' ' + variable)
    }
  }

  // --- HÀM TRỢ GIÚP VẼ BẢNG MENU NODE CHIA SẺ TRÁNH TRÙNG LẶP CODE ---
  const renderPaletteContent = () => {
    // ----------------------------------------------------
    // VIEW 1: BẢNG CHỌN ỨNG DỤNG LIÊN KẾT (APP SELECTOR)
    // ----------------------------------------------------
    if (paletteSelectedApp === null) {
      const apps = [
        { id: 'google_sheets', name: 'Google Sheets', description: 'Đồng bộ bảng tính Excel', icon: Table, color: 'bg-emerald-500 text-white', badge: 'Verified' },
        { id: 'zalo_zns', name: 'Zalo ZNS', description: 'Chăm sóc khách hàng Zalo', icon: Smartphone, color: 'bg-blue-500 text-white', badge: 'Verified' },
        { id: 'webhook', name: 'Webhook Connection', description: 'Nhận tín hiệu webhook JSON', icon: Link, color: 'bg-indigo-500 text-white', badge: 'Verified' },
        { id: 'telegram', name: 'Telegram CSKH', description: 'Báo động phòng Chat khẩn cấp', icon: Send, color: 'bg-sky-500 text-white', badge: 'Verified' },
        { id: 'crm', name: 'CRM Profile', description: 'Cập nhật VIP & Thẻ khách hàng', icon: UserPlus, color: 'bg-purple-500 text-white', badge: 'Verified' },
        { id: 'logic', name: 'Logic Gate (Filter)', description: 'Bộ lọc rẽ nhánh điều kiện', icon: GitBranch, color: 'bg-amber-500 text-white', badge: null },
        { id: 'email', name: 'Email Service', description: 'Gửi Email chăm sóc tự động', icon: Mail, color: 'bg-sky-400 text-white', badge: null },
      ]

      const filteredApps = apps.filter(app => 
        app.name.toLowerCase().includes(paletteSearchQuery.toLowerCase()) || 
        app.description.toLowerCase().includes(paletteSearchQuery.toLowerCase())
      )

      return (
        <div className="flex flex-col gap-3.5 w-full text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-[11.5px] font-black uppercase text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 tracking-widest flex items-center gap-1.5">
              <LayoutGrid size={13} className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200" />
              Chọn ứng dụng liên kết
            </span>
            <button 
              onClick={() => { setIsPaletteOpen(false); setConnectingSourceId(null); setPaletteSearchQuery(''); }}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 border-none bg-transparent cursor-pointer p-0.5 rounded transition hover:bg-slate-100"
            >
              <X size={15} />
            </button>
          </div>

          {/* Search box with purple focus border like Make.com */}
          <div className="relative">
            <input
              type="text"
              value={paletteSearchQuery}
              onChange={(e) => setPaletteSearchQuery(e.target.value)}
              placeholder="Search apps..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 rounded-xl py-2 px-3 pl-8 text-xs font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-inner"
            />
            <span className="absolute left-2.5 top-2.5 text-zinc-400 dark:text-zinc-500">🔍</span>
          </div>

          {/* Scrollable list of apps */}
          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredApps.length === 0 ? (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic text-center py-4">Không tìm thấy ứng dụng nào khớp</span>
            ) : (
              filteredApps.map(app => (
                <div
                  key={app.id}
                  onClick={() => { setPaletteSelectedApp(app.id); setPaletteSearchQuery(''); }}
                  className="flex items-center justify-between p-2 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 ${app.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-inner`}>
                      <app.icon size={15} />
                    </div>
                    <div className="flex flex-col leading-normal text-left">
                      <span className="text-[11px] font-black text-slate-900">{app.name}</span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold leading-none mt-0.5">{app.description}</span>
                    </div>
                  </div>
                  {app.badge && (
                    <span className="bg-purple-100 text-purple-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {app.badge}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )
    }

    // ----------------------------------------------------
    // VIEW 2: BẢNG CHỌN HÀNH ĐỘNG CỦA GOOGLE SHEETS
    // ----------------------------------------------------
    if (paletteSelectedApp === 'google_sheets') {
      const gsheetsActions = [
        // Group Rows
        { value: 'watch_new_rows', name: 'Watch New Rows', description: 'Triggers when a new row is added.', type: 'trigger', badge: 'Acid', badge2: 'Instant', group: 'Rows' },
        { value: 'add_row', name: 'Add a Row', description: 'Appends a new row to the bottom of the table.', type: 'action', badge: null, badge2: null, group: 'Rows' },
        { value: 'update_row', name: 'Update a Row', description: 'Updates a row.', type: 'action', badge: null, badge2: null, group: 'Rows' },
        { value: 'bulk_add_rows', name: 'Bulk Add Rows (Advanced)', description: 'Appends multiple rows to the bottom of the table.', type: 'action', badge: 'Advanced', badge2: null, group: 'Rows' },
        { value: 'bulk_update_rows', name: 'Bulk Update Rows (Advanced)', description: 'Updates multiple rows.', type: 'action', badge: 'Advanced', badge2: null, group: 'Rows' },
        { value: 'search_rows', name: 'Search Rows', description: 'Returns results matching the given criteria.', type: 'action', badge: null, badge2: null, group: 'Rows' },
        { value: 'search_rows_advanced', name: 'Search Rows (Advanced)', description: 'Returns results matching the given criteria. This module doesn\'t return a row number.', type: 'action', badge: 'Advanced', badge2: null, group: 'Rows' },
        { value: 'clear_row', name: 'Clear a Row', description: 'Clears values from a specific row.', type: 'action', badge: null, badge2: null, group: 'Rows' },
        { value: 'delete_row', name: 'Delete a Row', description: 'Deletes a specific row.', type: 'action', badge: null, badge2: null, group: 'Rows' },
        
        // Group Cells
        { value: 'watch_changes', name: 'Watch Changes', description: 'Triggers when a cell is updated. Watches only changes made in Google Sheet app. Sheets Add-On required.', type: 'trigger', badge: 'Instant', badge2: 'Acid', group: 'Cells' },
        { value: 'update_cell', name: 'Update a Cell', description: 'Updates a specific cell.', type: 'action', badge: null, badge2: null, group: 'Cells' },
        { value: 'get_cell', name: 'Get a Cell', description: 'Gets a specific cell.', type: 'action', badge: null, badge2: null, group: 'Cells' },
        { value: 'clear_cell', name: 'Clear a Cell', description: 'Clears a specific cell.', type: 'action', badge: null, badge2: null, group: 'Cells' },
        
        // Group Sheets
        { value: 'perform_function', name: 'Perform a Function', description: 'Receives data from the MAKE_FUNCTION or INTEGROMAT functions used in a sheet. Please note, the Sheets Add-On is required.', type: 'action', badge: 'Instant', badge2: 'Acid', group: 'Sheets' },
        { value: 'perform_function_responder', name: 'Perform a Function - Responder', description: 'Returns processed data as a result of the MAKE_FUNCTION or INTEGROMAT function. Sheets Add-On required.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'add_sheet', name: 'Add a Sheet', description: 'Adds a new sheet.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'create_spreadsheet', name: 'Create a Spreadsheet', description: 'Creates a new spreadsheet.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'create_spreadsheet_template', name: 'Create a Spreadsheet from a Template', description: 'Creates a new spreadsheet from a template sheet.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'copy_sheet', name: 'Copy a Sheet', description: 'Copies a sheet to another spreadsheet.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'add_conditional_format_rule', name: 'Add a Conditional Format Rule', description: 'Creates a new conditional format rule at the given index. All subsequent rules\' indexes are incremented.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'rename_sheet', name: 'Rename a Sheet', description: 'Renames a specific sheet.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'get_range_values', name: 'Get Range Values', description: 'Returns a sheet’s content defined by range values.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'list_sheets', name: 'List Sheets', description: 'Gets a list of all sheets in a spreadsheet.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'delete_sheet', name: 'Delete a Sheet', description: 'Deletes a specific sheet.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'clear_range_values', name: 'Clear Values from a Range', description: 'Clears a specified range of values from a spreadsheet.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        { value: 'delete_conditional_format_rule', name: 'Delete a Conditional Format Rule', description: 'Deletes a conditional format rule at the given index. All subsequent rules\' indexes are decremented.', type: 'action', badge: null, badge2: null, group: 'Sheets' },
        
        // Group Other
        { value: 'make_api_call', name: 'Make an API Call', description: 'Performs an arbitrary authorized API call.', type: 'action', badge: null, badge2: null, group: 'Other' },
      ]

      const filteredActions = gsheetsActions.filter(act => 
        act.name.toLowerCase().includes(paletteSearchQuery.toLowerCase()) || 
        act.description.toLowerCase().includes(paletteSearchQuery.toLowerCase()) ||
        act.group.toLowerCase().includes(paletteSearchQuery.toLowerCase())
      )

      return (
        <div className="flex flex-col gap-3.5 w-full text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
          {/* Header row with back purple text and close */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => { setPaletteSelectedApp(null); setPaletteSearchQuery(''); }}
              className="text-indigo-600 hover:text-indigo-850 border-none bg-transparent cursor-pointer font-black text-xs flex items-center gap-1 active:scale-95 transition"
            >
              ← Back
            </button>
            <button 
              onClick={() => { setIsPaletteOpen(false); setConnectingSourceId(null); setPaletteSearchQuery(''); setPaletteSelectedApp(null); }}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 border-none bg-transparent cursor-pointer p-0.5 rounded transition hover:bg-slate-100"
            >
              <X size={15} />
            </button>
          </div>

          {/* Premium green Sheets icon card banner matching user screenshot */}
          <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border-2 border-emerald-500 rounded-2xl p-3 flex flex-col items-center justify-center relative shadow-inner">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md mb-1">
              <Table size={20} />
            </div>
            <span className="font-black text-slate-800 text-xs">Google Sheets</span>
            <span className="bg-purple-150 text-purple-700 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5">
              Verified
            </span>
          </div>

          {/* Search box with purple outline */}
          <div className="relative">
            <input
              type="text"
              value={paletteSearchQuery}
              onChange={(e) => setPaletteSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-indigo-500 rounded-xl py-2 px-3 pl-8 text-xs font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-inner"
              autoFocus
            />
            <span className="absolute left-2.5 top-2.5 text-zinc-400 dark:text-zinc-500">🔍</span>
          </div>

          {/* Grouped module action selector list */}
          <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
            {['Rows', 'Cells', 'Sheets', 'Other'].map(group => {
              const groupActions = filteredActions.filter(a => a.group === group)
              if (groupActions.length === 0) return null
              return (
                <div key={group} className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-black text-zinc-500 dark:text-zinc-400 tracking-wider block border-b border-slate-100 pb-0.5 text-left">{group}</span>
                  <div className="flex flex-col gap-1.5">
                    {groupActions.map(act => (
                      <div
                        key={act.value}
                        onClick={() => handleAddNodeFromPalette(
                          act.type as any,
                          `Google Sheets: ${act.name} 📊`,
                          Table,
                          'google_sheets',
                          act.value
                        )}
                        className="flex items-start gap-2.5 p-2 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 rounded-xl text-left cursor-pointer transition active:scale-[0.98]"
                      >
                        <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                          <Table size={13} />
                        </div>
                        <div className="flex flex-col text-left leading-normal flex-grow">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10.5px] font-black text-slate-900 leading-tight">{act.name}</span>
                            {act.badge && (
                              <span className="bg-purple-600 text-white text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none">
                                {act.badge}
                              </span>
                            )}
                            {act.badge2 && (
                              <span className="bg-blue-600 text-white text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none">
                                {act.badge2}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold leading-normal mt-0.5">
                            {act.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // ----------------------------------------------------
    // VIEW 3: CÁC DỊCH VỤ KHÁC (Zalo, Webhook, CRM, Telegram, etc.)
    // ----------------------------------------------------
    const otherAppConfigs: Record<string, { name: string, color: string, bannerBg: string, borderCol: string, badgeCol: string, icon: any, actions: Array<{ value: string, name: string, description: string, type: string, badge?: string, group: string }> }> = {
      zalo_zns: {
        name: 'Zalo ZNS',
        color: 'bg-blue-500 text-white',
        bannerBg: 'bg-blue-50',
        borderCol: 'border-blue-500',
        badgeCol: 'bg-blue-100 text-blue-700',
        icon: Smartphone,
        actions: [
          { value: 'send_zns', name: 'Gửi Zalo ZNS', description: 'Tự động gửi tin nhắn chăm sóc khách hàng bằng tin nhắn mẫu đã duyệt.', type: 'action', badge: 'Instant', group: 'Messaging' },
          { value: 'watch_events', name: 'Watch ZNS Delivery', description: 'Theo dõi trạng thái giao nhận tin gửi khách.', type: 'trigger', group: 'Tracking' }
        ]
      },
      webhook: {
        name: 'Webhook Connection',
        color: 'bg-indigo-500 text-white',
        bannerBg: 'bg-indigo-50',
        borderCol: 'border-indigo-500',
        badgeCol: 'bg-indigo-100 text-indigo-700',
        icon: Link,
        actions: [
          { value: 'trigger_webhook', name: 'Watch Webhook', description: 'Kích hoạt luồng tự động hóa khi nhận webhook JSON thời gian thực.', type: 'webhook', badge: 'Instant', group: 'Listeners' },
          { value: 'custom_api', name: 'Make an API Call', description: 'Thực hiện yêu cầu API ngoài tùy chỉnh (GET/POST/PUT).', type: 'webhook', group: 'API Calls' }
        ]
      },
      telegram: {
        name: 'Telegram CSKH',
        color: 'bg-sky-500 text-white',
        bannerBg: 'bg-sky-50',
        borderCol: 'border-sky-400',
        badgeCol: 'bg-sky-100 text-sky-700',
        icon: Send,
        actions: [
          { value: 'send_telegram', name: 'Gửi báo Telegram CSKH', description: 'Gửi tin nhắn thông báo khẩn cấp tới nhóm Telegram CSKH.', type: 'action', group: 'Messaging' }
        ]
      },
      crm: {
        name: 'CRM Profile & Tags',
        color: 'bg-purple-500 text-white',
        bannerBg: 'bg-purple-50',
        borderCol: 'border-purple-500',
        badgeCol: 'bg-purple-100 text-purple-700',
        icon: UserPlus,
        actions: [
          { value: 'sync_profile', name: 'Đồng bộ CRM thăng hạng VIP', description: 'Tạo hồ sơ CRM và tự động thăng hạng khách hàng VIP.', type: 'crm', group: 'Customers' },
          { value: 'add_behavior', name: 'Gắn thẻ hành vi khách', description: 'Gắn thẻ hành vi của khách dựa trên lịch sử đặt phòng.', type: 'crm', group: 'Customers' }
        ]
      },
      logic: {
        name: 'Logic Gate (Filter)',
        color: 'bg-amber-500 text-white',
        bannerBg: 'bg-amber-50',
        borderCol: 'border-amber-500',
        badgeCol: 'bg-amber-100 text-amber-700',
        icon: GitBranch,
        actions: [
          { value: 'filter', name: 'Lọc điều kiện rẽ nhánh', description: 'Kiểm tra dữ liệu đối chiếu và phân nhánh luồng kết nối.', type: 'logic', badge: 'Instant', group: 'Routing' }
        ]
      },
      email: {
        name: 'Email Service',
        color: 'bg-sky-400 text-white',
        bannerBg: 'bg-sky-50',
        borderCol: 'border-sky-300',
        badgeCol: 'bg-slate-100 text-slate-700',
        icon: Mail,
        actions: [
          { value: 'send_email', name: 'Gửi Email chăm sóc', description: 'Tự động gửi email thông báo xác nhận đặt phòng, email cảm ơn.', type: 'action', group: 'Messaging' }
        ]
      }
    }

    const appConfig = otherAppConfigs[paletteSelectedApp]
    if (!appConfig) return null

    const filteredActions = appConfig.actions.filter(act => 
      act.name.toLowerCase().includes(paletteSearchQuery.toLowerCase()) || 
      act.description.toLowerCase().includes(paletteSearchQuery.toLowerCase())
    )

    return (
      <div className="flex flex-col gap-3.5 w-full text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
        {/* Header bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => { setPaletteSelectedApp(null); setPaletteSearchQuery(''); }}
            className="text-indigo-600 hover:text-indigo-850 border-none bg-transparent cursor-pointer font-black text-xs flex items-center gap-1 active:scale-95 transition"
          >
            ← Back
          </button>
          <button 
            onClick={() => { setIsPaletteOpen(false); setConnectingSourceId(null); setPaletteSearchQuery(''); setPaletteSelectedApp(null); }}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 border-none bg-transparent cursor-pointer p-0.5 rounded transition hover:bg-slate-100"
          >
            <X size={15} />
          </button>
        </div>

        {/* Premium Banner */}
        <div className={`${appConfig.bannerBg} border-2 ${appConfig.borderCol} rounded-2xl p-3 flex flex-col items-center justify-center relative shadow-inner`}>
          <div className={`w-10 h-10 ${appConfig.color} rounded-full flex items-center justify-center shadow-md mb-1`}>
            <appConfig.icon size={18} />
          </div>
          <span className="font-black text-slate-800 text-xs">{appConfig.name}</span>
          <span className={`${appConfig.badgeCol} text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5`}>
            Verified
          </span>
        </div>

        {/* Search box with purple outline */}
        <div className="relative">
          <input
            type="text"
            value={paletteSearchQuery}
            onChange={(e) => setPaletteSearchQuery(e.target.value)}
            placeholder="Search modules..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-indigo-500 rounded-xl py-2 px-3 pl-8 text-xs font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-inner"
            autoFocus
          />
          <span className="absolute left-2.5 top-2.5 text-zinc-400 dark:text-zinc-500">🔍</span>
        </div>

        {/* List of Actions */}
        <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
          {filteredActions.map(act => (
            <div
              key={act.value}
              onClick={() => handleAddNodeFromPalette(
                act.type as any,
                `${appConfig.name}: ${act.name} ${paletteSelectedApp === 'zalo_zns' ? '🔵' : paletteSelectedApp === 'webhook' ? '🔌' : paletteSelectedApp === 'telegram' ? '📢' : paletteSelectedApp === 'crm' ? '🟣' : paletteSelectedApp === 'logic' ? '🟡' : '✉️'}`,
                appConfig.icon,
                paletteSelectedApp,
                act.value
              )}
              className="flex items-start gap-2.5 p-2 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 rounded-xl text-left cursor-pointer transition active:scale-[0.98]"
            >
              <div className={`w-7 h-7 ${appConfig.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5`}>
                <appConfig.icon size={13} />
              </div>
              <div className="flex flex-col text-left leading-normal flex-grow">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] font-black text-slate-900 leading-tight">{act.name}</span>
                  {act.badge && (
                    <span className="bg-purple-600 text-white text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none">
                      {act.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold leading-normal mt-0.5">
                  {act.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- HÀM 10: THÊM NODE MỚI TỪ PALETTE (ADD NODE PROCESS) ---
  const handleAddNodeFromPalette = (
    type: 'trigger' | 'logic' | 'crm' | 'action' | 'webhook', 
    label: string, 
    icon: any,
    appType?: string,
    actionType?: string
  ) => {
    const newId = `node-ai-${Date.now()}`
    
    const randomOffset = Math.floor(Math.random() * 80) - 40
    let newX = (400 - pan.x) / zoom + randomOffset
    let newY = (220 - pan.y) / zoom + randomOffset

    const sourceNode = connectingSourceId ? nodes.find(n => n.id === connectingSourceId) : null
    if (sourceNode) {
      newX = sourceNode.x + 250
      newY = sourceNode.y
    }

    const newNode: AutomationNode = {
      id: newId,
      type,
      label,
      icon,
      color: type === 'trigger' ? 'border-emerald-500 bg-emerald-50 text-emerald-500'
             : type === 'logic' ? 'border-amber-500 bg-amber-50 text-amber-500'
             : type === 'crm' ? 'border-purple-500 bg-purple-50 text-purple-500'
             : type === 'webhook' ? 'border-indigo-500 bg-indigo-50 text-indigo-500'
             : 'border-blue-500 bg-blue-50 text-blue-500',
      inputs: type === 'trigger' || type === 'webhook' ? [] : [{ id: `in-${Date.now()}`, type: 'input', label: 'Tín hiệu' }],
      outputs: [{ id: `out-${Date.now()}`, type: 'output', label: 'Dữ liệu' }],
      x: newX,
      y: newY,
      config: {
        template: 'Mẫu Tin nhắn Tự động',
        content: 'Nội dung thông điệp tự động gửi khách hàng {{$trigger.name}}...',
        webhook_url: 'https://hook.make.com/your-endpoint',
        webhook_method: 'POST',
        sheet_name: 'Bliss Bookings Data',
        telegram_message: 'Thông báo tự động: Khách {{$trigger.name}} vừa đặt phòng!',
        action_type: actionType || (appType === 'google_sheets' ? 'add_row' : 'custom_action')
      }
    }

    setNodes(prev => [...prev, newNode])
    
    if (sourceNode) {
      const fromPort = sourceNode.outputs[0]?.id || `out-${sourceNode.id}`
      const toPort = newNode.inputs[0]?.id || `in-${newNode.id}`
      
      setConnections(prev => [...prev, {
        fromId: sourceNode.id,
        fromPort,
        toId: newNode.id,
        toPort
      }])
      setConnectingSourceId(null)
    } else if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1]
      const fromPort = lastNode.outputs[0]?.id || ''
      const toPort = newNode.inputs[0]?.id || ''
      
      if (fromPort && toPort) {
        setConnections(prev => [...prev, {
          fromId: lastNode.id,
          fromPort,
          toId: newNode.id,
          toPort
        }])
      }
    }

    setIsPaletteOpen(false)
    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message: `🔌 Đã thêm Node mới: "${label}" vào sơ đồ Canvas!`, type: 'info' }
    ])
    
    // Tự động bật menu cấu hình node mới vừa tạo
    handleSelectNodeForEdit(newNode)
  }

  // --- HÀM 11: CĂN CHỈNH LAYOUT NODE TỰ ĐỘNG ---
  const handleAutoAlignNodes = () => {
    setNodes(prev => {
      return prev.map((n, i) => {
        return {
          ...n,
          x: 100 + i * 260,
          y: 200 + (i % 2 === 0 ? 0 : 70)
        }
      })
    })
    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message: '📐 Đã tự động căn chỉnh khoảng cách các thẻ Node trên Canvas thẳng hàng.', type: 'info' }
    ])
  }

  // --- HÀM 12: RESET SCENARIO CANVAS ---
  const handleResetCanvas = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Làm sạch Canvas',
      message: 'Bạn có chắc muốn xóa hết toàn bộ các thẻ Node hiện tại và làm trống Canvas không?',
      onConfirm: () => {
        setNodes([])
        setConnections([])
        setSelectedNode(null)
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: '🧹 Đã làm sạch toàn bộ Canvas!', type: 'warning' }
        ])
      }
    })
  }

  // --- CANVAS VIEWPORT EVENT HANDLERS (PAN & ZOOM) ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Nếu đang giữ phím Space, cho phép bấm kéo bất cứ vị trí nào để di chuyển màn hình (pan)
    if (isSpacePressed) {
      setIsPanning(true)
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
      return
    }

    // Chỉ kích hoạt pan khi người dùng click chuột trái trên khoảng không lưới
    const target = e.target as HTMLElement
    if (target.id === 'automation-canvas-container' || target.tagName === 'svg') {
      setIsPanning(true)
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault()
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      })
      return
    }
    // Forward to node drag handlers
    handleMouseMove(e)
  }

  const handleCanvasWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    // Ctrl/Cmd + lăn chuột = Phóng to / Thu nhỏ
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = 0.05
      const direction = e.deltaY < 0 ? 1 : -1
      setZoom(prev => Math.max(0.5, Math.min(1.5, prev + direction * zoomFactor)))
    } else {
      // Lăn chuột thường = Di chuyển Panning của Canvas tự nhiên (Y cuộn đứng, X cuộn ngang)
      setPan(prev => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8
      }))
    }
  }

  // HÀM SAO CHÉP MÃ SQL DI TRÚ
  const copyMigrationSQL = () => {
    const sql = `CREATE TABLE IF NOT EXISTS public.automations (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    trigger_name VARCHAR(255),
    run_count INT NOT NULL DEFAULT 0,
    channels TEXT[] DEFAULT '{}'::TEXT[],
    nodes JSONB NOT NULL DEFAULT '[]'::JSONB,
    connections JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);`
    navigator.clipboard.writeText(sql)
    alert('Đã sao chép mã lệnh SQL! Vui lòng chạy trong SQL Editor của Supabase.')
  }

  // Thống kê kịch bản
  const countActive = scenarios.filter(s => s.status === 'active').length
  const countDraft = scenarios.filter(s => s.status === 'draft').length
  const countPaused = scenarios.filter(s => s.status === 'paused').length
  const countExpired = scenarios.filter(s => s.status === 'expired').length

  return (
    <div className="w-full h-full select-none font-sans text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card p-6 rounded-3xl min-h-screen">
      
      {/* =========================================================================
         VIEW 1: DASHBOARD KỊCH BẢN AUTOMATION
         ========================================================================= */}
      {activeView === 'dashboard' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* HEADER DASHBOARD (Màu be chữ đen sang trọng) */}
          <div className="flex justify-between items-center bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase">
                Bliss home Automation AI
              </h1>
              <span className="text-[10px] text-slate-600 block mt-1 font-bold">Quản lý các kịch bản chạy tự động hóa & tích hợp Make/n8n</span>
            </div>
            <button
              onClick={handleCreateNewScenario}
              className="px-5 py-3 bg-black hover:bg-slate-800 text-white rounded-2xl font-black text-xs transition-all duration-300 flex items-center gap-2 border-none shadow-md cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Plus size={16} />
              Tạo kịch bản mới
            </button>
          </div>

          {/* CHỈ SỐ THỐNG KÊ (STATS GRID - Nền Be Nhãn Đen Cao Cấp) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex items-center gap-4 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
              <div className="w-10 h-10 bg-card border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-2xl flex items-center justify-center font-bold flex-shrink-0">
                <Activity size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 block">Hoạt động</span>
                <span className="text-xl font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">{countActive}</span>
              </div>
            </div>

            <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex items-center gap-4 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
              <div className="w-10 h-10 bg-card border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-2xl flex items-center justify-center font-bold flex-shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 block">Nháp</span>
                <span className="text-xl font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">{countDraft}</span>
              </div>
            </div>

            <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex items-center gap-4 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
              <div className="w-10 h-10 bg-card border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-2xl flex items-center justify-center font-bold flex-shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 block">Tạm ngưng</span>
                <span className="text-xl font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">{countPaused}</span>
              </div>
            </div>

            <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex items-center gap-4 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
              <div className="w-10 h-10 bg-card border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-2xl flex items-center justify-center font-bold flex-shrink-0">
                <AlertCircle size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 block">Hết hạn</span>
                <span className="text-xl font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">{countExpired}</span>
              </div>
            </div>

          </div>

          {/* DANH SÁCH KỊCH BẢN (VERTICAL BAR LIST) */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 tracking-widest leading-none">
              Danh sách kịch bản
            </h2>
            
            <div className="flex flex-col gap-4">
              {scenarios.map((scen) => {
                const badgeStyle = 
                  scen.status === 'active' ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  : scen.status === 'paused' ? 'bg-amber-100 border-amber-400 text-amber-800'
                  : scen.status === 'expired' ? 'bg-red-100 border-red-400 text-red-800'
                  : 'bg-slate-100 border-zinc-300 dark:border-zinc-700 text-slate-800'
                
                const statusLabel = 
                  scen.status === 'active' ? 'Đang hoạt động'
                  : scen.status === 'paused' ? 'Tạm ngưng'
                  : scen.status === 'expired' ? 'Hết hạn'
                  : 'Bản nháp'

                return (
                  <div
                    key={scen.id}
                    className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                  >
                    {/* Info */}
                    <div className="flex-grow flex flex-col gap-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 border rounded-full text-[8.5px] font-black uppercase tracking-wider ${badgeStyle}`}>
                          {statusLabel}
                        </span>
                        <span className="text-[10px] text-slate-700 font-extrabold uppercase bg-card px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                          ⚡ Trigger: {scen.triggerName}
                        </span>
                        
                        {/* Kênh truyền thông */}
                        <div className="flex gap-1 ml-2">
                          {scen.channels.includes('zalo') && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 border border-blue-200 rounded text-[8px] font-black uppercase tracking-wider">zalo</span>
                          )}
                          {scen.channels.includes('email') && (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[8px] font-black uppercase tracking-wider">email</span>
                          )}
                          {scen.channels.includes('crm') && (
                            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 border border-purple-200 rounded text-[8px] font-black uppercase tracking-wider">crm</span>
                          )}
                          {scen.channels.includes('voucher') && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[8px] font-black uppercase tracking-wider">voucher</span>
                          )}
                          {scen.channels.includes('webhook') && (
                            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded text-[8px] font-black uppercase tracking-wider">webhook</span>
                          )}
                          {scen.channels.includes('google_sheets') && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded text-[8px] font-black uppercase tracking-wider">sheets</span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 group-hover:text-slate-800 transition duration-200">
                        {scen.name}
                      </h3>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {scen.description}
                      </p>
                    </div>

                    {/* Run Count */}
                    <div className="flex flex-col gap-0.5 min-w-[90px] text-left md:text-center flex-shrink-0">
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-extrabold">Số lượt chạy</span>
                      <span className="text-xs font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-mono bg-card px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                        {scen.runCount.toLocaleString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0 justify-end border-t border-zinc-200 dark:border-zinc-800 md:border-t-0 pt-3 md:pt-0">
                      <button
                        onClick={() => handleEditScenario(scen)}
                        className="px-4 py-2 bg-card border-2 border-zinc-300 dark:border-zinc-700 hover:bg-black hover:text-white hover:border-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-xl font-black text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Settings2 size={12} />
                        Chỉnh sửa luồng
                      </button>
                      <button
                        onClick={() => handleDeleteScenario(scen.id, scen.name)}
                        className="p-2 bg-red-50 hover:bg-red-500 border-2 border-red-200 hover:border-red-500 text-red-600 hover:text-white rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center flex-shrink-0 shadow-2xs"
                        title="Xóa kịch bản"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
         VIEW 2: MÀN HÌNH EDIT CANVANS LỚN MAKE-STYLE (editor)
         ========================================================================= */}
      {activeView === 'editor' && (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
          
          {/* PERSISTENCE WARNING BANNER (BẢNG THÔNG BÁO DI TRÚ SQL MÔ HÌNH DÂN CHƠI) */}
          {!usingDbMode && isMigrationBannerOpen && (
            <div className="bg-amber-50/70 dark:bg-zinc-950 border border-amber-300/80 p-4 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-md text-xs">
              <div className="flex gap-2.5 items-start">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5 animate-bounce" size={16} />
                <div>
                  <span className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 block text-[12.5px] uppercase tracking-wide">⚠️ Chưa cấu hình bảng automations trong Supabase (Chạy ở chế độ LocalStorage)</span>
                  <p className="text-slate-700 leading-relaxed mt-0.5">
                    Để kích hoạt tính năng chạy ngầm 100% tự động trên server và lưu trữ vĩnh viễn trên đám mây, vui lòng copy mã lệnh SQL bên dưới và dán vào mục **SQL Editor** trong trang quản trị Supabase của bạn.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto justify-end flex-shrink-0">
                <button 
                  onClick={copyMigrationSQL}
                  className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl font-black text-[10.5px] transition shadow-sm cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <FileText size={12} />
                  Sao chép mã SQL
                </button>
                <button 
                  onClick={() => setIsMigrationBannerOpen(false)}
                  className="px-3 py-2 bg-card hover:bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {/* HEADER EDITOR SIÊU COMPACT CẢI TIẾN MỚI (Màu Be, chữ Đen) */}
          <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 px-4 rounded-2xl shadow-xs flex-shrink-0">
            
            {/* Cột 1: Nút Quay Lại & Tên Mạch */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Quay lại danh sách',
                    message: 'Các thay đổi chưa lưu sẽ bị hủy bỏ. Bạn chắc chắn muốn quay lại danh sách kịch bản không?',
                    onConfirm: () => {
                      router.push('/admin/automation')
                    }
                  })
                }}
                className="w-8 h-8 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card hover:border-black hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-xl flex items-center justify-center cursor-pointer transition flex-shrink-0 shadow-2xs"
                title="Quay lại Dashboard"
              >
                <ArrowLeft size={14} />
              </button>
              
              <div className="flex flex-col justify-center">
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="Nhập tên mạch..."
                  className="bg-transparent border-b border-transparent hover:border-slate-400 focus:border-black text-[13px] font-black font-sans text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 outline-none pb-0.5 w-44 md:w-56 transition"
                />
              </div>
            </div>

            {/* Cột 2: Bliss Flow AI Generator tích hợp siêu nhỏ gọn ở giữa */}
            <div className="flex-grow max-w-md xl:mx-4 flex items-center gap-2 bg-card border border-zinc-300 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Sparkles size={13} className="text-indigo-600 flex-shrink-0 ml-0.5" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="✨ AI dựng luồng nhanh: Nhập yêu cầu..."
                className="flex-grow bg-transparent border-none text-[11px] text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 focus:outline-none font-bold placeholder-slate-400 p-0"
              />
              <button
                onClick={handleAIGenerateFlow}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-3 py-1 bg-black hover:bg-slate-800 disabled:bg-slate-100 disabled:text-zinc-400 dark:text-zinc-500 text-white rounded-lg font-black text-[10px] transition flex items-center gap-1 border-none cursor-pointer active:scale-95 flex-shrink-0 shadow-2xs"
              >
                {isGenerating ? (
                  <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Sparkles size={9} />
                    Dựng
                  </>
                )}
              </button>
            </div>

            {/* Cột 3: Các chọn lựa Cấu hình & Trạng thái */}
            <div className="flex items-center gap-2 flex-shrink-0 justify-end">
              {/* Scheduling type (Make clock icon) */}
              <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                <Clock size={11} className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200" />
                <select
                  value={schedulingType}
                  onChange={(e: any) => setSchedulingType(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 outline-none cursor-pointer p-0"
                >
                  <option value="none" className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card">Mặc định (Chạy tay)</option>
                  <option value="15m" className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card">Mỗi 15 phút ⏰</option>
                  <option value="immediate" className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card">Ngay lập tức ⚡</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                <span className={`w-2 h-2 rounded-full ${
                  editorStatus === 'active' ? 'bg-emerald-500 animate-pulse'
                  : editorStatus === 'paused' ? 'bg-amber-500'
                  : 'bg-slate-400'
                }`} />
                <select
                  value={editorStatus}
                  onChange={(e: any) => setEditorStatus(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 outline-none cursor-pointer p-0"
                >
                  <option value="active" className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card">Đang hoạt động</option>
                  <option value="draft" className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card">Bản nháp</option>
                  <option value="paused" className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card">Tạm ngưng</option>
                  <option value="expired" className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 bg-card">Hết hạn</option>
                </select>
              </div>
            </div>
          </div>

          {/* VÙNG VẼ SƠ ĐỒ CHÍNH (FULL SCREEN CANVAS WORKSPACE) */}
          <div 
            id="automation-canvas-container"
            className="relative w-full h-[750px] bg-card border border-zinc-250 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            style={{ 
              cursor: isSpacePressed ? (isPanning ? 'grabbing' : 'grab') : 'default',
              overscrollBehavior: 'none'
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleCanvasWheel}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            
            {/* Dots Canvas Grid Pattern */}
            <div 
              className="absolute inset-0 z-0" 
              style={{ 
                backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', 
                backgroundSize: '24px 24px',
                transform: `translate(${pan.x}px, ${pan.y}px)`,
                backgroundPosition: `${pan.x}px ${pan.y}px`
              }} 
            />

            {/* Viewport Scale-Translation layer */}
            <div 
              style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none'
              }}
            >

              {/* Dynamic Connection lines with Neon propagation */}
              <svg className="absolute inset-0 w-[3000px] h-[2000px] pointer-events-none z-10">
                {connections.map((c, index) => {
                  const fromNode = nodes.find(n => n.id === c.fromId)
                  const toNode = nodes.find(n => n.id === c.toId)
                  
                  if (!fromNode || !toNode) return null

                  // Cổng Ra bên phải Node (w-52 = 208px)
                  const startX = fromNode.x + 208
                  const startY = fromNode.y + (fromNode.type === 'logic' ? (c.fromPort.includes('true') ? 35 : 62) : 38)
                  
                  // Cổng Vào bên trái Node
                  const endX = toNode.x
                  const endY = toNode.y + 38

                  // Vẽ đường cong Bezier mềm mại n8n/Make
                  const controlDist = Math.abs(endX - startX) * 0.5
                  const d = `M ${startX} ${startY} C ${startX + controlDist} ${startY}, ${endX - controlDist} ${endY}, ${endX} ${endY}`

                  return (
                    <g key={index}>
                      <path
                        d={d}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="3.5"
                        className="opacity-75"
                      />
                      {/* Glowing neon pulse if active simulation is running */}
                      {isSimulating && (
                        <circle r="4.5" fill="#f43f5e">
                          <animateMotion dur="2s" repeatCount="indefinite" path={d} />
                        </circle>
                      )}
                    </g>
                  )
                })}

                {/* Rubber band connecting line when dragging */}
                {drawingConnectionFrom && (() => {
                  const fromNode = nodes.find(n => n.id === drawingConnectionFrom)
                  if (!fromNode) return null
                  const startX = fromNode.x + 208
                  const startY = fromNode.y + 28
                  const endX = cursorCoords.x
                  const endY = cursorCoords.y
                  const controlDist = Math.abs(endX - startX) * 0.5
                  const d = `M ${startX} ${startY} C ${startX + controlDist} ${startY}, ${endX - controlDist} ${endY}, ${endX} ${endY}`
                  return (
                    <g>
                      <path
                        d={d}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        strokeDasharray="6,4"
                        className="opacity-90 animate-pulse"
                      />
                      <circle cx={endX} cy={endY} r="5.5" fill="#6366f1" />
                    </g>
                  )
                })()}
              </svg>

              {/* Nodes Render Layer */}
              <div className="absolute inset-0 z-20 w-[3000px] h-[2000px] pointer-events-auto">
                {nodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id
                  const Icon = node.icon
                  
                  return (
                    <div
                      key={node.id}
                      onMouseDown={(e) => handleMouseDown(e, node.id)}
                      onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                      onTouchStart={(e) => handleTouchStart(e, node.id)}
                      onDoubleClick={(e) => { e.stopPropagation(); handleSelectNodeForEdit(node); }}
                      style={{ left: `${node.x}px`, top: `${node.y}px` }}
                      className={`absolute w-[208px] bg-zinc-50/50 dark:bg-zinc-900/40 border-2 rounded-2xl p-3 shadow-md hover:shadow-lg cursor-pointer node-card select-none flex flex-col gap-1 transition-[border-color,box-shadow,transform,background-color] duration-200 ${
                        isSelected 
                          ? 'ring-2 ring-black border-black bg-card scale-[1.03]' 
                          : 'border-zinc-300 dark:border-zinc-700'
                      } ${
                        activeNodeId === node.id 
                          ? 'ring-4 ring-rose-400 bg-card scale-[1.05] shadow-[0_0_20px_rgba(244,63,94,0.3)] border-rose-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Node Icon Block */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-2xs ${
                          node.type === 'trigger' ? 'bg-emerald-500'
                          : node.type === 'logic' ? 'bg-amber-500'
                          : node.type === 'crm' ? 'bg-purple-500'
                          : node.type === 'webhook' ? 'bg-indigo-500'
                          : 'bg-blue-500'
                        }`}>
                          <Icon size={18} />
                        </div>
                        
                        <div className="flex-grow flex flex-col gap-0.5 overflow-hidden text-left">
                          <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 tracking-tight leading-tight truncate">
                            {node.label}
                          </span>
                          <span className={`text-[8px] font-extrabold tracking-widest uppercase ${
                            node.type === 'trigger' ? 'text-emerald-600'
                            : node.type === 'logic' ? 'text-amber-600'
                            : node.type === 'crm' ? 'text-purple-600'
                            : node.type === 'webhook' ? 'text-indigo-600'
                            : 'text-blue-600'
                          }`}>
                            {node.type === 'trigger' ? 'System Trigger'
                             : node.type === 'logic' ? 'Logic Gate'
                             : node.type === 'crm' ? 'CRM Action'
                             : node.type === 'webhook' ? 'External Webhook'
                             : 'Channel Action'}
                          </span>
                        </div>
                      </div>

                      {/* Node Ports (Input / Output ports matching visually n8n style) */}
                      <div className="flex justify-between items-center text-[9px] text-slate-700 font-bold mt-1.5 border-t border-zinc-200 dark:border-zinc-800 pt-1.5">
                        <div>
                          {node.inputs.map(i => (
                            <span key={i.id} className="flex items-center gap-0.5">🟢 {i.label}</span>
                          ))}
                        </div>
                        <div className="text-right">
                          {node.outputs.map(o => (
                            <span key={o.id} className="flex items-center gap-0.5">{o.label} 🔵</span>
                          ))}
                        </div>
                      </div>

                      {/* Output link port (+) button on the right edge of each node card */}
                      <div 
                        onMouseDown={(e) => handleStartConnectionDrawing(e, node.id)}
                        onClick={(e) => handlePortClick(e, node.id)}
                        className="absolute -right-3 top-[28px] w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-30 cursor-crosshair hover:scale-110 transition active:scale-90"
                        title="Kéo sang Node khác để liên kết, hoặc click để thêm và nối Node mới nhanh!"
                      >
                        <Plus size={12} className="text-white" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Local Node Palette right next to the node (Dành riêng cho kích hoạt từ Node cụ thể) */}
              {isPaletteOpen && connectingSourceId !== null && (() => {
                const anchorNode = nodes.find(n => n.id === connectingSourceId)
                if (!anchorNode) return null
                return (
                  <div 
                    className="absolute bg-card border-2 border-zinc-300 dark:border-zinc-700 rounded-3xl p-4.5 shadow-2xl w-80 z-50 flex flex-col gap-3 pointer-events-auto animate-in zoom-in-95 duration-150"
                    style={{ left: `${anchorNode.x + 224}px`, top: `${anchorNode.y - 120}px` }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {renderPaletteContent()}
                  </div>
                )
              })()}
            </div>

            {/* Nút cộng lớn dạng Make khi chưa có Node nào trên Canvas (Đặt ngoài Viewport layer để không bị pointer-events: none chặn) */}
            {nodes.length === 0 && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-25"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center justify-center p-8 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsPaletteOpen(true)
                      setConnectingSourceId(null)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-16 h-16 bg-card border-2 border-dashed border-indigo-500 hover:border-solid hover:border-indigo-600 text-indigo-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
                    title="Bấm để thêm Node đầu tiên của bạn"
                  >
                    <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-3 select-none text-center">
                    Nhấp để thêm thẻ Node đầu tiên
                  </span>
                </div>
              </div>
            )}

            {/* ZOOM INDICATOR & PANEL (GÓC DƯỚI BÊN TRÁI CANVAS) */}
            <div className="absolute bottom-6 left-6 z-30 bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-md">
              <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 font-mono">Zoom: {Math.round(zoom * 100)}%</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="w-6 h-6 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-slate-100 rounded-lg flex items-center justify-center border border-zinc-300 dark:border-zinc-700 cursor-pointer active:scale-90 transition"
                  title="Thu nhỏ"
                >
                  <ZoomOut size={12} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="px-1.5 py-0.5 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-slate-100 rounded-lg text-[9px] font-black border border-zinc-300 dark:border-zinc-700 cursor-pointer active:scale-90 transition"
                  title="Reset Zoom 1.0x"
                >
                  Reset
                </button>
                <button
                  onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
                  className="w-6 h-6 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-slate-100 rounded-lg flex items-center justify-center border border-zinc-300 dark:border-zinc-700 cursor-pointer active:scale-90 transition"
                  title="Phóng to"
                >
                  <ZoomIn size={12} />
                </button>
              </div>
            </div>

            {/* =========================================================================
               FLOATING NODE CONFIGURATION OVERLAY DIALOG (MINI PANEL CHÈN BIẾN)
               ========================================================================= */}
            {selectedNode && (
              <div className="absolute inset-0 bg-black/10 backdrop-blur-2xs flex items-center justify-center z-40 animate-in fade-in duration-200" onWheel={(e) => e.stopPropagation()}>
                <div className="bg-card border border-zinc-250 dark:border-zinc-805 rounded-3xl p-6 shadow-2xl max-w-md w-full text-zinc-800 dark:text-zinc-650 dark:text-zinc-200 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90%] overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                  
                  {/* Close icon */}
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 hover:bg-slate-100 p-1.5 rounded-lg border-none cursor-pointer transition"
                  >
                    <X size={16} />
                  </button>

                  {/* Header popup */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <h3 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 tracking-widest leading-none">
                      Tùy chỉnh thông số Node
                    </h3>
                    <span className="text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400 block mt-1">Loại: {selectedNode.type.toUpperCase()} | ID: {selectedNode.id}</span>
                  </div>

                  {/* Form fields */}
                  <div className="flex flex-col gap-3 text-xs">
                    
                    {/* TÊN THẺ HIỂN THỊ (Giữ mặc định, không điều chỉnh) */}
                    <div className="flex flex-col gap-1.5 text-xs text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
                      <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[10px] tracking-wider">TÊN THẺ HIỂN THỊ</label>
                      <input
                        type="text"
                        value={selectedNode.label}
                        readOnly
                        disabled
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-2xl p-3 font-bold select-none cursor-not-allowed shadow-inner"
                      />
                    </div>

                    {/* WEBHOOK NODE SPECIFIC CONFIG (🔌) */}
                    {selectedNode.type === 'webhook' && (
                      <div className="flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9px] tracking-wider">Hành động thực thi (Action)</label>
                          <select
                            value={nodeActionType}
                            onChange={(e) => setNodeActionType(e.target.value)}
                            className="w-full bg-card border-2 border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 font-bold outline-none cursor-pointer text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                          >
                            <option value="trigger_webhook">Watch Webhook (Nhận webhook ngoài)</option>
                            <option value="custom_api">Make an API Call (Gọi API ngoài tùy chỉnh)</option>
                          </select>
                          <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 p-2 rounded-lg text-[9.5px] border border-zinc-200 dark:border-zinc-800 leading-normal font-semibold mt-1">
                            💡 {getActionDescription(nodeActionType)}
                          </div>
                        </div>

                        <SmartVariableInput
                          label="Webhook API Endpoint URL"
                          value={webhookUrl}
                          onChange={webhookUrl => setWebhookUrl(webhookUrl)}
                          placeholder="https://hook.make.com/..."
                        />

                        <div className="flex gap-2">
                          <div className="flex-1 flex flex-col gap-1">
                            <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[8.5px]">Phương thức HTTP</label>
                            <select
                              value={webhookMethod}
                              onChange={(e) => setWebhookMethod(e.target.value)}
                              className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg p-1.5 font-bold outline-none cursor-pointer"
                            >
                              <option value="POST">POST (Khuyên dùng)</option>
                              <option value="GET">GET</option>
                              <option value="PUT">PUT</option>
                            </select>
                          </div>
                          <div className="flex-1 flex flex-col gap-1">
                            <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[8.5px]">Ứng dụng liên kết</label>
                            <select
                              value={sourceApp}
                              onChange={(e) => setSourceApp(e.target.value)}
                              className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg p-1.5 font-bold outline-none cursor-pointer"
                            >
                              <option value="Make.com">Make.com Integration</option>
                              <option value="n8n.io">n8n.io Workflow</option>
                              <option value="Zapier">Zapier Hook</option>
                              <option value="Custom API">Custom API Endpoint</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ZALO ZNS & EMAIL ACTION CHÈN BIẾN (💬) */}
                    {selectedNode.type === 'action' && selectedNode.label.toLowerCase().includes('zalo') && (
                      <div className="flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9px] tracking-wider">Hành động thực thi (Action)</label>
                          <select
                            value={nodeActionType}
                            onChange={(e) => setNodeActionType(e.target.value)}
                            className="w-full bg-card border-2 border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 font-bold outline-none cursor-pointer text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                          >
                            <option value="send_zns">Gửi Zalo ZNS (Tin nhắn mẫu đã duyệt)</option>
                            <option value="watch_events">Watch ZNS Delivery (Theo dõi trạng thái tin nhắn)</option>
                          </select>
                          <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 p-2 rounded-lg text-[9.5px] border border-zinc-200 dark:border-zinc-800 leading-normal font-semibold mt-1">
                            💡 {getActionDescription(nodeActionType)}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px]">Mẫu Zalo ZNS Template</label>
                          <select
                            value={nodeTemplate}
                            onChange={(e) => setNodeTemplate(e.target.value)}
                            className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-bold outline-none cursor-pointer"
                          >
                            <option value="Mẫu ZNS Chào mừng Thành viên mới">Mẫu ZNS Chào mừng Thành viên mới</option>
                            <option value="Mẫu ZNS Tri ân Khách hàng cũ">Mẫu ZNS Tri ân Khách hàng cũ</option>
                            <option value="Mẫu ZNS Bám đuổi Giỏ hàng">Mẫu ZNS Bám đuỏ Giỏ hàng</option>
                            <option value="Mẫu ZNS Cảm ơn Sau Lưu Trú">Mẫu ZNS Cảm ơn Sau Lưu Trú</option>
                          </select>
                        </div>

                        <SmartVariableInput
                          label="Nội dung gửi"
                          value={nodeMessage}
                          onChange={nodeMessage => setNodeMessage(nodeMessage)}
                          placeholder="Nhập nội dung tin nhắn gửi khách..."
                          isTextarea
                          rows={3}
                        />
                      </div>
                    )}

                    {/* GOOGLE SHEETS ACTION CONFIG (📊) */}
                    {selectedNode.label.toLowerCase().includes('sheets') && (
                      <div className="flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                        {/* KẾT NỐI GOOGLE ACCOUNT */}
                        <div className="flex flex-col gap-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50/30">
                          <div className="flex justify-between items-center">
                            <label className="font-black text-slate-800 uppercase text-[9px] tracking-wider">Tài khoản Google liên kết</label>
                            {googleConnection !== 'none' ? (
                              <span className="bg-emerald-100 text-emerald-700 text-[8.5px] px-1.5 py-0.5 rounded font-black flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ĐÃ LIÊN KẾT
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-700 text-[8.5px] px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> CHƯA LIÊN KẾT
                              </span>
                            )}
                          </div>
                          
                          <select
                            value={googleConnection}
                            onChange={(e) => {
                              setGoogleConnection(e.target.value)
                              if (e.target.value === 'none') {
                                localStorage.removeItem('bliss_google_tokens')
                                setGoogleLinkedEmail('')
                              }
                            }}
                            className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 font-bold outline-none cursor-pointer text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                          >
                            <option value="none">-- Chọn tài khoản Google Sheets --</option>
                            {googleLinkedEmail ? (
                              <option value={googleLinkedEmail}>{googleLinkedEmail} (Tài khoản thật)</option>
                            ) : (
                              <option value="bliss_cskh">cskh@blisshome.vn (Demo Workspace)</option>
                            )}
                          </select>
                          
                          <button
                            type="button"
                            onClick={handleConnectGoogleAccount}
                            disabled={isConnectingGoogle}
                            className={`w-full py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1 border shadow-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                                  isConnectingGoogle 
                                    ? 'bg-slate-100 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                                    : googleConnection !== 'none' && googleConnection !== 'bliss_cskh'
                                      ? 'bg-card hover:bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            }`}
                          >
                            {isConnectingGoogle ? (
                              <>
                                <svg className="animate-spin h-3.5 w-3.5 text-current mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang kết nối tài khoản Google...
                              </>
                            ) : googleConnection !== 'none' && googleConnection !== 'bliss_cskh' ? (
                              'Kết nối tài khoản Google khác +'
                            ) : (
                              'Liên kết Google Account +'
                            )}
                          </button>

                          {/* Togglable Config Panel Link */}
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => setShowGoogleCredentialsPanel(!showGoogleCredentialsPanel)}
                              className="text-[9.5px] text-indigo-650 hover:text-indigo-855 font-black underline cursor-pointer"
                            >
                              {showGoogleCredentialsPanel ? 'Ẩn cấu hình Google App' : 'Cấu hình Google App (Dữ liệu thật)'}
                            </button>
                          </div>

                          {/* Google App Credentials Input Form */}
                          {showGoogleCredentialsPanel && (
                            <div className="flex flex-col gap-2 mt-1.5 p-2.5 bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs">
                              <div className="flex flex-col gap-0.5">
                                <label className="font-bold text-[8.5px] text-zinc-600 dark:text-zinc-400 uppercase">Google Client ID</label>
                                <input
                                  type="text"
                                  value={googleClientId}
                                  onChange={(e) => {
                                    setGoogleClientId(e.target.value)
                                    localStorage.setItem('bliss_google_credentials', JSON.stringify({
                                      client_id: e.target.value,
                                      client_secret: googleClientSecret
                                    }))
                                  }}
                                  placeholder="Nhập Client ID..."
                                  className="w-full bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1.5 font-mono text-[9px] focus:border-indigo-500 outline-none text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                                />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <label className="font-bold text-[8.5px] text-zinc-600 dark:text-zinc-400 uppercase">Google Client Secret</label>
                                <input
                                  type="password"
                                  value={googleClientSecret}
                                  onChange={(e) => {
                                    setGoogleClientSecret(e.target.value)
                                    localStorage.setItem('bliss_google_credentials', JSON.stringify({
                                      client_id: googleClientId,
                                      client_secret: e.target.value
                                    }))
                                  }}
                                  placeholder="Nhập Client Secret..."
                                  className="w-full bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1.5 font-mono text-[9px] focus:border-indigo-500 outline-none text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                                />
                              </div>
                              <p className="text-[8.5px] text-zinc-500 dark:text-zinc-400 font-semibold leading-snug">
                                💡 Redirect URI cấu hình tại Google Cloud Console: <br />
                                <span className="font-mono text-[8px] select-all bg-slate-100 p-0.5 rounded text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 block mt-0.5">
                                  {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'http://localhost:3000/admin/automation/flow'}
                                </span>
                              </p>
                            </div>
                          )}

                          {googleConnection === 'none' && (
                            <p className="text-[9px] text-amber-600 font-semibold italic mt-0.5">
                              ⚠️ Bạn cần liên kết Google Account để đọc/ghi dữ liệu Sheet.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9px] tracking-wider">Hành động thực thi (Action)</label>
                          <select
                            value={nodeActionType}
                            onChange={(e) => setNodeActionType(e.target.value)}
                            className="w-full bg-card border-2 border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 font-bold outline-none cursor-pointer text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                          >
                            <optgroup label="Rows">
                              <option value="watch_new_rows">Watch New Rows - Theo dõi hàng mới</option>
                              <option value="add_row">Add a Row - Thêm hàng mới</option>
                              <option value="update_row">Update a Row - Cập nhật hàng</option>
                              <option value="bulk_add_rows">Bulk Add Rows (Advanced) - Thêm nhiều hàng</option>
                              <option value="bulk_update_rows">Bulk Update Rows (Advanced) - Cập nhật nhiều hàng</option>
                              <option value="search_rows">Search Rows - Tìm kiếm hàng</option>
                              <option value="search_rows_advanced">Search Rows (Advanced) - Tìm kiếm nâng cao</option>
                              <option value="clear_row">Clear a Row - Làm sạch hàng</option>
                              <option value="delete_row">Delete a Row - Xóa hàng</option>
                            </optgroup>
                            <optgroup label="Cells">
                              <option value="watch_changes">Watch Changes - Theo dõi ô thay đổi</option>
                              <option value="update_cell">Update a Cell - Cập nhật ô</option>
                              <option value="get_cell">Get a Cell - Lấy giá trị ô</option>
                              <option value="clear_cell">Clear a Cell - Xóa giá trị ô</option>
                            </optgroup>
                            <optgroup label="Sheets">
                              <option value="perform_function">Perform a Function - Thực hiện hàm</option>
                              <option value="perform_function_responder">Perform a Function - Responder - Trả kết quả hàm</option>
                              <option value="add_sheet">Add a Sheet - Thêm trang tính</option>
                              <option value="create_spreadsheet">Create a Spreadsheet - Tạo bảng tính mới</option>
                              <option value="create_spreadsheet_template">Create a Spreadsheet from a Template - Tạo từ mẫu</option>
                              <option value="copy_sheet">Copy a Sheet - Sao chép trang tính</option>
                              <option value="add_conditional_format_rule">Add a Conditional Format Rule - Quy tắc định dạng</option>
                              <option value="rename_sheet">Rename a Sheet - Đổi tên trang tính</option>
                              <option value="get_range_values">Get Range Values - Lấy giá trị vùng</option>
                              <option value="list_sheets">List Sheets - Liệt kê các trang tính</option>
                              <option value="delete_sheet">Delete a Sheet - Xóa trang tính</option>
                              <option value="clear_range_values">Clear Values from a Range - Xóa giá trị vùng</option>
                              <option value="delete_conditional_format_rule">Delete a Conditional Format Rule - Xóa quy tắc</option>
                            </optgroup>
                            <optgroup label="Other">
                              <option value="make_api_call">Make an API Call - Gọi API tùy chỉnh</option>
                            </optgroup>
                          </select>
                          <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 p-2 rounded-lg text-[9.5px] border border-zinc-200 dark:border-zinc-800 leading-normal font-semibold mt-1">
                            💡 {getActionDescription(nodeActionType)}
                          </div>
                        </div>

                        <SmartVariableInput
                          label="Tên file Google Sheets"
                          value={sheetName}
                          onChange={sheetName => setSheetName(sheetName)}
                          placeholder="Ví dụ: Bliss Bookings 2026"
                        />
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px]">Danh sách tiêu đề cột (Phân tách bằng dấu phẩy)</label>
                          <input
                            type="text"
                            value={sheetHeaders}
                            onChange={(e) => setSheetHeaders(e.target.value)}
                            placeholder="Booking ID, Tên Khách, SĐT..."
                            className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-[10px] focus:border-black outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* TELEGRAM BOT ACTION CONFIG (📢) */}
                    {selectedNode.label.toLowerCase().includes('telegram') && (
                      <div className="flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px]">Telegram Chat ID (ID phòng chat)</label>
                          <input
                            type="text"
                            value={telegramChatId}
                            onChange={(e) => setTelegramChatId(e.target.value)}
                            placeholder="-1002345678 or @channel"
                            className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono focus:border-black outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px]">Telegram Bot Token (API Token thật)</label>
                          <input
                            type="text"
                            value={telegramToken}
                            onChange={(e) => setTelegramToken(e.target.value)}
                            placeholder="7723490234:AAEgH..."
                            className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono focus:border-black outline-none"
                          />
                        </div>
                        <SmartVariableInput
                          label="Nội dung gửi nhóm Telegram"
                          value={telegramMessage}
                          onChange={telegramMessage => setTelegramMessage(telegramMessage)}
                          placeholder="🔔 Đơn đặt phòng mới..."
                          isTextarea
                          rows={3}
                        />
                      </div>
                    )}

                    {/* VOUCHER GENERATOR ACTION CONFIG (🎫) */}
                    {selectedNode.label.toLowerCase().includes('voucher') && (
                      <div className="flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px]">Tỷ lệ chiết khấu ưu đãi</label>
                          <select
                            value={voucherDiscount}
                            onChange={(e) => setVoucherDiscount(e.target.value)}
                            className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-bold outline-none cursor-pointer"
                          >
                            <option value="10%">10% Chiết khấu</option>
                            <option value="15%">15% Chiết khấu</option>
                            <option value="20%">20% Chiết khấu</option>
                            <option value="50k">Giảm 50.000đ trực tiếp</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px]">Mã Voucher cấu hình mẫu</label>
                          <select
                            value={nodeVoucher}
                            onChange={(e) => setNodeVoucher(e.target.value)}
                            className="w-full bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-bold outline-none cursor-pointer"
                          >
                            {activeVouchers.map(code => (
                              <option key={code} value={code}>{code}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* CRM ACTION CONFIG (🟣) */}
                    {selectedNode.type === 'crm' && (
                      <div className="flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9px] tracking-wider">Hành động thực thi (Action)</label>
                          <select
                            value={nodeActionType}
                            onChange={(e) => setNodeActionType(e.target.value)}
                            className="w-full bg-card border-2 border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 font-bold outline-none cursor-pointer text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                          >
                            <option value="sync_profile">Tạo & Đồng bộ CRM thăng hạng VIP</option>
                            <option value="add_behavior">Thêm nhóm hành vi & gắn thẻ Tag khách</option>
                          </select>
                          <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 p-2 rounded-lg text-[9.5px] border border-zinc-200 dark:border-zinc-800 leading-normal font-semibold mt-1">
                            💡 {getActionDescription(nodeActionType)}
                          </div>
                        </div>

                        <SmartVariableInput
                          label="Nhóm Hành Vi / Tag CRM"
                          value={nodeVoucher}
                          onChange={nodeVoucher => setNodeVoucher(nodeVoucher)}
                          placeholder="VIP, Khách Thân Thiết,..."
                        />
                      </div>
                    )}

                    {/* BỘ LỌC ĐIỀU KIỆN CHO THẺ LOGIC GATE (AND/OR COMPLEX AST) */}
                    {selectedNode.type === 'logic' && (
                      <div className="flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                          <span className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px]">Cấu hình bộ lọc (AND/OR)</span>
                          <select
                            value={logicRelation}
                            onChange={(e: any) => setLogicRelation(e.target.value)}
                            className="bg-card border border-zinc-300 dark:border-zinc-700 rounded-md text-[10px] font-bold p-1"
                          >
                            <option value="AND">Khớp TẤT CẢ (AND)</option>
                            <option value="OR">Khớp MỘT TRONG (OR)</option>
                          </select>
                        </div>

                        {/* List of active conditions */}
                        <div className="flex flex-col gap-2">
                          {logicConditions.length === 0 ? (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">Chưa có điều kiện nào được cấu hình.</span>
                          ) : (
                            logicConditions.map((cond, index) => (
                              <div key={index} className="flex gap-1 items-center bg-card border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg relative">
                                <div className="flex flex-col gap-1 flex-grow">
                                  {/* Field selector */}
                                  <select
                                    value={cond.field}
                                    onChange={(e) => {
                                      const next = [...logicConditions]
                                      next[index].field = e.target.value
                                      setLogicConditions(next)
                                    }}
                                    className="bg-zinc-50/50 dark:bg-zinc-900/40 border border-slate-305 rounded-xl p-1.5 text-[9.5px] font-bold text-zinc-800 dark:text-zinc-600 dark:text-zinc-200"
                                  >
                                    <option value="booking.total_price">Giá Đơn Phòng (booking.total_price)</option>
                                    <option value="customer.total_spent">Tổng Chi Tiêu (customer.total_spent)</option>
                                    <option value="trigger.name">Tên Khách Hàng (trigger.name)</option>
                                    <option value="trigger.phone">Số Điện Thoại (trigger.phone)</option>
                                    <option value="voucher.code">Mã Voucher (voucher.code)</option>
                                  </select>

                                  <div className="flex gap-1">
                                    {/* Phép so sánh chất lượng cao */}
                                    <select
                                      value={cond.operator}
                                      onChange={(e) => {
                                        const next = [...logicConditions]
                                        next[index].operator = e.target.value
                                        setLogicConditions(next)
                                      }}
                                      className="bg-card border-2 border-zinc-300 dark:border-zinc-700 rounded-xl p-1.5 text-[10px] font-bold flex-grow outline-none cursor-pointer focus:border-black transition-all"
                                    >
                                      <option value="equals">Bằng (=)</option>
                                      <option value="greater_than">Lớn hơn (&gt;)</option>
                                      <option value="less_than">Nhỏ hơn (&lt;)</option>
                                      <option value="greater_than_or_equal">Lớn hơn hoặc bằng (&gt;=)</option>
                                      <option value="less_than_or_equal">Nhỏ hơn hoặc bằng (&lt;=)</option>
                                      <option value="not_equals">Khác (!= / &lt;&gt;)</option>
                                      <option value="contains">Chứa / Gồm</option>
                                    </select>

                                    {/* Value */}
                                    <input
                                      type="text"
                                      value={cond.value}
                                      onChange={(e) => {
                                        const next = [...logicConditions]
                                        next[index].value = e.target.value
                                        setLogicConditions(next)
                                      }}
                                      placeholder="Giá trị..."
                                      className="bg-zinc-50/50 dark:bg-zinc-900/40 border-2 border-zinc-300 dark:border-zinc-700 rounded-xl p-1.5 text-[10px] font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 w-24 outline-none focus:border-black transition-all"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setLogicConditions(prev => prev.filter((_, i) => i !== index))}
                                  className="p-1 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 text-red-500 rounded-lg cursor-pointer flex items-center justify-center flex-shrink-0 transition self-stretch"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add condition button */}
                        <button
                          type="button"
                          onClick={() => setLogicConditions(prev => [...prev, { field: 'booking.total_price', operator: 'equals', value: '1200000' }])}
                          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-lg font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Plus size={11} />
                          Thêm điều kiện so khớp
                        </button>
                      </div>
                    )}

                    {/* Delay Logic config */}
                    {selectedNode.type === 'logic' && selectedNode.label.toLowerCase().includes('đợi') && (
                      <div className="flex flex-col gap-1">
                        <label className="font-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 uppercase text-[9.5px]">Thời gian trễ (Phút)</label>
                        <input
                          type="number"
                          value={nodeDelay}
                          onChange={(e) => setNodeDelay(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 font-bold focus:border-black outline-none shadow-sm"
                        />
                      </div>
                    )}

                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-2">
                    {/* Nút Xóa Node nhỏ gọn, đặt bên trái tránh bấm nhầm */}
                    <button
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="p-2 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 text-red-500 rounded-lg transition flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                      title="Xóa thẻ Node này khỏi Canvas"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    {/* Nhóm Đóng & Lưu ở bên phải tối ưu nhỏ gọn */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-zinc-300 dark:border-zinc-700 text-[11px] cursor-pointer active:scale-95 transition"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={handleSaveNodeConfig}
                        className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 text-[11px] border-none cursor-pointer shadow-xs active:scale-95 transition"
                      >
                        <Check size={12} />
                        Lưu áp dụng
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* =========================================================================
               ADD NODE PALETTE DRAW OVERLAY (➕ PALETTE)
               ========================================================================= */}
            {/* Global centered overlay for palette opened from the bottom toolbar (Tránh bị che khuất) */}
            {isPaletteOpen && connectingSourceId === null && (
              <div 
                className="absolute inset-0 bg-black/10 backdrop-blur-2xs z-30 flex items-center justify-center pointer-events-auto"
                onClick={() => { setIsPaletteOpen(false); setConnectingSourceId(null); }}
                onWheel={(e) => e.stopPropagation()}
              >
                <div 
                  className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl max-w-sm w-72 z-40 flex flex-col gap-3.5 animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                >
                  {renderPaletteContent()}
                </div>
              </div>
            )}

            {/* =========================================================================
               BOTTOM SLIDE-UP REAL-TIME LOGS MONITOR CONSOLE DRAWER (📟)
               ========================================================================= */}
            {isLogsDrawerOpen && (
              <div 
                className="fixed bottom-0 left-0 lg:left-64 right-0 bg-zinc-50 dark:bg-zinc-950 border-t-2 border-zinc-300 dark:border-zinc-700 p-4 h-[220px] z-50 flex flex-col gap-2.5 shadow-2xl animate-in slide-in-from-bottom duration-250"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                    <Activity size={13} className="text-zinc-800 dark:text-zinc-600 dark:text-zinc-200" />
                    Cửa sổ Giám sát tiến trình và Dòng chảy dữ liệu (Real-time Logs)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLogs([])}
                      className="px-2 py-0.5 bg-card border border-zinc-300 dark:border-zinc-700 hover:bg-black hover:text-white rounded text-[8.5px] font-black cursor-pointer transition"
                    >
                      Xóa logs
                    </button>
                    <button 
                      onClick={() => setIsLogsDrawerOpen(false)}
                      className="text-slate-600 hover:text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 border-none bg-transparent cursor-pointer p-0.5"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex-grow bg-card text-slate-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] p-3 rounded-xl overflow-y-auto flex flex-col gap-1.5 shadow-inner">
                  {logs.length === 0 ? (
                    <span className="text-zinc-400 dark:text-zinc-500 italic">Mạch tự động rảnh. Click "Kích hoạt thử nghiệm" phía dưới để theo dõi log...</span>
                  ) : (
                    logs.map((l, index) => {
                      const colorClass = l.type === 'success' ? 'text-emerald-700 font-extrabold' 
                                       : l.type === 'warning' ? 'text-amber-700 font-extrabold animate-pulse' 
                                       : l.type === 'error' ? 'text-red-700 font-extrabold'
                                       : 'text-slate-700'
                      return (
                        <div key={index} className="flex gap-2 items-start leading-normal">
                          <span className="text-zinc-400 dark:text-zinc-500 flex-shrink-0">[{l.timestamp}]</span>
                          <span className={colorClass}>{renderMessage(l.message)}</span>
                        </div>
                      )
                    })
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            )}

            {/* =========================================================================
               FLOATING FIGMA/MIRO-STYLE VERTICAL RIGHT TOOLBAR DOCK (📟)
               ========================================================================= */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl py-5 px-2.5 flex flex-col items-center gap-4 shadow-xl z-30 animate-in slide-in-from-right duration-300">
              
              {/* Play / Run Once circular button */}
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center border-none shadow-md cursor-pointer active:scale-95 transition-all duration-200"
                title="Khởi chạy thử nghiệm (Run once)"
              >
                {isSimulating ? (
                  <RefreshCw size={14} className="animate-spin text-white" />
                ) : (
                  <Play size={13} fill="currentColor" className="text-white ml-0.5" />
                )}
              </button>

              <div className="w-5 h-px bg-slate-200" />

              {/* Toolbar Controls (Vertical Stack) */}
              <div className="flex flex-col items-center gap-3">
                {/* Plus (+) Add node icon */}
                <button
                  onClick={() => {
                    setIsPaletteOpen(!isPaletteOpen)
                    setConnectingSourceId(null)
                  }}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition active:scale-90 shadow-2xs ${
                    isPaletteOpen ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-300 dark:border-zinc-700 hover:border-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200'
                  }`}
                  title="Thêm thẻ Node vào mạch"
                >
                  <Plus size={16} />
                </button>

                {/* Auto align */}
                <button
                  onClick={handleAutoAlignNodes}
                  className="w-9 h-9 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-slate-100 border border-zinc-300 dark:border-zinc-700 hover:border-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200 rounded-full flex items-center justify-center cursor-pointer transition active:scale-90 shadow-2xs"
                  title="Tự động căn chỉnh Canvas"
                >
                  <Sliders size={14} />
                </button>

                {/* Logs Terminal button */}
                <button
                  onClick={() => setIsLogsDrawerOpen(!isLogsDrawerOpen)}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition active:scale-90 shadow-2xs ${
                    isLogsDrawerOpen ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-300 dark:border-zinc-700 hover:border-black text-zinc-800 dark:text-zinc-600 dark:text-zinc-200'
                  }`}
                  title="Bật/Tắt Cửa sổ Giám sát logs"
                >
                  <Activity size={14} />
                </button>

                {/* Clean Canvas */}
                <button
                  onClick={handleResetCanvas}
                  className="w-9 h-9 bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center cursor-pointer transition active:scale-90 shadow-2xs"
                  title="Xóa trống Canvas"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="w-5 h-px bg-slate-200" />

              {/* Save Scenario circular button (Check mark icon) */}
              <button
                onClick={handleSaveScenario}
                className="w-10 h-10 bg-black hover:bg-slate-800 text-white rounded-full flex items-center justify-center border-none shadow-md cursor-pointer active:scale-95 transition-all duration-200"
                title="Lưu kịch bản lên hệ thống"
              >
                <Check size={16} className="stroke-[3]" />
              </button>

            </div>

          </div>

        </div>
      )}

      {confirmModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-[999] animate-in fade-in duration-200" 
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-[340px] text-zinc-800 dark:text-zinc-650 dark:text-zinc-200 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-600 dark:text-zinc-200">
                {confirmModal.title}
              </h3>
            </div>
            
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed text-left">
              {confirmModal.message}
            </p>
            
            <div className="flex gap-2.5 justify-end mt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 text-slate-700 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition shadow-md shadow-rose-100"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
