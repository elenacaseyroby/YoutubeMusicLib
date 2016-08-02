from flask import Flask
from flask_login import LoginManager
from sqlalchemy.orm import sessionmaker
from app import models
#from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
login_manager = LoginManager()
login_manager.init_app(app)
app.config.from_object('config')
#db = SQLAlchemy(app)

#start session
Session = sessionmaker(bind=models.engine)
Session.configure(bind=models.engine) 
sql_session = Session()

print("~~~~~~~~~~~start~~~~~~~~~~")

from app import views, models #imports views.py from the app package



