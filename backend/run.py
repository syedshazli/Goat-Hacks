import os
import dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from swarm import Swarm, Agent
import logging
from models import Course, Department

dotenv.load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///WPI_COURSES.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = scoped_session(sessionmaker(bind=engine))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

courses = {}

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
    print("Switching to humanities Agent...")
    return humanities_agent

def transfer_back_to_router():
    print("Switching back to Schedule Router...")
    return schedule_router

# Subject agents
cs_agent = Agent(
    name="Computer Science Agent",
    instructions="""
        You are the Computer Science Advisor. Your task is to help generate a Computer Science course recommendation.
        You have access to functions to fetch Computer Science courses from the database.
        Use 'fetch_cs_courses()' to retrieve available courses.
        Transfer back to the router after giving your recommendations
        """,
    functions=[transfer_back_to_router],
)

robotics_agent = Agent(
    name="Robotics Agent",
    instructions="""
        You are the Robotics Engineering Advisor. Your task is to help generate a Robotics course recommendation.
        You have access to functions to fetch Robotics Engineering courses from the database.
        Use 'fetch_robotics_courses()' to retrieve available courses.
        Transfer back to the router after giving your recommendations
        """,
    functions=[transfer_back_to_router],
)

humanities_agent = Agent(
    name="Humanities Advisor",
    instructions="""
        You are the Humanities Advisor. Your task is to help generate a Humanities course recommendation.
        You have access to functions to fetch Humanities courses from the database.
        Use 'fetch_humanities_courses()' to retrieve available courses.
        Transfer back to the router after giving your recommendations
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
    Select 3 courses total from the available departments, ensuring none are from the student's completed courses.
    If you choose to, you may add a 4th WPE course. These do not count as full courses. Always add this if the user plays a sport.
    Use the available agents to fetch and recommend courses as needed.
    The user has the following information:
    - {context_variables.get("completedCourses", [])}
    - {context_variables.get("sports", [])}
    - {context_variables.get("futureGoals", [])}
    Return the final schedule of 3 courses in a clear and structured format. Please indicate that this is your 'final' schedule in your response.
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
    ],
)

client = Swarm()

# Agent functions

def fetch_cs_courses():
    """Returns all computer science courses that the student has not completed."""
    return fetch_department_courses("Computer Science Department")

def fetch_robotics_courses():
    """Returns all robotics courses that the student has not completed."""
    return fetch_department_courses("Robotics Engineering Department")

def fetch_humanities_courses():
    """Returns all humanities and arts courses that the student has not completed."""
    return fetch_department_courses("Humanities and Arts Department")

# Attach the functions to the agents
cs_agent.functions.append(fetch_cs_courses)
robotics_agent.functions.append(fetch_robotics_courses)
humanities_agent.functions.append(fetch_humanities_courses)

# Main function to run the Swarm
def run_swarm(model_override, messages, context_variables):

    swarm_client = Swarm()

    # Start the swarm with the schedule router
    response = swarm_client.run(
        agent=schedule_router,
        messages=messages,
        context_variables=context_variables,
        model_override=model_override
    )

    return response.messages[-1]["content"]