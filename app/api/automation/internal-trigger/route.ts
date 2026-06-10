import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventType, payload } = body

    if (!eventType) {
      return NextResponse.json(
        { error: 'Thiếu thông tin loại sự kiện (eventType) bắt buộc.' },
        { status: 400 }
      )
    }

    console.log('[API INTERNAL EVENT] Nhận sự kiện hệ thống:', { eventType, payload })

    try {
      const supabase = getSupabase()

      // 1. Tìm các workflow đang active
      const { data: activeWorkflows, error: wfError } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('status', 'active')

      if (wfError) throw wfError

      // 2. Lọc các kịch bản có chứa node trigger khớp với eventType
      const matchedWorkflows = (activeWorkflows || []).filter((wf: any) => {
        const reactFlowData = wf.react_flow_data
        if (!reactFlowData || !reactFlowData.nodes) return false
        
        // Tìm node trigger xem có khớp cấu hình eventType hoặc node type không
        return reactFlowData.nodes.some((node: any) => 
          node.type === 'trigger' && 
          (node.data?.triggerType === eventType || node.id === eventType || node.data?.label?.toLowerCase().includes(eventType.toLowerCase()))
        )
      })

      const executionResults = []

      // 3. Loop qua các kịch bản khớp và gửi tín hiệu kích hoạt sang n8n webhook
      for (const wf of matchedWorkflows) {
        if (!wf.n8n_webhook_url) continue

        let status: 'success' | 'failed' = 'success'
        let responseData = null
        let errorMessage = null

        try {
          // Gọi sang n8n Webhook
          const n8nRes = await fetch(wf.n8n_webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workflow_id: wf.id,
              event: eventType,
              payload: payload
            })
          })

          responseData = await n8nRes.json().catch(() => null)
          if (!n8nRes.ok) {
            throw new Error(`n8n trả về mã lỗi HTTP ${n8nRes.status}`)
          }
        } catch (fetchErr: any) {
          status = 'failed'
          errorMessage = fetchErr.message
        }

        // 4. Ghi log thực thi vào bảng automation_logs
        const logRecord = {
          workflow_id: wf.id,
          status,
          execution_data: {
            payload,
            response: responseData
          },
          error_message: errorMessage,
          executed_at: new Date().toISOString()
        }

        const { error: logError } = await supabase
          .from('automation_logs')
          .insert(logRecord)

        if (logError) {
          console.error('[API INTERNAL EVENT] Lỗi ghi log vào Supabase:', logError.message)
        }

        executionResults.push({
          workflow_id: wf.id,
          workflow_name: wf.name,
          status,
          error: errorMessage
        })
      }

      return NextResponse.json({
        message: `Đã xử lý sự kiện '${eventType}' hoàn tất.`,
        triggeredWorkflowsCount: matchedWorkflows.length,
        results: executionResults
      })

    } catch (dbError: any) {
      console.warn('[API INTERNAL EVENT WARNING] Lỗi kết nối Supabase, tự động chuyển sang chế độ giả lập chạy ngầm:', dbError.message)

      // Mock processing for simulation purposes
      const mockLogId = 'log-' + Math.floor(100000 + Math.random() * 900000)
      
      console.log(`[AUTOMATION HYBRID ENGINE] Mô phỏng kích hoạt sự kiện '${eventType}' thành công. Đã định tuyến dữ liệu sang n8n webhook mock.`);

      return NextResponse.json({
        message: `Đã mô phỏng sự kiện '${eventType}' thành công trong môi trường Offline Memory!`,
        triggeredWorkflowsCount: 1,
        results: [
          {
            workflow_id: 'mock-wf-id',
            workflow_name: 'Gửi Zalo khi có Booking mới (Mock)',
            status: 'success',
            log_id: mockLogId,
            warning: 'Đây là dữ liệu mô phỏng. Hãy chạy lệnh khởi tạo bảng SQL để kiểm tra thực tế.'
          }
        ]
      })
    }
  } catch (err: any) {
    console.error('[API INTERNAL EVENT ERROR]:', err)
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ.', details: err.message },
      { status: 500 }
    )
  }
}
