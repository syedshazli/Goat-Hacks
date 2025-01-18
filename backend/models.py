from sqlalchemy import Column, String, Float, Date, Time, ForeignKey, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

#tables here

# Database connection
DATABASE_URL = 'sqlite:///WPI_COURSE_LISTINGS.db'
engine = create_engine(DATABASE_URL)

# Create all tables in the database
Base.metadata.create_all(engine)

# Create a session
Session = sessionmaker(bind=engine)
session = Session()