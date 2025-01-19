import os
import dotenv

from swarm import Swarm, Agent
from sqlalchemy.orm import Session

# You’ll need to import/create a function to get your database Session,
# or pass it in from your Flask route. Below we assume a function get_db_session()
# that returns an active SQLAlchemy session.
from models import Course, Department

dotenv.load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base

# Database configuration
DATABASE_URL = "sqlite:///WPI_COURSE_LISTINGS.db"

# Create a database engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create a configured "Session" class
SessionLocal = scoped_session(sessionmaker(bind=engine))

def get_db_session():
    """
    Provides a new SQLAlchemy session.
    """
    return SessionLocal()

# ------------------------------------------------------------------------------
# 1. HELPER FUNCTIONS TO QUERY THE DATABASE
# ------------------------------------------------------------------------------

def fetch_department_courses(db: Session, department_name: str):
    """
    Given a SQLAlchemy session and a department name, return all courses
    for that department, sorted in a helpful manner.
    """
    department = db.query(Department).filter(Department.name == department_name).first()
    if not department:
        return []
    
    return db.query(Course).filter(Course.department_id == department.id).all()

# Example logic for “filtering out” courses the student has completed:
def filter_completed(db_courses, completed_course_titles):
    """
    Return only the courses from db_courses whose titles are NOT in
    the student's completed courses list.
    """
    filtered = []
    for c in db_courses:
        # We assume completed_course_titles are raw strings like "CS 3733 - Software Engineering"
        # You might need more robust matching depending on how course titles are stored.
        if c.course_title not in completed_course_titles:
            filtered.append(c)
    return filtered

# ------------------------------------------------------------------------------
# 2. DEFINE DEPARTMENT AGENTS
# ------------------------------------------------------------------------------

# Each department agent’s job is to figure out what courses from its department
# the student might want to take. In a real scenario, you’d expand instructions
# to handle prerequisites, scheduling conflicts, etc.

def aerospace_instructions(context_variables):
    """
    Return instructions for the Aerospace agent. 
    context_variables might contain:
      - completedCourses
      - futureGoals
      - etc.
    """
    return """You are the Aerospace Department Agent. 
Given the user’s completed courses and goals, recommend some Aerospace Engineering courses.
Avoid any courses they've already completed.
"""


def mathematics_instructions(context_variables):
    return """You are the Mathematics Department Agent.
Recommend math courses that the user has not completed yet. 
Take into account any typical math requirements for their goals.
"""

def cs_instructions(context_variables):
    return """You are the Computer Science Department Agent.
Recommend relevant CS courses. Avoid courses the user has completed.
"""


# Department Agents
def aerospace_agent_function(context_variables):
    # This function is what the agent "does" when called.
    db = get_db_session()
    completed_titles = context_variables.get("completedCourses", [])
    
    courses = fetch_department_courses(db, "Aerospace Engineering Department")
    filtered = filter_completed(courses, completed_titles)

    # Return a text recommendation
    if not filtered:
        return "No new Aerospace Engineering courses to recommend, as you’ve completed them all or none found."
    else:
        recommended_titles = [f"{c.course_title} ({c.course_section})" for c in filtered[:3]]
        return (
            "Recommended Aerospace Engineering courses:\n"
            + "\n".join(recommended_titles)
        )

def math_agent_function(context_variables):
    db = get_db_session()
    completed_titles = context_variables.get("completedCourses", [])

    courses = fetch_department_courses(db, "Mathematical Sciences Department")
    filtered = filter_completed(courses, completed_titles)

    if not filtered:
        return "No new Math courses to recommend."
    else:
        recommended_titles = [f"{c.course_title} ({c.course_section})" for c in filtered[:3]]
        return "Recommended Math courses:\n" + "\n".join(recommended_titles)

def cs_agent_function(context_variables):
    db = get_db_session()
    completed_titles = context_variables.get("completedCourses", [])

    courses = fetch_department_courses(db, "Computer Science Department")
    filtered = filter_completed(courses, completed_titles)

    if not filtered:
        return "No new Computer Science courses to recommend."
    else:
        recommended_titles = [f"{c.course_title} ({c.course_section})" for c in filtered[:3]]
        return "Recommended CS courses:\n" + "\n".join(recommended_titles)

# Define Agents
aerospace_agent = Agent(
    name="Aerospace Agent",
    instructions=aerospace_instructions,
    functions=[],
    agent_function=aerospace_agent_function
)

math_agent = Agent(
    name="Math Agent",
    instructions=mathematics_instructions,
    functions=[],
    agent_function=math_agent_function
)

cs_agent = Agent(
    name="CS Agent",
    instructions=cs_instructions,
    functions=[],
    agent_function=cs_agent_function
)


# ------------------------------------------------------------------------------
# 3. DEFINE A “ROUTER” AGENT
# ------------------------------------------------------------------------------
#
# This agent decides which department(s) to query based on the user’s data.

def schedule_router_instructions(context_variables):
    """
    The router inspects user data, decides which department agents to call, 
    and composes a final schedule recommendation.
    """
    return """You are the Schedule Router. 
Look at the student's 'futureGoals', 'completedCourses', etc., 
and decide which department agents to call. 
Then compile their responses into a final recommended schedule.
"""

def router_agent_function(context_variables):
    """
    This is the code that actually runs when the Router agent is triggered.
    We can call each department agent that we think is relevant.
    In a real app, you might parse futureGoals or other user data 
    to decide which agents to invoke.
    """
    # We'll just call all three for demo.
    # context_variables has "db", "completedCourses", etc.

    # 1. Call the aerospace agent
    aerospace_result = aerospace_agent.run(
        messages=[],
        context_variables=context_variables
    ).messages[-1]["content"]

    # 2. Call the math agent
    math_result = math_agent.run(
        messages=[],
        context_variables=context_variables
    ).messages[-1]["content"]

    # 3. Optionally call the CS agent
    cs_result = cs_agent.run(
        messages=[],
        context_variables=context_variables
    ).messages[-1]["content"]

    # Combine them
    final_recommendation = (
        f"{aerospace_result}\n\n"
        f"{math_result}\n\n"
        f"{cs_result}\n"
    )

    return final_recommendation


schedule_router = Agent(
    name="Schedule Router Agent",
    instructions=schedule_router_instructions,
    functions=[],
    agent_function=router_agent_function
)


# ------------------------------------------------------------------------------
# 4. CREATE A TOP-LEVEL SWARM CLIENT
# ------------------------------------------------------------------------------
# In your code, you can create a single instance or create it dynamically.
# We'll do a single instance:
schedule_swarm = Swarm()
