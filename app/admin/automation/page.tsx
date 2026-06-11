'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Connection,
  Edge,
  Node,
  Panel,
  NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import {
  Play,
  Trash2,
  Plus,
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  Smartphone,
  UserPlus,
  GitBranch,
  Link,
  Table,
  Send,
  FileText,
  Check,
  X,
  ChevronRight,
  Settings,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

import SmartVariableInput from '@/components/admin/automation/SmartVariableInput'

// =========================================================================
// AUTOMATION MODULES OUTPUT SCHEMA DEFINITIONS
// =========================================================================
interface OutputVariable {
  key: string
  name: string
  description?: string
}

const NODE_OUTPUTS_SCHEMA: Record<string, OutputVariable[]> = {
  trigger_internal_booking: [
    { key: 'booking_id', name: 'Mã Booking', description: 'ID duy nhất của đơn booking' },
    { key: 'customer_name', name: 'Tên Khách', description: 'Họ và tên của khách hàng đặt phòng' },
    { key: 'customer_phone', name: 'Số Điện Thoại', description: 'Số điện thoại của khách hàng' },
    { key: 'customer_email', name: 'Email Khách', description: 'Địa chỉ email của khách hàng' },
    { key: 'room_name', name: 'Tên Phòng', description: 'Tên phòng khách đặt' },
    { key: 'room_price', name: 'Giá Phòng / Đêm', description: 'Đơn giá phòng mỗi đêm' },
    { key: 'checkin_date', name: 'Ngày Nhận Phòng', description: 'Ngày check-in thực tế hoặc dự kiến' },
    { key: 'checkout_date', name: 'Ngày Trả Phòng', description: 'Ngày check-out dự kiến' },
    { key: 'total_amount', name: 'Tổng Tiền', description: 'Tổng số tiền cần thanh toán' },
    { key: 'special_notes', name: 'Ghi Chú', description: 'Yêu cầu đặc biệt từ khách hàng' },
    { key: 'created_at', name: 'Thời Gian Tạo', description: 'Thời điểm đơn booking được tạo' },
  ],
  trigger_internal_crm: [
    { key: 'customer_id', name: 'Mã Khách Hàng', description: 'ID khách hàng trong hệ thống CRM' },
    { key: 'customer_name', name: 'Tên Khách', description: 'Họ và tên khách hàng' },
    { key: 'customer_phone', name: 'Số Điện Thoại', description: 'Số điện thoại liên hệ' },
    { key: 'old_group', name: 'Phân Hạng Cũ', description: 'Hạng thành viên cũ của khách hàng' },
    { key: 'new_group', name: 'Phân Hạng Mới', description: 'Hạng thành viên mới được AI cập nhật' },
    { key: 'total_spent', name: 'Tổng Chi Tiêu', description: 'Tổng số tiền khách hàng đã thanh toán' },
    { key: 'updated_at', name: 'Thời Gian Cập Nhật', description: 'Thời gian AI phân hạng chạy thành công' },
  ],
  trigger_external_webhook: [
    { key: 'body', name: 'Dữ Liệu Payload (Body)', description: 'Toàn bộ nội dung dữ liệu JSON gửi lên' },
    { key: 'headers', name: 'HTTP Headers', description: 'Thông tin HTTP headers của request' },
    { key: 'query_params', name: 'Tham Số Query', description: 'Các tham số trên đường dẫn URL (?key=val)' },
  ],
  action_internal_room: [
    { key: 'room_id', name: 'Mã Số Phòng', description: 'ID phòng được cập nhật' },
    { key: 'old_status', name: 'Trạng Thái Cũ', description: 'Trạng thái của phòng trước khi cập nhật' },
    { key: 'new_status', name: 'Trạng Thái Mới', description: 'Trạng thái phòng sau khi cập nhật thành công' },
    { key: 'updated_at', name: 'Thời Gian Cập Nhật', description: 'Thời gian hoàn tất thay đổi' },
  ],
  action_external_zalo_zns: [
    { key: 'message_id', name: 'Mã Tin Nhắn ZNS', description: 'Mã định danh tin nhắn từ Zalo' },
    { key: 'status', name: 'Trạng Thái Gửi', description: 'Kết quả gửi tin: success hoặc failed' },
    { key: 'sent_time', name: 'Thời Gian Gửi', description: 'Thời điểm hệ thống gửi tin' },
    { key: 'error_message', name: 'Chi Tiết Lỗi', description: 'Nguyên nhân gửi tin thất bại (nếu có)' },
  ],
  action_external_sheets: [
    { key: 'sheet_id', name: 'Spreadsheet ID', description: 'ID của tệp Google Sheet đã ghi' },
    { key: 'range', name: 'Vùng Ghi (Range)', description: 'Tên trang tính và dải ô đã tác động' },
    { key: 'rows_added', name: 'Số Dòng Đã Thêm', description: 'Số lượng dòng mới được chèn' },
    { key: 'updated_range', name: 'Vùng Được Cập Nhật', description: 'Dải ô chính xác nhận dữ liệu mới' },
  ]
}

// Helper to render dynamic schema output badges on canvas nodes
function renderOutputPills(nodeType: string, config: any, isTrigger: boolean) {
  const schema = NODE_OUTPUTS_SCHEMA[nodeType]
  if (!schema) return null

  const selectedKeys: string[] = config?.output_variables || schema.map(v => v.key)
  const activeVars = schema.filter(v => selectedKeys.includes(v.key))

  if (activeVars.length === 0) {
    return (
      <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold italic mt-0.5 block">
        (Không có dữ liệu đầu ra)
      </span>
    )
  }

  const badgeBg = isTrigger ? 'bg-emerald-50' : 'bg-indigo-50'
  const badgeText = isTrigger ? 'text-emerald-700 border-emerald-100' : 'text-indigo-700 border-indigo-100'

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {activeVars.map(v => (
        <code 
          key={v.key} 
          className={`text-[7.5px] font-mono border px-1 rounded-sm truncate max-w-[120px] ${badgeBg} ${badgeText}`}
          title={v.description || v.name}
        >
          {v.key}
        </code>
      ))}
    </div>
  )
}

// =========================================================================
// CUSTOM TRIGGER NODE COMPONENT
// =========================================================================
function TriggerNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as any
  const iconMap: Record<string, any> = {
    trigger_internal_booking: Database,
    trigger_internal_crm: Sparkles,
    trigger_external_webhook: Link,
  }

  const IconComponent = iconMap[data.nodeType as string] || Database

  return (
    <div className={`px-4 py-3 bg-card border-2 rounded-2xl shadow-md w-60 transition-all duration-200 ${
      selected ? 'border-emerald-600 ring-2 ring-emerald-100 scale-102' : 'border-emerald-400 hover:border-emerald-500'
    }`}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <IconComponent size={16} />
        </div>
        <div className="text-left leading-tight min-w-0 flex-grow">
          <h4 className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider truncate">
            {data.label as string}
          </h4>
          <span className="text-[9px] text-zinc-500 dark:text-zinc-450 font-bold block mt-0.5 truncate">
            {data.description as string}
          </span>
        </div>
      </div>
      
      {/* Node output summary snippet */}
      <div className="mt-2 pt-2 border-t border-slate-100 text-left">
        <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 block">Dữ liệu đầu ra:</span>
        {renderOutputPills(data.nodeType, data.config, true)}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-emerald-500 !border-2 !border-white hover:scale-125 transition"
      />
    </div>
  )
}

// =========================================================================
// CUSTOM ACTION NODE COMPONENT
// =========================================================================
function ActionNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as any
  const iconMap: Record<string, any> = {
    action_internal_room: Table,
    action_external_zalo_zns: Send,
    action_external_sheets: FileText,
  }

  const IconComponent = iconMap[data.nodeType as string] || Send

  return (
    <div className={`px-4 py-3 bg-card border-2 rounded-2xl shadow-md w-60 transition-all duration-200 ${
      selected ? 'border-indigo-600 ring-2 ring-indigo-100 scale-102' : 'border-indigo-400 hover:border-indigo-500'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-indigo-500 !border-2 !border-white hover:scale-125 transition"
      />

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <IconComponent size={16} />
        </div>
        <div className="text-left leading-tight min-w-0 flex-grow">
          <h4 className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider truncate">
            {data.label as string}
          </h4>
          <span className="text-[9px] text-zinc-500 dark:text-zinc-450 font-bold block mt-0.5 truncate">
            {data.description as string}
          </span>
        </div>
      </div>

      {/* Action variables summary snippet */}
      <div className="mt-2 pt-2 border-t border-slate-100 text-left">
        <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 block">Cấu hình:</span>
        <div className="text-[8.5px] font-semibold text-slate-600 mt-1 truncate">
          {data.nodeType === 'action_internal_room' && `Phòng: ${data.config?.room_id || 'Chưa chọn'} ➔ ${data.config?.new_status || 'Chưa chọn'}`}
          {data.nodeType === 'action_external_zalo_zns' && `Mẫu: ${data.config?.template_id || 'Chưa chọn'}`}
          {data.nodeType === 'action_external_sheets' && `Bảng tính: ${data.config?.sheet_id || 'Chưa chọn'}`}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 text-left">
        <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 block">Dữ liệu đầu ra:</span>
        {renderOutputPills(data.nodeType, data.config, false)}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-indigo-500 !border-2 !border-white hover:scale-125 transition"
      />
    </div>
  )
}

// =========================================================================
// AUTOMATION FLOW ENGINE PAGE (REACT FLOW INTEGRATION)
// =========================================================================
const initialNodes: Node[] = [
  {
    id: 'node-trigger-booking',
    type: 'trigger',
    position: { x: 80, y: 150 },
    data: {
      nodeType: 'trigger_internal_booking',
      label: 'Đơn Đặt Phòng Mới 🟢',
      description: 'Kích hoạt khi khách đặt đơn phòng mới',
      config: {}
    }
  },
  {
    id: 'node-action-zalo',
    type: 'action',
    position: { x: 420, y: 150 },
    data: {
      nodeType: 'action_external_zalo_zns',
      label: 'Gửi Tin Zalo ZNS 🔵',
      description: 'Gửi ZNS CSKH tự động',
      config: {
        template_id: 'zns_welcome_cskh',
        phone_number: '{{$node-trigger-booking.customer_phone}}',
        dynamic_params: 'Chào mừng quý khách đặt đơn {{$node-trigger-booking.booking_id}}!'
      }
    }
  }
]

const initialEdges: Edge[] = [
  {
    id: 'edge-1',
    source: 'node-trigger-booking',
    target: 'node-action-zalo',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 }
  }
]

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode
}

export default function AutomationPage() {
  const [mounted, setMounted] = useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  const [workflowName, setWorkflowName] = useState('Kịch bản Gửi Zalo chào mừng tự động')
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'active' | 'paused'>('draft')
  const [workflowId, setWorkflowId] = useState<string>('mock-wf-uuid')
  
  const [isDeploying, setIsDeploying] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  
  // Custom toast notification system
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    show: false,
    message: '',
    type: 'success'
  })

  const triggerToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 4000)
  }

  // Right configuration panel selected node helper
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null
  }, [nodes, selectedNodeId])

  // React Flow connection helper
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds))
    },
    [setEdges]
  )

  // Upstream nodes variable resolver for current editing node
  const upstreamVariables = useMemo(() => {
    if (!selectedNodeId) return []

    // Recursive traversal to find all ancestor nodes
    const ancestors: string[] = []
    const queue = [selectedNodeId]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)

      // Find edges targeting the current node
      const incomingEdges = edges.filter(e => e.target === current)
      for (const edge of incomingEdges) {
        if (!visited.has(edge.source)) {
          ancestors.push(edge.source)
          queue.push(edge.source)
        }
      }
    }

    // Convert ancestor nodes into styled input options
    const vars: any[] = []
    const ancestorNodes = nodes.filter(n => ancestors.includes(n.id))

    for (const node of ancestorNodes) {
      const schema = NODE_OUTPUTS_SCHEMA[node.data.nodeType as string]
      if (!schema) continue

      const selectedKeys: string[] = (node.data.config as any)?.output_variables || schema.map(v => v.key)
      const activeVars = schema.filter(v => selectedKeys.includes(v.key))

      for (const v of activeVars) {
        vars.push({
          nodeId: node.id,
          nodeLabel: node.data.label,
          name: v.name,
          key: v.key
        })
      }
    }

    return vars
  }, [selectedNodeId, edges, nodes])

  // Custom node properties updating handler
  const updateNodeConfig = (key: string, value: any) => {
    if (!selectedNodeId) return

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...(node.data.config as Record<string, any>),
                [key]: value
              }
            }
          }
        }
        return node
      })
    )
  }

  // RESTRICTION LOGIC: "Một luồng chỉ được phép có MỘT Trigger Node (nằm ở đầu)"
  const handleAddNewNode = (nodeType: string, label: string, category: 'trigger' | 'action') => {
    if (category === 'trigger') {
      const existingTrigger = nodes.find(n => n.type === 'trigger')
      if (existingTrigger) {
        triggerToast('Lỗi nghiêm trọng: Mỗi kịch bản chỉ cho phép sở hữu MỘT Node Sự kiện Trigger đầu vào duy nhất.', 'warning')
        return
      }
    }

    const newNodeId = `node-${nodeType}-${Math.floor(1000 + Math.random() * 9000)}`
    const newNode: Node = {
      id: newNodeId,
      type: category,
      position: { x: 200 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: {
        nodeType,
        label,
        description: category === 'trigger' ? 'Sự kiện hệ thống kích hoạt' : 'Hành động tự động thực thi',
        config: {}
      }
    }

    setNodes((nds) => [...nds, newNode])
    setSelectedNodeId(newNodeId)
    triggerToast(`Đã thêm thẻ ${label} vào bản vẽ Canvas!`, 'success')
  }

  // Delete node and its cables logic handler
  const handleDeleteNode = (id: string) => {
    setNodes((nds) => nds.filter(n => n.id !== id))
    setEdges((eds) => eds.filter(e => e.source !== id && e.target !== id))
    if (selectedNodeId === id) setSelectedNodeId(null)
    triggerToast('Đã gỡ bỏ thẻ Node và các dây cáp liên kết liên quan khỏi Canvas.', 'success')
  }

  // BACKEND API DEPLOY WORKFLOW INTEGRATION
  const handleDeployWorkflow = async () => {
    setIsDeploying(true)
    try {
      const response = await fetch('/api/automation/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workflowId,
          name: workflowName,
          status: workflowStatus,
          nodes,
          edges,
          n8n_webhook_url: 'https://n8n.blisshome.vn/webhook/booking-automations'
        })
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Lỗi gửi yêu cầu lưu kịch bản.')
      }

      triggerToast('Triển khai và kích hoạt luồng tự động hóa lên Engine thành công!', 'success')
      if (resData.data?.id) {
        setWorkflowId(resData.data.id)
      }
    } catch (err: any) {
      console.error(err)
      triggerToast(`Triển khai thất bại: ${err.message}`, 'error')
    } finally {
      setIsDeploying(false)
    }
  }

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full select-none font-sans text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl min-h-screen relative flex flex-col gap-6">
      
      {/* Toast popup indicator */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border-2 transition-all duration-300 animate-in slide-in-from-top-6 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
          : toast.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' 
          : 'bg-amber-50 border-amber-400 text-amber-800'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={18} className="text-red-600 flex-shrink-0" />}
          {toast.type === 'warning' && <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />}
          <span className="text-xs font-black leading-relaxed">{toast.message}</span>
        </div>
      )}

      {/* =========================================================================
         HEADER CONTROLLER (Premium Light Theme)
         ========================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-xs gap-4">
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full">
              Engine Level 2
            </span>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full">
              n8n Hybrid
            </span>
          </div>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight outline-none border-b-2 border-transparent focus:border-indigo-500 w-full mt-1 bg-transparent"
            title="Đổi tên kịch bản"
          />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <select
            value={workflowStatus}
            onChange={(e) => setWorkflowStatus(e.target.value as any)}
            className="bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 text-xs font-black rounded-2xl px-3 py-2 text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500 cursor-pointer shadow-inner"
          >
            <option value="draft">Bản nháp (Draft)</option>
            <option value="active">Kích hoạt (Active)</option>
            <option value="paused">Tạm dừng (Paused)</option>
          </select>

          <button
            onClick={handleDeployWorkflow}
            disabled={isDeploying}
            className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-full font-black text-[11px] uppercase tracking-wider flex items-center gap-2 border-none shadow-md cursor-pointer active:scale-95 transition disabled:opacity-50"
          >
            {isDeploying ? (
              <>
                <RefreshCw size={12} className="animate-spin text-white" />
                Đang triển khai...
              </>
            ) : (
              <>
                <Play size={12} className="text-white" />
                Save & Active
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
         MAIN CANVAS & PANELS LAYOUT
         ========================================================================= */}
      <div className="flex-grow flex flex-col lg:flex-row gap-6 h-[640px]">
        
        {/* React Flow drawing zone */}
        <div className="flex-grow bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden relative shadow-sm h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
          >
            <Controls className="!bg-card !border-zinc-200 dark:border-zinc-800 !shadow-xs" />
            <MiniMap 
              nodeColor={(node) => {
                if (node.type === 'trigger') return '#10b981'
                return '#6366f1'
              }}
              className="!bg-zinc-50 dark:bg-zinc-950 !border !border-zinc-300 dark:border-zinc-700 !rounded-2xl"
            />
            <Background color="#cbd5e1" gap={16} size={1.2} />

            {/* Quick adding triggers/actions float menu */}
            <Panel position="top-left" className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 shadow-md flex flex-col gap-1.5 max-w-[200px]">
              <span className="text-[9px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500 block mb-1">
                + Thêm Module
              </span>
              
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-emerald-600 uppercase block">Triggers:</span>
                <button
                  onClick={() => handleAddNewNode('trigger_internal_booking', 'Đơn Đặt Phòng Mới 🟢', 'trigger')}
                  className="text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border-none cursor-pointer transition active:scale-95"
                >
                  Đặt Phòng Mới
                </button>
                <button
                  onClick={() => handleAddNewNode('trigger_internal_crm', 'Phân Hạng AI CRM 🤖', 'trigger')}
                  className="text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border-none cursor-pointer transition active:scale-95"
                >
                  CRM Phân Hạng
                </button>
                <button
                  onClick={() => handleAddNewNode('trigger_external_webhook', 'Webhook Đầu Vào 🔌', 'trigger')}
                  className="text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border-none cursor-pointer transition active:scale-95"
                >
                  Webhook API
                </button>
              </div>

              <div className="h-px bg-slate-100 my-1" />

              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-indigo-600 uppercase block">Actions:</span>
                <button
                  onClick={() => handleAddNewNode('action_internal_room', 'Cập Nhật Phòng 🏢', 'action')}
                  className="text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border-none cursor-pointer transition active:scale-95"
                >
                  Đổi Trạng Thái Phòng
                </button>
                <button
                  onClick={() => handleAddNewNode('action_external_zalo_zns', 'Gửi Tin Zalo ZNS 🔵', 'action')}
                  className="text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border-none cursor-pointer transition active:scale-95"
                >
                  Bắn Zalo ZNS
                </button>
                <button
                  onClick={() => handleAddNewNode('action_external_sheets', 'Ghi Google Sheets 📊', 'action')}
                  className="text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border-none cursor-pointer transition active:scale-95"
                >
                  Đồng Bộ Bảng Tính
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right configuration side drawer */}
        <div className="w-full lg:w-80 bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4 h-full overflow-y-auto">
          {selectedNode ? (
            <div className="flex flex-col gap-4 text-left">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className={`text-[8.5px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border ${
                    selectedNode.type === 'trigger' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  }`}>
                    {selectedNode.type}
                  </span>
                  <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase mt-2 tracking-wide leading-tight">
                    {selectedNode.data.label as string}
                  </h3>
                </div>
                <button
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-600 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-red-50 rounded-xl transition border-none cursor-pointer"
                  title="Xóa node này"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* INPUT FIELDS CONFIGURATION */}
              <div className="flex flex-col gap-4">
                <span className="text-[9px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500 block">
                  Thuộc tính node
                </span>

                {/* 1. Trigger Booking node type */}
                {selectedNode.data.nodeType === 'trigger_internal_booking' && (
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-700">Loại sự kiện (eventType)</span>
                    <code className="text-[9.5px] font-mono font-bold text-emerald-800 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100">
                      booking_created
                    </code>
                    <span className="text-[8.5px] text-zinc-500 dark:text-zinc-450 block mt-1">Kích hoạt mỗi khi có lượt thanh toán cọc đơn đặt phòng mới trên ứng dụng Bliss.</span>
                  </div>
                )}

                {/* 2. Trigger CRM node type */}
                {selectedNode.data.nodeType === 'trigger_internal_crm' && (
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-700">Loại sự kiện (eventType)</span>
                    <code className="text-[9.5px] font-mono font-bold text-emerald-800 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100">
                      crm_tier_changed
                    </code>
                    <span className="text-[8.5px] text-zinc-500 dark:text-zinc-450 block mt-1">Kích hoạt tự động khi phân loại AI CRM cập nhật nhóm VIP của khách.</span>
                  </div>
                )}

                {/* 3. Trigger Webhook node type */}
                {selectedNode.data.nodeType === 'trigger_external_webhook' && (
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-700">Đường dẫn Webhook URL nhận dữ liệu</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        readOnly
                        value={`https://n8n.blisshome.vn/webhook/${selectedNode.id}`}
                        className="w-full bg-card border border-zinc-300 dark:border-zinc-700 py-1 px-2 text-[9px] font-mono rounded-lg outline-none"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://n8n.blisshome.vn/webhook/${selectedNode.id}`)
                          triggerToast('Đã copy đường dẫn Webhook!', 'success')
                        }}
                        className="bg-black hover:bg-slate-800 text-white border-none py-1 px-2.5 text-[8.5px] font-black rounded-lg cursor-pointer transition active:scale-95"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Action Room Update */}
                {selectedNode.data.nodeType === 'action_internal_room' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Mã số phòng (Room ID)</span>
                      <SmartVariableInput
                        value={(selectedNode.data.config as any)?.room_id || ''}
                        onChange={(val) => updateNodeConfig('room_id', val)}
                        placeholder="Nhập mã số phòng hoặc chèn biến..."
                        upstreamVariables={upstreamVariables}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Trạng thái mới</span>
                      <select
                        value={(selectedNode.data.config as any)?.new_status || 'dirty'}
                        onChange={(e) => updateNodeConfig('new_status', e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 text-xs font-bold rounded-xl px-2.5 py-2 outline-none focus:border-indigo-650 text-zinc-800 dark:text-zinc-200 shadow-inner"
                      >
                        <option value="clean">Sạch sẽ (Available)</option>
                        <option value="dirty">Đang dọn dẹp (Cleaning)</option>
                        <option value="repair">Đang sửa chữa (Maintenance)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 5. Action Zalo ZNS */}
                {selectedNode.data.nodeType === 'action_external_zalo_zns' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Mẫu tin nhắn (Template ID)</span>
                      <SmartVariableInput
                        value={(selectedNode.data.config as any)?.template_id || ''}
                        onChange={(val) => updateNodeConfig('template_id', val)}
                        placeholder="Mã template ZNS (Ví dụ: zns_welcome)"
                        upstreamVariables={upstreamVariables}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Số điện thoại gửi</span>
                      <SmartVariableInput
                        value={(selectedNode.data.config as any)?.phone_number || ''}
                        onChange={(val) => updateNodeConfig('phone_number', val)}
                        placeholder="Nhập số hoặc chọn biến động {}..."
                        upstreamVariables={upstreamVariables}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Nội dung động (Dynamic Params)</span>
                      <SmartVariableInput
                        value={(selectedNode.data.config as any)?.dynamic_params || ''}
                        onChange={(val) => updateNodeConfig('dynamic_params', val)}
                        placeholder="Nhập lời chúc..."
                        upstreamVariables={upstreamVariables}
                      />
                    </div>
                  </div>
                )}

                {/* 6. Action Google Sheets */}
                {selectedNode.data.nodeType === 'action_external_sheets' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Spreadsheet ID / URL</span>
                      <SmartVariableInput
                        value={(selectedNode.data.config as any)?.sheet_id || ''}
                        onChange={(val) => updateNodeConfig('sheet_id', val)}
                        placeholder="ID Google Sheet..."
                        upstreamVariables={upstreamVariables}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Vùng phạm vi (Range)</span>
                      <SmartVariableInput
                        value={(selectedNode.data.config as any)?.range || 'Sheet1!A:Z'}
                        onChange={(val) => updateNodeConfig('range', val)}
                        placeholder="VD: Trang1!A:E"
                        upstreamVariables={upstreamVariables}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Dòng giá trị chèn (comma separated)</span>
                      <SmartVariableInput
                        value={(selectedNode.data.config as any)?.row_data || ''}
                        onChange={(val) => updateNodeConfig('row_data', val)}
                        placeholder="VD: {{$trigger_booking.booking_id}}, {{$trigger_booking.customer_phone}}"
                        upstreamVariables={upstreamVariables}
                      />
                    </div>
                  </div>
                )}

                {/* 7. OUTPUT SCHEMA SELECTION */}
                {NODE_OUTPUTS_SCHEMA[selectedNode.data.nodeType as string] && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500 block">
                        Dữ liệu đầu ra (Output Schema)
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const schema = NODE_OUTPUTS_SCHEMA[selectedNode.data.nodeType as string]
                            updateNodeConfig('output_variables', schema.map(v => v.key))
                          }}
                          className="text-[8.5px] font-extrabold text-indigo-600 hover:text-indigo-850 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded-md cursor-pointer transition border-none"
                        >
                          Chọn tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateNodeConfig('output_variables', [])
                          }}
                          className="text-[8.5px] font-extrabold text-zinc-500 dark:text-zinc-450 hover:text-slate-700 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-slate-100 px-1.5 py-0.5 rounded-md cursor-pointer transition border-none"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                      {NODE_OUTPUTS_SCHEMA[selectedNode.data.nodeType as string]?.map((v) => {
                        const schema = NODE_OUTPUTS_SCHEMA[selectedNode.data.nodeType as string]
                        const selectedKeys: string[] = (selectedNode.data.config as any)?.output_variables || schema.map(s => s.key)
                        const isChecked = selectedKeys.includes(v.key)

                        return (
                          <label 
                            key={v.key} 
                            className="flex items-start gap-2.5 cursor-pointer group text-left select-none animate-in fade-in duration-100"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updated: string[]
                                if (e.target.checked) {
                                  updated = [...selectedKeys, v.key]
                                } else {
                                  updated = selectedKeys.filter(k => k !== v.key)
                                }
                                updateNodeConfig('output_variables', updated)
                              }}
                              className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-650 focus:ring-offset-0 cursor-pointer accent-indigo-650 transition"
                            />
                            <div className="flex flex-col leading-tight">
                              <span className="text-[10px] font-bold text-slate-800 group-hover:text-zinc-800 dark:text-zinc-200 transition flex items-center gap-1">
                                {v.name}
                                <code className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 bg-slate-100 px-1 rounded-sm">
                                  {v.key}
                                </code>
                              </span>
                              {v.description && (
                                <span className="text-[8.5px] text-zinc-400 dark:text-zinc-500 font-semibold block mt-0.5">
                                  {v.description}
                                </span>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 dark:text-zinc-500 gap-2">
              <Settings size={28} className="animate-spin duration-6000 text-slate-300" />
              <span className="text-xs font-semibold">Chưa chọn Node để cấu hình</span>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">Chọn đúp hoặc nhấp chuột vào một Node trên Canvas để điều khiển cấu hình chi tiết và chèn biến.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
