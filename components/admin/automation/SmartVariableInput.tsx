'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Search, Brackets } from 'lucide-react'

interface Variable {
  nodeId: string
  nodeLabel: string
  name: string
  key: string // e.g. "booking_id"
}

interface SmartVariableInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  upstreamVariables?: Variable[] // Grouped list of available variables from preceding nodes
}

export default function SmartVariableInput({
  value,
  onChange,
  placeholder = 'Nhập thông tin...',
  upstreamVariables = []
}: SmartVariableInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Standard variables fallback if upstreamVariables is empty
  const defaultVariables: Variable[] = [
    { nodeId: 'trigger_booking', nodeLabel: 'Đơn Đặt Phòng Mới 🟢', name: 'Mã đặt phòng', key: 'booking_id' },
    { nodeId: 'trigger_booking', nodeLabel: 'Đơn Đặt Phòng Mới 🟢', name: 'Số điện thoại khách', key: 'customer_phone' },
    { nodeId: 'trigger_booking', nodeLabel: 'Đơn Đặt Phòng Mới 🟢', name: 'Tổng số tiền', key: 'total_amount' },
    { nodeId: 'trigger_crm', nodeLabel: 'Phân Hạng AI CRM 🤖', name: 'Mã khách hàng', key: 'customer_id' },
    { nodeId: 'trigger_crm', nodeLabel: 'Phân Hạng AI CRM 🤖', name: 'Nhóm phân hạng mới', key: 'new_group' },
    { nodeId: 'trigger_webhook', nodeLabel: 'Webhook Bên Ngoài 🔌', name: 'Dữ liệu thô nhận được', key: 'body' }
  ]

  const activeVariables = upstreamVariables.length > 0 ? upstreamVariables : defaultVariables

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    
    // Auto-open dropdown when typing '{'
    if (val.endsWith('{')) {
      setIsOpen(true)
    }
  }

  const handleInsertVariable = (variable: Variable) => {
    const varSyntax = `{{$${variable.nodeId}.${variable.key}}}`
    const input = inputRef.current
    
    if (input) {
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0
      
      // Insert variable syntax at cursor position
      const newVal = value.substring(0, start) + varSyntax + value.substring(end)
      onChange(newVal)
      
      // Refocus and place cursor after inserted variable
      setTimeout(() => {
        input.focus()
        const newCursorPos = start + varSyntax.length
        input.setSelectionRange(newCursorPos, newCursorPos)
      }, 50)
    } else {
      onChange(value + varSyntax)
    }
    
    setIsOpen(false)
    setSearchQuery('')
  }

  // Filter variables by search query
  const filteredVariables = activeVariables.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.nodeLabel.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group variables by nodeLabel
  const groupedVariables = filteredVariables.reduce((acc, curr) => {
    if (!acc[curr.nodeLabel]) {
      acc[curr.nodeLabel] = []
    }
    acc[curr.nodeLabel].push(curr)
    return acc;
  }, {} as Record<string, Variable[]>)

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center bg-[#FAF9F5] border-2 border-slate-300 rounded-xl focus-within:border-indigo-650 transition-all shadow-inner overflow-hidden pr-2.5">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-none py-2 px-3 text-xs text-black outline-none font-medium"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-indigo-650 transition active:scale-90 p-1 rounded-md"
          title="Chèn biến động"
        >
          <Brackets size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-[999] overflow-hidden max-h-[220px] flex flex-col animate-in fade-in duration-200">
          <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
            <Search size={12} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm biến động..."
              className="w-full bg-transparent border-none text-[10.5px] outline-none text-black font-semibold"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-grow p-1.5 flex flex-col gap-2">
            {Object.keys(groupedVariables).length === 0 ? (
              <span className="text-[10px] text-slate-400 italic text-center py-3">Không có biến phù hợp...</span>
            ) : (
              Object.entries(groupedVariables).map(([nodeLabel, vars]) => (
                <div key={nodeLabel} className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 px-2 flex items-center gap-1">
                    <Sparkles size={8} className="text-indigo-500" />
                    {nodeLabel}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {vars.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => handleInsertVariable(v)}
                        className="text-left w-full px-2.5 py-1 text-[10.5px] hover:bg-indigo-50 rounded-lg text-slate-700 hover:text-indigo-650 font-bold transition flex justify-between items-center"
                      >
                        <span>{v.name}</span>
                        <code className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded-sm">
                          {`{{$${v.nodeId}.${v.key}}}`}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
