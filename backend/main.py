from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
from rag_pipeline import build_rag_pipeline, format_answer_with_citations

app = FastAPI(title="RAG Citation Chatbot")

# Allows React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store chain and filename
rag_chain = None
current_file = None


@app.get("/")
def root():
    return {"message": "RAG Citation Chatbot API is running"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global rag_chain, current_file

    # Only accept PDF files
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")

    # Save file temporarily
    save_path = f"temp_{file.filename}"
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Build RAG pipeline
    rag_chain = build_rag_pipeline(save_path, file.filename)
    current_file = file.filename

    return {
        "message": f"PDF '{file.filename}' processed successfully",
        "filename": file.filename
    }


class Question(BaseModel):
    query: str


@app.post("/chat")
async def chat(question: Question):
    global rag_chain

    if not rag_chain:
        raise HTTPException(400, "Please upload a PDF first")

    if not question.query.strip():
        raise HTTPException(400, "Question cannot be empty")

    # Run RAG chain
    answer = rag_chain.invoke(question.query)

# Format with citations
    formatted = format_answer_with_citations(answer)

    return formatted


@app.get("/status")
def status():
    return {
        "pdf_loaded": rag_chain is not None,
        "current_file": current_file
    }