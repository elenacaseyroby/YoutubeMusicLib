from flask import Flask

app = Flask(__name__)
from app import views #imports views.py from the app package