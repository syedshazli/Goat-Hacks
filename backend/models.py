from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Department(Base):
    __tablename__ = 'departments'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    
    courses = relationship("Course", back_populates="department")


class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(Integer, primary_key=True)
    course_section = Column(String, unique=True, nullable=False)
    course_title = Column(String, nullable=False)
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
    department_id = Column(Integer, ForeignKey('departments.id'))
    
    department = relationship("Department", back_populates="courses")
    instructors = relationship("Instructor", back_populates="course")
    locations = relationship("Location", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")
    previous_classes = relationship("StudentClass", back_populates="course")


class Instructor(Base):
    __tablename__ = 'instructors'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'))
    
    course = relationship("Course", back_populates="instructors")


class Location(Base):
    __tablename__ = 'locations'
    
    id = Column(Integer, primary_key=True)
    location_name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'))
    
    course = relationship("Course", back_populates="locations")


class Enrollment(Base):
    __tablename__ = 'enrollments'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=True)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    student_cluster = Column(String)
    
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Student(Base):
    __tablename__ = 'students'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    academic_level = Column(String)
    
    password_hash = Column(String, nullable=False)
    completed_courses = Column(Text, nullable=True)
    sports = Column(Text, nullable=True)
    future_goals = Column(Text, nullable=True)
    
    enrollments = relationship("Enrollment", back_populates="student")
    previous_classes = relationship("StudentClass", back_populates="student")


class StudentClass(Base):
    __tablename__ = 'student_classes'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    grade = Column(String)
    
    student = relationship("Student", back_populates="previous_classes")
    course = relationship("Course", back_populates="previous_classes")