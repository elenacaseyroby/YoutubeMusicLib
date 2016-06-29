#!/usr/bin/python

from flask import render_template, flash, redirect, request
from app import app, models
from .forms import LoginForm

#use namespaces to pull controllers and models

@app.route('/')
@app.route('/index')

def index():
	return render_template('index.html')


@app.route('/postlistens', methods=['POST'])
def postlistens():
  #do stuff with json data here! ;)
  """
  print request.form["user_id"]
  print request.form["youtube_id"]
    # # also imaginary:
    # new_listen = User(name=request.form["user_id"],
    #                 status=request.form["youtube_id"])
    # db.session.add(new_listen)
    # db.session.commit()
    return "success"


  """

@app.route('/confirmplays')

def cleandata():
	return render_template('cleandata.html')

@app.route('/login', methods=['GET', 'POST'])

def login():
    form = LoginForm()
    if form.validate_on_submit():
        flash('Login requested for OpenID="%s", remember_me=%s' %
              (form.openid.data, str(form.remember_me.data)))
        return redirect('/index')
    return render_template('login.html', 
                           title='Sign In',
                           form=form,
                           providers=app.config['OPENID_PROVIDERS'])



		






