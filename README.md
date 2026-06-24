# RAG Document Chat 📚

An AI-powered document chat application with semantic search and citations.

## Features
- Upload any PDF and ask questions in natural language
- Semantic search using FAISS vector database
- Citations with exact page numbers for every answer
- Conversation history sidebar
- Fully local — no API costs using Ollama Llama3.2

## Tech Stack
- **Frontend:** React + Tailwind CSS
- **Backend:** FastAPI + Python
- **AI Orchestration:** LangChain
- **Embeddings:** HuggingFace sentence-transformers
- **Vector DB:** FAISS
- **LLM:** Ollama Llama3.2 (local)

## How To Run

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Ollama
```bash
ollama pull llama3.2
ollama serve
```

Open http://localhost:5173
