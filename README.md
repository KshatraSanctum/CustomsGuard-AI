# CustomsGuard AI 🛡️
> **Autonomous Trade Compliance, Vector HS-Code Classification, & Fraud Mitigation Engine**

CustomsGuard AI is an enterprise-grade full-stack application designed to streamline international trade compliance, automate commercial invoice parsing, and mitigate tariff evasion risks. By combining vector similarity search with modern LLMs and OCR vision pipelines, CustomsGuard helps customs brokers and logistics enterprises instantly audit shipments against World Customs Organization (WCO) standards.

---

## 🚀 Key Features

* **Vector-Powered HS Code Classification:** Uses sentence transformers (`all-MiniLM-L6-v2`) and PostgreSQL (`pgvector`) to perform high-speed cosine distance similarity matching against global WCO HS code databases.
* **Autonomous Fraud & Risk Scoring Engine:** Evaluates item descriptions and metadata heuristics in real-time to compute fraud probability scores, flag suspicious vague descriptions, and monitor sanctions compliance.
* **OCR & AI Structured Extraction:** Scans multi-language commercial invoices or shipping manifests using Tesseract OCR, then uses Gemini to extract structured attributes (Origin, Destination, Incoterms, and Hazardous Flags).
* **Palantir-Style Operations Terminal:** Provides visual transparency into backend vector embeddings, cosine distance computations, and registry checks through a live hacker-style execution log.
* **Autonomous AI Co-pilot:** An embedded assistant powered by Gemini that answers complex regulatory questions, clarifies material compositions, and suggests duty rates based on active document context.
* **One-Click Compliance PDF Export:** Generates professional, executive-ready PDF audit reports summarizing matched HS codes, risk levels, and official harmonized descriptions instantly.

---

## 🛠️ Tech Stack

* **Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL (`pgvector`), PyTesseract, Sentence-Transformers.
* **AI / LLM:** Google GenAI SDK (`gemini-3.5-flash`), Custom Prompt Engineering, Structured JSON Extraction.
* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, jsPDF.

---

## ⚙️ Getting Started Locally

### Prerequisites
* Python 3.10+
* Node.js & npm
* PostgreSQL with the `pgvector` extension enabled
* Tesseract OCR installed on your system

### 1. Backend Setup (FastAPI)
Navigate to your project root and install the required Python dependencies:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary sentence-transformers pytesseract pillow python-dotenv google-genai
```
 Create a .env file in the root directory and add your API key:
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=postgresql://your_db_user:your_password@localhost:5432/your_database
```
3. Launch Full-Stack Application

Run both the FastAPI backend (port 8000) and the Next.js frontend (port 3000) simultaneously in a single terminal window:
```bash
npm run dev:all
``` 
Open your browser and navigate to http://localhost:3000 to access the CustomsGuard Enterprise Dashboard.
(The backend will be available at http://127.0.0.1:8000)
(The frontend dashboard will be available at http://localhost:3000)

## 💡 System Architecture Workflow
Ingestion: User uploads a commercial invoice or enters a raw product description.

Vision/OCR Pipeline: Tesseract extracts raw text, which Gemini structures into standardized JSON metadata.

Vector Vectorization & Querying: The text is encoded into dense vector embeddings and queried against pgvector to find the exact WCO harmonization match.

Risk Evaluation: The heuristic engine calculates fraud probabilities and sanction flags, rendering actionable metrics directly to the user dashboard.

Mitigation & Reporting: Brokers can interact with the AI Co-pilot for deep compliance clarifications and export a signed PDF audit report.

## 🛡️ License
Distributed under the MIT License. See LICENSE for more information.