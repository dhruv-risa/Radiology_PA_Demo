import { useNavigate, useParams } from 'react-router-dom'
import { getOrderByMRN } from '../../../utils/patientDataHelpers'
import { useState } from 'react'
import DocumentModal from '../../common/DocumentModal'

export default function Documents() {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [currentDocument, setCurrentDocument] = useState({ title: '', url: '' })
  const navigate = useNavigate()
  const { id } = useParams()
  const orderData = getOrderByMRN(id!)
  const documents = orderData?.documents || []
  const paStatus = orderData?.paStatus

  // Check if case is marked as complete
  const isMarkedComplete = orderData ? localStorage.getItem(`case-complete-${orderData.orderId}`) === 'true' : false

  const handleMarkComplete = () => {
    if (orderData) {
      localStorage.setItem(`case-complete-${orderData.orderId}`, 'true')
      navigate('/')
    }
  }

  const handleViewDocument = (doc: any) => {
    setCurrentDocument({ title: doc.name, url: doc.url || '/documents/sample.pdf' })
    setIsDocumentModalOpen(true)
  }

  const handleDownload = (doc: any) => {
    const url = doc.url || '/documents/sample.pdf'
    const link = document.createElement('a')
    link.href = url
    link.download = doc.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Retrieved':
        return (
          <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded flex items-center gap-1">
            <span className="w-2 h-2 bg-green-700 rounded-full"></span>
            Retrieved
          </span>
        )
      case 'Not Available':
        return (
          <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded flex items-center gap-1">
            <span className="w-2 h-2 bg-red-700 rounded-full"></span>
            Not Available
          </span>
        )
      case 'Failed':
        return (
          <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded flex items-center gap-1">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Failed
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="pb-24">
      <div className="bg-gray-100 border rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Documents Fetched</h3>

        {documents.length === 0 ? (
          <div className="bg-white border rounded-lg p-6 text-center text-gray-500 text-sm">
            No documents available for this order
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                      {getStatusBadge(doc.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {doc.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(doc.fetchedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  {doc.status === 'Retrieved' && (
                    <div className="ml-4 flex items-center gap-2">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View document"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Download document"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            {paStatus && (['Queries', 'Clinical Missing', 'Supporting Imaging Missing', 'Invalid Dx Code', 'Eligibility Failed'].includes(paStatus.authStatus) || paStatus.automationStatus === 'Blocked') && (
              <button
                onClick={() => navigate(`/patient/${id}/dynamics/issues`)}
                className="px-6 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                View Issues
              </button>
            )}
            {paStatus && ['Auth Required', 'PA Ordered'].includes(paStatus.authStatus) && !paStatus.paFiled && (
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
            {paStatus && (paStatus.authStatus === 'PA Submitted' || paStatus.paFiled) && (
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

      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        title={currentDocument.title}
        documentUrl={currentDocument.url}
      />
    </div>
  )
}
