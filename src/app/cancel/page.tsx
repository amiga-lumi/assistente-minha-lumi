'use client'

import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-gray-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pagamento Cancelado
          </h1>
          
          <p className="text-gray-600 mb-6">
            Você cancelou o processo de pagamento. Não se preocupe, você pode tentar novamente a qualquer momento.
          </p>

          <div className="bg-rose-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700">
              💡 Lembre-se: com o Lumi+ Premium você tem acesso a recursos exclusivos como previsão do ciclo menstrual, histórico emocional completo e muito mais!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/?screen=premium')}
              className="w-full bg-rose-400 text-white py-3 px-6 rounded-xl hover:bg-rose-500 transition-colors"
            >
              Tentar Novamente
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Lumi
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Você pode continuar usando o Lumi gratuitamente com funcionalidades limitadas.
          </p>
        </div>
      </div>
    </div>
  )
}