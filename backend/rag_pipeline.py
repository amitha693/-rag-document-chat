import os
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

CITATION_PROMPT = PromptTemplate(
    template="""
You are a helpful assistant. Answer the question using ONLY 
the context provided below.

For EVERY piece of information you use, cite like this: [Source: filename, Page X]

If the answer is not in the context, say:
"I could not find this information in the provided document."

Context:
{context}

Question: {question}

Answer with citations:
""",
    input_variables=["context", "question"]
)

last_retrieved_docs = []

def format_docs(docs):
    global last_retrieved_docs
    last_retrieved_docs = docs
    return "\n\n".join(doc.page_content for doc in docs)


def build_rag_pipeline(pdf_path: str, filename: str):

    # STEP 1: Read PDF
    print(f"Loading {filename}...")
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    # STEP 2: Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(pages)

    # STEP 3: Add metadata for citations
    for chunk in chunks:
        chunk.metadata["source"] = filename

    print(f"Created {len(chunks)} chunks from {len(pages)} pages")

    # STEP 4: Create embeddings
    print("Creating embeddings...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # STEP 5: Store in FAISS
    vectorstore = FAISS.from_documents(chunks, embeddings)
    print("Stored in FAISS ✅")

    # STEP 6: Retrieve relevant chunks
    retriever = vectorstore.as_retriever(
        search_kwargs={"k": 4}
    )

    # STEP 7: Send context 
    
    llm = ChatOllama(
    model="llama3.2",
    temperature=0)

    # STEP 8: Build chain
    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | CITATION_PROMPT
        | llm
        | StrOutputParser()
    )

    return chain


def format_answer_with_citations(answer: str) -> dict:
    global last_retrieved_docs

    sources = []
    seen = set()

    for doc in last_retrieved_docs:
        page = doc.metadata.get("page", 0)
        source = doc.metadata.get("source", "document")
        citation = f"{source} — Page {page + 1}"

        if citation not in seen:
            sources.append(citation)
            seen.add(citation)

    return {
        "answer": answer,
        "sources": sources
    }