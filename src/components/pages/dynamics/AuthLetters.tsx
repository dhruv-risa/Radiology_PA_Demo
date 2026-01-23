import { useNavigate, useParams } from 'react-router-dom'
import { getOrderByMRN } from '../../../utils/patientDataHelpers'
import { useState } from 'react'
import DocumentModal from '../../common/DocumentModal'

export default function AuthLetters() {
  const navigate = useNavigate()
  const { id } = useParams()
  const orderData = getOrderByMRN(id!)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [currentDocument, setCurrentDocument] = useState({ title: '', url: '' })

  const hasIssues = orderData?.paStatus.AutomationWorkflow === 'Blocked'
  const paStatus = orderData?.paStatus

  // Check if case is marked as complete
  const isMarkedComplete = orderData ? localStorage.getItem(`case-complete-${orderData.orderId}`) === 'true' : false

  // Check if PA has been filed (either via paFiled flag or localStorage submission)
  const isPAFiled = paStatus?.paFiled || (orderData ? localStorage.getItem(`pa-submission-${orderData.orderId}`) !== null : false)

  // Get auth letter path (same document for all payers)
  const getAuthLetterPath = (): string => {
    return '/documents/auth-letter-aetna.pdf'
  }

  // Show auth letter for RAD-001 to RAD-004
  const orderNumber = orderData ? parseInt(orderData.orderId.split('-')[1]) : 0
  const showAuthLetter = orderData && orderNumber >= 1 && orderNumber <= 4

  const authLetterDate = new Date(2025, 11, 11).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })

  const handleViewAuthLetter = () => {
    if (orderData) {
      const authLetterPath = getAuthLetterPath()
      setCurrentDocument({
        title: `${orderData.payer.name} Authorization Letter`,
        url: authLetterPath
      })
      setIsDocumentModalOpen(true)
    }
  }

  const handleMarkComplete = () => {
    if (orderData) {
      localStorage.setItem(`case-complete-${orderData.orderId}`, 'true')
      navigate('/')
    }
  }

  return (
    <div className="pb-24">
      <div className="bg-white border rounded-lg overflow-hidden">
        {showAuthLetter ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-700">Date Created</th>
                <th className="text-left px-6 py-3 font-medium text-gray-700">Document Name</th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{authLetterDate}</td>
                <td className="px-6 py-4">{orderData?.payer.name} Authorization Letter</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={handleViewAuthLetter}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No authorization letters available</p>
            <p className="text-gray-400 text-xs mt-2">Authorization letters will appear after PA is filed or approved</p>
          </div>
        )}
      </div>

      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        title={currentDocument.title}
        documentUrl={currentDocument.url}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex justify-end gap-3 z-20">
        <button
          onClick={() => navigate(`/patient/${id}/ev`)}
          className="px-6 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Go Back
        </button>
        {/* Show action button based on status - hide if marked complete */}
        {!isMarkedComplete && (
          <>
            {hasIssues && (
              <button
                onClick={() => navigate(`/patient/${id}/dynamics/issues`)}
                className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                View Issues
              </button>
            )}
            {paStatus && ['Auth Required', 'PA Ordered'].includes(paStatus.authStatus) && !isPAFiled && (
              <button
                onClick={() => navigate(`/patient/${id}/dynamics/workflow`)}
                className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                File Prior Authorization
              </button>
            )}
            {paStatus && (paStatus.authStatus === 'PA Submitted' || isPAFiled) && (
              <button
                onClick={handleMarkComplete}
                className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark as Complete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
