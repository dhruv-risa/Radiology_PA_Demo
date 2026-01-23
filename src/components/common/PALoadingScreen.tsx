import { useEffect, useState } from 'react'

interface PALoadingScreenProps {
  isOpen: boolean
  onComplete: () => void
}

const loadingSteps = [
  { text: 'Fetching patient information...', duration: 1500 },
  { text: 'Fetching provider information...', duration: 1200 },
  { text: 'Fetching diagnosis information...', duration: 1300 },
  { text: 'Fetching procedures information...', duration: 1400 },
  { text: 'Fetching attachment information...', duration: 1200 },
  { text: 'Preparing authorization form...', duration: 800 }
]

export default function PALoadingScreen({ isOpen, onComplete }: PALoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setCompletedSteps([])
      return
    }

    let timeoutId: ReturnType<typeof setTimeout>

    const processStep = (stepIndex: number) => {
      if (stepIndex >= loadingSteps.length) {
        // All steps complete
        timeoutId = setTimeout(() => {
          onComplete()
        }, 300)
        return
      }

      setCurrentStep(stepIndex)

      timeoutId = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex])
        processStep(stepIndex + 1)
      }, loadingSteps[stepIndex].duration)
    }

    processStep(0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isOpen, onComplete])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-900 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Preparing Authorization Form</h2>
          <p className="text-sm text-gray-600">Please wait while we gather all necessary information</p>
        </div>

        <div className="space-y-3">
          {loadingSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(index)
            const isCurrent = currentStep === index

            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isCompleted ? 'bg-green-50' :
                  isCurrent ? 'bg-gray-100' :
                  'bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' :
                  isCurrent ? 'bg-gray-900' :
                  'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                  )}
                </div>
                <span className={`text-sm font-medium transition-all duration-300 ${
                  isCompleted ? 'text-green-700' :
                  isCurrent ? 'text-gray-900' :
                  'text-gray-500'
                }`}>
                  {step.text}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>{Math.round((completedSteps.length / loadingSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gray-900 h-full transition-all duration-500 ease-out"
              style={{ width: `${(completedSteps.length / loadingSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
