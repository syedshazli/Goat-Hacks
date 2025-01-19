import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Department, Course, Instructor, Location
from bs4 import BeautifulSoup

# Database configuration
DATABASE_URL = 'sqlite:///WPI_COURSES.db'

# Create a database engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create a session
Session = sessionmaker(bind=engine)
session = Session()

# Load the JSON data
with open('courses.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Extract course entries
course_entries = data["Report_Entry"]

for entry in course_entries:
    # Get the department name and strip whitespace
    department_name = entry.get("Academic_Units", "").strip()

    # Check if the department already exists
    department = session.query(Department).filter_by(name=department_name).first()

    if not department:
        # Create a new Department
        department = Department(name=department_name)
        session.add(department)
        session.commit() # Commit to generate the department ID

    # Parse dates
    start_date_str = entry.get("Course_Section_Start_Date")
    end_date_str = entry.get("Course_Section_End_Date")
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else None
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date() if end_date_str else None

    # Clean course description by stripping HTML tags
    course_description_html = entry.get("Course_Description", "")
    course_description = BeautifulSoup(course_description_html, "html.parser").get_text(separator="\n").strip()

    # Parse credits
    credits = float(entry.get("Credits", 0))

    # Create Course instance
    course = Course(
        course_section=entry["Course_Section"],
        course_title=entry["Course_Title"],
        subject=entry["Subject"],
        course_description=course_description,
        credits=credits,
        academic_level=entry["Academic_Level"],
        offering_period=entry["Offering_Period"],
        start_date=start_date,
        end_date=end_date,
        instructional_format=entry["Instructional_Format"],
        delivery_mode=entry["Delivery_Mode"],
        course_tags=entry["Course_Tags"],
        academic_units=department_name,
        section_status=entry["Section_Status"],
        waitlist_capacity=entry["Waitlist_Waitlist_Capacity"],
        enrolled_capacity=entry["Enrolled_Capacity"],
        department=department # Link to Department
    )
    session.add(course)
    session.commit() # Commit to generate the course ID

    # Add Instructors
    instructors = entry.get("Instructors", "").split(",")
    for instructor_name in instructors:
        instructor = Instructor(name=instructor_name.strip(), course=course)
        session.add(instructor)
    session.commit()

    # Add Locations
    locations = entry.get("Locations", "").split(",")
    for location_name in locations:
        location = Location(location_name=location_name.strip(), course=course)
        session.add(location)
    session.commit()

# Close the session
session.close()

print("Database filling complete.")