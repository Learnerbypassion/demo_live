const mongoose = require("mongoose");

const AbhaRecordSchema = new mongoose.Schema({
  record_id: { type: String, unique: true, index: true },
  abha_id: { type: String, required: true, index: true },
  session_id: { type: String, index: true },
  hospital_id: { type: String, default: "default" },
  hospital_name: { type: String, default: "City Care Hospital" },
  doctor_id: { type: String },
  doctor_name: { type: String, default: "Attending Doctor" },
  doctor_specialization: { type: String, default: "General Medicine" },
  date: { type: String, default: () => new Date().toISOString() },
  chief_complaint: { type: String },
  symptoms: [{ type: String }],
  hpi_transcript: { type: String },
  hpi_qa: [{ question: String, answer: String }],
  vitals: { type: mongoose.Schema.Types.Mixed },
  lab_reports: [{ type: mongoose.Schema.Types.Mixed }],
  ai_summary: { type: String },
  diagnosis: { type: String, required: true },
  prescription: { type: String, required: true },
  clinical_notes: { type: String },
  ayush_mode: { type: Boolean, default: false },
  ayush_fields: { type: mongoose.Schema.Types.Mixed },
  fhir_bundle: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
});

AbhaRecordSchema.index({ abha_id: 1, session_id: 1 }, { unique: true, sparse: true });

const DEFAULT_RECORD_SEEDS = [

  {
    record_id: "REC-2025-0814-01",
    abha_id: "98-7654-3210-5678",
    session_id: "demo_sess_rajesh_01",
    hospital_id: "hosp_apollo_delhi",
    hospital_name: "Apollo Multispeciality Hospital, Delhi",
    doctor_id: "doc_anirban",
    doctor_name: "Dr. Anirban Mukherjee",
    doctor_specialization: "Cardiology",
    date: "2025-08-14T10:30:00.000Z",
    chief_complaint: "Exertional chest heaviness and mild shortness of breath on climbing stairs",
    symptoms: ["Chest tightness", "Dyspnea on exertion", "Fatigue"],
    hpi_transcript: "Patient reports retrosternal tightness triggered by exertion, relieving with rest within 5-10 minutes. No diaphoresis or radiating arm pain.",
    hpi_qa: [
      { question: "When did you first notice chest heaviness?", answer: "About 3 weeks ago while climbing stairs." },
      { question: "Does rest relieve the symptom?", answer: "Yes, sitting down relieves it within 5-10 minutes." }
    ],
    diagnosis: "Stable Angina Pectoris, Essential Hypertension, Mixed Dyslipidemia",
    prescription: "1. Tab. Atorvastatin 20mg (0-0-1) — at night for 30 days\n2. Tab. Metoprolol Tartrate 25mg (1-0-0) — after breakfast for 30 days\n3. Tab. Aspirin 75mg (0-1-0) — after lunch for 30 days\n4. Tab. Sorbitrate 5mg (Sublingual SOS for acute chest discomfort)",
    clinical_notes: "Advised low-sodium, low-cholesterol cardiac diet. Follow-up ECG and 2D Echo advised in 4 weeks.",
    vitals: {
      bp: "138/88 mmHg",
      pulse: "76 bpm",
      spo2: "98%",
      temp: "98.4 F"
    },
    lab_reports: [
      {
        report_name: "Lipid Profile & Cardiac Risk Panel",
        date: "2025-08-13T09:00:00.000Z",
        labs: [
          { name: "Total Cholesterol", value: 224, unit: "mg/dL", ref_range: "< 200 mg/dL", abnormal: true, status: "High" },
          { name: "LDL Cholesterol", value: 142, unit: "mg/dL", ref_range: "< 100 mg/dL", abnormal: true, status: "High" },
          { name: "HDL Cholesterol", value: 41, unit: "mg/dL", ref_range: "> 40 mg/dL", abnormal: false, status: "Normal" },
          { name: "Serum Triglycerides", value: 185, unit: "mg/dL", ref_range: "< 150 mg/dL", abnormal: true, status: "Borderline" },
          { name: "hs-CRP", value: 2.4, unit: "mg/L", ref_range: "< 1.0 mg/L", abnormal: true, status: "Moderate Risk" }
        ]
      }
    ],
    ai_summary: "47-year-old male evaluated for exertional chest tightness. Diagnosed with Stable Angina and Hypertension. Lipid profile indicates elevated LDL and Total Cholesterol. Prescribed statin and beta-blocker therapy with lifestyle modifications.",
    fhir_bundle: {
      resourceType: "Bundle",
      type: "document",
      entry: [
        { resource: { resourceType: "Patient", identifier: [{ value: "98-7654-3210-5678" }], name: [{ text: "Rajesh Kumar" }] } },
        { resource: { resourceType: "Condition", code: { text: "Stable Angina Pectoris" }, clinicalStatus: { coding: [{ code: "active" }] } } },
        { resource: { resourceType: "MedicationRequest", medicationCodeableConcept: { text: "Atorvastatin 20mg" } } }
      ]
    }
  },

  {
    record_id: "REC-2025-0210-02",
    abha_id: "98-7654-3210-5678",
    session_id: "demo_sess_rajesh_02",
    hospital_id: "hosp_max_saket",
    hospital_name: "Max Super Speciality Hospital, Saket",
    doctor_id: "doc_kavita_m",
    doctor_name: "Dr. Kavita Mathur",
    doctor_specialization: "Internal Medicine",
    date: "2025-02-10T11:00:00.000Z",
    chief_complaint: "Annual Executive Health Checkup and BP monitoring",
    symptoms: ["Occasional mild morning headache", "Fatigue"],
    diagnosis: "Stage 1 Hypertension, Borderline Hyperlipidemia",
    prescription: "1. Tab. Telmisartan 40mg (1-0-0) — morning after food\n2. Tab. Multivitamin with Zinc (0-1-0) — daily for 30 days\n3. Lifestyle: Brisk walking 30 mins/day, reduce dietary salt",
    vitals: {
      bp: "142/90 mmHg",
      pulse: "82 bpm",
      spo2: "99%",
      temp: "98.6 F"
    },
    lab_reports: [
      {
        report_name: "Comprehensive Metabolic & Kidney Panel",
        date: "2025-02-10T08:30:00.000Z",
        labs: [
          { name: "Serum Creatinine", value: 0.94, unit: "mg/dL", ref_range: "0.72 - 1.18 mg/dL", abnormal: false, status: "Normal" },
          { name: "Serum Urea", value: 28, unit: "mg/dL", ref_range: "19 - 45 mg/dL", abnormal: false, status: "Normal" },
          { name: "eGFR", value: 96, unit: "mL/min/1.73m2", ref_range: "> 90 mL/min", abnormal: false, status: "Normal" },
          { name: "Fasting Blood Sugar", value: 104, unit: "mg/dL", ref_range: "70 - 100 mg/dL", abnormal: true, status: "Impaired Fasting Glucose" }
        ]
      }
    ],
    ai_summary: "Executive health checkup confirmed Stage 1 Hypertension. Telmisartan initiated with dietary advice.",
    fhir_bundle: {
      resourceType: "Bundle",
      type: "document",
      entry: [
        { resource: { resourceType: "Patient", identifier: [{ value: "98-7654-3210-5678" }], name: [{ text: "Rajesh Kumar" }] } },
        { resource: { resourceType: "Condition", code: { text: "Stage 1 Essential Hypertension" } } }
      ]
    }
  },

  {
    record_id: "REC-2025-0720-03",
    abha_id: "12-3456-7890-1234",
    session_id: "demo_sess_ananya_01",
    hospital_id: "hosp_manipal_blr",
    hospital_name: "Manipal Hospital, HAL Airport Road, Bengaluru",
    doctor_id: "doc_shalini",
    doctor_name: "Dr. Shalini Rao",
    doctor_specialization: "Endocrinology",
    date: "2025-07-20T11:15:00.000Z",
    chief_complaint: "Quarterly follow up for Type 2 Diabetes Mellitus with increased thirst",
    symptoms: ["Polydipsia", "Mild post-lunch fatigue", "Dryness of mouth"],
    diagnosis: "Type 2 Diabetes Mellitus — Sub-optimal Glycemic Control",
    prescription: "1. Tab. Metformin HCl 500mg SR (1-0-1) — after meals for 90 days\n2. Tab. Glimepiride 1mg (1-0-0) — 15 mins before breakfast\n3. Tab. Methylcobalamin 1500 mcg (0-1-0) — after lunch daily for 60 days",
    clinical_notes: "HbA1c increased from 6.8% to 7.2%. Adjusted Glimepiride dose. Advised self-monitoring of blood glucose (SMBG) twice weekly.",
    vitals: {
      bp: "124/80 mmHg",
      pulse: "72 bpm",
      spo2: "99%",
      temp: "98.2 F"
    },
    lab_reports: [
      {
        report_name: "Glycemic & Renal Function Profile",
        date: "2025-07-19T08:00:00.000Z",
        labs: [
          { name: "HbA1c", value: 7.2, unit: "%", ref_range: "< 5.7%", abnormal: true, status: "Elevated" },
          { name: "Fasting Blood Glucose", value: 132, unit: "mg/dL", ref_range: "70 - 100 mg/dL", abnormal: true, status: "High" },
          { name: "Post-Prandial Blood Sugar", value: 178, unit: "mg/dL", ref_range: "< 140 mg/dL", abnormal: true, status: "High" },
          { name: "Serum Creatinine", value: 0.82, unit: "mg/dL", ref_range: "0.50 - 1.00 mg/dL", abnormal: false, status: "Normal" },
          { name: "Urine Microalbumin", value: 18, unit: "mg/g", ref_range: "< 30 mg/g", abnormal: false, status: "Normal" }
        ]
      }
    ],
    ai_summary: "35-year-old female with Type 2 Diabetes. Moderate elevation in HbA1c (7.2%). Renal markers within safe limits. Medication dosage stepped up with lifestyle counseling.",
    fhir_bundle: {
      resourceType: "Bundle",
      type: "document",
      entry: [
        { resource: { resourceType: "Patient", identifier: [{ value: "12-3456-7890-1234" }], name: [{ text: "Ananya Sharma" }] } },
        { resource: { resourceType: "Condition", code: { text: "Type 2 Diabetes Mellitus" } } }
      ]
    }
  },

  {
    record_id: "REC-2025-0902-04",
    abha_id: "76-02991-0681-3344",
    session_id: "demo_sess_bittu_01",
    hospital_id: "hosp_sskm_kol",
    hospital_name: "IPGMER & SSKM Hospital, Kolkata",
    doctor_id: "doc_subhasish",
    doctor_name: "Dr. Subhasish Das",
    doctor_specialization: "General Medicine",
    date: "2025-09-02T14:00:00.000Z",
    chief_complaint: "High-grade fever, retro-orbital headache, and generalized body ache for 4 days",
    symptoms: ["High fever (102.5 F)", "Retro-orbital pain", "Joint aches", "Nausea"],
    diagnosis: "Acute Dengue Fever (NS1 Antigen Positive) with Mild Thrombocytopenia",
    prescription: "1. Tab. Paracetamol 650mg (1-1-1-1 SOS) — for fever/body pain (do not take NSAIDs/Ibuprofen)\n2. WHO-ORS solution — 1 sachet in 1 liter water, 2 to 3 liters daily\n3. Tab. Pantoprazole 40mg (1-0-0) — before breakfast\n4. Strict bed rest and monitor platelet count every 24 hours",
    clinical_notes: "Platelet count is 98,000 /uL. No spontaneous mucosal bleeding. Patient advised to visit ER immediately if abdominal pain or petechiae develop.",
    vitals: {
      bp: "116/74 mmHg",
      pulse: "88 bpm",
      spo2: "99%",
      temp: "102.4 F"
    },
    lab_reports: [
      {
        report_name: "Complete Blood Count & Dengue Serology",
        date: "2025-09-02T10:00:00.000Z",
        labs: [
          { name: "Platelet Count", value: 98000, unit: "/uL", ref_range: "1,50,000 - 4,50,000", abnormal: true, status: "Low" },
          { name: "Hemoglobin", value: 14.2, unit: "g/dL", ref_range: "13.0 - 17.0 g/dL", abnormal: false, status: "Normal" },
          { name: "WBC Count", value: 3400, unit: "/uL", ref_range: "4,000 - 11,000 /uL", abnormal: true, status: "Leukopenia" },
          { name: "Hematocrit (PCV)", value: 42.5, unit: "%", ref_range: "40 - 50 %", abnormal: false, status: "Normal" },
          { name: "Dengue NS1 Antigen", value: "Positive", unit: "", ref_range: "Negative", abnormal: true, status: "Reactive" }
        ]
      }
    ],
    ai_summary: "20-year-old male presented with dengue NS1 positive viral pyrexia and mild thrombocytopenia (98,000 /uL). Managed supportively with oral hydration and antipyretics under close hematologic surveillance.",
    fhir_bundle: {
      resourceType: "Bundle",
      type: "document",
      entry: [
        { resource: { resourceType: "Patient", identifier: [{ value: "76-02991-0681-3344" }], name: [{ text: "BITTU DEV" }] } },
        { resource: { resourceType: "Condition", code: { text: "Dengue Fever" } } }
      ]
    }
  },

  {
    record_id: "REC-2025-0610-05",
    abha_id: "76-02891-0681-3354",
    session_id: "demo_sess_rishi_01",
    hospital_id: "hosp_fortis_kol",
    hospital_name: "Fortis Hospital, Anandapur, Kolkata",
    doctor_id: "doc_debashis",
    doctor_name: "Dr. Debashis Sen",
    doctor_specialization: "Pulmonology",
    date: "2025-06-10T16:30:00.000Z",
    chief_complaint: "Recurrent nocturnal coughing episodes and wheezing after dust exposure",
    symptoms: ["Nocturnal cough", "Expiratory wheezing", "Chest tightness"],
    diagnosis: "Moderate Persistent Bronchial Asthma, Allergic Rhinitis",
    prescription: "1. Budesonide + Formoterol Inhaler 200/6 mcg — 2 puffs twice daily (rinse mouth after use)\n2. Tab. Montelukast 10mg + Levocetirizine 5mg (0-0-1) — at night for 30 days\n3. Salbutamol 100mcg MDI Inhaler — 2 puffs SOS for acute breathlessness",
    clinical_notes: "Spirometry demonstrates reversible airflow limitation. Instructed on proper inhaler and spacer technique.",
    vitals: {
      bp: "120/78 mmHg",
      pulse: "80 bpm",
      spo2: "97%",
      temp: "98.6 F"
    },
    lab_reports: [
      {
        report_name: "Pulmonary Function & Allergy Markers",
        date: "2025-06-09T11:00:00.000Z",
        labs: [
          { name: "FEV1 / FVC Ratio", value: 68, unit: "%", ref_range: "> 75 %", abnormal: true, status: "Airflow Limitation" },
          { name: "Post-Bronchodilator Reversibility", value: 15, unit: "%", ref_range: "< 12 %", abnormal: true, status: "Positive Reversibility" },
          { name: "Serum Total IgE", value: 450, unit: "kU/L", ref_range: "< 100 kU/L", abnormal: true, status: "Elevated" },
          { name: "Absolute Eosinophil Count", value: 520, unit: "/uL", ref_range: "40 - 440 /uL", abnormal: true, status: "Eosinophilia" }
        ]
      }
    ],
    ai_summary: "21-year-old male with persistent asthma and allergic rhinitis. Spirometry confirmed reversible airflow obstruction. Maintenance ICS-LABA and anti-leukotriene regimen prescribed.",
    fhir_bundle: {
      resourceType: "Bundle",
      type: "document",
      entry: [
        { resource: { resourceType: "Patient", identifier: [{ value: "76-02891-0681-3354" }], name: [{ text: "RISHI DEV" }] } },
        { resource: { resourceType: "Condition", code: { text: "Bronchial Asthma" } } }
      ]
    }
  },

  {
    record_id: "REC-2025-0504-06",
    abha_id: "11-2233-4455-6677",
    session_id: "demo_sess_priya_01",
    hospital_id: "hosp_apollo_ahmedabad",
    hospital_name: "Apollo Hospitals, Bhat, Ahmedabad",
    doctor_id: "doc_chintan",
    doctor_name: "Dr. Chintan Vora",
    doctor_specialization: "Orthopedics & Sports Medicine",
    date: "2025-05-04T15:00:00.000Z",
    chief_complaint: "Right knee pain and clicking sensation during sports activity",
    symptoms: ["Right knee joint tenderness", "Mild effusion", "Clicking on flexion"],
    diagnosis: "Grade I Medial Meniscal Strain (Right Knee)",
    prescription: "1. Tab. Etoricoxib 90mg (1-0-0) — after meals for 5 days\n2. Tab. Pantoprazole 40mg (1-0-0) — before breakfast for 5 days\n3. Knee brace support while walking\n4. Quadriceps isometric strengthening exercises with physiotherapy",
    vitals: {
      bp: "118/76 mmHg",
      pulse: "74 bpm",
      spo2: "99%",
      temp: "98.4 F"
    },
    lab_reports: [
      {
        report_name: "Inflammatory & Calcium Markers",
        date: "2025-05-04T11:00:00.000Z",
        labs: [
          { name: "Serum Calcium", value: 9.6, unit: "mg/dL", ref_range: "8.8 - 10.6 mg/dL", abnormal: false, status: "Normal" },
          { name: "Serum Uric Acid", value: 4.8, unit: "mg/dL", ref_range: "3.5 - 7.2 mg/dL", abnormal: false, status: "Normal" },
          { name: "ESR", value: 14, unit: "mm/hr", ref_range: "0 - 20 mm/hr", abnormal: false, status: "Normal" }
        ]
      }
    ],
    ai_summary: "24-year-old female evaluated for sports-related right knee injury. Grade I meniscal sprain managed conservatively with short-course NSAID, brace support, and physiotherapy.",
    fhir_bundle: {
      resourceType: "Bundle",
      type: "document",
      entry: [
        { resource: { resourceType: "Patient", identifier: [{ value: "11-2233-4455-6677" }], name: [{ text: "Priya Patel" }] } },
        { resource: { resourceType: "Condition", code: { text: "Right Meniscal Strain" } } }
      ]
    }
  }
];

async function seedDefaultRecords(Model) {
  try {
    for (const r of DEFAULT_RECORD_SEEDS) {
      await Model.updateOne({ record_id: r.record_id }, { $set: r }, { upsert: true });
    }
    console.log(`[ABHA Registry] Seeded/verified ${DEFAULT_RECORD_SEEDS.length} default clinical records in central DB`);
  } catch (err) {
    console.warn("[ABHA Registry] Record seeding notice:", err.message);
  }
}

module.exports = {
  AbhaRecord: mongoose.model("AbhaRecord", AbhaRecordSchema),
  DEFAULT_RECORD_SEEDS,
  seedDefaultRecords
};
