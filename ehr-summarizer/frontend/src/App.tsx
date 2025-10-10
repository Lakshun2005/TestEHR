import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// TypeScript interfaces for the structured summary
interface PatientOverview {
  summary: string;
}

interface MedicalProblem {
  problem: string;
  status: string;
}

interface Medication {
  name: string;
  details: string;
}

interface Allergy {
  name: string;
  reaction: string;
}

interface ClinicalFinding {
  finding: string;
}

interface ActionableItem {
  item: string;
  priority: string;
}

interface PendingItem {
  item: string;
}

interface StructuredSummary {
  patient_overview: PatientOverview;
  active_medical_problems: MedicalProblem[];
  current_medications_and_allergies: {
    medications: Medication[];
    allergies: Allergy[];
  };
  recent_clinical_findings: ClinicalFinding[];
  actionable_items: ActionableItem[];
  pending_items: PendingItem[];
}

const App: React.FC = () => {
  const [ehrData, setEhrData] = useState('');
  const [customization, setCustomization] = useState({
    length: 'Standard',
    time_frame: 'Last 30 days',
    focus_area: 'General',
    audience: 'Physician',
    urgency_level: 'Standard',
  });
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestBody = {
        ehr_data: {
          demographics: '65-year-old male',
          chief_complaint: 'Routine follow-up',
          past_medical_history: 'Hypertension, Type 2 Diabetes',
          medications: ['Lisinopril 10mg', 'Metformin 500mg'],
          allergies: ['Penicillin'],
          vital_signs: 'BP 130/80',
          lab_results: ['A1c 7.2%'],
          imaging_reports: [],
        },
        customization: customization,
      };

      const response = await axios.post('http://localhost:8000/summarize', requestBody);
      setSummary(response.data);
    } catch (err) {
      setError('Failed to fetch summary. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Enhanced EHR Summarization System</h1>
      </header>
      <main>
        <div className="input-section">
          <h2>EHR Data</h2>
          <textarea
            value={ehrData}
            onChange={(e) => setEhrData(e.target.value)}
            placeholder="Paste EHR data here (currently uses mocked data)"
            rows={10}
          />
          <h2>Customization</h2>
          <div className="customization-controls">
            {/* Add controls for customization here */}
          </div>
          <button onClick={handleSummarize} disabled={loading}>
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
        <div className="output-section">
          <h2>Summary</h2>
          {error && <p className="error">{error}</p>}
          {summary && (
            <div className="summary-content">
              <h3>Patient Overview</h3>
              <p>{summary.patient_overview.summary}</p>

              <h3>Active Medical Problems</h3>
              <ul>
                {summary.active_medical_problems.map((p, i) => (
                  <li key={i}><strong>{p.problem}</strong>: {p.status}</li>
                ))}
              </ul>

              <h3>Medications and Allergies</h3>
              <h4>Medications</h4>
              <ul>
                {summary.current_medications_and_allergies.medications.map((m, i) => (
                  <li key={i}><strong>{m.name}</strong>: {m.details}</li>
                ))}
              </ul>
              <h4>Allergies</h4>
              <ul>
                {summary.current_medications_and_allergies.allergies.map((a, i) => (
                  <li key={i}><strong>{a.name}</strong>: {a.reaction}</li>
                ))}
              </ul>

              <h3>Recent Clinical Findings</h3>
              <ul>
                {summary.recent_clinical_findings.map((f, i) => (
                  <li key={i}>{f.finding}</li>
                ))}
              </ul>

              <h3>Actionable Items</h3>
              <ul>
                {summary.actionable_items.map((item, i) => (
                  <li key={i}><strong>{item.priority}</strong>: {item.item}</li>
                ))}
              </ul>

              <h3>Pending Items</h3>
              <ul>
                {summary.pending_items.map((item, i) => (
                  <li key={i}>{item.item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;