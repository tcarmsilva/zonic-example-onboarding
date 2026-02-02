"use client"

import { RefreshCw, PlayCircle } from "lucide-react"

interface ResumePromptProps {
  progressSummary: {
    answeredQuestions: number
    percentage: number
    clinicName?: string
    responsibleName?: string
  }
  onResume: () => void
  onStartFresh: () => void
}

export function ResumePrompt({ progressSummary, onResume, onStartFresh }: ResumePromptProps) {
  const displayName = progressSummary.responsibleName || progressSummary.clinicName

  return (
    <div className="mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-[#0051fe]/10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0051fe]/10 mb-4">
            <PlayCircle className="w-8 h-8 text-[#0051fe]" />
          </div>
          <h2 className="text-xl font-bold text-[#04152b] mb-2">
            {displayName ? `Olá, ${displayName}!` : "Bem-vindo de volta!"}
          </h2>
          <p className="text-[#04152b]/70 text-sm">
            Você já iniciou o onboarding anteriormente.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="bg-[#e6eefe] rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#04152b]/70">Progresso salvo</span>
            <span className="text-sm font-semibold text-[#0051fe]">{progressSummary.percentage}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5">
            <div 
              className="bg-[#0051fe] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressSummary.percentage}%` }}
            />
          </div>
          <p className="text-xs text-[#04152b]/60 mt-2">
            {progressSummary.answeredQuestions} {progressSummary.answeredQuestions === 1 ? 'pergunta respondida' : 'perguntas respondidas'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0051fe] text-white font-semibold rounded-xl hover:bg-[#0051fe]/90 transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            Continuar de onde parei
          </button>
          
          <button
            onClick={onStartFresh}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#04152b] font-medium rounded-xl border-2 border-[#04152b]/10 hover:border-[#04152b]/20 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Começar do zero
          </button>
        </div>

        <p className="text-xs text-center text-[#04152b]/50 mt-4">
          Seus dados ficam salvos localmente no navegador
        </p>
      </div>
    </div>
  )
}
