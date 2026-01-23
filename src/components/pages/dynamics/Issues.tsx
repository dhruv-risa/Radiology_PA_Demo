import { useNavigate, useParams } from 'react-router-dom'
import { getOrderByMRN } from '../../../utils/patientDataHelpers'
import { useState, useEffect } from 'react'

interface ProcessingRequest {
  type: 'upload' | 'request'
  timestamp: string
  fileName?: string
  fileSize?: number
  fileType?: string
}

export default function Issues() {
  const navigate = useNavigate()
  const { id } = useParams()
  const orderData = getOrderByMRN(id!)

  // State for modals
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showUploadReviewModal, setShowUploadReviewModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // State for tracking request submission
  const [processingRequest, setProcessingRequest] = useState<ProcessingRequest | null>(null)

  // State for RPA trigger confirmation
  const [rpaTriggered, setRpaTriggered] = useState<{
    timestamp: string
    providerName: string
    providerNPI: string
  } | null>(null)

  // Load processing request from localStorage on mount
  useEffect(() => {
    const storageKey = `processing_request_${id}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setProcessingRequest(data)
      } catch (error) {
        console.error('Failed to parse processing request from localStorage', error)
      }
    }
  }, [id])

  // Load RPA trigger status from localStorage
  useEffect(() => {
    if (orderData) {
      const rpaStorageKey = `rpa-triggered-${orderData.orderId}`
      const rpaStored = localStorage.getItem(rpaStorageKey)
      if (rpaStored) {
        try {
          const data = JSON.parse(rpaStored)
          setRpaTriggered(data)
        } catch (error) {
          console.error('Failed to parse RPA trigger status from localStorage', error)
        }
      }
    }
  }, [orderData])

  // Save processing request to localStorage
  const saveProcessingRequest = (request: ProcessingRequest) => {
    const storageKey = `processing_request_${id}`
    localStorage.setItem(storageKey, JSON.stringify(request))
    setProcessingRequest(request)
  }

  // Clear processing request from localStorage
  const clearProcessingRequest = () => {
    const storageKey = `processing_request_${id}`
    localStorage.removeItem(storageKey)
    setProcessingRequest(null)
  }

  // Clear RPA trigger status from localStorage
  const clearRpaTriggered = () => {
    if (orderData) {
      const rpaStorageKey = `rpa-triggered-${orderData.orderId}`
      localStorage.removeItem(rpaStorageKey)
      setRpaTriggered(null)
    }
  }

  if (!orderData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No order data found</p>
      </div>
    )
  }

  const { paStatus, documents } = orderData

  const getIssueDetails = () => {
    const authStatus = paStatus.authStatus
    const AutomationWorkflow = paStatus.AutomationWorkflow
    const issueType = paStatus.issueType || authStatus

    if (issueType === 'Clinical Missing' || authStatus === 'Clinical Missing') {
      return {
        title: 'Required Clinical Documentation Missing',
        severity: 'Blocking',
        severityColor: 'red',
        icon: '📋',
        impact: 'Authorization cannot be submitted',
        explanation: 'Required clinical documentation was not found in the patient record during the automated document retrieval process.',
        resolution: [
          'Upload the latest clinical notes from the ordering provider',
          'Ensure the documentation includes the medical necessity justification for the imaging study'
        ]
      }
    }

    if (issueType === 'Supporting Imaging Missing' || authStatus === 'Supporting Imaging Missing') {
      const missingDocs = documents?.filter(doc => doc.status === 'Not Available') || []
      const missingTypes = missingDocs.map(doc => doc.type).join(', ')

      return {
        title: 'Supporting Imaging Documentation Missing',
        severity: 'Blocking',
        severityColor: 'red',
        icon: '🔍',
        impact: 'Authorization cannot be submitted',
        explanation: `Supporting imaging studies required by payer policy were not found. Missing documents include: ${missingTypes || 'prior imaging reports'}.`,
        resolution: [
          'Upload relevant prior imaging reports (X-ray, Ultrasound, CT, or MRI)',
          'Verify that the imaging is relevant to the current clinical indication'
        ]
      }
    }

    if (issueType === 'Invalid Dx Code' || authStatus === 'Invalid Dx Code') {
      return {
        title: 'Diagnosis Code Does Not Meet Requirements',
        severity: 'Blocking',
        severityColor: 'red',
        icon: '⚠️',
        impact: 'Authorization cannot be submitted',
        explanation: 'The diagnosis code provided does not meet payer medical necessity criteria for the requested imaging study.',
        resolution: [
          'Review and update the diagnosis code in the order to align with clinical documentation',
          'Ensure the diagnosis code matches the medical necessity for the imaging type'
        ]
      }
    }

    if (authStatus === 'Eligibility Failed') {
      return {
        title: 'Patient Eligibility Verification Failed',
        severity: 'Blocking',
        severityColor: 'red',
        icon: '❌',
        impact: 'Authorization cannot be processed',
        explanation: 'Patient eligibility could not be verified with the payer. This may be due to inactive coverage, incorrect member information, or payer system unavailability.',
        resolution: [
          'Verify patient insurance information and member ID',
          'Contact the payer to confirm active coverage for the date of service'
        ]
      }
    }

    if (AutomationWorkflow === 'Blocked' || authStatus === 'Query') {
      return {
        title: issueType ? `Issue Detected: ${issueType}` : 'Automation Workflow Blocked',
        severity: 'Blocking',
        severityColor: 'red',
        icon: '🛑',
        impact: 'Authorization workflow cannot continue',
        explanation: issueType
          ? `The authorization process has been blocked due to: ${issueType}. This issue must be resolved before proceeding with the authorization submission.`
          : 'The automated prior authorization workflow has been paused due to a blocking issue that requires manual review.',
        resolution: [
          'Review the order details and documentation for completeness',
          'Upload or request any missing documentation needed for authorization'
        ]
      }
    }

    return null
  }

  const issueDetails = getIssueDetails()

  if (!issueDetails) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No issues found</p>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Alert Banner */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">{issueDetails.title}</h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Impact:</span> {issueDetails.impact}
          </p>
        </div>

        {/* Issue Explanation Card */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">What Happened</h3>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              {issueDetails.explanation}
            </p>
          </div>
        </div>

        {/* Resolution Steps Card */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Required Actions to Resolve</h3>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              {issueDetails.resolution.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>

            {/* Show Upload and Request buttons for all blocked issues - hide if any request is processed */}
            {(paStatus.AutomationWorkflow === 'Blocked' || paStatus.authStatus === 'Query') && !processingRequest && !rpaTriggered && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded hover:bg-gray-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Relevant Document
                  </button>
                  <button
                    onClick={() => navigate(`/patient/${id}/dynamics/business-office?triggerRPA=true`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Request Relevant Document
                  </button>
                </div>
              </div>
            )}

            {/* Show status after document has been uploaded */}
            {(paStatus.AutomationWorkflow === 'Blocked' || paStatus.authStatus === 'Query') && processingRequest && processingRequest.type === 'upload' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        Document Uploaded Successfully
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Your document has been uploaded and is being reviewed by the authorization team.
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted on {new Date(processingRequest.timestamp).toLocaleString('en-US')}
                      </p>
                    </div>
                  </div>

                  {/* Document Preview for Upload */}
                  {processingRequest.fileName && (
                    <div className="border border-gray-200 rounded-lg p-4 mt-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Document</h5>
                      <div className="space-y-2">
                        <div className="flex text-sm">
                          <span className="text-gray-600 w-28">File Name:</span>
                          <span className="font-medium text-gray-900">{processingRequest.fileName}</span>
                        </div>
                        <div className="flex text-sm">
                          <span className="text-gray-600 w-28">File Size:</span>
                          <span className="font-medium text-gray-900">
                            {processingRequest.fileSize ? (processingRequest.fileSize / 1024).toFixed(1) + ' KB' : 'N/A'}
                          </span>
                        </div>
                        <div className="flex text-sm">
                          <span className="text-gray-600 w-28">File Type:</span>
                          <span className="font-medium text-gray-900">{processingRequest.fileType || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={clearProcessingRequest}
                    className="mt-4 w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Clear Status
                  </button>
                </div>
              </div>
            )}

            {/* Show RPA trigger confirmation */}
            {(paStatus.AutomationWorkflow === 'Blocked' || paStatus.authStatus === 'Query') && rpaTriggered && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        Request Sent to OncoEMR
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Your request for additional documentation has been successfully sent to the provider via OncoEMR.
                      </p>
                      <p className="text-xs text-gray-500">
                        Sent on {new Date(rpaTriggered.timestamp).toLocaleString('en-US')}
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 mt-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Provider Information</h5>
                    <div className="space-y-2">
                      <div className="flex text-sm">
                        <span className="text-gray-600 w-32">Provider Name:</span>
                        <span className="font-medium text-gray-900">{rpaTriggered.providerName}</span>
                      </div>
                      <div className="flex text-sm">
                        <span className="text-gray-600 w-32">NPI Code:</span>
                        <span className="font-medium text-gray-900">{rpaTriggered.providerNPI}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={clearRpaTriggered}
                    className="mt-4 w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Clear Status
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex justify-end gap-3 z-20">
        <button
          onClick={() => navigate(`/patient/${id}/ev`)}
          className="px-6 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upload Relevant Document</h3>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select document to upload
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setUploadedFile(file)
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>
                {uploadedFile && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadedFile(null)
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (uploadedFile) {
                    setShowUploadModal(false)
                    setShowUploadReviewModal(true)
                  }
                }}
                disabled={!uploadedFile}
                className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Review Modal */}
      {showUploadReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Document Uploaded Successfully</h3>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">Upload Complete</p>
                      <p className="text-sm text-gray-600">Your document has been successfully uploaded.</p>
                    </div>
                  </div>
                </div>

                {uploadedFile && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Document Details</h4>
                    <div className="space-y-2">
                      <div className="flex text-sm">
                        <span className="text-gray-600 w-24">File Name:</span>
                        <span className="font-medium text-gray-900">{uploadedFile.name}</span>
                      </div>
                      <div className="flex text-sm">
                        <span className="text-gray-600 w-24">File Size:</span>
                        <span className="font-medium text-gray-900">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="flex text-sm">
                        <span className="text-gray-600 w-24">Upload Date:</span>
                        <span className="font-medium text-gray-900">{new Date().toLocaleDateString('en-US')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      Your request will be processed. The document will be reviewed by the authorization team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-lg">
              <button
                onClick={() => {
                  if (uploadedFile) {
                    saveProcessingRequest({
                      type: 'upload',
                      timestamp: new Date().toISOString(),
                      fileName: uploadedFile.name,
                      fileSize: uploadedFile.size,
                      fileType: uploadedFile.type || uploadedFile.name.split('.').pop() || 'Unknown'
                    })
                  }
                  setShowUploadReviewModal(false)
                  setUploadedFile(null)
                }}
                className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
