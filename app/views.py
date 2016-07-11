#!/usr/bin/python
from flask import render_template, flash, redirect, request, Flask
from app import app, models, session #,db
from .forms import LoginForm
from json import loads



@app.route('/')
@app.route('/index')

def index():
  return render_template('index.html')

@app.route('/play')

def playMusic():
  return render_template('play.html')

@app.route('/printplaylist', methods=['POST'])

def printPlayList():
  """
  #get info from post request
  vid_info = [];
  print "~~~~~~ vid info ~~~~~~~"
  vid_info = [loads(request.form["vid1"]), 
              loads(request.form["vid2"]),
              loads(request.form["vid3"])]
  print vid_info[0]['id']"""
  return render_template('play.html')

@app.route('/postlistens', methods=['POST'])


def postlistens():
  #move into model
    session.rollback()
    #if new vid post to db
    video_in_db = session.query(models.Video).filter_by(youtube_id = request.form["youtube_id"]).first()
    if not video_in_db:
      new_video = models.Video(youtube_id=request.form["youtube_id"],
                    youtube_title=request.form["youtube_title"],
                    title = request.form["youtube_title"])#edit so it only adds vid info if it doesn't already exist
      session.add(new_video)
      session.commit()
    #post listen
    new_listen = models.Listen(user_id=request.form["user_id"],
                  youtube_id=request.form["youtube_id"],
                  listened_to_end=request.form["listened_to_end"])
    session.add(new_listen)
    session.commit()

    return "success"
    
@app.route('/listens')

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






		






