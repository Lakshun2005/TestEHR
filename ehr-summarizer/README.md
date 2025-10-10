# AI-Enhanced EHR Summarization System

This project is an AI-powered system to summarize Electronic Health Records (EHRs) into clinically actionable bullet points. It helps healthcare providers quickly understand a patient's medical situation and make informed clinical decisions.

## Features

- **Structured Summaries**: Transforms complex EHR data into structured, actionable summaries.
- **Customizable**: Allows customization of summary length, time frame, and specialty focus.
- **Clinically Actionable**: Highlights critical information for clinical decision-making.
- **HIPAA Compliant**: Designed to maintain patient safety and data privacy.

## Tech Stack

- **Backend**: Python with FastAPI
- **Frontend**: React with Vite
- **AI**: (To be integrated)

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ehr-summarizer
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start the frontend development server:**
   ```bash
   cd ../frontend
   npm run dev
   ```

The application will be available at `http://localhost:5173`.