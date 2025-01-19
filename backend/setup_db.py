from sqlalchemy import create_engine
from models import Base

# Database configuration
DATABASE_URL = 'sqlite:///WPI_COURSES.db'

# Create a database engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Drop and recreate all tables
Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)

print("Database setup complete.")
