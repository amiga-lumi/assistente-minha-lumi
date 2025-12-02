import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID é obrigatório' }, { status: 400 })
    }

    const accessToken = await getPayPalAccessToken()

    // Capturar a ordem no PayPal
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const captureData = await response.json()

    if (response.ok && captureData.status === 'COMPLETED') {
      // Aqui você pode atualizar o banco de dados do usuário
      // Por exemplo, marcar como premium no Supabase
      
      return NextResponse.json({
        success: true,
        transactionId: captureData.id,
        status: captureData.status,
        payerEmail: captureData.payer?.email_address,
        amount: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount
      })
    } else {
      console.error('Erro ao capturar ordem:', captureData)
      return NextResponse.json({ error: 'Erro ao processar pagamento' }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro na API capture-order:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}