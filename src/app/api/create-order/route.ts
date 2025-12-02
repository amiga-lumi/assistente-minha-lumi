import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com'

interface PayPalPlan {
  id: string
  name: string
  description: string
  value: string
  currency: string
  billing_cycles?: number
  trial_days?: number
}

const PLANS: { [key: string]: PayPalPlan } = {
  trial: {
    id: 'trial',
    name: '7 dias gratuitos + R$ 9,90/mês',
    description: '7 dias gratuitos, depois R$ 9,90/mês nos 3 primeiros meses e após R$ 17,90/mês',
    value: '9.90',
    currency: 'BRL',
    trial_days: 7
  },
  quarterly: {
    id: 'quarterly',
    name: 'Plano Trimestral Promocional',
    description: 'R$ 29,70 por 3 meses, depois R$ 53,70 por 3 meses',
    value: '29.70',
    currency: 'BRL',
    billing_cycles: 3
  },
  biannual: {
    id: 'biannual',
    name: 'Plano Semestral',
    description: 'R$ 82,90 por 6 meses',
    value: '82.90',
    currency: 'BRL',
    billing_cycles: 6
  }
}

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
    const { planId } = await request.json()
    
    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    const plan = PLANS[planId]
    const accessToken = await getPayPalAccessToken()

    // Criar ordem no PayPal
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: plan.currency,
            value: plan.value,
          },
          description: plan.description,
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?plan=${planId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cancel`,
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    }

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    })

    const order = await response.json()

    if (response.ok) {
      // Encontrar o link de aprovação
      const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href

      return NextResponse.json({
        orderId: order.id,
        approvalUrl,
        plan: plan
      })
    } else {
      console.error('Erro do PayPal:', order)
      return NextResponse.json({ error: 'Erro ao criar ordem no PayPal' }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro na API create-order:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}