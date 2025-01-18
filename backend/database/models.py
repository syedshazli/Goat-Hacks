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