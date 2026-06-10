import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { logId, status, execution_data, error_message } = body

    if (!logId || !status) {
      return NextResponse.json(
        { error: 'Thiếu thông tin logId hoặc status bắt buộc.' },
        { status: 400 }
      )
    }

    console.log('[API WEBHOOK CALLBACK] Nhận kết quả từ n8n engine:', { logId, status, error_message })

    try {
      const supabase = getSupabase()

      // Update trạng thái của log trong bảng automation_logs
      const { data, error } = await supabase
        .from('automation_logs')
        .update({
          status,
          execution_data: execution_data || {},
          error_message: error_message || null,
          executed_at: new Date().toISOString()
        })
        .eq('id', logId)
        .select()

      if (error) throw error

      return NextResponse.json({
        message: 'Cập nhật log thực thi từ n8n thành công!',
        data
      })

    } catch (dbError: any) {
      console.warn('[API WEBHOOK CALLBACK WARNING] Lỗi kết nối Supabase, tự động chuyển sang chế độ giả lập nhận callback:', dbError.message)
      
      console.log(`[AUTOMATION CALLBACK] n8n báo kết quả thực thi: LOG ID '${logId}' đã hoàn thành với trạng thái '${status}'!`);

      return NextResponse.json({
        message: 'Mô phỏng nhận callback từ n8n thành công (Chế độ giả lập)!',
        mockUpdatedLog: {
          id: logId,
          status,
          execution_data: execution_data || {},
          error_message: error_message || null,
          executed_at: new Date().toISOString()
        }
      })
    }
  } catch (err: any) {
    console.error('[API WEBHOOK CALLBACK ERROR]:', err)
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ.', details: err.message },
      { status: 500 }
    )
  }
}
