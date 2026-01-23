import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom'
import { getOrderByMRN } from '../../utils/patientDataHelpers'
import { useState, useRef, useEffect } from 'react'
import DocumentModal from '../common/DocumentModal'

interface DxCodesModalProps {
  isOpen: boolean
  onClose: () => void
  diagnosisCodes: string[]
}

function DxCodesModal({ isOpen, onClose, diagnosisCodes }: DxCodesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Diagnosis Codes</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {diagnosisCodes && diagnosisCodes.length > 0 ? (
            <div className="space-y-2">
              {diagnosisCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-mono font-semibold text-gray-900">{code}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No diagnosis codes available</p>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MedOncDynamicsLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const orderData = getOrderByMRN(id!)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isDxCodesModalOpen, setIsDxCodesModalOpen] = useState(false)
  const [currentDocument, setCurrentDocument] = useState({ title: '', url: '' })
  const menuRef = useRef<HTMLDivElement>(null)


  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No order data found</p>
      </div>
    )
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const patient = orderData.patient
  const order = orderData.order
  const payer = orderData.payer
  const paStatus = orderData.paStatus

  const shouldShowIssuesTab = () => {
    if (paStatus.automationStatus === 'Blocked') {
      return true
    }
    return paStatus.authStatus === 'Queries'
  }

  const shouldShowFiledPATab = () => {
    // Show Filed PA tab if PA has been submitted
    if (paStatus.authStatus === 'PA Submitted') {
      return true
    }
    // Check if PA was filed internally (internal tag)
    if (paStatus.paFiled === true) {
      return true
    }
    // Also check localStorage for submitted PAs
    const savedSubmission = localStorage.getItem(`pa-submission-${orderData.orderId}`)
    return savedSubmission !== null
  }

  const tabs = [
    { id: 'authorization', label: 'Authorization' },
    { id: 'documents', label: 'Documents' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'auth-letters', label: 'Auth Letters' },
    { id: 'business-office', label: 'Business Office' },
    ...(shouldShowFiledPATab() ? [{ id: 'filed-pa', label: 'Filed PA' }] : []),
    ...(shouldShowIssuesTab() ? [{ id: 'issues', label: 'Issues' }] : []),
  ]

  const currentTab = location.pathname.split('/').pop() || 'authorization'

  const openDocument = (documentPath: string, title: string) => {
    setCurrentDocument({ title, url: documentPath })
    setIsDocumentModalOpen(true)
    setIsMenuOpen(false)
  }

  const getPayerNARGridPath = (payerName: string): string => {
    // Map payer names to their NAR grid PDF files
    const payerMap: Record<string, string> = {
      'Aetna': '/documents/nar-grid-aetna.pdf',
      'BCBS': '/documents/nar-grid-bcbs.pdf',
      'Cigna': '/documents/nar-grid-cigna.pdf'
    }
    return payerMap[payerName] || '/documents/nar-grid-aetna.pdf'
  }

  const handleViewOncoEMR = () => {
    window.open('https://secure92.oncoemr.com/nav/documents?PID=PD_064PKXCW006EF8B4GWX9&locationId=LH_066YFE5N557HFTWBQGZ3', '_blank')
    setIsMenuOpen(false)
  }

  const handleViewNARGrid = () => {
    const narGridPath = getPayerNARGridPath(payer.name)
    openDocument(narGridPath, `${payer.name} NAR Grid`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{patient.name.toUpperCase()} ({patient.mrn})</h1>
              {paStatus.automationStatus === 'Blocked' ? (
                <>
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded">
                    Auth Status: {paStatus.authStatus}
                  </span>
                </>
              ) : (
                <>
                  {orderData.eligibilityVerification.priorAuthRequired && (
                    <span className="px-2.5 py-1 bg-yellow-50 text-yellow-800 text-xs font-medium rounded">
                      Auth Required
                    </span>
                  )}
                  {paStatus.authStatus === 'NAR' && (
                    <span className="px-2.5 py-1 bg-teal-50 text-teal-600 text-xs font-medium rounded flex items-center gap-1">
                      <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                      Auth Status: NAR
                    </span>
                  )}
                  {paStatus.authStatus === 'Auth on File' && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Auth Status: Auth on File
                    </span>
                  )}
                  {paStatus.authStatus === 'PA Submitted' && (
                    <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded">
                      Auth Status: PA Submitted
                    </span>
                  )}
                  {paStatus.authStatus === 'PA Ordered' && (
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded flex items-center gap-1">
                      <span className="w-2 h-2 bg-purple-700 rounded-full"></span>
                      Auth Status: PA Ordered
                    </span>
                  )}
                </>
              )}
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                <span className="w-2 h-2 bg-green-700 rounded-full"></span>
                Coverage Status: {payer.status}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded ${
                paStatus.automationStatus === 'Completed' ? 'bg-green-50 text-green-700' :
                paStatus.automationStatus === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                paStatus.automationStatus === 'Blocked' ? 'bg-red-50 text-red-600' :
                'bg-gray-50 text-gray-700'
              }`}>
                Autonomous workflow: {paStatus.automationStatus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="relative"
                ref={menuRef}
                onMouseEnter={() => setIsMenuOpen(true)}
              >
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleViewOncoEMR}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View in OncoEMR
                    </button>
                    <button
                      onClick={handleViewNARGrid}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      View NAR Grid
                    </button>
                    <button
                      onClick={() => {
                        setIsDxCodesModalOpen(true)
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      View Dx Codes
                    </button>
                  </div>
                )}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 mb-3">
            <span>Insurance: {payer.name}</span>
            <span className="mx-2">|</span>
            <span>DOS: {new Date(order.dateOfService).toLocaleDateString('en-US')}</span>
            <span className="mx-2">|</span>
            <span>Provider: {order.orderingProvider.name}</span>
            <span className="mx-2">|</span>
            <span>Provider NPI: {order.orderingProvider.npi}</span>
          </div>
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigate(`/patient/${id}/dynamics/${tab.id}`)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  currentTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PA Ordered Alert Banner - Only show if PA not filed yet */}
      {(paStatus.authStatus === 'PA Ordered' || paStatus.authStatus === 'Auth Required') && !paStatus.paFiled && orderData.eligibilityVerification.priorAuthRequired && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Action Required: Prior Authorization Not Yet Filed
                </h3>
                <p className="text-sm text-gray-600">
                  This case requires prior authorization submission. All documentation has been gathered and the authorization is ready to be filed with the payer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queries Alert Banner */}
      {paStatus.authStatus === 'Queries' && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b-2 border-red-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">
                  Issue Detected: {paStatus.issueType || 'Queries'}
                </h3>
                <p className="text-sm text-red-800">
                  {paStatus.issueType === 'Clinical Missing' && 'Required clinical documentation is missing for this authorization. Please upload or request the necessary documents to proceed.'}
                  {paStatus.issueType === 'Supporting Imaging Missing' && 'Required supporting imaging is missing for this authorization. Please upload or request the necessary imaging files to proceed.'}
                  {paStatus.issueType === 'Invalid Dx Code' && 'One or more diagnosis codes are invalid or not supported for this authorization request. Please review and correct the diagnosis codes.'}
                  {!paStatus.issueType && 'This authorization has queries that need to be resolved. Please review and address the issues to proceed.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="p-6">
        <Outlet />
      </div>

      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        title={currentDocument.title}
        documentUrl={currentDocument.url}
      />

      <DxCodesModal
        isOpen={isDxCodesModalOpen}
        onClose={() => setIsDxCodesModalOpen(false)}
        diagnosisCodes={order.diagnosisCodes || []}
      />
    </div>
  )
}
