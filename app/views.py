#!/usr/bin/python
from flask import render_template, flash, redirect, request, Flask
from app import app, models, session #,db
from .forms import LoginForm
from json import loads
from sqlalchemy import text, update
import datetime

#will update once logins have been implemented
user_id = 1;

class displayupdate_page_row_object:
    def __init__(self, index, play, library, music, title, artist, album, release_date, youtube_id, artist_id, album_id):
        self.index = index
        self.play = play
        self.library = library
        self.music = music
        self.title = title
        self.artist = artist
        self.album = album
        self.release_date = release_date
        self.youtube_id = youtube_id
        self.artist_id = artist_id
        self.album_id = album_id

    def __getitem__ (self, index, play, library, music, title, artist, album, release_date, youtube_id, artist_id, album_id):
        return self.index 
        return self.play 
        return self.library 
        return self.music 
        return self.title 
        return self.artist 
        return self.album 
        return self.release_date 
        return self.youtube_id 
        return self.artist_id 
        return self.album_id 

@app.route('/')
@app.route('/index')
@app.route('/play')

def playMusic():
  return render_template('play.html')

@app.route('/listens', methods = ['GET'])
def listens():
  #set dates from form submission 
  #if those are empty set default dates
  now = datetime.datetime.now()
  today = now.strftime("%Y-%m-%d %H:%M:%S") #format should be '2016-07-10 19:12:18'
  oneweekago = datetime.date.today() - datetime.timedelta(days=7)
  oneweekago = oneweekago.strftime("%Y-%m-%d %H:%M:%S")


  if not request.args.get("search_start_date"):
    search_start_date = oneweekago
  else:
    search_start_date = request.args.get("search_start_date");
  if not request.args.get("search_end_date"):
    search_end_date = today
  else:
    search_end_date = request.args.get("search_end_date");
  print search_end_date
  print search_start_date
  listens = getlistensdata(search_start_date = search_start_date, search_end_date = search_end_date) 
  return render_template('displayupdate_data.html', display_update_rows = listens, search_start_date = search_start_date, search_end_date = search_end_date, islistens = "true")


@app.route('/library')

def library():
  library = list()
  library = getlibrary(user_id)
  if not library:
    return render_template('nolibrarymessage.html')
  else:
    return render_template('displayupdate_data.html', display_update_rows = library, islistens = "false")


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

# post listens from play page
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

#get listens data for listens page
def getlistensdata(search_start_date, search_end_date):
  session.rollback()
  limit = 30
  listens = list()
  start_date = search_start_date
  end_date = search_end_date

  sql = text("""SELECT listens.id
   , listens.youtube_id
   , listens.time_of_listen
   , videos.youtube_title
   , videos.title
   , videos.music
   , videos.release_date
   , artists.artist_name as artist
   , cities.name
   , albums.name as album
   , albums.track_num
   , artists.id as artist_id
   , albums.id as album_id
   FROM listens
   JOIN videos ON listens.youtube_id = videos.youtube_id
   JOIN albums ON videos.album_id = albums.id
   JOIN artists ON videos.artist_id = artists.id
   JOIN cities ON artists.city_id = cities.id
   WHERE listens.user_id = """+str(user_id)+"""
   AND listens.time_of_listen > '"""+str(start_date)+"""'
   AND listens.time_of_listen < '"""+str(end_date)+"""'
   AND listens.listened_to_end != 1 
   GROUP BY listens.id 
   ORDER BY listens.time_of_listen DESC
   LIMIT """+str(limit)+";""")

  results = models.engine.execute(sql)
  for result in results:
    #if result[1] (youtube_id) is in list of user's saved vids, then 
    # var library = 1, else = 0 
    listen = displayupdate_page_row_object(index = result[2].strftime('%a %I:%M %p') #time_of_listen
                            , play = 0
                            , library = 0
                            , music= result[5]
                            , title= result[4]
                            , artist = result[7]
                            , album = result[9]
                            , release_date = result[6]
                            , youtube_id = result[1]
                            , artist_id = result[11]
                            , album_id = result[12]
                            )
    listens.append(listen)

  return listens 

#update data from listens and library pages
@app.route('/updatedata', methods = ['POST'])
def updatedata():
  album_id = 2
  artist_id = 1
  #error: not updating middle row of 3 like the other two

  session.rollback()
  artist_by_name = session.query(models.Artist).filter_by(artist_name = request.form["artist"]).first()
  album_by_name = session.query(models.Album).filter_by(name = request.form["album"]).first()

  #if artist name exists in db but it is not already tied to video, update videos table row with new artist_id
  if artist_by_name:
    artist_id = artist_by_name.id

  else:#if artist name doesn't exist in db, add new row to artists table
    session.rollback()
    new_artist = models.Artist(artist_name=request.form["artist"])#edit so it only adds vid info if it doesn't already exist
    session.add(new_artist)
    session.commit()
    new_artist_id = session.query(models.Artist).filter_by(artist_name = request.form["artist"]).first()
    artist_id = int(new_artist_id.id)
  
  session.rollback()
  if album_by_name:
    album_id = album_by_name.id
  else: 
    session.rollback()
    new_album = models.Album(name=request.form["album"])#edit so it only adds vid info if it doesn't already exist
    session.add(new_album)
    session.commit()
    new_album_id = session.query(models.Album).filter_by(name = request.form["album"]).first()
    album_id = int(new_album_id.id)
  
  session.rollback()
  video_update = session.query(models.Video).filter_by(youtube_id = request.form["youtube_id"]).first()
  video_update.title=request.form["title"]
  video_update.music=request.form["music"]
  video_update.artist_id=int(artist_id)
  video_update.album_id=int(album_id)
  session.commit() 

  session.rollback()
  if request.form['library'] == "1": 
  #only updates if add to library was checked,
  #since unchecked is default right now.
    saved_vids = session.query(models.SavedVid).filter_by(youtube_id = request.form["youtube_id"], user_id = user_id).first()
    if not saved_vids:
      new_saved_vid = models.SavedVid(youtube_id = request.form["youtube_id"]
                                     , user_id = user_id)
      session.add(new_saved_vid)
      session.commit()

  return "success"

#pulls data for library page
def getlibrary(user_id):
  session.rollback()
  listens = list()
  saved_vids = session.query(models.SavedVid).filter_by(user_id = user_id).first()
  if saved_vids:
    sql = text("""SELECT videos.youtube_id
   , videos.youtube_title
   , videos.title
   , videos.music
   , videos.release_date
   , artists.artist_name as artist
   , cities.name
   , albums.name as album
   , albums.track_num
   , artists.id as artist_id
   , albums.id as album_id
   FROM saved_vids
   JOIN videos ON saved_vids.youtube_id = videos.youtube_id
   JOIN albums ON videos.album_id = albums.id
   JOIN artists ON videos.artist_id = artists.id
   JOIN cities ON artists.city_id = cities.id
   WHERE saved_vids.user_id = """+str(user_id)+"""
   ORDER BY videos.title DESC;""")

    results = models.engine.execute(sql)
    for result in results:

      listen = displayupdate_page_row_object( index = ""
                              , play = 0
                              , library = 1
                              , music= result[3]
                              , title= result[2]
                              , artist = result[5]
                              , album = result[7]
                              , release_date = result[4]
                              , youtube_id = result[0]
                              , artist_id = result[9]
                              , album_id = result[10]
                              )
      listens.append(listen)

  return listens 


#query not in use yet
def getgenres(youtube_id):
  sql = text("""SELECT 
genres.name
,videos.youtube_title
,videos.youtube_id
,videos.title
,artists.artist_name
FROM videos
JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id
JOIN genres ON vids_genres.genre_id = genres.id
JOIN artists ON videos.artist_id = artists.id
WHERE videos.youtube_id ='"""+youtube_id+"';")
  result = models.engine.execute(sql)
  return result

#query not in use yet
def getsimilarartists(youtube_id):
  sql = text("""SELECT 
a1.artist_name
FROM videos
JOIN similar_artists s1 ON videos.artist_id = s1.artist_id1
JOIN artists a1 ON s1.artist_id2 = a1.id
WHERE videos.youtube_id = '"""+youtube_id+"""';""")
  result1 = models.engine.execute(sql)

  for result in result1:
    print result

  sql = text("""SELECT 
a2.artist_name
FROM videos
JOIN similar_artists s2 ON videos.artist_id = s2.artist_id2
JOIN artists a2 ON s2.artist_id1 = a2.id
WHERE videos.youtube_id = '"""+youtube_id+"""';""")
  result2 = models.engine.execute(sql)

  for result in result2:
    print result
  #result = result1 + result2
  #result = list(set(result)) #remove redundancies
  return "success"



