import json
from datetime import datetime, timedelta
from functools import wraps
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Course, Instructor, Location, Enrollment, Student, StudentClass
from flask import Flask, request, jsonify
import jwt  # Install PyJWT via pip
import bcrypt  # For password hashing, install via pip

# Configuration
DATABASE_URL = "sqlite:///WPI_COURSE_LISTINGS.db"

# TODO: flask app, routes and such