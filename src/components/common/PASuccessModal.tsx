interface PASuccessModalProps {
  isOpen: boolean
  onClose: () => void
  authorizationNumber?: string
}

export default function PASuccessModal({ isOpen, onClose, authorizationNumber }: PASuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Success Animation */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authorization Submitted!</h2>
          <p className="text-sm text-gray-600">
            Your prior authorization request has been successfully submitted to the payer.
          </p>
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submission Details</div>
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Submission Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {authorizationNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Reference Number</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{authorizationNumber}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Status</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                  <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                  Pending Review
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm font-semibold text-blue-900 mb-1">What happens next?</div>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• The payer will review your authorization request</li>
                  <li>• You'll be notified when a decision is made</li>
                  <li>• Check the Authorization tab for status updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
