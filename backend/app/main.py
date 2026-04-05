from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import datetime
from sqlalchemy.orm import Session

from .llm_pipeline import LLMPipeline

app = FastAPI(title="Log Analyzer API")

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
def analyze_log_endpoint(request: LogSubmitRequest):
    if not request.raw_log.strip():
        raise HTTPException(status_code=400, detail="Log is empty")
    
    # Send to LLM
    analysis = pipeline.analyze_log(request.raw_log)
    
    # Normally we would save to DB here, but start simple for prototype
    return {
        "status": "success",
        "analysis": analysis,
        "project_name": request.project_name
    }
