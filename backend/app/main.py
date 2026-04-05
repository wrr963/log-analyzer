from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json

from .llm_pipeline import LLMPipeline
from .database import SessionLocal, LogAnalysis

app = FastAPI(title="Log Analyzer API")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = LLMPipeline()

class LogSubmitRequest(BaseModel):
    raw_log: str
    project_name: str = "default_project"

@app.get("/")
def read_root():
    return {"message": "Log Analyzer API"}

@app.post("/api/analyze")
def analyze_log_endpoint(request: LogSubmitRequest, db: Session = Depends(get_db)):
    if not request.raw_log.strip():
        raise HTTPException(status_code=400, detail="Log is empty")
    
    # Send to LLM
    analysis = pipeline.analyze_log(request.raw_log)
    
    if "error" not in analysis:
        # Save to DB
        new_entry = LogAnalysis(
            project_name=request.project_name,
            raw_log=request.raw_log,
            cause=analysis.get("cause", ""),
            solution=analysis.get("solution", ""),
            tags=json.dumps(analysis.get("tags", []))
        )
        db.add(new_entry)
        db.commit()
    
    return {
        "status": "success",
        "analysis": analysis,
        "project_name": request.project_name
    }

@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    history = db.query(LogAnalysis).order_by(LogAnalysis.created_at.desc()).limit(20).all()
    results = []
    for h in history:
        results.append({
            "id": h.id,
            "project_name": h.project_name,
            "cause": h.cause,
            "solution": h.solution,
            "tags": json.loads(h.tags) if h.tags else [],
            "created_at": h.created_at.isoformat(),
            "raw_log": h.raw_log
        })
    return results
