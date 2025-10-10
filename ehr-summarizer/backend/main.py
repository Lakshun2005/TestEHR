from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI()

# Pydantic Models for Request Body
class EHRData(BaseModel):
    demographics: str
    chief_complaint: str
    past_medical_history: str
    medications: List[str]
    allergies: List[str]
    vital_signs: str
    lab_results: List[str]
    imaging_reports: List[str]

class CustomizationParameters(BaseModel):
    length: str = Field("Standard", enum=["Brief", "Standard", "Comprehensive"])
    time_frame: str = Field("Last 30 days", enum=["Last encounter", "Last 30 days", "Last 6 months", "Complete history"])
    focus_area: str = Field("General", enum=["General", "Cardiology", "Oncology", "Primary Care"])
    audience: str = Field("Physician", enum=["Physician", "Nurse", "Specialist", "Patient"])
    urgency_level: str = Field("Standard", enum=["Critical only", "Standard"])

class SummarizationRequest(BaseModel):
    ehr_data: EHRData
    customization: CustomizationParameters

# Pydantic Models for Response Body
class PatientOverview(BaseModel):
    summary: str

class MedicalProblem(BaseModel):
    problem: str
    status: str

class Medication(BaseModel):
    name: str
    details: str

class Allergy(BaseModel):
    name: str
    reaction: str

class ClinicalFinding(BaseModel):
    finding: str

class ActionableItem(BaseModel):
    item: str
    priority: str

class PendingItem(BaseModel):
    item: str

class StructuredSummary(BaseModel):
    patient_overview: PatientOverview
    active_medical_problems: List[MedicalProblem]
    current_medications_and_allergies: dict
    recent_clinical_findings: List[ClinicalFinding]
    actionable_items: List[ActionableItem]
    pending_items: List[PendingItem]

@app.post("/summarize", response_model=StructuredSummary)
async def summarize_ehr(request: SummarizationRequest):
    """
    Summarizes EHR data based on the provided customization parameters.
    This is a mocked endpoint that returns a hardcoded summary.
    """
    # Mocked AI logic
    return {
        "patient_overview": {
            "summary": "The patient is a 65-year-old male with a history of hypertension and type 2 diabetes, presenting for a routine follow-up."
        },
        "active_medical_problems": [
            {"problem": "Hypertension", "status": "Controlled"},
            {"problem": "Type 2 Diabetes", "status": "Stable"}
        ],
        "current_medications_and_allergies": {
            "medications": [
                {"name": "Lisinopril", "details": "10mg daily"},
                {"name": "Metformin", "details": "500mg twice daily"}
            ],
            "allergies": [
                {"name": "Penicillin", "reaction": "Hives"}
            ]
        },
        "recent_clinical_findings": [
            {"finding": "A1c: 7.2% (3 months ago)"},
            {"finding": "BP: 130/80 mmHg (today)"}
        ],
        "actionable_items": [
            {"item": "Schedule annual eye exam", "priority": "Routine"},
            {"item": "Discuss A1c goal", "priority": "Important"}
        ],
        "pending_items": [
            {"item": "Lipid panel results"}
        ]
    }