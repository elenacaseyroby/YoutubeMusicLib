#!/usr/bin/python

from flask import render_template
from app import app

@app.route('/')
@app.route('/index')

def index():
	return render_template('index.html')

@app.route('/confirmplays')

def cleandata():
	return render_template('cleandata.html')

		






