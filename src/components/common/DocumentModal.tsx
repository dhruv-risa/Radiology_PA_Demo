import { useEffect } from 'react'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  documentUrl: string
}

export default function DocumentModal({ isOpen, onClose, title, documentUrl }: DocumentModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Check if the document is an image (PNG, JPG, JPEG, GIF, etc.)
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(documentUrl)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-100">
            {isImage ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={documentUrl}
                  alt={title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <iframe
                src={`${documentUrl}${documentUrl.includes('?') ? '&' : '#'}view=FitH&pagemode=none&navpanes=0&toolbar=1`}
                className="w-full h-full border-0"
                title={title}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
