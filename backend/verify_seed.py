from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Course, Instructor, Location, Department

# Database configuration
DATABASE_URL = 'sqlite:///WPI_COURSE_LISTINGS.db'

# Create a database engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create a session
Session = sessionmaker(bind=engine)
session = Session()

# Query all courses
courses = session.query(Course).all()

for course in courses:
    print(f"Course: {course.course_title} ({course.course_section})")
    print(f"  Department: {course.department.name}")
    print("  Instructors:")
    for instr in course.instructors:
        print(f"    - {instr.name}")
    print("  Locations:")
    for loc in course.locations:
        print(f"    - {loc.location_name}")
    print("---")

# Close the session
session.close()
