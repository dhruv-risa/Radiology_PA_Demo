# Implementation Example: Using Centralized Patient Data

This document shows how to use the centralized patient data structure in different screens.

## Example 1: Eligibility Verification Screen

```typescript
import { useParams } from 'react-router-dom'
import {
  getPatientByMRN,
  getEligibilityVerification,
  getPayerInfo,
  getProviderInfo
} from '../utils/patientDataHelpers'

export default function EligibilityVerification() {
  const { mrn } = useParams()

  // Get all patient data
  const patient = getPatientByMRN(mrn!)

  // Get specific sections
  const eligibility = getEligibilityVerification(mrn!)
  const payer = getPayerInfo(mrn!)
  const provider = getProviderInfo(mrn!)

  if (!patient || !eligibility) {
    return <div>No data found</div>
  }

  return (
    <div>
      {/* Patient Info */}
      <section>
        <h2>Patient Information</h2>
        <p>Name: {patient.name}</p>
        <p>MRN: {patient.mrn}</p>
        <p>DOB: {patient.dateOfBirth}</p>
      </section>

      {/* Payer Info */}
      <section>
        <h2>Insurance Information</h2>
        <p>Payer: {payer?.name}</p>
        <p>Member ID: {payer?.memberId}</p>
        <p>Plan: {payer?.planName}</p>
        <p>Status: {payer?.status}</p>
      </section>

      {/* Provider Info */}
      <section>
        <h2>Provider Information</h2>
        <p>Name: {provider?.name}</p>
        <p>NPI: {provider?.npi}</p>
      </section>

      {/* Financial Info */}
      <section>
        <h2>Financial Information</h2>

        <h3>Deductible</h3>
        <div>
          <p>Individual In-Network:</p>
          <p>Total: ${eligibility.financials.deductible.inNetworkIndividual.total}</p>
          <p>Used: ${eligibility.financials.deductible.inNetworkIndividual.used}</p>
          <p>Remaining: ${eligibility.financials.deductible.inNetworkIndividual.remaining}</p>
        </div>

        <h3>Out of Pocket</h3>
        <div>
          <p>Individual In-Network:</p>
          <p>Total: ${eligibility.financials.outOfPocket.inNetworkIndividual.total}</p>
          <p>Used: ${eligibility.financials.outOfPocket.inNetworkIndividual.used}</p>
          <p>Remaining: ${eligibility.financials.outOfPocket.inNetworkIndividual.remaining}</p>
        </div>

        <p>Copay: ${eligibility.financials.copay}</p>
        <p>Coinsurance: {eligibility.financials.coinsurance}</p>
      </section>

      {/* Order Details */}
      <section>
        <h2>Order Information</h2>
        {patient.orders.map(order => (
          <div key={order.orderId}>
            <p>Order ID: {order.orderId}</p>
            <p>Imaging Type: {order.imagingType}</p>
            <p>CPT Codes: {order.cptCodes.join(', ')}</p>
            <p>Date of Service: {order.dateOfService}</p>
            <p>Auth Status: {order.authStatus}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
```

## Example 2: PA Orders List Screen (Already Implemented)

```typescript
import { useNavigate } from 'react-router-dom'
import { getAllOrders } from '../../utils/patientDataHelpers'

export default function PAOrders() {
  const navigate = useNavigate()
  const orders = getAllOrders()

  return (
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Patient Name</th>
          <th>MRN</th>
          <th>Imaging Type</th>
          <th>Payer</th>
          <th>Date of Service</th>
          <th>Auth Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.orderId} onClick={() => navigate(`/patient/${order.mrn}/ev`)}>
            <td>{order.orderId}</td>
            <td>{order.patientName}</td>
            <td>{order.mrn}</td>
            <td>{order.imagingType}</td>
            <td>{order.payer}</td>
            <td>{order.dateOfService}</td>
            <td>{order.authStatus}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Example 3: Adding New Screen Data (Clinical Review)

### Step 1: Add data to patientsData.json
```json
{
  "patients": {
    "800721": {
      "orders": [
        {
          "orderId": "RAD-001",
          // ... existing fields ...
          "clinicalReview": {
            "diagnosisCodes": [
              {
                "code": "M81.0",
                "description": "Age-related osteoporosis without current pathological fracture"
              }
            ],
            "clinicalHistory": "72-year-old female with history of low bone density...",
            "priorImaging": [
              {
                "date": "2025-02-15",
                "type": "Bone DXA",
                "findings": "T-score -2.8"
              }
            ],
            "clinicalJustification": "Monitoring of known osteoporosis per guidelines",
            "reviewStatus": "Approved",
            "reviewedBy": "Dr. Clinical Reviewer",
            "reviewDate": "2026-01-22"
          }
        }
      ]
    }
  }
}
```

### Step 2: Add helper function to patientDataHelpers.ts
```typescript
export interface ClinicalReview {
  diagnosisCodes: DiagnosisCode[]
  clinicalHistory: string
  priorImaging: PriorImaging[]
  clinicalJustification: string
  reviewStatus: string
  reviewedBy: string
  reviewDate: string
}

export const getClinicalReview = (orderId: string): ClinicalReview | undefined => {
  const order = getOrderById(orderId)
  return order?.clinicalReview
}
```

### Step 3: Use in your screen component
```typescript
import { getClinicalReview, getOrderById } from '../utils/patientDataHelpers'

export default function ClinicalReviewScreen() {
  const { orderId } = useParams()
  const order = getOrderById(orderId!)
  const clinicalReview = getClinicalReview(orderId!)

  return (
    <div>
      <h2>Clinical Review for {order?.orderId}</h2>

      <section>
        <h3>Diagnosis Codes</h3>
        {clinicalReview?.diagnosisCodes.map(dx => (
          <div key={dx.code}>
            <strong>{dx.code}</strong>: {dx.description}
          </div>
        ))}
      </section>

      <section>
        <h3>Clinical History</h3>
        <p>{clinicalReview?.clinicalHistory}</p>
      </section>

      <section>
        <h3>Prior Imaging</h3>
        {clinicalReview?.priorImaging.map((img, idx) => (
          <div key={idx}>
            <p>{img.date} - {img.type}</p>
            <p>Findings: {img.findings}</p>
          </div>
        ))}
      </section>

      <section>
        <h3>Review Status</h3>
        <p>Status: {clinicalReview?.reviewStatus}</p>
        <p>Reviewed by: {clinicalReview?.reviewedBy}</p>
        <p>Date: {clinicalReview?.reviewDate}</p>
      </section>
    </div>
  )
}
```

## Key Takeaways

1. **Always use helper functions** - Don't import the JSON directly in components
2. **Add new data to orders** - Each order can have screen-specific data
3. **Create typed interfaces** - Use TypeScript for type safety
4. **Keep it organized** - Related data stays together under each order
5. **Single source of truth** - All screens read from the same data file

## Data Flow

```
patientsData.json (Source)
       ↓
patientDataHelpers.ts (Access Layer)
       ↓
Components/Screens (UI Layer)
```
