# Dhanvantari / MediKiosk — Multilingual Smart OPD Triage & Clinical Intake System

## Architecture & Dual-Mode Deployment

Dhanvantari is architected with a strict privacy-first model designed for hospital on-premise hardware with an adaptable cloud demonstration mode.

```
+-----------------------------------------------------------------------------+
|                             DHANVANTARI SYSTEM                              |
+-----------------------------------------------------------------------------+
|                                                                             |
|   +-------------------+                     +---------------------------+   |
|   |   React + Vite    |                     |    Express API Gateway    |   |
|   |  Frontend Client  | <--- HTTP / REST ---+       (Node.js / Mongo)   |   |
|   | (Static / Cloud)  |                     +-------------+-------------+   |
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

### 1. On-Premise Hospital Deployment (Production)
In a hospital setting, MediKiosk runs locally on hospital edge hardware:
- **Zero Cloud Egress for Clinical Data**: Patient medical records and prescription photos never leave hospital premises.
- **Local PaddleOCR**: Document and lab report OCR runs on an internal Python FastAPI sidecar (`http://127.0.0.1:8001`).
- **Local Ollama LLM**: Clinical summarization and HPI structuring run locally on `http://127.0.0.1:11434` with `llama3.1:8b`.
- **Environment Flags**: `OCR_ENABLED=true`, `AI_ENABLED=true`.
- **Run with Docker Compose**: `docker compose up -d`

### 2. Public Hackathon Demo Deployment (Cloud Safe)
For remote evaluators and web demonstrations:
- **Local Heavy AI Isolation**: OCR and Ollama are cleanly disabled via feature flags (`OCR_ENABLED=false`, `AI_ENABLED=false`).
- **Graceful Informational UI**: The kiosk and doctor dashboards return HTTP 503 (`LOCAL_OCR_UNAVAILABLE` and `LOCAL_AI_UNAVAILABLE`) and present clear privacy badges explaining that OCR and Ollama run on-premise to preserve patient privacy.
- **Static Voice Cache**: Fixed multilingual voice prompts (250 UI phrases) are pre-rendered into `frontend/public/audio_cache/` so the cloud frontend delivers instant speech without machine dependencies or sensitive data leaks.
- **Privacy TTS Guard**: Any dynamic patient-specific content is routed strictly to browser-native Web Speech API, never transmitted to external cloud voice services.
- **Run with Demo Docker Compose**: `docker compose -f docker-compose.demo.yml up -d`

---


| Area | Before (Python) | Now (JavaScript) |
|---|---|---|
| Backend | FastAPI + SQLAlchemy | Express + better-sqlite3 |
| Auth | None — anyone could hit any endpoint | JWT-based, 3 roles: `hospital_admin`, `doctor`, `patient` |
| Hospital | n/a | Register hospital (name, registration no., type, phone, email, city/state/PIN, address, HFR/ABDM ID) |
| Doctors | n/a | Add doctor (name, HPR ID, Aadhar ID, DOB, address, type), remove doctor, doctor login |
| Patients | Create-only, no auth | Add patient, find patient (by phone), update patient, patient portal login |
| Doctor console | Queue + generic review | Dashboard/queue, patient's current medicine records, review tabbed as **Profile / Reports / Diagnosis / Case / Prescribing** (per the docx sketch) |
| Patient console | n/a (kiosk only) | Patient portal: Profile / Reports / Diagnosis / Case tabs, "New visit" kiosk flow, self-service "Update patient" |
| OCR | pytesseract (needs system Tesseract binary) | `tesseract.js` (pure JS, no native install) |
| FHIR bundle, red-flag triage, med/lab extraction | Python | Ported 1:1 to JavaScript, same behavior |

## Project layout

```
medikiosk-js/
├── backend/
│   ├── server.js         Express app entrypoint
│   ├── db.js              better-sqlite3 connection + schema
│   ├── auth.js             JWT signing + requireAuth/requireRole middleware
│   ├── extract.js          Rule-based medication/lab extraction (ported)
│   ├── ocr.js               tesseract.js OCR wrapper
│   ├── fhirBuilder.js        FHIR R4 bundle builder (ported)
│   ├── routes/
│   │   ├── auth.js            Hospital register/login, doctor add/remove/login, patient login
│   │   ├── patients.js        Add/find/update patient
│   │   ├── intake.js           Kiosk session flow (symptom, HPI, AYUSH, parameters, docs, submit)
│   │   └── doctor.js            Queue, medicine records, review
│   └── package.json
└── frontend/
    ├── index.html          Shell
    ├── app.js               All views/routing (vanilla JS, fetch-based)
    └── styles.css
```

## Roles

- **hospital_admin** — registers the hospital, adds/removes doctors, adds/finds patients.
- **doctor** — logs in, sees the submitted-patient queue, views a patient's
  current medicine records, and reviews a visit across five tabs (Profile,
  Reports, Diagnosis, Case, Prescribing) matching the handwritten UI sketch
  in the docx.
- **patient** — logs in with phone + the password set at registration; can
  view/update their own profile, see reports/diagnosis/case once reviewed,
  and start a new kiosk visit (symptom pick, optional document photo → OCR,
  PMH/allergies, submit to the doctor's queue).

Every protected route checks both the JWT and that the resource belongs to
the caller's hospital (or, for patients, to themselves) — see `assertAccess`
in `intake.js` and the checks in `patients.js`.

## Running it

**1. Backend**

```bash
cd backend
npm install
npm start          # listens on http://localhost:8000 by default
```

Check `http://localhost:8000/api/health`.

> `tesseract.js` downloads its English language data on first OCR call and
> caches it locally — this needs outbound internet access once. All other
> functionality works fully offline.

**2. Frontend**

```bash
cd frontend
python3 -m http.server 5500      # or any static file server
```

Visit `http://localhost:5500`. It talks to the backend at
`http://localhost:8000` by default — to point it elsewhere, set
`window.MEDIKIOSK_API_BASE` in `index.html` before `app.js` loads.

**3. Try the flow**

1. **Hospital** → Register a hospital → you're logged in as `hospital_admin`.
2. Add a doctor (Doctors tab) and a patient (Patients tab, with a portal
   password so the patient can log in later).
3. Log out, log back in as **Patient** (phone + password) → "New visit"
   tab → pick a symptom (try "Chest Pain / Breathless" to see the real
   server-side red-flag rule fire) → optionally upload a prescription/lab
   photo → submit.
4. Log out, log in as **Doctor** with the email/password you added →
   the patient appears in the Dashboard queue → click them → walk through
   Profile / Reports / Diagnosis / Case / Prescribing, save each tab.

## Still stand-ins (same caveats as the original prototype)

- ABHA ID is format-validated only — no real ABDM sandbox call.
- Medication/lab extraction is rule-based (regex + known-drug list), not a
  trained clinical NER model.
- Speech-to-text/text-to-speech (Web Speech API in the browser) was in the
  original single-file kiosk UI; the rewritten frontend focuses on the
  role-based flows above and doesn't re-wire that piece — it's a
  straightforward addition to `app.js`'s "New visit" tab if you need it back.
