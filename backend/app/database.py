from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./log_analyzer.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class LogAnalysis(Base):
    __tablename__ = "log_analyses"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String, index=True)
    raw_log = Column(Text)
    cause = Column(Text)
    solution = Column(Text)
    tags = Column(String)  # Stored as JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)
