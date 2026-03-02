## 1. Product Scope & Overview

### 1.1 Purpose

This application is a specialized Prior Authorization (PA) management platform designed specifically for **Radiology Oncology**. It streamlines the complex workflow of authorizing high-tech imaging (MRI, CT, PET) and standard radiology services for oncology patients. The system acts as a central hub to verify eligibility, determine authorization requirements (NAR, Auth on File, etc.), and manage the submission lifecycle across various payer portals.

### 1.2 Demo Disclaimer

> Note: This documentation describes a Demo Version of the product. All patient profiles, medical history, insurance details, and clinical documents within the application are dummy data created for simulation purposes. The application allows users to experience the end-to-end workflow without interacting with real Protected Health Information (PHI).
> 

## 2. Technical Overview

The application is built using a modern web development stack to ensure performance and responsiveness:

- **Framework:** React 18 with TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

## 3. Application Workflow & Routes

The user journey follows a linear flow: **Dashboard (Orders) → Eligibility Verification → Authorization Management**.

### 3.1 Main Dashboard: PA Orders

**Route:** `/`

The landing page acts as the central command center, displaying a comprehensive table of all Prior Authorization orders.

- **Key Features:**
    - **Order Management Table:** Displays critical data including Order ID, Patient Name/MRN, Imaging Type, CPT Codes, Payer, Date of Service (DOS), and Auth Status.
    - **Processing Statistics:** Hover menu showing breakdown of orders by status (Total, PA Filed, NAR, Blocked, etc.).
    - **Workflow Visualization:** A "View" action opens a modal showing the granular steps of the order's lifecycle.

### 3.2 Eligibility Verification (EV)

**Route:** `/patient/:id/ev`

Before filing a PA, the user enters this screen to validate the patient's insurance coverage and financial status.

- **Key Features:**
    - **Patient & Order Context:** Displays immutable details such as Date of Birth, Imaging Type, CPT Codes, and Provider NPI.
    - **Coverage Summary:** Validates Payer Name, Plan Status (Active/Inactive), and Plan Type.
    - **Financials:** Tracks Deductibles (Total vs. Used) and Out-of-Pocket maximums.

### 3.3 Patient Dynamics (Authorization Management)

**Route:** `/patient/:id/dynamics/*`

Once eligibility is confirmed, the user proceeds to the Dynamics layout. This is the core workspace for managing the PA request.

**Navigation Tabs:**

- **Authorization:** The main status screen.
- **Issues:** Only appears if the workflow is "Blocked" or the status is "Query".
- **Documents:** A repository for clinical notes and imaging reports.
- **Workflow:** A detailed timeline view of the automation steps.
- **Auth Letters:** Access to generated authorization letters.
- **Comments (Business Office):** Section for notes and communication regarding the case.
- **Filed PA:** Visible only when the PA status is "PA Submitted".

### 3.4 Manual PA Filing

**Route:** `/patient/:id/pa-form-guidelines`

A dedicated route for complex cases requiring manual input with guideline assistance.

## 4. Detailed Use Cases

The application supports distinct workflows tailored to the specific status of an order. Below are the detailed use cases covering the major scenarios.

### Use Case 1: "No Auth Required" (NAR)

**Scenario:** Routine procedures (e.g., Bone Dex, Standard X-Rays) often do not require prior authorization based on payer rules.

- **Logic:** The system determines this status by cross-referencing CPT codes against NAR Grids (e.g., Aetna, BCBS).
- **Workflow:**
    1. **Identification:** The user identifies an order with **"NAR"** status on the dashboard.
    2. **Tagging:** The user navigates to the **Comments (Business Office)** tab where the system has pre-populated a note detailing the verification (e.g., *"No Authorization Required per payer guidelines"*).
    3. **RPA Trigger:** The user clicks the **"Trigger RPA"** button.
    4. **Outcome:** The RPA agent automatically pushes this note into the provider's EMR (OncoEMR), notifying the provider and scheduling team that the appointment can proceed immediately.

### Use Case 2: "Auth on File"

**Scenario:** An authorization already exists (e.g., from a previous visit or recurring series), avoiding redundant work.

- **Logic:** The system checks external portals (Evicore, Carelon) for active authorization numbers matching the patient and CPT code.
- **Workflow:**
    1. **Identification:** The user identifies an order with **"Auth on File"** status.
    2. **Tagging:** The user navigates to the **Comments (Business Office)** tab.
    3. **Review:** The system displays the retrieved details, including the specific **Auth Number** and validity dates.
    4. **RPA Trigger:** The user clicks **"Trigger RPA"**.
    5. **Outcome:** The agent updates the EMR with the valid authorization number, ensuring the billing team has the necessary data for claims processing.

### Use Case 3: Resolving "Query" (Missing Documentation)

**Scenario:** High-tech imaging requests (e.g., MRI, PET) are blocked due to missing prerequisites like prior imaging or clinical notes.

- **Workflow:**
    1. **Identification:** The dashboard flags the order as **"Query"** or **"Blocked"**.
    2. **Action:** The user navigates to the **Issues** tab to view the specific blocker.
    3. **Resolution Options:**
        - **Request via RPA:** The user clicks **"Request Relevant Document"**. This triggers the RPA agent to send a high-priority message to the provider in the EMR, explicitly stating what is missing (e.g., *"Missing prior CT Scan report"*).
        - **Direct Upload:** If the user has the file offline, they click **"Upload Relevant Document"** to upload the PDF/Image directly, clearing the "Blocked" status.

### Use Case 4: Reviewing Filed PAs (Patient 008)

**Scenario:** For orders where the PA has been successfully submitted to the payer, the system provides full visibility into the submission packet.

- **Example:** Patient 008 (CT Chest & Abdomen).
- **Workflow:**
    1. **Identification:** The status is **"PA Submitted"**.
    2. **Verification:** The user navigates to the **Filed PA** tab.
    3. **Review:** The user sees the exact data transmitted to the payer, including Patient Details, Diagnosis/Procedure Codes, and attached documents.
    4. **Evidence:** The user can click **"View PA Filed by Agent"** to see the actual confirmation screenshot or PDF from the payer portal.
    5. **Notification:** The user navigates to the **Comments** tab and triggers the RPA to notify the provider that the submission is complete.

### Use Case 5: Manual PA Filing with Guidelines (Patient 009)

**Scenario:** Complex cases requiring a new authorization submission where the user needs to ensure strict adherence to medical necessity guidelines.

- **Example:** Patient 009 (PET Whole Body Scan).
- **Workflow:**
    1. **Identification:** The status is **"Auth Required"** or **"PA Ordered"**.
    2. **Action:** The user clicks the **"File Prior Authorization"** button in the footer.
    3. **Interface:** The system opens the **PA Form with Guidelines** screen (Split-View):
        - **Left Panel:** Displays the interactive Clinical Guidelines PDF (e.g., Aetna Clinical Policy Bulletin).
        - **Right Panel:** Displays the PA Submission Form.
    4. **Fulfillment:** The user fills out the form while referencing the guidelines to ensure the narrative matches payer criteria.
    5. **Submission:** The user submits the form, which queues the RPA agent to file the request.

## 5. Installation & Setup

To run the demo environment locally:

Bash

`# Install dependencies
npm install

# Start development server
npm run dev`
