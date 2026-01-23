import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const orderData = getOrderByMRN(id!)
  const [entries, setEntries] = useState<BusinessOfficeEntry[]>([])
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false)
  const [triggerSuccess, setTriggerSuccess] = useState(false)

  // Check for triggerRPA query parameter and auto-trigger the modal
  useEffect(() => {
    const shouldTrigger = searchParams.get('triggerRPA')
    if (shouldTrigger === 'true') {
      // Remove the parameter from URL
      setSearchParams({})
      // Trigger the modal after a brief delay to ensure page is loaded
      setTimeout(() => {
        setIsTriggerModalOpen(true)
      }, 300)
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (orderData) {
      // Clear localStorage to see fresh changes
      localStorage.removeItem(`bo-notes-${orderData.orderId}`)

      // Load business office data from orderData
      if (orderData.businessOffice?.entries) {
        // Transform existing data to new format
        const transformedEntries = orderData.businessOffice.entries.map(entry => {
          const isNAR = orderData.paStatus.authStatus === 'NAR'
          const dos = new Date(orderData.order.dateOfService).toLocaleDateString('en-US')

          // Extract basic info for left box (without Initials)
          const basicInfo = isNAR
            ? `Date: ${entry.date}\nDOS: ${dos}\n\nRequired Auth`
            : `Date: ${entry.date}\nDOS: ${dos}`

          // Extract major info - what happened and when
          const detailsText = entry.detailsText || ''
          let majorInfo = ''

          // Build major info showing what happened and when
          if (detailsText.includes('As per Insurance')) {
            // Extract insurance info and events
            const lines = detailsText.split('\n')
            const relevantLines = lines.filter(line =>
              line.includes('As per Insurance') ||
              line.includes('Auth status') ||
              line.includes('Verified') ||
              line.includes(entry.date.split('/')[1] + '/') // Find lines with dates
            )
            majorInfo = relevantLines.join('\n')
          } else {
            // Default for NAR cases
            majorInfo = `As per Insurance ${orderData.payer.name} - ${orderData.payer.status} (${new Date(orderData.payer.effectiveDate).toLocaleDateString('en-US')})\nAuth status: NAR - No Authorization Required per payer guidelines\nVerified with insurance: routine screening does not require PA\n\n${entry.date} Verified NAR status with insurance, case cleared for scheduling`
          }

          // Remove "Prior Auth Questions" section if it exists
          majorInfo = majorInfo.replace(/Prior Auth Questions:[\s\S]*?(?=\n\n|$)/g, '').trim()

          return {
            date: entry.date,
            detailsText: basicInfo,
            authCases: entry.authCases.length > 0 ? [{
              ...entry.authCases[0],
              details: majorInfo,
              status: entry.authCases[0].status as 'Completed' | 'Pending' | 'In Progress'
            }] : [{
              id: '1',
              radioButtonStatus: 'Required',
              title: 'Authorization',
              details: majorInfo,
              status: 'Pending' as const
            }]
          }
        })
        setEntries(transformedEntries)
      } else {
        // Default empty entries if no data exists
        const isNAR = orderData.paStatus.authStatus === 'NAR'
        const dos = new Date(orderData.order.dateOfService).toLocaleDateString('en-US')
        const today = new Date().toLocaleDateString('en-US')

        const basicInfo = isNAR
          ? `Date: ${today}\nDOS: ${dos}\n\nRequired Auth`
          : `Date: ${today}\nDOS: ${dos}`

        const majorDetails = `As per Insurance ${orderData.payer.name} - ${orderData.payer.status} (${new Date(orderData.payer.effectiveDate).toLocaleDateString('en-US')})\nAuth status: NAR - No Authorization Required per payer guidelines\nVerified with insurance: routine screening does not require PA\n\n${today} Verified NAR status with insurance, case cleared for scheduling`

        setEntries([
          {
            date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
            detailsText: basicInfo,
            authCases: [{
              id: '1',
              radioButtonStatus: 'Required',
              title: 'Authorization',
              details: majorDetails,
              status: 'Pending'
            }]
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

  const hasIssues = orderData?.paStatus.AutomationWorkflow === 'Blocked'

  // Check if case is marked as complete
  const isMarkedComplete = localStorage.getItem(`case-complete-${orderData.orderId}`) === 'true'

  // Check if PA has been filed (either via paFiled flag or localStorage submission)
  const isPAFiled = orderData.paStatus.paFiled || localStorage.getItem(`pa-submission-${orderData.orderId}`) !== null

  const handleMarkComplete = () => {
    localStorage.setItem(`case-complete-${orderData.orderId}`, 'true')
    navigate('/')
  }

  const updateEntryDetails = (entryIndex: number, newDetails: string) => {
    const updatedEntries = [...entries]
    updatedEntries[entryIndex].detailsText = newDetails
    setEntries(updatedEntries)
  }

  const updateAuthCase = (entryIndex: number, field: keyof AuthCase, value: string) => {
    const updatedEntries = [...entries]
    if (updatedEntries[entryIndex].authCases[0]) {
      updatedEntries[entryIndex].authCases[0] = {
        ...updatedEntries[entryIndex].authCases[0],
        [field]: value
      }
      setEntries(updatedEntries)
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

    // Save RPA trigger status for Issues tab to display confirmation
    localStorage.setItem(`rpa-triggered-${orderData.orderId}`, JSON.stringify({
      timestamp: new Date().toISOString(),
      providerName: orderData.order.orderingProvider.name,
      providerNPI: orderData.order.orderingProvider.npi
    }))

    setIsTriggerModalOpen(false)
    setTriggerSuccess(true)

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setTriggerSuccess(false)
    }, 3000)
  }

  // Get the single auth case to display (priority: Denied > Approved > Pending)
  const getSingleAuthCase = (entry: BusinessOfficeEntry): AuthCase | null => {
    if (!entry.authCases || entry.authCases.length === 0) return null

    // Check for Denied
    const denied = entry.authCases.find(ac => ac.radioButtonStatus === 'Denied')
    if (denied) return denied

    // Check for Approved
    const approved = entry.authCases.find(ac => ac.radioButtonStatus === 'Approved')
    if (approved) return approved

    // Return first case (usually pending)
    return entry.authCases[0]
  }

  return (
    <div className="pb-24">
      {/* Main Content Section */}
      <div className="space-y-8">
        {entries.map((entry, entryIndex) => {
          const singleAuthCase = getSingleAuthCase(entry)

          return (
            <div key={entryIndex}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">{entry.date}</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {/* Left side - Basic Info (1/4 space) */}
                <div className="col-span-1 w-full">
                  <textarea
                    value={entry.detailsText}
                    onChange={(e) => updateEntryDetails(entryIndex, e.target.value)}
                    className="w-full h-64 p-4 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Date:
DOS:"
                  />
                </div>

                {/* Right side - Major Event Details (3/4 space) */}
                <div className="col-span-3 w-full">
                  {singleAuthCase ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 h-64 flex flex-col">
                      {/* Radio Button and Eye Icon */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Radio Button:</span>
                          <select
                            value={singleAuthCase.radioButtonStatus}
                            onChange={(e) => updateAuthCase(entryIndex, 'radioButtonStatus', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option>Required</option>
                            <option>Approved</option>
                            <option>Denied</option>
                            <option>Pending</option>
                            <option>Auth Issue</option>
                          </select>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>

                      {/* Case Details - What happened and when */}
                      <textarea
                        value={singleAuthCase.details}
                        onChange={(e) => updateAuthCase(entryIndex, 'details', e.target.value)}
                        className="flex-1 w-full text-sm text-gray-700 leading-relaxed border border-gray-200 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3 bg-gray-50"
                        placeholder="What happened and when..."
                      />

                      {/* Trigger RPA Button - Right aligned and consistent size */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleTriggerRPA}
                          className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
                        >
                          Trigger RPA
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center h-64">
                      <p className="text-sm text-gray-600 italic">No auth case for this date</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider between entries */}
              {entryIndex < entries.length - 1 && (
                <div className="border-t border-gray-200 mt-8"></div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex justify-end gap-3 z-20">
        <div className="flex gap-3">
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
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
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview of Comments:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {entries.map((entry, idx) => {
                    const authCase = getSingleAuthCase(entry)
                    return (
                      <div key={idx} className="mb-4 last:mb-0">
                        <div className="mb-3 pb-3 border-b border-gray-300">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Basic Information:</p>
                          <pre className="text-xs text-gray-900 whitespace-pre-wrap">{entry.detailsText}</pre>
                        </div>
                        {authCase && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Radio Button: {authCase.radioButtonStatus}</p>
                            <p className="text-xs font-semibold text-gray-600 mb-2">Details:</p>
                            <div className="bg-white border border-gray-200 rounded p-3 max-h-48 overflow-y-auto">
                              <pre className="text-xs text-gray-900 whitespace-pre-wrap leading-relaxed">
                                {authCase.details}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
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
    </div>
  )
}
