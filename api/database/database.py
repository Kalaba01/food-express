from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Podaci za konekciju
SQLALCHEMY_DATABASE_URL = 'postgresql://postgres.xwhktvlcwstolmmvyxxi:J9TDsHCxryjS4Iav@aws-0-us-east-1.pooler.supabase.com:6543/postgres'

# Kreiranje engine-a
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Osnovna klasa za modele
Base = declarative_base()

# Funkcija za dobijanje sesije
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
