import { useParams, useNavigate } from 'react-router-dom'
import { getOrderByMRN } from '../../../utils/patientDataHelpers'
import { useEffect, useState } from 'react'
import DocumentModal from '../../common/DocumentModal'
import { getIcdDescription } from '../../../utils/icdCodes'

interface FiledPAData {
  orderId: string
  submittedAt: string
  authorizationNumber: string
  formData: {
    diagnoses: Array<{ icdCode: string; icdDescription: string }>
    procedures: Array<{ codeDescription: string; code: string; serviceQuantity: string; serviceQuantityType: string }>
    providerNotes: string
    fromDate: string
    attachments: any[]
  }
}

export default function FiledPA() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderData = getOrderByMRN(id!)
  const [filedPAData, setFiledPAData] = useState<FiledPAData | null>(null)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [currentDocument, setCurrentDocument] = useState({ title: '', url: '' })

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

  useEffect(() => {
    if (!orderData) return

    // Check for filed PA data in localStorage
    const savedSubmission = localStorage.getItem(`pa-submission-${orderData.orderId}`)
    if (savedSubmission) {
      setFiledPAData(JSON.parse(savedSubmission))
    } else {
      // Create default filed PA data if PA was filed (check paFiled flag or PA Submitted status)
      if (orderData.paStatus.paFiled || orderData.paStatus.authStatus === 'PA Submitted') {
        // Check if authorization number already exists, otherwise generate a new one
        let authNumber = localStorage.getItem(`auth-number-${orderData.orderId}`)
        if (!authNumber) {
          authNumber = `AUTH-${Date.now()}`
          localStorage.setItem(`auth-number-${orderData.orderId}`, authNumber)
        }

        const defaultFiledData: FiledPAData = {
          orderId: orderData.orderId,
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          authorizationNumber: authNumber,
          formData: {
            diagnoses: orderData.order.diagnosisCodes?.map(code => ({
              icdCode: code,
              icdDescription: getIcdDescription(code)
            })) || [{ icdCode: 'R07.9', icdDescription: getIcdDescription('R07.9') }],
            procedures: orderData.order.cptCodes?.map(code => ({
              codeDescription: orderData.order.imagingType,
              code: code,
              serviceQuantity: '1',
              serviceQuantityType: 'Units'
            })) || [],
            providerNotes: 'Patient presents with chronic symptoms requiring advanced imaging for proper diagnosis and treatment planning. Clinical documentation supports medical necessity.',
            fromDate: orderData.order.dateOfService,
            attachments: orderData.documents || []
          }
        }
        setFiledPAData(defaultFiledData)
      }
    }
  }, [orderData])

  if (!orderData || !filedPAData) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 text-sm">No prior authorization has been filed yet</p>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Prior Authorization Filed</h2>
                <p className="text-sm text-gray-600 mb-2">
                  Authorization request submitted on {new Date(filedPAData.submittedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600">Authorization Number:</span>
                    <span className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                      {filedPAData.authorizationNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600">Status:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                      Pending Payer Review
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Header */}
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Patient Information Form</h3>
          <p className="text-sm text-gray-600 mt-0.5">Prior Authorization Request - Submitted</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">

        {/* Patient Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 pb-1.5 border-b border-gray-200">Patient Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Member ID</div>
              <div className="text-sm font-medium text-gray-900">{orderData.patient.memberId}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Relationship to Subscriber</div>
              <div className="text-sm font-medium text-gray-900">Self</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Patient Name</div>
              <div className="text-sm font-medium text-gray-900">{orderData.patient.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Date of Birth</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(orderData.patient.dob).toLocaleDateString('en-US')}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">MRN</div>
              <div className="text-sm font-medium text-gray-900">{orderData.patient.mrn}</div>
            </div>
          </div>
        </div>

        {/* Provider Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 pb-1.5 border-b border-gray-200">Provider Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Provider Name</div>
              <div className="text-sm font-medium text-gray-900">{orderData.order.orderingProvider.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">NPI Number</div>
              <div className="text-sm font-medium text-gray-900">{orderData.order.orderingProvider.npi}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Place of Service</div>
              <div className="text-sm font-medium text-gray-900">11 - Office</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Facility NPI</div>
              <div className="text-sm font-medium text-gray-900">1326046467</div>
            </div>
          </div>
        </div>

        {/* Diagnosis Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 pb-1.5 border-b border-gray-200">Diagnosis Information</h4>
          <div className="space-y-2">
            {filedPAData.formData.diagnoses.map((diagnosis, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-gray-600 mb-1.5">Diagnosis {index + 1}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">ICD Code</div>
                    <div className="text-sm font-medium text-gray-900">{diagnosis.icdCode}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">ICD Description</div>
                    <div className="text-sm font-medium text-gray-900">{diagnosis.icdDescription}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Procedures Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 pb-1.5 border-b border-gray-200">Procedures Information</h4>
          <div className="space-y-2">
            {filedPAData.formData.procedures.map((procedure, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-gray-600 mb-1.5">Procedure {index + 1}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Procedure Code Description</div>
                    <div className="text-sm font-medium text-gray-900">{procedure.codeDescription}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Procedure Code (CPT / HCPCS)</div>
                    <div className="text-sm font-medium text-gray-900">{procedure.code}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Service Quantity</div>
                    <div className="text-sm font-medium text-gray-900">{procedure.serviceQuantity}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Service Quantity Type</div>
                    <div className="text-sm font-medium text-gray-900">{procedure.serviceQuantityType}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filedPAData.formData.providerNotes && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-0.5">Provider Notes</div>
              <div className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2">{filedPAData.formData.providerNotes}</div>
            </div>
          )}

          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-0.5">From Date</div>
            <div className="text-sm font-medium text-gray-900">
              {new Date(filedPAData.formData.fromDate).toLocaleDateString('en-US')}
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 pb-1.5 border-b">Attachments</h4>
          {filedPAData.formData.attachments && filedPAData.formData.attachments.length > 0 ? (
            <div className="space-y-1.5">
              {filedPAData.formData.attachments.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                    <div className="text-xs text-gray-500">{doc.type}</div>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                    Submitted
                  </span>
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View document"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-3">No attachments submitted</p>
          )}
        </div>

        {/* Submission Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 pb-1.5 border-b border-gray-200">Submission Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Payer Name</div>
              <div className="text-sm font-medium text-gray-900">{orderData.payer.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Plan Name</div>
              <div className="text-sm font-medium text-gray-900">{orderData.payer.planName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Submission Date</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(filedPAData.submittedAt).toLocaleDateString('en-US')}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Submission Method</div>
              <div className="text-sm font-medium text-gray-900">Electronic Portal</div>
            </div>
          </div>
        </div>

        </div>
        {/* End Main Form Container */}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex justify-end gap-3 z-20">
        <button
          onClick={() => navigate(`/patient/${id}/ev`)}
          className="px-6 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Go Back
        </button>
        {/* Show Mark as Complete button only if not already marked complete */}
        {!isMarkedComplete && (
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
