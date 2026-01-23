# Implementation Summary - Authorization Tab & Document Links

## What Was Implemented

### 1. Authorization Tab
**Location:** `src/components/pages/dynamics/Authorization.tsx`

A fully functional, read-only Authorization tab that displays:

#### Section 1: Authorization Status (Hero Section)
- Large, prominent display with icons and descriptions
- Handles all status types:
  - No Authorization Required (NAR)
  - Authorization on File
  - PA Submitted
  - Authorization Required (with documentation issues)
  - Blocked

#### Section 2: Authorization Details (Conditional)
- Shows only when authorization exists
- Displays payer name and authorization info

#### Section 3: Submission & Payer Response
- Submission status with badges
- Latest payer response in plain language
- Submission date when applicable

#### Section 4: Next Expected System Action
- System-oriented action statement
- Reinforces automation

**Visual Enhancements:**
- Gradient backgrounds
- Section icons
- Improved spacing and typography
- Card shadows and borders
- Blue accent highlights

### 2. Dropdown Menu with PDF Links
**Location:** `src/components/layouts/MedOncDynamicsLayout.tsx`

Added functional three-dot menu button with options:

#### Menu Options:
1. **View {Payer} Guidelines**
   - Dynamically shows payer name (e.g., "View Aetna Guidelines")
   - Opens payer-specific PDF based on patient's insurance
   - Path: `/documents/payer-guidelines-{payer-name}.pdf`

2. **View Clinical Criteria**
   - Opens clinical criteria documentation
   - Path: `/documents/clinical-criteria.pdf`

3. **View in RIS**
   - Placeholder for RIS integration
   - Shows alert when clicked

4. **View CPT Codes**
   - Opens CPT codes reference
   - Path: `/documents/cpt-codes.pdf`

5. **View NAR Grid**
   - Opens No Authorization Required grid
   - Path: `/documents/nar-grid.pdf`

**Features:**
- Click-outside-to-close functionality
- Opens PDFs in new tab with security attributes
- Dynamic payer name in first option
- Hover effects and icons

### 3. Document Structure
**Location:** `public/documents/`

Created document directory with:
- README.md - Basic file listing
- SETUP_INSTRUCTIONS.md - Detailed setup guide
- Placeholder PDF files:
  - `payer-guidelines-aetna.pdf`
  - `payer-guidelines-bcbs.pdf`
  - `payer-guidelines-cigna.pdf`
  - `clinical-criteria.pdf`
  - `cpt-codes.pdf`
  - `nar-grid.pdf`

### 4. Route Configuration
**Location:** `src/App.tsx`

- Added Authorization route
- Set as default tab (redirects to /authorization)
- Integrated with existing routing structure

## How to Add Actual PDFs

1. Navigate to: `public/documents/`
2. Replace the empty placeholder files with actual PDFs
3. Maintain the naming convention:
   - `payer-guidelines-{lowercase-payer-name}.pdf`
   - `clinical-criteria.pdf`
   - `cpt-codes.pdf`
   - `nar-grid.pdf`

## Dynamic Payer Selection

The system automatically:
1. Reads the patient's payer name from order data
2. Converts to lowercase and replaces spaces with hyphens
3. Constructs the appropriate PDF path
4. Example: "Blue Cross Blue Shield" → `/documents/payer-guidelines-blue-cross-blue-shield.pdf`

## Testing

### Without PDFs:
- Browser will show 404 error
- Menu still works and attempts to open

### With PDFs:
- PDFs open in new browser tab
- Works in both development and production

## File Paths

**Development:** `http://localhost:5173/documents/{filename}.pdf`
**Production:** `{domain}/documents/{filename}.pdf`

## Key Functions

```typescript
// Opens document in new tab
openDocument(documentPath: string)

// Generates payer-specific guideline path
getPayerGuidelinePath()
```

## Current Patient Payers in Data

Based on `patientsData.json`:
- Aetna
- BCBS
- Cigna

Ensure these payer guideline PDFs exist:
- payer-guidelines-aetna.pdf ✓
- payer-guidelines-bcbs.pdf ✓
- payer-guidelines-cigna.pdf ✓
