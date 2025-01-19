import os
import dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from swarm import Swarm, Agent
import logging

from models import Course, Department

dotenv.load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///WPI_COURSE_LISTINGS.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = scoped_session(sessionmaker(bind=engine))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

context_vars = {}

# Database helper functions
def fetch_department_courses(department_name: str):
    """
    Fetch all courses for a given department.
    """
    db = SessionLocal()
    try:
        department = db.query(Department).filter(Department.name == department_name).first()
        if not department:
            logger.warning(f"Department '{department_name}' not found in the database.")
            return []
        courses = db.query(Course).filter(Course.department_id == department.id).all()
        return [course.course_title for course in courses]
    except Exception as e:
        logger.error(f"Error fetching courses for department '{department_name}': {e}")
        return []
    finally:
        db.close()

# Handoff functions
def transfer_to_cs_agent():
    print("Switching to Computer Science Agent...")
    return cs_agent

def transfer_to_robotics_agent():
    print("Switching to Robotics Agent...")
    return robotics_agent

def transfer_to_humanities_agent():
    print("Switching to Humanities Agent...")
    return humanities_agent

def transfer_to_business_agent():
    print("Switching to Business School Agent...")
    return business_agent

def transfer_to_ece_agent():
    print("Switching to Electrical and Computer Engineering Agent...")
    return ece_agent

def transfer_to_chem_eng_agent():
    print("Switching to Chemical Engineering Agent...")
    return chem_eng_agent

def transfer_to_math_agent():
    print("Switching to Mathematical Sciences Agent...")
    return math_agent

def transfer_to_physics_agent():
    print("Switching to Physics Agent...")
    return physics_agent

def transfer_to_mech_eng_agent():
    print("Switching to Mechanical and Materials Engineering Agent...")
    return mech_eng_agent

def transfer_to_bio_biotech_agent():
    print("Switching to Biology and Biotechnology Agent...")
    return bio_biotech_agent

def transfer_to_wpe_agent():
    print("Switching to Physical Education Agent...")
    return wpe_agent

def transfer_back_to_router():
    print("Switching back to Schedule Router...")
    return schedule_router

# Subject agents
cs_agent = Agent(
    name="Computer Science Agent",
    instructions=f"""
You are the Computer Science Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Computer Science courses from the database.
Use 'fetch_cs_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

robotics_agent = Agent(
    name="Robotics Agent",
    instructions=f"""
You are the Robotics Engineering Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Robotics Engineering courses from the database.
Use 'fetch_robotics_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

humanities_agent = Agent(
    name="Humanities Advisor",
    instructions=f"""
You are the Humanities Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Humanities courses from the database.
Use 'fetch_humanities_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

business_agent = Agent(
    name="Business School Agent",
    instructions=f"""
You are the Business School Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Business courses from the database.
Use 'fetch_business_courses()' to retrieve available courses.
Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

ece_agent = Agent(
    name="Electrical and Computer Engineering Agent",
    instructions=f"""
You are the Electrical and Computer Engineering Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Electrical and Computer Engineering courses from the database.
Use 'fetch_ece_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

chem_eng_agent = Agent(
    name="Chemical Engineering Agent",
    instructions=f"""
You are the Chemical Engineering Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Chemical Engineering courses from the database.
Use 'fetch_chem_eng_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

math_agent = Agent(
    name="Mathematical Sciences Agent",
    instructions=f"""
You are the Mathematical Sciences Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Mathematics courses from the database.
Use 'fetch_math_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

physics_agent = Agent(
    name="Physics Agent",
    instructions=f"""
You are the Physics Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Physics courses from the database.
Use 'fetch_physics_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

mech_eng_agent = Agent(
    name="Mechanical and Materials Engineering Agent",
    instructions=f"""
You are the Mechanical and Materials Engineering Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Mechanical and Materials Engineering courses from the database.
Use 'fetch_mech_eng_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

bio_biotech_agent = Agent(
    name="Biology and Biotechnology Agent",
    instructions=f"""
You are the Biology and Biotechnology Advisor. 
Your task is to respond with all the best course recommendations for the user based on their previous courses.
You have access to functions to fetch Biology and Biotechnology courses from the database.
Use 'fetch_bio_biotech_courses()' to retrieve available courses.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

wpe_agent = Agent(
    name="Physical Education Agent",
    instructions=f"""
You are the Physical Education Advisor.
Your task is to recommend suitable sports or physical education courses for the student.
You have access to the student's sports interests.
    Ensure you exclude any courses the student has already completed.
    The user has the following information:
    - {context_vars.get("completedCourses", [])}
    - {context_vars.get("sports", [])}
    - {context_vars.get("futureGoals", [])}
    Transfer back to the router after giving your recommendations.
""",
    functions=[transfer_back_to_router],
)

# Router agent to generate the final schedule
def router_instructions(context_variables):
    """
    Instructions for the Schedule Router to generate a schedule based on context.
    """
    return f"""
    You are the Schedule Router. Your task is to generate a course schedule for the student.
    Use the provided context to select appropriate departments and recommend courses.
    All the departments you have access to are: [{context_variables.get("departmentNames", [])}]
    Select 3 courses TOTAL from the available departments, ensuring none are from the student's completed courses.
    Use the available agents to fetch and recommend courses as needed.
    The user has the following information:
    - {context_variables.get("completedCourses", [])}
    - {context_variables.get("sports", [])}
    - {context_variables.get("futureGoals", [])}
    Return the final schedule of 3 courses in a clear and structured format. Please indicate that this is your final schedule in your response.
    There will be no further interactions after this. 
    Wish them good luck on their term or prompt them to click the button below for you to edit their information and allow you to try again.
    """

schedule_router = Agent(
    name="Schedule Router",
    instructions=router_instructions,
    functions=[
        transfer_to_cs_agent,
        transfer_to_robotics_agent,
        transfer_to_humanities_agent,
        transfer_to_business_agent,
        transfer_to_ece_agent,
        transfer_to_chem_eng_agent,
        transfer_to_math_agent,
        transfer_to_physics_agent,
        transfer_to_mech_eng_agent,
        transfer_to_bio_biotech_agent,
        transfer_to_wpe_agent,
    ],
)


client = Swarm()

# Agent implementations

def fetch_cs_courses():
    """Returns all computer science courses that the student has not completed."""
    return fetch_department_courses("Computer Science Department")

def fetch_robotics_courses():
    """Returns all robotics courses that the student has not completed."""
    return fetch_department_courses("Robotics Engineering Department")

def fetch_humanities_courses():
    """Returns all humanities and arts courses that the student has not completed."""
    return fetch_department_courses("Humanities and Arts Department")

def fetch_business_courses():
    """Returns all business school courses that the student has not completed."""
    return fetch_department_courses("Business School")

def fetch_ece_courses():
    """Returns all electrical and computer engineering courses that the student has not completed."""
    return fetch_department_courses("Electrical and Computer Engineering Department")

def fetch_chem_eng_courses():
    """Returns all chemical engineering courses that the student has not completed."""
    return fetch_department_courses("Chemical Engineering Department")

def fetch_math_courses():
    """Returns all mathematical sciences courses that the student has not completed."""
    return fetch_department_courses("Mathematical Sciences Department")

def fetch_physics_courses():
    """Returns all physics courses that the student has not completed."""
    return fetch_department_courses("Physics Department")

def fetch_mech_eng_courses():
    """Returns all mechanical and materials engineering courses that the student has not completed."""
    return fetch_department_courses("Mechanical and Materials Engineering Department")

def fetch_bio_biotech_courses():
    """Returns all biology and biotechnology courses that the student has not completed."""
    return fetch_department_courses("Biology and Biotechnology Department")

def fetch_wpe_courses():
    """Returns all physical education courses that the student has not completed."""
    return fetch_department_courses("Physical Education and Athletics Department")

# Assign functions to agents
cs_agent.functions.append(fetch_cs_courses)
robotics_agent.functions.append(fetch_robotics_courses)
humanities_agent.functions.append(fetch_humanities_courses)
business_agent.functions.append(fetch_business_courses)
ece_agent.functions.append(fetch_ece_courses)
chem_eng_agent.functions.append(fetch_chem_eng_courses)
math_agent.functions.append(fetch_math_courses)
physics_agent.functions.append(fetch_physics_courses)
mech_eng_agent.functions.append(fetch_mech_eng_courses)
bio_biotech_agent.functions.append(fetch_bio_biotech_courses)

# Main function to run the swarm
def run_swarm(model_override, messages, context_variables):
    """
    Main entry point for generating a schedule.
    """
    # Initialize a new Swarm client instance
    swarm_client = Swarm()

    global context_vars
    context_vars = context_variables

    # Start the swarm with the Schedule Router
    response = swarm_client.run(
        agent=schedule_router,
        messages=messages,
        context_variables=context_variables,
        model_override=model_override
    )

    return response.messages[-1]["content"]