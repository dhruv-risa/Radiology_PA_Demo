import { RadiologyPAOrder } from '../../utils/patientDataHelpers'

import { Document } from '../../utils/patientDataHelpers'

interface PAPreviewProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  orderData: RadiologyPAOrder
  formData: {
    diagnoses: Array<{ icdCode: string; icdDescription: string }>
    procedures: Array<{ codeDescription: string; code: string; serviceQuantity: string; serviceQuantityType: string }>
    providerNotes: string
    fromDate: string
    attachments: Document[]
  }
}

export default function PAPreview({ isOpen, onClose, onSubmit, orderData, formData }: PAPreviewProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review Prior Authorization Request</h2>
            <p className="text-sm text-gray-600 mt-1">Please review all information before submitting</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Aetna Header */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900">Aetna Patient Information Form</h3>
            <p className="text-sm text-gray-600 mt-1">Prior Authorization Request Summary</p>
          </div>

          {/* Patient Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">Patient Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Member ID</div>
                <div className="text-sm font-medium text-gray-900">{orderData.patient.memberId}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Relationship to Subscriber</div>
                <div className="text-sm font-medium text-gray-900">Self</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Patient Name</div>
                <div className="text-sm font-medium text-gray-900">{orderData.patient.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Date of Birth</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(orderData.patient.dob).toLocaleDateString('en-US')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">MRN</div>
                <div className="text-sm font-medium text-gray-900">{orderData.patient.mrn}</div>
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">Provider Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Provider Name</div>
                <div className="text-sm font-medium text-gray-900">{orderData.order.orderingProvider.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">NPI Number</div>
                <div className="text-sm font-medium text-gray-900">{orderData.order.orderingProvider.npi}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Place of Service</div>
                <div className="text-sm font-medium text-gray-900">11 - Office</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Facility NPI</div>
                <div className="text-sm font-medium text-gray-900">1326046467</div>
              </div>
            </div>
          </div>

          {/* Diagnosis Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">Diagnosis Information</h4>
            <div className="space-y-3">
              {formData.diagnoses.map((diagnosis, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Diagnosis {index + 1}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ICD Code</div>
                      <div className="text-sm font-medium text-gray-900">{diagnosis.icdCode || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ICD Description</div>
                      <div className="text-sm font-medium text-gray-900">{diagnosis.icdDescription || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Procedures Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">Procedures Information</h4>
            <div className="space-y-3">
              {formData.procedures.map((procedure, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Procedure {index + 1}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Procedure Code Description</div>
                      <div className="text-sm font-medium text-gray-900">{procedure.codeDescription || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Procedure Code (CPT / HCPCS)</div>
                      <div className="text-sm font-medium text-gray-900">{procedure.code || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Service Quantity</div>
                      <div className="text-sm font-medium text-gray-900">{procedure.serviceQuantity}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Service Quantity Type</div>
                      <div className="text-sm font-medium text-gray-900">{procedure.serviceQuantityType}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.providerNotes && (
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-1">Provider Notes</div>
                <div className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{formData.providerNotes}</div>
              </div>
            )}

            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">From Date</div>
              <div className="text-sm font-medium text-gray-900">
                {formData.fromDate ? new Date(formData.fromDate).toLocaleDateString('en-US') : 'Not specified'}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">Attachments</h4>
            {formData.attachments && formData.attachments.length > 0 ? (
              <div className="space-y-2">
                {formData.attachments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.url && (
                        <button
                          onClick={() => window.open(doc.url, '_blank')}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        doc.status === 'Retrieved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No attachments added</p>
            )}
          </div>

          {/* Payer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Submission Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Payer Name</div>
                <div className="text-sm font-medium text-gray-900">{orderData.payer.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Plan Name</div>
                <div className="text-sm font-medium text-gray-900">{orderData.payer.planName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Submission Date</div>
                <div className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('en-US')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back to Edit
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Submit Authorization Request
          </button>
        </div>
      </div>
    </div>
  )
}
