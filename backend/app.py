import os
import json
import bcrypt
from datetime import datetime, timedelta
from math import ceil
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import openai
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base, Department, Course, Instructor, Location, Enrollment, Student, StudentClass
from run import run_swarm

# Configuration
DATABASE_URL = "sqlite:///WPI_COURSES.db"
SECRET_KEY = "YOUR_SECRET_KEY"

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# JWT setup
jwt = JWTManager(app)

# Loose CORS for testing
CORS(app, resources={r"*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Database setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = scoped_session(sessionmaker(bind=engine))

# Register a new user into the db
@app.route('/api/register', methods=['POST'])
def register():
    """
    Input: { "name": "" "email": "" "password": "" }
    Returns JWT access token if successful.
    """
    db = SessionLocal()
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        db.close()
        return jsonify({"message": "Missing fields"}), 400

    # Check if user already exists
    existing_user = db.query(Student).filter_by(email=email).first()
    if existing_user:
        db.close()
        return jsonify({"message": "User already exists"}), 409

    # Hash the password
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    new_student = Student(
        name=name,
        email=email,
        password_hash=password_hash,
        completed_courses=json.dumps([]),
        sports=json.dumps([]),
        future_goals=""
    )
    db.add(new_student)
    db.commit()

    # Retrieve the new student
    student = db.query(Student).filter_by(email=email).first()
    if not student:
        db.close()
        return jsonify({"message": "User not found"}), 404

    # Generate JWT Access Token
    access_token = create_access_token(identity=str(student.id))

    # Return success + user data (minus password)
    return jsonify({
        "message": "Registration successful",
        "access_token": access_token,
        "user": {
            "id": new_student.id,
            "name": new_student.name,
            "email": new_student.email
        }
    }), 201

# Login a user and set their JWT identity
@app.route('/api/login', methods=['POST'])
def login():
    """
    Input: { "email": "", "password": "" }
    Returns JWT access token if successful.
    """

    db = SessionLocal()
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        db.close()
        return jsonify({"message": "Missing email or password"}), 400

    # Check if user exists
    student = db.query(Student).filter_by(email=email).first()
    if not student:
        db.close()
        return jsonify({"message": "User not found"}), 404

    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), student.password_hash.encode('utf-8')):
        db.close()
        return jsonify({"message": "Invalid password"}), 401

    # Generate JWT Access Token
    access_token = create_access_token(identity=str(student.id))

    db.close()
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": student.id,
            "name": student.name,
            "email": student.email,
        }
    }), 200

# Return all courses in the system
@app.route('/api/courses', methods=['GET'])
def get_courses():
    """
    Returns all courses in the system.
    """

    db = SessionLocal()
    all_courses = db.query(Course).all()
    results = []
    # Append all fields for each course
    for c in all_courses:
        results.append({
            "id": c.id,
            "course_section": c.course_section,
            "course_title": c.course_title,
            "subject": c.subject,
            "course_description": c.course_description,
            "credits": c.credits,
            "academic_level": c.academic_level,
            "offering_period": c.offering_period,
            "start_date": c.start_date.isoformat() if c.start_date else None,
            "end_date": c.end_date.isoformat() if c.end_date else None,
            "instructional_format": c.instructional_format,
            "delivery_mode": c.delivery_mode,
            "course_tags": c.course_tags,
            "academic_units": c.academic_units,
            "section_status": c.section_status,
            "waitlist_capacity": c.waitlist_capacity,
            "enrolled_capacity": c.enrolled_capacity,
        })
    db.close()
    return jsonify({"courses": results}), 200

# Returns the user's profile information
@app.route('/api/get-profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Retrieves the user's profile information.
    """
    
    db = SessionLocal()

    # Retrieve current user ID from JWT
    user_id = get_jwt_identity()
    current_user = db.query(Student).filter_by(id=user_id).first()

    if not current_user:
        db.close()
        return jsonify({"message": "User not found"}), 404

    # Prepare user data
    user_data = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "completedCourses": json.loads(current_user.completed_courses) if current_user.completed_courses else [],
        "sports": json.loads(current_user.sports) if current_user.sports else [],
        "futureGoals": current_user.future_goals
    }

    db.close()
    return jsonify({"user": user_data}), 200

# Updates the student's profile data
@app.route('/api/update-account', methods=['POST'])
@jwt_required()
def update_profile():
    """
    Updates the student's profile data
    """

    db = SessionLocal()
    data = request.get_json()

    # Retrieve current user ID from JWT
    user_id = int(get_jwt_identity())
    current_user = db.query(Student).filter_by(id=user_id).first()

    if not current_user:
        db.close()
        return jsonify({"message": "User not found"}), 404

    # Update the user's profile data
    completed = data.get("completedCourses", [])
    sports = data.get("sports", [])
    goals = data.get("futureGoals", "")
    name = data.get("name", current_user.name)
    email = data.get("email", current_user.email)

    # Update the user's profile
    current_user.completed_courses = json.dumps(completed)
    current_user.sports = json.dumps(sports)
    current_user.future_goals = goals
    current_user.name = name
    current_user.email = email

    db.commit()
    db.close()

    return jsonify({"message": "Profile updated successfully"}), 200

# Returns a new valid schedule for the user
@app.route("/api/generate-schedule", methods=["POST"])
@jwt_required()
def generate_schedule():
    """
    Runs Swarm to build a schedule, parses the recommendations into JSON and returns it
    """

    # Parse the incoming JSON payload
    data = request.get_json() or {}
    user_data = data.get("userData", {})

    # Extract fields from user_data
    completed_courses = user_data.get("completedCourses", [])
    sports = user_data.get("sports", [])
    future_goals = user_data.get("futureGoals", "")

    # department_names = [d.name for d in departments]
    # Only these for now
    department_names = [
        "Computer Science Department",
        "Robotics Engineering Department",
        "Humanities and Arts Department",
    ]

    # Prepare context for the Swarm
    context_variables = {
        "completedCourses": completed_courses,
        "sports": sports,
        "futureGoals": future_goals,
        "departmentNames": department_names,
    }

    # Run the Swarm
    final_text = run_swarm(
        model_override="gpt-4o-mini", # can't use 4o idk
        messages=[{"role": "user", "content": "Generate a schedule."}],
        context_variables=context_variables,
    )

    # Parse final_text into something structured
    schedule_obj = {
        "recommendations": final_text.splitlines()
    }

    # Return the response
    return jsonify({
        "message": "Schedule generated",
        "schedule": schedule_obj
    }), 200


# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
