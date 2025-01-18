from sqlalchemy import create_engine, Column, Integer, String, Text, Float, Date, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()

# Existing Tables
class Course(Base):
    __tablename__ = 'courses'
    id = Column(Integer, primary_key=True)
    course_section = Column(String, unique=True)
    course_title = Column(String)
    subject = Column(String)
    course_description = Column(Text)
    credits = Column(Float)
    academic_level = Column(String)
    offering_period = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    instructional_format = Column(String)
    delivery_mode = Column(String)
    course_tags = Column(String)
    academic_units = Column(String)
    section_status = Column(String)
    waitlist_capacity = Column(String)
    enrolled_capacity = Column(String)

class Instructor(Base):
    __tablename__ = 'instructors'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    course_id = Column(Integer, ForeignKey('courses.id'))
    course = relationship("Course", back_populates="instructors")

Course.instructors = relationship("Instructor", order_by=Instructor.id, back_populates="course")

class Location(Base):
    __tablename__ = 'locations'
    id = Column(Integer, primary_key=True)
    location_name = Column(String)
    course_id = Column(Integer, ForeignKey('courses.id'))
    course = relationship("Course", back_populates="locations")

Course.locations = relationship("Location", order_by=Location.id, back_populates="course")

class Enrollment(Base):
    __tablename__ = 'enrollments'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

Course.enrollments = relationship("Enrollment", order_by=Enrollment.id, back_populates="course")

# New Tables
class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)
    academic_level = Column(String)
    enrollments = relationship("Enrollment", back_populates="student")
    previous_classes = relationship("StudentClass", back_populates="student")

class StudentClass(Base):
    __tablename__ = 'student_classes'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    grade = Column(String)
    student = relationship("Student", back_populates="previous_classes")
    course = relationship("Course")
# Create all tables in the database
Base.metadata.create_all(engine)

# Create a session
Session = sessionmaker(bind=engine)
session = Session()

# open JSON of WPI enrollments
with open("courses.json", "r") as file:
    data = json.load(file)["Report_Entry"]

# Populate database from JSON
for entry in data:
    # Populate Course table
    course = Course(
        course_section=entry["Course_Section"],
        course_title=entry["Course_Title"],
        subject=entry["Subject"],
        course_description=entry["Course_Description"],
        credits=float(entry["Credits"]),
        academic_level=entry["Academic_Level"],
        offering_period=entry["Offering_Period"],
        start_date=entry["Course_Section_Start_Date"],
        end_date=entry["Course_Section_End_Date"],
        instructional_format=entry["Instructional_Format"],
        delivery_mode=entry["Delivery_Mode"],
        course_tags=entry["Course_Tags"],
        academic_units=entry["Academic_Units"],
        section_status=entry["Section_Status"],
        waitlist_capacity=entry["Waitlist_Waitlist_Capacity"],
        enrolled_capacity=entry["Enrolled_Capacity"]
    )
    session.add(course)
    session.commit()  # Commit to get the course ID for relationships

    # Populate Instructor table
    instructors = entry["Instructors"].split(", ")  # Handle multiple instructors if necessary
    for instructor_name in instructors:
        instructor = Instructor(name=instructor_name, course=course)
        session.add(instructor)

    # Populate Location table
    location = Location(location_name=entry["Locations"], course=course)
    session.add(location)

    # Populate Enrollment table (if applicable)
    if entry.get("Student_Course_Section_Cluster"):  # Check if enrollment data exists
        enrollment = Enrollment(
            student_cluster=entry["Student_Course_Section_Cluster"],
            course=course
        )
        session.add(enrollment)

# Commit all the changes to the database
session.commit()
print("Database populated successfully!")