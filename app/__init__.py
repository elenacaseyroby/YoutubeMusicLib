from flask import Flask
from sqlalchemy.orm import sessionmaker
from app import models
#from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
#db = SQLAlchemy(app)

#start session
Session = sessionmaker(bind=models.engine)
Session.configure(bind=models.engine) 
sql_session = Session()

from app import views, models #imports views.py from the app package



