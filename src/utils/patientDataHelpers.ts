import patientsData from '../data/patientsData.json'

export interface RadiologyPAOrder {
  orderId: string
  patient: PatientInfo
  order: OrderDetails
  payer: PayerInfo
  eligibilityVerification: EligibilityVerification
  paStatus: PAStatus
  documents?: Document[]
  businessOffice?: BusinessOffice
}

export interface Document {
  id: string
  name: string
  type: string
  fetchedDate: string
  source: string
  status: string
  url?: string
}

export interface PatientInfo {
  name: string
  mrn: string
  dob: string
  memberId: string
}

export interface OrderDetails {
  imagingType: string
  imagingModality: string
  cptCodes: string[]
  diagnosisCodes?: string[]
  dateOfService: string
  orderingProvider: OrderingProvider
}

export interface OrderingProvider {
  name: string
  npi: string
  networkStatus: string
}

export interface PayerInfo {
  name: string
  planName: string
  planType: string
  status: string
  effectiveDate: string
  endDate: string
}

export interface EligibilityVerification {
  serviceTypeCode: string
  covered: boolean
  priorAuthRequired: boolean
  referralRequired: boolean
  financials: Financials
}

export interface Financials {
  deductible: { total: number; used: number }
  outOfPocket: { total: number; used: number }
  copay: number
  coinsurance: string
}

export interface PAStatus {
  authStatus: string
  automationStatus: string
  issueType?: string
  paFiled?: boolean
}

export interface AuthCase {
  id: string
  radioButtonStatus: string
  title: string
  details: string
  status: 'Completed' | 'Pending' | 'In Progress'
}

export interface BusinessOfficeEntry {
  date: string
  detailsText: string
  authCases: AuthCase[]
}

export interface BusinessOffice {
  entries: BusinessOfficeEntry[]
}

/**
 * Get all radiology PA orders (with localStorage updates applied)
 */
export const getAllOrders = (): RadiologyPAOrder[] => {
  const orders = patientsData.radiologyPAOrders as RadiologyPAOrder[]

  // Update orders with localStorage data if available
  return orders.map(order => {
    const savedSubmission = localStorage.getItem(`pa-submission-${order.orderId}`)
    if (savedSubmission) {
      const submissionData = JSON.parse(savedSubmission)
      return {
        ...order,
        paStatus: {
          ...order.paStatus,
          authStatus: 'Auth Required',
          automationStatus: 'In Progress',
          paFiled: true
        },
        documents: submissionData.formData?.attachments || order.documents
      }
    }
    return order
  })
}

/**
 * Get an order by MRN
 */
export const getOrderByMRN = (mrn: string): RadiologyPAOrder | undefined => {
  return getAllOrders().find(order => order.patient.mrn === mrn)
}

/**
 * Get an order by Order ID
 */
export const getOrderById = (orderId: string): RadiologyPAOrder | undefined => {
  return getAllOrders().find(order => order.orderId === orderId)
}

/**
 * Get eligibility verification data for an order by MRN
 */
export const getEligibilityVerificationByMRN = (mrn: string): EligibilityVerification | undefined => {
  const order = getOrderByMRN(mrn)
  return order?.eligibilityVerification
}

/**
 * Get eligibility verification data for an order by Order ID
 */
export const getEligibilityVerificationByOrderId = (orderId: string): EligibilityVerification | undefined => {
  const order = getOrderById(orderId)
  return order?.eligibilityVerification
}

/**
 * Get all orders formatted for the PA Orders table
 */
export const getAllOrdersForTable = () => {
  return getAllOrders().map(order => ({
    orderId: order.orderId,
    patientName: order.patient.name,
    mrn: order.patient.mrn,
    imagingType: order.order.imagingType,
    cptCodes: order.order.cptCodes,
    payer: order.payer.name,
    dateOfService: order.order.dateOfService,
    authStatus: order.paStatus.authStatus,
    automationStatus: order.paStatus.automationStatus,
    action: 'View'
  }))
}
