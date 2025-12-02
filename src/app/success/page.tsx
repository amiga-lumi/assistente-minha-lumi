'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Crown, ArrowLeft } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [planInfo, setPlanInfo] = useState<any>(null)

  useEffect(() => {
    const processPayment = async () => {
      try {
        const orderId = searchParams.get('token') // PayPal retorna como 'token'
        const planId = searchParams.get('plan')

        if (!orderId) {
          setPaymentStatus('error')
          setIsProcessing(false)
          return
        }

        // Capturar a ordem no PayPal
        const response = await fetch('/api/capture-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        })

        const result = await response.json()

        if (result.success) {
          // Atualizar status do usuário no localStorage (simulação)
          const userData = JSON.parse(localStorage.getItem('lumiUser') || '{}')
          if (userData.email) {
            const updatedUser = {
              ...userData,
              isPremium: true,
              planType: planId,
              activationDate: new Date().toISOString(),
              transactionId: result.transactionId
            }
            localStorage.setItem('lumiUser', JSON.stringify(updatedUser))
          }

          setPlanInfo({
            planId,
            transactionId: result.transactionId,
            amount: result.amount
          })
          setPaymentStatus('success')
        } else {
          setPaymentStatus('error')
        }
      } catch (error) {
        console.error('Erro ao processar pagamento:', error)
        setPaymentStatus('error')
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [searchParams])

  const getPlanName = (planId: string) => {
    const plans = {
      trial: '7 dias gratuitos + R$ 9,90/mês',
      quarterly: 'Plano Trimestral Promocional',
      biannual: 'Plano Semestral'
    }
    return plans[planId as keyof typeof plans] || 'Plano Premium'
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Processando seu pagamento...
            </h1>
            <p className="text-gray-600">
              Aguarde enquanto confirmamos sua transação com o PayPal.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">✕</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-600 mb-6">
              Não conseguimos processar seu pagamento. Tente novamente ou entre em contato conosco.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-rose-400 text-white py-3 px-6 rounded-xl hover:bg-rose-500 transition-colors"
            >
              Voltar ao App
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ✨ Parabéns! Seu Lumi+ Premium foi ativado com sucesso.
          </h1>
          
          <p className="text-gray-600 mb-6">
            Aproveite todos os recursos desbloqueados 💖
          </p>

          <div className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl p-4 text-white mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">Plano Ativado</span>
            </div>
            <p className="text-sm text-rose-100">
              {getPlanName(planInfo?.planId)}
            </p>
            {planInfo?.transactionId && (
              <p className="text-xs text-rose-100 mt-2">
                ID da Transação: {planInfo.transactionId}
              </p>
            )}
          </div>

          <div className="bg-white/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Agora você tem acesso a:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Planner com até 10 tarefas</li>
              <li>✓ Histórico emocional de 7 dias</li>
              <li>✓ Previsão do ciclo menstrual</li>
              <li>✓ Lista de compras expandida (30 itens)</li>
              <li>✓ Salvar receitas favoritas</li>
              <li>✓ Notificações personalizadas</li>
              <li>✓ Sugestões musicais personalizadas</li>
            </ul>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-rose-400 text-white py-3 px-6 rounded-xl hover:bg-rose-500 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Lumi
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Você pode gerenciar sua assinatura a qualquer momento na área Premium.
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Carregando...
          </h1>
          <p className="text-gray-600">
            Preparando sua página de sucesso.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  )
}