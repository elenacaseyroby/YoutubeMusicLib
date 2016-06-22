#!/usr/bin/python

from flask import render_template, flash, redirect
from app import app
from .forms import LoginForm

#use namespaces to pull controllers and models

@app.route('/')
@app.route('/index')

def index():
	return render_template('index.html')

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



		






