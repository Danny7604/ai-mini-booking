export async function POST(request) {
  try {
    const { note } = await request.json();

    if (!note || typeof note !== 'string') {
      return Response.json({ error: 'Note is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Từ ghi chú sau, hãy trích xuất 3 tags (thẻ) mô tả nhu cầu của người dùng. Chỉ trả về 3 từ khóa ngắn gọn, cách nhau bằng dấu phẩy, không thêm giải thích.\n\nGhi chú: ${note}`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tags = text.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);

    return Response.json({ tags });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
