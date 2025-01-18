import json
import os
import re
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from openai import OpenAI
from bs4 import BeautifulSoup

# Set up the database connection
DATABASE_URL = "sqlite:///WPI_COURSE_LISTINGS.db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Load the JSON data from the file
with open('WPI_course_catalog.json', 'r') as file:
    data = json.load(file)