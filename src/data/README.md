# Patient Data Structure

This directory contains the centralized patient data for the Radiology PA Demo application.

## Files

### `patientsData.json`
The **single source of truth** for all patient data. This global JSON file contains:
- Patient demographics (name, MRN, date of birth)
- Order information (imaging type, CPT codes, dates, statuses)
- Payer details (insurance information, member IDs, plan names)
- Provider information (name, NPI)
- Service details
- Eligibility verification data including financials (deductibles, out-of-pocket, copay, coinsurance)

### Data Structure
```json
{
  "patients": {
    "MRN": {
      "mrn": "string",
      "name": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "orders": [
        {
          "orderId": "string",
          "imagingType": "string",
          "cptCodes": ["string"],
          "dateOfService": "YYYY-MM-DD",
          "authStatus": "string",
          "AutomationWorkflow": "string",
          "payer": {
            "name": "string",
            "memberId": "string",
            "planName": "string",
            "status": "Active",
            "effectiveDate": "YYYY-MM-DD",
            "planEndDate": "YYYY-MM-DD"
          },
          "provider": {
            "name": "string",
            "npi": "string"
          },
          "service": {
            "serviceTypeCode": "string",
            "dateOfService": "YYYY-MM-DD",
            "imagingType": "string",
            "cptCodes": ["string"]
          },
          "eligibilityVerification": {
            "verified": boolean,
            "verificationDate": "YYYY-MM-DD",
            "financials": {
              "deductible": {
                "inNetworkIndividual": { "total": number, "used": number, "remaining": number },
                "inNetworkFamily": { "total": number, "used": number, "remaining": number }
              },
              "outOfPocket": {
                "inNetworkIndividual": { "total": number, "used": number, "remaining": number },
                "inNetworkFamily": { "total": number, "used": number, "remaining": number }
              },
              "copay": number,
              "coinsurance": "string"
            }
          }
        }
      ]
    }
  }
}
```

## Usage

### Import Helper Functions
```typescript
import {
  getAllPatients,
  getPatientByMRN,
  getPatientByOrderId,
  getOrderById,
  getAllOrders,
  getEligibilityVerification,
  getPayerInfo,
  getProviderInfo
} from '../utils/patientDataHelpers'
```

### Example: Get All Orders for PA Orders Screen
```typescript
const orders = getAllOrders()
// Returns: Array of orders with patient info flattened for table display
```

### Example: Get Patient Details by MRN
```typescript
const patient = getPatientByMRN('800721')
// Returns: Full patient object with all orders and details
```

### Example: Get Eligibility Verification Data
```typescript
const eligibility = getEligibilityVerification('800721')
// Returns: Eligibility verification with financials
```

### Example: Get Order Details
```typescript
const order = getOrderById('RAD-001')
// Returns: Specific order with all associated data
```

## Adding New Data

When adding data for new screens (e.g., Clinical Review, Prior Auth Status):

1. **Add the data to the appropriate order** in `patientsData.json`
2. **Create helper functions** in `patientDataHelpers.ts` if needed
3. **Use the helpers** in your screen components

### Example: Adding Clinical Review Data
```json
{
  "patients": {
    "800721": {
      "orders": [
        {
          "orderId": "RAD-001",
          // ... existing data ...
          "clinicalReview": {
            "diagnosisCodes": ["M81.0"],
            "clinicalNotes": "Patient has history of...",
            "reviewStatus": "Approved"
          }
        }
      ]
    }
  }
}
```

## Benefits of Centralized Data

1. **Single Source of Truth**: All screens reference the same data
2. **Consistency**: Changes propagate automatically across all screens
3. **Type Safety**: TypeScript interfaces ensure data consistency
4. **Easy Maintenance**: Update data in one place
5. **Extensible**: Easy to add new fields for additional screens
6. **Relationship Preservation**: Patient-Order relationships maintained

## Migration Note

The old `paOrders.json` file with screen-specific data structure has been replaced by this centralized approach. All screens should now use `patientsData.json` and the helper functions in `patientDataHelpers.ts`.
