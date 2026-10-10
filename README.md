# 🧠 LearnGraph AI

> **Don't just track what students studied. Track what they still know.**

LearnGraph AI is a personalised AI-powered student learning graph and knowledge decay analyser. It maps a student's understanding as an interactive knowledge graph, tracks how knowledge fades over time using decay modelling, and recommends targeted revision — all in real time.

---

## 🚀 Features

- 📊 **Knowledge Graph Visualisation** — See concept relationships as an interactive node graph (powered by React Flow)
- 📉 **Knowledge Decay Modelling** — Tracks how well a student retains concepts over time using forgetting-curve algorithms
- 🧪 **Adaptive Quizzing** — Quiz engine that updates mastery scores dynamically
- 🔁 **Smart Revision Recommendations** — Suggests what to revise based on decay & dependency graph
- 📈 **Analytics Dashboard** — Visual insights into mastery levels, weak spots, and learning velocity
- 🔌 **Dual Graph Engine** — Works with embedded NetworkX (zero setup) or Neo4j AuraDB (production)
- 🗄️ **Dual Database Support** — SQLite (local dev) or PostgreSQL/Supabase (production)

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite, TailwindCSS, React Flow, Recharts |
| Backend    | FastAPI, Python 3.11+, Uvicorn                 |
| Graph DB   | NetworkX (default) / Neo4j AuraDB (optional)   |
| Database   | SQLite (default) / PostgreSQL / Supabase       |
| AI/LLM     | Google Gemini API (optional)                   |

---

## 📁 Project Structure

```
learn-graph-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings & environment config
│   │   ├── database.py          # SQLAlchemy DB setup
│   │   ├── graph_db.py          # Graph engine (NetworkX / Neo4j)
│   │   ├── seed.py              # Initial data seeder
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── routes/              # API route handlers
│   │   │   ├── students.py
│   │   │   ├── concepts.py
│   │   │   ├── quiz.py
│   │   │   ├── graph.py
│   │   │   ├── analytics.py
│   │   │   ├── recommendations.py
│   │   │   └── demo.py
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── services/            # Core business logic
│   │       ├── concept_extraction.py
│   │       ├── decay.py
│   │       ├── dependency.py
│   │       ├── mastery.py
│   │       └── recommendation.py
│   ├── tests/                   # Pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/          # Reusable UI components
│   │   │   ├── KnowledgeGraph.jsx
│   │   │   ├── ConceptNode.jsx
│   │   │   ├── DecayChart.jsx
│   │   │   ├── DemoController.jsx
│   │   │   ├── MasteryBadge.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NodeDetailDrawer.jsx
│   │   │   └── WhyExplanation.jsx
│   │   ├── pages/               # Page-level views
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── GraphPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── DecayPage.jsx
│   │   │   └── RevisionPage.jsx
│   │   └── services/
│   │       └── api.js           # Axios API client
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── concepts.json            # Seed concept definitions
│   ├── questions.json           # Quiz question bank
│   └── demo_student.json        # Demo student profile
├── .env.example                 # Environment variable template
└── .gitignore
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Python** 3.11 or higher — [Download](https://www.python.org/downloads/)
- **Node.js** 18 or higher — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/deebikasubramani-1209/LEARNGRAPHAIfinal.git
cd LEARNGRAPHAIfinal
```

---

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

```bash
# Go back to the project root
cd ..

# Copy the example env file
cp .env.example .env
```

Open `.env` and configure the values:

```env
# Server
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Database — SQLite (default, no setup needed)
DATABASE_URL=sqlite:///./learngraph.db

# Optional: PostgreSQL / Supabase
# DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Optional: Neo4j AuraDB (uses embedded NetworkX graph if not set)
# NEO4J_URI=neo4j+s://[INSTANCE_ID].databases.neo4j.io
# NEO4J_USERNAME=neo4j
# NEO4J_PASSWORD=your_password

# Optional: Google Gemini API (for AI concept extraction)
# GEMINI_API_KEY=your_gemini_api_key
```

> **Note:** The app works out-of-the-box without Neo4j or Gemini. SQLite + NetworkX are used by default.

---

### 4. Run the Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- 🌐 **API Base:** `http://localhost:8000`
- 📖 **Swagger Docs:** `http://localhost:8000/docs`
- ❤️ **Health Check:** `http://localhost:8000/api/health`

---

### 5. Frontend Setup

Open a **new terminal**, then:

```bash
# Navigate to the frontend folder
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at:
- 🖥️ **App:** `http://localhost:5173`

---

## 🧪 Running Tests

```bash
# From the backend directory (with venv activated)
cd backend
pytest tests/ -v
```

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET/POST | `/api/students` | Student management |
| GET/POST | `/api/concepts` | Concept CRUD |
| POST | `/api/quiz/submit` | Submit quiz answers |
| GET | `/api/graph/{student_id}` | Knowledge graph data |
| GET | `/api/analytics/{student_id}` | Learning analytics |
| GET | `/api/recommendations/{student_id}` | Revision recommendations |
| GET | `/api/demo` | Demo mode data |

Full interactive API docs available at `http://localhost:8000/docs` when the backend is running.

---

## 🌐 Production Deployment

### Database (PostgreSQL / Supabase)
1. Create a [Supabase](https://supabase.com) project (free tier works)
2. Copy the connection string from **Settings → Database**
3. Set `DATABASE_URL` in your `.env`

### Graph Database (Neo4j AuraDB)
1. Create a free instance at [Neo4j AuraDB](https://neo4j.com/cloud/platform/aura-graph-database/)
2. Set `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` in `.env`

### Frontend Build

```bash
cd frontend
npm run build
# Output is in frontend/dist/
```

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👩‍💻 Author

**Deebika Subramani**  
GitHub: [@deebikasubramani-1209](https://github.com/deebikasubramani-1209)
