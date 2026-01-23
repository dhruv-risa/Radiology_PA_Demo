import { useNavigate, useParams } from 'react-router-dom'
import { getOrderByMRN } from '../../../utils/patientDataHelpers'
import { useState, useEffect } from 'react'

interface AuthCase {
  id: string
  radioButtonStatus: string
  title: string
  details: string
  status: 'Completed' | 'Pending' | 'In Progress'
}

interface BusinessOfficeEntry {
  date: string
  detailsText: string
  authCases: AuthCase[]
}

interface OncoEMRNote {
  patientMRN: string
  patientName: string
  dateOfService: string
  insurance: string
  authDetails: string
  boValue: string
  authCases: {
    radioButtonStatus: string
    title: string
    details: string
    status: string
  }[]
  timestamp: string
}

export default function BusinessOffice() {
  const navigate = useNavigate()
  const { id } = useParams()
  const orderData = getOrderByMRN(id!)
  const [entries, setEntries] = useState<BusinessOfficeEntry[]>([])
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false)
  const [triggerSuccess, setTriggerSuccess] = useState(false)

  useEffect(() => {
    if (orderData) {
      // Load business office data from orderData or localStorage
      const savedData = localStorage.getItem(`bo-notes-${orderData.orderId}`)

      if (savedData) {
        setEntries(JSON.parse(savedData))
      } else if (orderData.businessOffice?.entries) {
        setEntries(orderData.businessOffice.entries)
      } else {
        // Default empty entries if no data exists
        setEntries([
          {
            date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
            detailsText: `Details: Date: ${new Date().toLocaleDateString('en-US')}, Initials: , As per Insurance ${orderData.payer.name}- ${orderData.payer.status} (${new Date(orderData.payer.effectiveDate).toLocaleDateString('en-US')}),\n\nPrior Auth Questions:\n\n`,
            authCases: []
          }
        ])
      }
    }
  }, [orderData])

  if (!orderData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No order data found</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600'
      case 'In Progress':
        return 'text-blue-600'
      case 'Pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleSaveBONotes = () => {
    localStorage.setItem(`bo-notes-${orderData.orderId}`, JSON.stringify(entries))
    alert('Business Office notes saved successfully!')
  }

  const handleRefreshTemplates = () => {
    // Refresh templates from the original data
    if (orderData.businessOffice?.entries) {
      setEntries(orderData.businessOffice.entries)
      alert('Templates refreshed from original data')
    } else {
      alert('No template data available')
    }
  }

  const handleTriggerRPA = () => {
    setIsTriggerModalOpen(true)
  }

  const confirmTriggerRPA = () => {
    // Prepare the OncoEMR note data
    const oncoEMRNote: OncoEMRNote = {
      patientMRN: orderData.patient.mrn,
      patientName: orderData.patient.name,
      dateOfService: new Date(orderData.order.dateOfService).toLocaleDateString('en-US'),
      insurance: orderData.payer.name,
      authDetails: entries.map(entry => entry.detailsText).join('\n\n---\n\n'),
      boValue: entries.flatMap(entry =>
        entry.authCases.map(ac => `${ac.radioButtonStatus}: ${ac.title} - ${ac.status}`)
      ).join('; '),
      authCases: entries.flatMap(entry => entry.authCases),
      timestamp: new Date().toISOString()
    }

    // Save to localStorage to simulate sending to OncoEMR
    const allNotes = JSON.parse(localStorage.getItem('oncoemr-notes') || '[]')
    allNotes.push(oncoEMRNote)
    localStorage.setItem('oncoemr-notes', JSON.stringify(allNotes))

    // Also save to this order's specific notes
    localStorage.setItem(`oncoemr-note-${orderData.orderId}`, JSON.stringify(oncoEMRNote))

    setIsTriggerModalOpen(false)
    setTriggerSuccess(true)

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setTriggerSuccess(false)
    }, 3000)
  }

  const updateEntryDetails = (entryIndex: number, newDetails: string) => {
    const updatedEntries = [...entries]
    updatedEntries[entryIndex].detailsText = newDetails
    setEntries(updatedEntries)
  }

  const updateAuthCase = (entryIndex: number, caseIndex: number, field: keyof AuthCase, value: string) => {
    const updatedEntries = [...entries]
    updatedEntries[entryIndex].authCases[caseIndex] = {
      ...updatedEntries[entryIndex].authCases[caseIndex],
      [field]: value
    }
    setEntries(updatedEntries)
  }

  const addNewAuthCase = (entryIndex: number) => {
    const updatedEntries = [...entries]
    const newCase: AuthCase = {
      id: Date.now().toString(),
      radioButtonStatus: 'AuthMate-Pending',
      title: 'Authmate Case',
      details: '',
      status: 'Pending'
    }
    updatedEntries[entryIndex].authCases.push(newCase)
    setEntries(updatedEntries)
  }

  const deleteAuthCase = (entryIndex: number, caseIndex: number) => {
    const updatedEntries = [...entries]
    updatedEntries[entryIndex].authCases.splice(caseIndex, 1)
    setEntries(updatedEntries)
  }

  const addNewEntry = () => {
    const newEntry: BusinessOfficeEntry = {
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      detailsText: '',
      authCases: []
    }
    setEntries([newEntry, ...entries])
  }

  const hasIssues = orderData?.paStatus.automationStatus === 'Blocked'

  // Check if case is marked as complete
  const isMarkedComplete = localStorage.getItem(`case-complete-${orderData.orderId}`) === 'true'

  // Check if PA has been filed (either via paFiled flag or localStorage submission)
  const isPAFiled = orderData.paStatus.paFiled || localStorage.getItem(`pa-submission-${orderData.orderId}`) !== null

  const handleMarkComplete = () => {
    localStorage.setItem(`case-complete-${orderData.orderId}`, 'true')
    navigate('/')
  }

  return (
    <div className="pb-24">
      {/* Success Alert */}
      {triggerSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Success!</p>
            <p className="text-sm">Notes sent to OncoEMR successfully</p>
          </div>
        </div>
      )}

      {/* Trigger Modal */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Trigger RPA to OncoEMR</h3>
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  The following information will be sent to OncoEMR as a note:
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-gray-700">Patient:</span>
                  <span className="text-sm text-gray-900 ml-2">{orderData.patient.name} (MRN: {orderData.patient.mrn})</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Insurance:</span>
                  <span className="text-sm text-gray-900 ml-2">{orderData.payer.name}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Date of Service:</span>
                  <span className="text-sm text-gray-900 ml-2">{new Date(orderData.order.dateOfService).toLocaleDateString('en-US')}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Auth Details:</p>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-900 whitespace-pre-wrap font-mono">
                    {entries.map(entry => entry.detailsText).join('\n\n---\n\n')}
                  </pre>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">BO Values (Radio Button Statuses):</p>
                <div className="bg-gray-50 rounded p-3 space-y-2">
                  {entries.flatMap((entry, entryIdx) =>
                    entry.authCases.map((ac, caseIdx) => (
                      <div key={`${entryIdx}-${caseIdx}`} className="text-xs">
                        <span className="font-semibold text-gray-900">{ac.radioButtonStatus}</span>
                        <span className="text-gray-600"> - {ac.title} ({ac.status})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="px-6 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmTriggerRPA}
                className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
              >
                Confirm & Send to OncoEMR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={addNewEntry}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Entry
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshTemplates}
            className="px-4 py-2 text-sm text-blue-600 hover:underline font-medium"
          >
            Refresh Templates
          </button>
          <button
            onClick={handleSaveBONotes}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Save BO Notes
          </button>
          <button
            onClick={handleTriggerRPA}
            className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 border border-black"
          >
            Trigger RPA
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="space-y-8">
        {entries.map((entry, entryIndex) => (
          <div key={entryIndex}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">{entry.date}</h3>
              <button
                onClick={() => addNewAuthCase(entryIndex)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Auth Case
              </button>
            </div>
            <div className="grid grid-cols-12 gap-4">
              {/* Left side - Details text area */}
              <div className="col-span-5">
                <textarea
                  value={entry.detailsText}
                  onChange={(e) => updateEntryDetails(entryIndex, e.target.value)}
                  className="w-full h-64 p-4 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter authorization details..."
                />
              </div>

              {/* Right side - Auth cases */}
              <div className="col-span-7 space-y-4">
                {entry.authCases.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-sm text-gray-600 italic">No auth cases for this date</p>
                    <button
                      onClick={() => addNewAuthCase(entryIndex)}
                      className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add First Auth Case
                    </button>
                  </div>
                ) : (
                  entry.authCases.map((authCase, caseIndex) => (
                    <div key={authCase.id} className="bg-white border border-gray-200 rounded-lg p-4 relative">
                      {/* Delete button */}
                      <button
                        onClick={() => deleteAuthCase(entryIndex, caseIndex)}
                        className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete auth case"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Radio Button and Status */}
                      <div className="flex items-center justify-between mb-3 pr-8">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Radio Button :</span>
                          <select
                            value={authCase.radioButtonStatus}
                            onChange={(e) => updateAuthCase(entryIndex, caseIndex, 'radioButtonStatus', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option>AuthMate-Pending</option>
                            <option>POD - Verify</option>
                            <option>Approved</option>
                            <option>Denied</option>
                            <option>Auth on File</option>
                            <option>NAR</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={authCase.status}
                            onChange={(e) => updateAuthCase(entryIndex, caseIndex, 'status', e.target.value as AuthCase['status'])}
                            className={`text-sm font-medium ${getStatusColor(authCase.status)} border-none bg-transparent`}
                          >
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Case Title */}
                      <input
                        type="text"
                        value={authCase.title}
                        onChange={(e) => updateAuthCase(entryIndex, caseIndex, 'title', e.target.value)}
                        className="w-full text-sm font-semibold mb-2 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* Case Details */}
                      <textarea
                        value={authCase.details}
                        onChange={(e) => updateAuthCase(entryIndex, caseIndex, 'details', e.target.value)}
                        className="w-full text-sm text-gray-700 leading-relaxed border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={4}
                        placeholder="Enter case details..."
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Divider between entries */}
            {entryIndex < entries.length - 1 && (
              <div className="border-t border-gray-200 mt-8"></div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
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
                className="px-6 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                View Issues
              </button>
            )}
            {['Auth Required', 'PA Ordered'].includes(orderData.paStatus.authStatus) && !isPAFiled && (
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
            {(orderData.paStatus.authStatus === 'PA Submitted' || isPAFiled) && (
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
