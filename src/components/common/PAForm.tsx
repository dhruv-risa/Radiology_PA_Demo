import { useState, useRef, useEffect } from 'react'
import { RadiologyPAOrder, Document } from '../../utils/patientDataHelpers'

export interface PAFormData {
  diagnoses: Array<{ icdCode: string; icdDescription: string }>
  procedures: Array<{ codeDescription: string; code: string; serviceQuantity: string; serviceQuantityType: string }>
  providerNotes: string
  fromDate: string
  attachments: Document[]
}

interface PAFormProps {
  isOpen: boolean
  onClose: () => void
  onContinue: (formData: PAFormData) => void
  orderData: RadiologyPAOrder
}

interface DiagnosisEntry {
  icdCode: string
  icdDescription: string
}

interface ProcedureEntry {
  codeDescription: string
  code: string
  serviceQuantity: string
  serviceQuantityType: string
}

type Section = 'patient' | 'provider' | 'diagnosis' | 'procedures' | 'attachments'

export default function PAForm({ isOpen, onClose, onContinue, orderData }: PAFormProps) {
  const [currentSection, setCurrentSection] = useState<Section>('patient')

  // Pre-fill diagnoses with data from orderData or dummy data
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>(() => {
    if (orderData.order.diagnosisCodes && orderData.order.diagnosisCodes.length > 0) {
      return orderData.order.diagnosisCodes.map(code => ({
        icdCode: code,
        icdDescription: `Description for ${code}`
      }))
    }
    return [{ icdCode: 'G43.909', icdDescription: 'Migraine, unspecified, not intractable, without status migrainosus' }]
  })

  // Pre-fill procedures with data from orderData
  const [procedures, setProcedures] = useState<ProcedureEntry[]>(() => {
    if (orderData.order.cptCodes && orderData.order.cptCodes.length > 0) {
      return orderData.order.cptCodes.map(code => ({
        codeDescription: orderData.order.imagingType,
        code: code,
        serviceQuantity: '1',
        serviceQuantityType: 'Units'
      }))
    }
    return [{ codeDescription: '', code: '', serviceQuantity: '365', serviceQuantityType: 'Days' }]
  })

  const [providerNotes, setProviderNotes] = useState('Patient presents with chronic symptoms requiring advanced imaging for proper diagnosis and treatment planning. Clinical documentation supports medical necessity.')
  const [fromDate, setFromDate] = useState(orderData.order.dateOfService || new Date().toISOString().split('T')[0])
  const [attachments, setAttachments] = useState<Document[]>(orderData.documents || [])

  const sectionRefs = useRef<Record<Section, HTMLDivElement | null>>({
    patient: null,
    provider: null,
    diagnosis: null,
    procedures: null,
    attachments: null
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const scrollToSection = (section: Section) => {
    setCurrentSection(section)
    sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, { icdCode: '', icdDescription: '' }])
  }

  const removeDiagnosis = (index: number) => {
    if (diagnoses.length > 1) {
      setDiagnoses(diagnoses.filter((_, i) => i !== index))
    }
  }

  const updateDiagnosis = (index: number, field: keyof DiagnosisEntry, value: string) => {
    const updated = [...diagnoses]
    updated[index][field] = value
    setDiagnoses(updated)
  }

  const addProcedure = () => {
    setProcedures([...procedures, { codeDescription: '', code: '', serviceQuantity: '365', serviceQuantityType: 'Days' }])
  }

  const removeProcedure = (index: number) => {
    if (procedures.length > 1) {
      setProcedures(procedures.filter((_, i) => i !== index))
    }
  }

  const updateProcedure = (index: number, field: keyof ProcedureEntry, value: string) => {
    const updated = [...procedures]
    updated[index][field] = value
    setProcedures(updated)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newAttachments: Document[] = Array.from(files).map((file) => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type || 'Document',
      fetchedDate: new Date().toISOString(),
      source: 'Manual Upload',
      status: 'Retrieved',
      url: URL.createObjectURL(file)
    }))

    setAttachments([...attachments, ...newAttachments])
    // Reset the input
    event.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const viewDocument = (doc: Document) => {
    if (doc.url) {
      window.open(doc.url, '_blank')
    }
  }

  const handleContinue = () => {
    const formData: PAFormData = {
      diagnoses,
      procedures,
      providerNotes,
      fromDate,
      attachments
    }
    onContinue(formData)
  }

  const getSectionStatus = (section: Section): 'active' | 'default' => {
    return currentSection === section ? 'active' : 'default'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {orderData.patient.name.toUpperCase()} ({orderData.patient.mrn})
              </h1>
              <span className="inline-block mt-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                Continuation of care
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r flex-shrink-0 pt-24 overflow-y-auto">
            <nav className="px-4 py-4 space-y-1">
              <button
                onClick={() => scrollToSection('patient')}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  getSectionStatus('patient') === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Patient Details
              </button>
              <button
                onClick={() => scrollToSection('provider')}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  getSectionStatus('provider') === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Provider Details
              </button>
              <button
                onClick={() => scrollToSection('diagnosis')}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  getSectionStatus('diagnosis') === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Diagnosis Information
              </button>
              <button
                onClick={() => scrollToSection('procedures')}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  getSectionStatus('procedures') === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Procedures Information
              </button>
              <button
                onClick={() => scrollToSection('attachments')}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  getSectionStatus('attachments') === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Attachments
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto pt-24 pb-24">
            <div className="px-8 py-6">
              {/* Aetna Header */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-4 mb-6">
                <h2 className="text-lg font-bold text-gray-900">Aetna Patient Information Form</h2>
              </div>

              {/* Patient Details Section */}
              <div ref={(el) => (sectionRefs.current.patient = el)} className="mb-8">
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Patient Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member ID
                      </label>
                      <input
                        type="text"
                        defaultValue={orderData.patient.memberId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship to Subscriber
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Self</option>
                        <option>Spouse</option>
                        <option>Child</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={orderData.patient.name.split(' ')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={orderData.patient.name.split(' ').slice(1).join(' ')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        defaultValue={orderData.patient.dob}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Details Section */}
              <div ref={(el) => (sectionRefs.current.provider = el)} className="mb-8">
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Provider Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider First Name
                      </label>
                      <input
                        type="text"
                        defaultValue={orderData.order.orderingProvider.name.split(' ')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue={orderData.order.orderingProvider.name.split(' ').slice(1).join(' ')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NPI Number
                    </label>
                    <input
                      type="text"
                      defaultValue={orderData.order.orderingProvider.npi}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place Of Service
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>11 - Office</option>
                      <option>21 - Inpatient Hospital</option>
                      <option>22 - Outpatient Hospital</option>
                      <option>23 - Emergency Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facility NPI
                    </label>
                    <input
                      type="text"
                      placeholder="1326046467"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis Information Section */}
              <div ref={(el) => (sectionRefs.current.diagnosis = el)} className="mb-8">
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Diagnosis Information
                </h3>
                <div className="space-y-4">
                  {diagnoses.map((diagnosis, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Diagnosis</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ICD Code <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={diagnosis.icdCode}
                              onChange={(e) => updateDiagnosis(index, 'icdCode', e.target.value)}
                              placeholder="Enter text to search..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <svg
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ICD Description
                          </label>
                          <input
                            type="text"
                            value={diagnosis.icdDescription}
                            onChange={(e) => updateDiagnosis(index, 'icdDescription', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            readOnly
                          />
                        </div>
                      </div>
                      {diagnoses.length > 1 && (
                        <button
                          onClick={() => removeDiagnosis(index)}
                          className="absolute top-4 right-4 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addDiagnosis}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add more
                  </button>
                </div>
              </div>

              {/* Procedures Information Section */}
              <div ref={(el) => (sectionRefs.current.procedures = el)} className="mb-8">
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Procedures Information
                </h3>
                <div className="space-y-4">
                  {procedures.map((procedure, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Procedure</div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Procedure Code Description <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={procedure.codeDescription}
                              onChange={(e) => updateProcedure(index, 'codeDescription', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Procedure Code (CPT / HCPCS) <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={procedure.code}
                              onChange={(e) => updateProcedure(index, 'code', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Procedure Service Quantity
                            </label>
                            <input
                              type="text"
                              value={procedure.serviceQuantity}
                              onChange={(e) => updateProcedure(index, 'serviceQuantity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Procedure Service Quantity Type
                            </label>
                            <select
                              value={procedure.serviceQuantityType}
                              onChange={(e) => updateProcedure(index, 'serviceQuantityType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option>Days</option>
                              <option>Visits</option>
                              <option>Units</option>
                              <option>Hours</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      {procedures.length > 1 && (
                        <button
                          onClick={() => removeProcedure(index)}
                          className="absolute top-4 right-4 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addProcedure}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add more
                  </button>
                </div>

                {/* Provider Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Notes
                  </label>
                  <textarea
                    value={providerNotes}
                    onChange={(e) => setProviderNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* From Date */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div ref={(el) => (sectionRefs.current.attachments = el)} className="mb-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200 flex items-center justify-between">
                  Attachments
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Attachment
                  </button>
                </h3>
                <div className="space-y-3">
                  {attachments.map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 group relative">
                      <div className="flex items-center gap-3 flex-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          <div className="text-xs text-gray-500">{doc.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.url && (
                          <button
                            onClick={() => viewDocument(doc)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        )}
                        <button
                          onClick={() => removeAttachment(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {attachments.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500 mb-2">No attachments added</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first attachment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-8 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
