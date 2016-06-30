#!/usr/bin/python

from flask import render_template, flash, redirect, request, Flask
from app import db, app, models
from .forms import LoginForm

from sqlalchemy.engine import reflection

@app.route('/')
@app.route('/index')

def index():
  return render_template('index.html')

@app.route('/postlistens', methods=['POST'])

def postlistens():
    print "~~~~~~~~~~  postlistens  ~~~~~~~~~"
    #db.session.rollback()
    print "models.engine"
    print models.engine
    insp = reflection.Inspector.from_engine(models.engine)
    print "~~~~~~~~~~ table names ~~~~~~~~~~~"
    print(insp.get_table_names())
    #connected to db!

    new_listen = models.Listen(user_id=request.form["user_id"],
                  youtube_id=request.form["youtube_id"],
                  time_start=request.form["time_start"],
                  time_end= request.form["time_end"])
    print "~~~~~~~~~~ new listen ! ~~~~~~~~~~~~"
    print new_listen.youtube_id
    print db.engine
    print db.session
    db.session.add(new_listen)
    db.session.commit()
    new_video = models.Video(youtube_id=request.form["youtube_id"],
                  title=request.form["title"])#edit so it only adds vid info if it doesn't already exist
    db.session.add(new_video)
    db.session.commit()
    print "~~~~~~~~~~ sent data! ~~~~~~~~~~~~"

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






		






