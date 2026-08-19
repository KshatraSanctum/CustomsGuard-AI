from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import router as customs_router

# Create database tables (including pgvector extension tables)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CustomsGuard AI API",
    description="Autonomous Cross-Border Tariff & Compliance Engine",
    version="1.0.0",
)

# Enable CORS to allow your Next.js frontend (port 3000) to connect to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include routes
app.include_router(customs_router)


@app.get("/")
def root():
    return {
        "system": "CustomsGuard AI",
        "status": "Online",
        "docs": "/docs",
    }