# Dhanvantri — Multilingual Smart OPD Triage & Clinical Intake System

Dhanvantri is an end-to-end clinical intake, triage, and healthcare management platform designed for hospital outpatient departments (OPD). It streamlines patient registration, automated multilingual clinical history collection, doctor verification, and digital health records exchange in compliance with Ayushman Bharat Digital Mission (ABDM) standards.

---

## Key Modules

- **Patient MediKiosk**: Self-service hospital kiosk allowing patients to check in via ABHA ID or phone, report chief complaints via speech/touch in 10+ Indian languages, undergo automated red-flag triage, and upload prior prescriptions or lab reports.
- **My Patient Portal**: Dedicated portal for patients to view verified clinical records, prescriptions, diagnosis summaries, and history securely via OTP.
- **Physician & Staff Console**: Clinician-in-the-loop dashboard displaying structured HPI summaries, lab evaluations, vital signs, and FHIR R4 clinical bundles in under 30 seconds per case.
- **Receptionist & Vitals Desk**: Queue management station with vitals entry (temperature, BP, pulse, SpO2, weight), claim locks, and automated SMS/voice calling for waiting patients.
- **ABDM / ABHA Integration**: Seamless lookup and verification against the central ABHA registry with longitudinal health record support.

---

## System Architecture

```
+-----------------------------------------------------------------------------+
|                             DHANVANTRI PLATFORM                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|   +-------------------+                     +---------------------------+   |
|   |   React + Vite    |                     |    Express API Gateway    |   |
|   |  Frontend Client  | <--- HTTP / REST ---+    (Node.js / Mongoose)   |   |
|   |    (Port 5173)    |                     +-------------+-------------+   |
|   +---------+---------+                                   |                 |
|             |                                             |                 |
|      Static Voice Cache                                   |                 |
|   (/audio_cache/*.json)                                   |                 |
|                                         +-----------------+-----------------+
|                                         |                                   |
|                        ON-PREMISE ONLY  v                  ON-PREMISE ONLY  v
|                      +--------------------+              +--------------------+
|                      | PaddleOCR Sidecar  |              |   Ollama LLM       |
|                      |  (Local Port 8001) |              | (Local Port 11434) |
|                      +--------------------+              +--------------------+
+-----------------------------------------------------------------------------+
```

---

## Architecture & Deployment

### 1. Hospital On-Premise Deployment (Production)
In a hospital setting, Dhanvantri runs on hospital edge infrastructure:
- **Zero Cloud Egress for Clinical Data**: Patient medical records and prescription photos remain on local premises.
- **Local PaddleOCR**: Document and lab report OCR runs on an internal sidecar (`http://127.0.0.1:8001`).
- **Local Ollama LLM**: Clinical summarization and HPI structuring run locally on `http://127.0.0.1:11434` (`llama3.1:8b`).
- **Flags**: `OCR_ENABLED=true`, `AI_ENABLED=true`.
- **Run**: `docker compose up -d`

### 2. Demonstration Deployment (Cloud Safe)
For cloud demonstrations:
- **Heavy Services Isolation**: OCR and Ollama services are cleanly toggled via feature flags (`OCR_ENABLED=false`, `AI_ENABLED=false`).
- **Informational UI**: The kiosk and doctor dashboards return HTTP 503 (`LOCAL_OCR_UNAVAILABLE` and `LOCAL_AI_UNAVAILABLE`) explaining that heavy OCR and LLM engines are hosted on-premise to preserve patient clinical privacy.
- **Multilingual Voice Cache**: Fixed multilingual voice prompts are served directly from client assets (`frontend/public/audio_cache/`) for instant zero-latency speech playback.
- **Run**: `docker compose -f docker-compose.demo.yml up -d`

---

## Project Structure

```
demo_live/
├── backend/                  Express API Gateway & Services
│   ├── routes/               Modular REST routes (auth, intake, doctor, receptionist, etc.)
│   ├── auth.js               JWT authentication & role-based access control
│   ├── callAgent.js          Queue calling & SMS notification service (Twilio/Mock)
│   ├── db.js                 MongoDB connection & Mongoose schemas
│   ├── documentUpload.js     Prescription and lab report upload handler
│   ├── extract.js            Rule-based clinical lab and medication extractor
│   ├── fhirBuilder.js        FHIR R4 bundle builder
│   ├── ocr.js                OCR service client
│   ├── redFlagRules.js       Clinical triage & red-flag detection rules
│   └── server.js             Backend application entry point
├── frontend/                 React 19 + Vite Application
│   ├── src/
│   │   ├── components/       Shared components
│   │   ├── context/          Global state and authentication context
│   │   ├── pages/            Kiosk, Doctor, Receptionist, Patient, & Admin views
│   │   ├── services/         Centralized API client
│   │   └── utils/            Multilingual translations and helpers
│   └── package.json
├── mock-abha-server/         Mock National ABHA Central Registry
└── docker-compose.yml        Docker container orchestrations
```

---

## User Roles & Permissions

- **Hospital Admin**: Registers and configures hospital details, manages doctor and receptionist staff accounts, customizes symptom decision trees, and configures queue calling settings.
- **Doctor**: Manages real-time patient queue, verifies clinical HPI details, reviews extracted lab values and prescriptions across standardized clinical tabs, and signs off on visits.
- **Receptionist**: Operates the front desk and pre-consultation vitals desk (temperature, BP, pulse, SpO2, weight), claims sessions, and dispatches automated phone/SMS queue notifications.
- **Patient**: Uses MediKiosk at check-in or logs into the patient portal via OTP to review verified health records, diagnoses, and prescriptions.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally on `mongodb://localhost:27017` or configured via `MONGO_URI`)

### 1. Start Backend Gateway

```bash
cd backend
npm install
npm start
```
*Listens on `http://localhost:8000` by default. Verify via `http://localhost:8000/api/health`.*

### 2. Start Frontend Application

```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173/` by default.*

### 3. Start Mock ABHA Registry (Optional)

```bash
cd mock-abha-server
npm install
npm start
```
*Listens on `http://localhost:8005` by default.*

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | Backend API gateway port |
| `MONGO_URI` | `mongodb://localhost:27017/medikiosk` | MongoDB connection string |
| `JWT_SECRET` | `medikiosk-dev-secret-change-me` | Secret key for JWT session signing |
| `OCR_ENABLED` | `false` | Enable local on-premise OCR sidecar integration |
| `AI_ENABLED` | `false` | Enable local on-premise Ollama clinical summarization |
| `ABHA_SERVER_URL` | `http://localhost:8005` | Mock central ABHA registry endpoint |
| `TWILIO_ACCOUNT_SID` | - | Twilio Account SID for voice calls (optional) |
| `TWILIO_AUTH_TOKEN` | - | Twilio Auth Token (optional) |
| `TWILIO_FROM_NUMBER` | - | Twilio caller phone number (optional) |

---

## Standards & Compliance

- **FHIR R4**: Generates standard FHIR Bundles containing `Patient`, `Encounter`, `Condition`, `Observation`, and `MedicationStatement` resources.
- **ABDM Compliant**: Compatible with standard ABHA IDs (14 digits) and longitudinal health records.
- **Clinical Safety**: Dual triage rules for Allopathic and AYUSH clinical terminology with automated red-flag detection.
