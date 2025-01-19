import os
import json
import bcrypt
from datetime import datetime, timedelta
from math import ceil

from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity
)
from flask_cors import CORS
import openai
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker, scoped_session

from models import Base, Department, Course, Instructor, Location, Enrollment, Student, StudentClass

from schedule_swarm import schedule_swarm, schedule_router

# Configuration
DATABASE_URL = "sqlite:///WPI_COURSE_LISTINGS.db"
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
    Register a new user (Student).
    Expects JSON: { "name": ..., "email": ..., "password": ... }
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
    User login. 
    Expects JSON: { "email": ..., "password": ... }
    Returns JWT access token if successful.
    """
    db = SessionLocal()
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        db.close()
        return jsonify({"message": "Missing email or password"}), 400

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
            # You can add more fields if needed
        }
    }), 200

# Return all courses in the system
@app.route('/api/courses', methods=['GET'])
def get_courses():
    """
    Returns all courses in the system.
    This is a public route.
    """
    db = SessionLocal()
    all_courses = db.query(Course).all()
    results = []
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
            # Add more fields as necessary
        })
    db.close()
    return jsonify({"courses": results}), 200

# Search for courses by ID or name with pagination and sorting
@app.route('/api/search_courses', methods=['GET'])
@jwt_required()
def search_courses():
    db = SessionLocal()
    try:
        # Extract query parameters with default values
        course_id = request.args.get('id', type=int)
        name = request.args.get('name', type=str)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        sort_by = request.args.get('sort_by', 'course_title')
        sort_order = request.args.get('sort_order', 'asc')

        # Define allowed sort fields
        allowed_sort_fields = ['course_title', 'credits', 'subject']
        if sort_by not in allowed_sort_fields:
            sort_by = 'course_title'

        # Build the query based on filters
        query = db.query(Course)
        if course_id:
            query = query.filter(Course.id == course_id)
        if name:
            query = query.filter(Course.course_title.ilike(f"%{name}%"))

        # Apply sorting
        sort_column = getattr(Course, sort_by)
        if sort_order.lower() == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Calculate total results for pagination
        total = query.count()

        # Apply pagination
        courses = query.offset((page - 1) * per_page).limit(per_page).all()
        total_pages = ceil(total / per_page) if per_page else 1

        # Serialize course data
        courses_list = [{
            "id": course.id,
            "course_section": course.course_section,
            "course_title": course.course_title,
            "subject": course.subject,
            "course_description": course.course_description,
            "credits": course.credits,
            "academic_level": course.academic_level,
            "offering_period": course.offering_period,
            "start_date": course.start_date.isoformat() if course.start_date else None,
            "end_date": course.end_date.isoformat() if course.end_date else None,
            "instructional_format": course.instructional_format,
            "delivery_mode": course.delivery_mode,
            "course_tags": course.course_tags,
            "academic_units": course.academic_units,
            "section_status": course.section_status,
            "waitlist_capacity": course.waitlist_capacity,
            "enrolled_capacity": course.enrolled_capacity,
        } for course in courses]

        # Return the response
        return jsonify({
            "courses": courses_list,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }), 200

    except Exception as e:
        # Log the error for debugging
        return jsonify({"message": "An error occurred while searching for courses."}), 500
    finally:
        # Ensure the database session is closed
        db.close()


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
    Updates the student's profile data: completed_courses, sports, future_goals, name, email.
    Expects JSON: {
      "completedCourses": [...],
      "sports": [...],
      "futureGoals": "some text here",
      "name": "...",
      "email": "..."
    }
    """
    db = SessionLocal()
    data = request.get_json()

    # Retrieve current user ID from JWT
    user_id = int(get_jwt_identity())
    current_user = db.query(Student).filter_by(id=user_id).first()

    if not current_user:
        db.close()
        return jsonify({"message": "User not found"}), 404

    completed = data.get("completedCourses", [])
    sports = data.get("sports", [])
    goals = data.get("futureGoals", "")
    name = data.get("name", current_user.name)
    email = data.get("email", current_user.email)

    current_user.completed_courses = json.dumps(completed)
    current_user.sports = json.dumps(sports)
    current_user.future_goals = goals
    current_user.name = name
    current_user.email = email

    db.commit()
    db.close()

    return jsonify({"message": "Profile updated successfully"}), 200

# Returns a new valid schedule for the user
@app.route('/api/generate-schedule', methods=['POST'])
@jwt_required()
def generate_schedule():
    """
    Runs the multi-agent Swarm, parses the recommendations into JSON,
    and returns the generated schedule directly. Uses data from the request
    payload rather than from the DB for completed courses, sports, and goals.
    """
    # 1. Parse the incoming JSON payload
    data = request.get_json() or {}
    
    # 'userData' might look like:
    # {
    #   "completedCourses": [...],
    #   "sports": [...],
    #   "futureGoals": "...",
    #   ...
    # }
    user_data = data.get("userData", {})
    
    # Extract fields from user_data
    completed_courses = user_data.get("completedCourses", [])
    sports = user_data.get("sports", [])
    future_goals = user_data.get("futureGoals", "")
    
    # 2. (Optional) Confirm the user actually exists in the database 
    #    (if you still want to ensure the user from JWT is valid).
    #    Otherwise, you can remove these lines entirely.
    db = SessionLocal()
    user_id = get_jwt_identity()
    current_user = db.query(Student).filter_by(id=user_id).first()
    if not current_user:
        db.close()
        return jsonify({"message": "User not found"}), 404

    # 3. (Optional) Fetch department names from the DB.
    #    If you don't need this data from the DB, remove or replace with a static list.
    departments = db.query(Department).all()
    db.close()
    department_names = [d.name for d in departments]

    # 4. Prepare context for the Swarm
    context_variables = {
        "completedCourses": completed_courses,
        "sports": sports,
        "futureGoals": future_goals,
        "departmentNames": department_names,
    }

    # 5. Run the Swarm
    try:
        result = schedule_swarm.run(
            agent=schedule_router,
            model_override="gpt-4o-mini",
            messages=[{"role": "user", "content": "Generate a schedule."}],
            context_variables=context_variables
        )
    except openai.error.OpenAIError as e:
        return jsonify({"message": f"Swarm error: {str(e)}"}), 500

    final_text = result.messages[-1]["content"]

    # 6. Parse final_text into something structured
    schedule_obj = {
        "recommendations": final_text.splitlines()
    }

    # 7. Return the response
    return jsonify({
        "message": "Schedule generated",
        "schedule": schedule_obj
    }), 200


# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
