from app.database import SessionLocal, engine, Base
from app.models import HSCodeRecord
from sentence_transformers import SentenceTransformer

# 1. Initialize the AI embedding model
print("Loading AI Embedding Model (all-MiniLM-L6-v2)...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# 2. Enterprise-Grade Manifest & Classification Dataset
ENTERPRISE_HS_CODES = [
    # Complex Chemicals, Catalysts & Reagents
    {
        "hs_code": "2825.30",
        "description": "Vanadium oxides and hydroxides (including Vanadium Pentoxide / V2O5 industrial catalysts)"
    },
    {
        "hs_code": "3824.99",
        "description": "Chemical products and preparations of the chemical or allied industries (including alcoholic potassium hydroxide / alcoholic KOH solutions and laboratory testing reagents)"
    },
    {
        "hs_code": "2922.49",
        "description": "Amino-acids, other than those containing more than one kind of oxygen function, and their esters (specialized organic amino acid compounds)"
    },
    {
        "hs_code": "2918.11",
        "description": "Lactic acid, its salts and esters"
    },

    # High-Tech & Industrial Electronics
    {
        "hs_code": "8517.12",
        "description": "Smartphones, mobile phones, and wireless communication devices"
    },
    {
        "hs_code": "8471.30",
        "description": "Laptops, portable automatic data processing machines weighing not more than 10 kg"
    },
    {
        "hs_code": "8542.31",
        "description": "Electronic integrated circuits as processors and controllers"
    },

    # Medical & Heavy Industry
    {
        "hs_code": "9018.90",
        "description": "Instruments and appliances used in medical, surgical, dental or veterinary sciences"
    },
    {
        "hs_code": "8703.23",
        "description": "Passenger vehicles, spark-ignition internal combustion engine, exceeding 1500 cc"
    },
    {
        "hs_code": "0901.21",
        "description": "Coffee, roasted, not decaffeinated"
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Clearing existing dataset...")
        db.query(HSCodeRecord).delete()
        db.commit()

        print("Generating 384-dimensional vector embeddings and pushing to Neon database...")
        for item in ENTERPRISE_HS_CODES:
            vector_embedding = model.encode(item["description"]).tolist()

            record = HSCodeRecord(
                hs_code=item["hs_code"],
                description=item["description"],
                embedding=vector_embedding
            )
            db.add(record)

        db.commit()
        print("Success: Database populated with enterprise-grade HS codes & chemical vector embeddings!")

    except Exception as e:
        print(f"Error during ingestion: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()