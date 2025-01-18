from sqlalchemy import Column, Integer, String, Text, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

# Initialize the base class for declarative class definitions
Base = declarative_base()

class Department(Base):
    """
    Represents an academic department within the institution.
    
    Attributes:
        id (Integer): Primary key uniquely identifying each department.
        name (String): Unique name of the department.
        courses (relationship): One-to-many relationship with Course.
    """
    __tablename__ = 'departments'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    
    courses = relationship("Course", back_populates="department")


class Course(Base):
    """
    Represents a course offered by a department.
    
    Attributes:
        id (Integer): Primary key uniquely identifying each course.
        course_section (String): Unique section identifier for the course.
        course_title (String): Title of the course.
        subject (String): Subject area of the course.
        course_description (Text): Detailed description of the course.
        credits (Float): Number of credits awarded for the course.
        academic_level (String): Academic level (e.g., Undergraduate, Graduate).
        offering_period (String): Term or period when the course is offered.
        start_date (Date): Start date of the course.
        end_date (Date): End date of the course.
        instructional_format (String): Format of instruction (e.g., Lecture, Seminar).
        delivery_mode (String): Mode of delivery (e.g., In-Person, Online).
        course_tags (String): Tags or keywords associated with the course.
        academic_units (String): Academic unit or department associated with the course.
        section_status (String): Status of the course section (e.g., Open, Closed).
        waitlist_capacity (String): Waitlist information (e.g., "0/10").
        enrolled_capacity (String): Enrollment capacity information (e.g., "8/18").
        department_id (Integer): Foreign key linking to the Department.
        department (relationship): Many-to-one relationship with Department.
        instructors (relationship): One-to-many relationship with Instructor.
        locations (relationship): One-to-many relationship with Location.
        enrollments (relationship): One-to-many relationship with Enrollment.
        previous_classes (relationship): One-to-many relationship with StudentClass.
    """
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
    """
    Represents an instructor teaching a course.
    
    Attributes:
        id (Integer): Primary key uniquely identifying each instructor.
        name (String): Name of the instructor.
        course_id (Integer): Foreign key linking to the Course.
        course (relationship): Many-to-one relationship with Course.
    """
    __tablename__ = 'instructors'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'))
    
    course = relationship("Course", back_populates="instructors")


class Location(Base):
    """
    Represents the location where a course is held.
    
    Attributes:
        id (Integer): Primary key uniquely identifying each location.
        location_name (String): Name or description of the location.
        course_id (Integer): Foreign key linking to the Course.
        course (relationship): Many-to-one relationship with Course.
    """
    __tablename__ = 'locations'
    
    id = Column(Integer, primary_key=True)
    location_name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'))
    
    course = relationship("Course", back_populates="locations")


class Enrollment(Base):
    """
    Represents the enrollment of a student in a course.
    
    Attributes:
        id (Integer): Primary key uniquely identifying each enrollment.
        student_id (Integer): Foreign key linking to the Student (nullable).
        course_id (Integer): Foreign key linking to the Course.
        student_cluster (String): Cluster or group identifier for the student.
        student (relationship): Many-to-one relationship with Student.
        course (relationship): Many-to-one relationship with Course.
    """
    __tablename__ = 'enrollments'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=True)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    student_cluster = Column(String)
    
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Student(Base):
    """
    Represents a student in the system.
    
    Attributes:
        id (Integer): Primary key uniquely identifying each student.
        name (String): Name of the student.
        email (String): Unique email address of the student.
        academic_level (String): Academic level of the student (e.g., Undergraduate).
        enrollments (relationship): One-to-many relationship with Enrollment.
        previous_classes (relationship): One-to-many relationship with StudentClass.
    """
    __tablename__ = 'students'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    academic_level = Column(String)
    enrollments = relationship("Enrollment", back_populates="student")
    previous_classes = relationship("StudentClass", back_populates="student")


class StudentClass(Base):
    """
    Represents a class previously taken by a student.
    
    Attributes:
        id (Integer): Primary key uniquely identifying each student class record.
        student_id (Integer): Foreign key linking to the Student.
        course_id (Integer): Foreign key linking to the Course.
        grade (String): Grade received by the student in the course.
        student (relationship): Many-to-one relationship with Student.
        course (relationship): Many-to-one relationship with Course.
    """
    __tablename__ = 'student_classes'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    grade = Column(String)
    
    student = relationship("Student", back_populates="previous_classes")
    course = relationship("Course", back_populates="previous_classes")
