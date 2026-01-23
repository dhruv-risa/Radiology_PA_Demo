# Document Setup Instructions

## Required PDF Files

Place the following PDF files in this directory (`public/documents/`):

### 1. Payer Guidelines (Dynamic by payer name)
These PDFs should be named based on the payer name in lowercase with hyphens:
- `payer-guidelines-aetna.pdf` - For Aetna insurance
- `payer-guidelines-bcbs.pdf` - For BCBS (Blue Cross Blue Shield)
- `payer-guidelines-cigna.pdf` - For Cigna insurance
- `payer-guidelines-unitedhealth.pdf` - For United Health
- `payer-guidelines-{payer-name}.pdf` - For any other payer

**The system will automatically select the correct guideline based on the patient's insurance payer.**

### 2. Clinical Criteria
- `clinical-criteria.pdf` - Contains clinical criteria for imaging authorization

### 3. CPT Codes Reference
- `cpt-codes.pdf` - Reference document for CPT codes

### 4. NAR Grid
- `nar-grid.pdf` - No Authorization Required (NAR) grid showing which services don't need auth

## How It Works

When a user clicks on a menu option:
1. **View {Payer} Guidelines** - Opens the payer-specific guideline PDF based on current patient
2. **View Clinical Criteria** - Opens clinical-criteria.pdf
3. **View CPT Codes** - Opens cpt-codes.pdf
4. **View NAR Grid** - Opens nar-grid.pdf
5. **View in RIS** - Placeholder for RIS integration (shows alert)

All PDFs open in a new browser tab.

## File Access

These files will be served from:
- Development: `http://localhost:5173/documents/{filename}`
- Production: `{domain}/documents/{filename}`

## Testing

To test without actual PDFs:
1. The browser will show a 404 error if PDF is missing
2. Replace with actual PDFs to make functional
3. Or use placeholder PDF files for testing
