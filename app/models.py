from app.database import Base
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, String, Text


class HSCodeRecord(Base):
  __tablename__ = "hs_codes"

  id = Column(Integer, primary_key=True, index=True)
  hs_code = Column(String(20), unique=True, index=True)
  description = Column(Text, nullable=False)
  # 384 dimensions matches the 'all-MiniLM-L6-v2' sentence-transformer model
  embedding = Column(Vector(384))