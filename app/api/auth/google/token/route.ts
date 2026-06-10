import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, code, refresh_token, client_id, client_secret, redirect_uri } = body

    if (action === 'refresh') {
      if (!refresh_token || !client_id || !client_secret) {
        return NextResponse.json({ error: 'Missing parameters for refresh' }, { status: 400 })
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id,
          client_secret,
          refresh_token,
          grant_type: 'refresh_token'
        })
      })

      const data = await response.json()
      if (data.error) {
        return NextResponse.json({ error: data.error_description || data.error }, { status: 400 })
      }

      return NextResponse.json({
        access_token: data.access_token,
        expires_in: data.expires_in
      })
    } else {
      // Exchange authorization code
      if (!code || !client_id || !client_secret || !redirect_uri) {
        return NextResponse.json({ error: 'Missing parameters for token exchange' }, { status: 400 })
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code,
          client_id,
          client_secret,
          redirect_uri,
          grant_type: 'authorization_code'
        })
      })

      const data = await response.json()
      if (data.error) {
        return NextResponse.json({ error: data.error_description || data.error }, { status: 400 })
      }

      // Fetch email using userinfo endpoint
      let email = 'unknown@gmail.com'
      try {
        const infoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        })
        const infoData = await infoResponse.json()
        if (infoData.email) {
          email = infoData.email
        }
      } catch (e) {
        console.error('Error fetching user info:', e)
      }

      return NextResponse.json({
        access_token: data.access_token,
        refresh_token: data.refresh_token || refresh_token || '',
        expires_in: data.expires_in,
        email
      })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
