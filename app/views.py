#!/usr/bin/python
from flask import render_template, flash, session, redirect, request, Flask, url_for, jsonify
from flask_oauthlib.client import OAuth
from app import app, models, sql_session, login_manager
from .forms import LoginForm
from json import loads
from .myfunctions import sortnumbers
from sqlalchemy import text, update, func
from urllib.request import Request, urlopen
from urllib.parse import unquote
from urllib.error import URLError
import datetime, re

GOOGLE_CLIENT_ID = '273956341734-jhk5ekhmrbeebqfef7d6f3vfeqf0aprg.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = 'ORbZWAUlZRk9Ixi5OjU-izDZ'
 
oauth = OAuth(app)

google = oauth.remote_app('google',
  base_url='https://www.googleapis.com/oauth2/v1/',
  authorize_url='https://accounts.google.com/o/oauth2/auth',
  request_token_url=None,
  request_token_params={'scope': 'email'},
  access_token_url='https://accounts.google.com/o/oauth2/token',
  access_token_method='POST',
  consumer_key=GOOGLE_CLIENT_ID,
  consumer_secret=GOOGLE_CLIENT_SECRET)

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
def index():
  if 'google_token' in session:
    return redirect(url_for('playMusic'))
  return redirect(url_for('login'))

@app.route('/play')
def playMusic():
  if 'google_token' in session:
    return render_template('play.html')
  return redirect(url_for('login'))

@app.route('/listens', methods = ['GET'])
def listens():
  if 'google_token' in session:
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
      search_end_date = request.args.get("search_end_date")
    search_artist = request.args.get("search_artist", "%")
    if search_artist == "":
        search_artist = "%"
    listens = getlistensdata(search_start_date = search_start_date, search_end_date = search_end_date, search_artist = search_artist)
    if search_artist == "%":
        search_artist = ""
    return render_template('displayupdate_data.html', display_update_rows = listens, search_start_date = search_start_date, search_end_date = search_end_date, search_artist = search_artist, islistens = "true")
  return redirect(url_for('login'))


@app.route('/library')
def library():
  if 'google_token' in session:
    library = list()
    search_artist = request.args.get("search_artist", "%")
    if search_artist == "":
        search_artist = "%"
    library = getlibrary(session['session_user_id'], search_artist)
    if not library:
      return render_template('nolibrarymessage.html')
    else:
      if search_artist == "%":
        search_artist = ""
      return render_template('displayupdate_data.html', display_update_rows = library, search_artist = search_artist, islistens = "false")
  return redirect(url_for('login'))

@app.route('/login')
def login():
  return render_template('login.html')

@app.route('/logout')
def revoke_token():
  if 'google_token' in session: 
    res = google.get('https://accounts.google.com/o/oauth2/revoke', data={'token': session['google_token'][0]})
    session.pop('user_email', None)
    session.pop('google_token', None)
    return redirect('/')
  return redirect(url_for('login'))

@app.route('/googlelogin')
def googlelogin():
  return google.authorize(callback=url_for('authorized', _external=True))

@app.route('/oauth2callback')
@google.authorized_handler
def authorized(resp):
    if resp is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error'],
            request.args['error_description']
        )
    session['google_token'] = (resp['access_token'], resp['id_token'])
    res = google.get('https://www.googleapis.com/plus/v1/people/me')
    google_object = res.data
    if (len(google_object['emails']) > 0):
      session['user_email'] = (google_object['emails'][0]['value'])
      sql_session.rollback()
      email_in_db = sql_session.query(models.User).filter_by(email=session['user_email']).first()
      last_id_query = sql_session.query(func.max(models.User.id))
      last_id = last_id_query.one()

      if not email_in_db:
        new_user = models.User(id=last_id[0] + 1,
                              verification_level=100,
                              email=session['user_email'])
        sql_session.add(new_user)
        sql_session.commit()
        session['session_user_id'] = last_id[0] + 1
      else:
        session['session_user_id'] = email_in_db.id
    return redirect('/play')

@google.tokengetter
def get_access_token(token=None):
    return session.get('google_token')

# post listens from play page
@app.route('/postlistens', methods=['POST'])
def postlistens():

  #add videos and listens
  if (request.form["album"] != "undefined"):
    album_id = updatealbum(request.form["album"])
  else:
    album_id = 2
  if(request.form["year"] == "1900-01-01"):
    year = None
  else: 
    year = request.form["year"] 
  if(request.form["album"] != "undefined"):
    track_num = 0
  else:
    track_num = None

  
  artist_id = updatevideoartist(str(request.form["artist"]))
  sql_session.rollback()
  video_in_db = sql_session.query(models.Video).filter_by(youtube_id = request.form["youtube_id"]).first()
  if not video_in_db:
    new_video = models.Video(youtube_id=str(request.form["youtube_id"]),
                  youtube_title=str(request.form["youtube_title"]),
                  title = str(request.form["title"]),
                  artist_id = artist_id,
                  album_id = album_id,
                  channel_id = str(request.form["channel_id"]),
                  description = str(request.form["description"]),
                  track_num = track_num,
                  release_date = year,
                  music = 1)
    sql_session.add(new_video)
    sql_session.commit()
  #post listen
  new_listen = models.Listen(user_id=session['session_user_id'],
                youtube_id=str(request.form["youtube_id"]),
                listened_to_end=request.form["listened_to_end"])
  sql_session.add(new_listen)
  sql_session.commit()

  #store lastfm similar artists and match scores
  lastfm_similar_artists_list = list()
  similar_artists_list = list()
  #artist_table_list is a full list of artists in our db
  artists_table = getArtists(); #trying to find out how to select just artist names so it can be a list of names that can be easily checked
  artist_table_list = list()
  for artist in artists_table:
    artist_table_list.append(artist[5].lower())
  #similar_artists_list is a list of all the artists that are 
  #listed as similar to artist_name artist (currently playing artist) in our db
  similar_artists = getsimilarartistsbyartist(artist_id)
  if similar_artists:
    for artist in similar_artists:
        similar_artists_list.append(artist[0].lower())
  #lastfm_similar_artists_list is a list of strings. Each string will contain
  #a similar artist and their match score: "similar_artist,match_score"
  lastfm_similar_artists_list = loads(request.form["similarartiststring"]) 
  for lastfm_artist in lastfm_similar_artists_list:
    artist = lastfm_artist['name']
    match = lastfm_artist['match']

    if artist.lower() not in artist_table_list:
      sql_session.rollback()
      new_artist = models.Artist(artist_name = artist)
      sql_session.add(new_artist)
      sql_session.commit()
    # add if lastfm similar artist isn't listed as artist's similar 
    # artist in similar_artists table
    if artist.lower() not in similar_artists_list:
      lastfm_artist_in_db = sql_session.query(models.Artist).filter_by(artist_name = artist).first()
      sql_session.rollback()
      new_similar_artist = models.SimilarArtists(artist_id1 = artist_id,
                                                artist_id2 = lastfm_artist_in_db.id,
                                                lastfm_match_score = match)
      sql_session.add(new_similar_artist)
      sql_session.commit()
  
  return "success"

@app.route('/postgenres', methods=['POST'])
def postgenres():
  genres = loads(request.form['genres'])
  youtube_id = request.form['youtube_id']
  updategenres(youtube_id, genres)

  return "success"

@app.route('/postartistinfo', methods=['POST'])
def postartistinfo():
  state_list = []
  city_list = []
  sql_session.rollback()
  
  artist_in_db = sql_session.query(models.Artist).filter_by(artist_name = request.form["artist"]).first()
  if (request.form["bio"]):
    bio = request.form["bio"]
    now = datetime.datetime.now()
    thisyear = int(str(now.year))
    mentionedyears = []

    #if artist doesn't have year stored, store year
    if artist_in_db:
      if not artist_in_db.start_year:
        potentialdates = re.findall('\d{4}', bio)
        if potentialdates:
          for date in potentialdates:
            if int(date)>1500 and int(date)<=thisyear:
              mentionedyears.append(int(date))

          if len(mentionedyears) >0:
            years = sortnumbers(mentionedyears)
            if years.low and years.high:
              q = sql_session.query(models.Artist).filter_by(id=artist_in_db.id).one()
              if q != []:
                  q.start_year = str(years.low)+'-01-01'
                  #set end date if inactive for 10+ yr
                  
                  if thisyear - int(years.high) > 10:
                    q.end_year = str(years.high)+'-01-01'
                  sql_session.add(q)
                  sql_session.commit()

      #if artist doesn't have city, store city
      if artist_in_db.city_id == 2:
        cities_results = getCities(select = " id, city_or_state")
        for city in cities_results:
            if str(city.city_or_state) in bio:
              sql_session.rollback()
              q = sql_session.query(models.Artist).filter_by(id=artist_in_db.id).one()
              if q != []:
                  q.city_id= str(city.id)
                  sql_session.add(q)
                  sql_session.commit()

    return "success"



  #find artist_id
  #if start_year and 

  #find all 4 digits and put smallest in artists.start_year and largest in artists.end_year
  
#get listens data for listens page

def getlistensdata(search_start_date, search_end_date, search_artist):
  sql_session.rollback()
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
   , cities.city_or_state
   , albums.name as album
   , videos.track_num
   , artists.id as artist_id
   , albums.id as album_id
   , CASE WHEN (SELECT COUNT(*) FROM saved_vids WHERE saved_vids.user_id = """+str(session['session_user_id'])+""" AND saved_vids.youtube_id = listens.youtube_id ) > 0 THEN 1 ELSE 0 END AS library
   FROM listens
   JOIN videos ON listens.youtube_id = videos.youtube_id
   JOIN albums ON videos.album_id = albums.id
   JOIN artists ON videos.artist_id = artists.id
   JOIN cities ON artists.city_id = cities.id
   WHERE listens.user_id = """+str(session['session_user_id'])+"""
   AND listens.time_of_listen > '"""+str(start_date)+"""'
   AND listens.time_of_listen < '"""+str(end_date)+"""'
   AND listens.listened_to_end != 1 
   AND artists.artist_name LIKE '"""+search_artist+"""'
   GROUP BY listens.id 
   ORDER BY listens.time_of_listen DESC
   LIMIT """+str(limit)+";""")

  results = models.engine.execute(sql)
  for result in results:
    #if result[1] (youtube_id) is in list of user's saved vids, then 
    # var library = 1, else = 0 
    listen = displayupdate_page_row_object(index = result[2].strftime('%a %I:%M %p') #time_of_listen
                            , play = 0
                            , music= result[5]
                            , title= result[4]
                            , artist = result[7]
                            , album = result[9]
                            , release_date = result[6]
                            , youtube_id = result[1]
                            , artist_id = result[11]
                            , album_id = result[12]
                            , library = result[13]
                            )
    listens.append(listen)

  return listens 

#update data from listens and library pages
@app.route('/updatedata', methods = ['POST'])
def updatedata():
  album_id = 2
  artist_id = 1
  #error: not updating middle row of 3 like the other two

  #if request.form["only_library"] == "false":
  sql_session.rollback()
  artist_by_name = sql_session.query(models.Artist).filter_by(artist_name = request.form["artist"]).first()
  album_by_name = sql_session.query(models.Album).filter_by(name = request.form["album"]).first()

  artist_id = updatevideoartist(request.form["artist"])
  
  sql_session.rollback()
  if album_by_name:
    album_id = album_by_name.id
  else: 
    sql_session.rollback()
    new_album = models.Album(name=request.form["album"])#edit so it only adds vid info if it doesn't already exist
    sql_session.add(new_album)
    sql_session.commit()
    new_album_id = sql_session.query(models.Album).filter_by(name = request.form["album"]).first()
    album_id = int(new_album_id.id)
  
  sql_session.rollback()
  video_update = sql_session.query(models.Video).filter_by(youtube_id = request.form["youtube_id"]).first()
  video_update.title=request.form["title"]
  video_update.music=request.form["music"]
  video_update.artist_id=int(artist_id)
  video_update.album_id=int(album_id)
  sql_session.commit() 

  sql_session.rollback()
  saved_vids = sql_session.query(models.SavedVid).filter_by(youtube_id = request.form["youtube_id"], user_id = session['session_user_id']).first()
    
  if request.form['library'] == "1":
  #only updates if add to library was checked,
  #since unchecked is default right now.
    if not saved_vids:
      new_saved_vid = models.SavedVid(youtube_id = request.form["youtube_id"]
                                     , user_id = session['session_user_id'])
      sql_session.add(new_saved_vid)
      sql_session.commit()
  else:
    if saved_vids:
      delete_vid = sql_session.query(models.SavedVid).filter_by(youtube_id = request.form["youtube_id"], user_id = session['session_user_id'])
      delete_vid.delete()
      sql_session.commit()
  return "success"

def updatevideoartist(artist_artist_name):
  #if artist name exists in db but it is not already tied to video, update videos table row with new artist_id
  sql_session.rollback()
  artist_by_name = sql_session.query(models.Artist).filter_by(artist_name = artist_artist_name).first()
  if artist_by_name:
    artist_id = artist_by_name.id
  #if artist name doesn't exist in db, add new row to artists table
  else:
    sql_session.rollback()
    new_artist = models.Artist(artist_name = artist_artist_name)
    sql_session.add(new_artist)
    sql_session.commit()
    new_artist_id = sql_session.query(models.Artist).filter_by(artist_name = artist_artist_name).first()
    artist_id = int(new_artist_id.id)

  return artist_id

def updatealbum(album_name):
  #if artist name exists in db but it is not already tied to video, update videos table row with new artist_id
  sql_session.rollback()
  album_by_name = sql_session.query(models.Album).filter_by(name = album_name).first()
  if album_by_name:
    album_id = album_by_name.id
  #if artist name doesn't exist in db, add new row to artists table
  else:
    sql_session.rollback()
    new_album = models.Album(name = album_name)
    sql_session.add(new_album)
    sql_session.commit()
    new_album_id = sql_session.query(models.Album).filter_by(name = album_name).first()
    album_id = int(new_album_id.id)

  return album_id

def updategenres(youtube_id, api_genres):
  video_genres = [];
  sql = text("""SELECT genres.name
                FROM genres
                JOIN vids_genres ON genres.id = vids_genres.genre_id
                WHERE vids_genres.youtube_id = '"""+youtube_id+"';");
  results = models.engine.execute(sql)
  rows = results.fetchall()
  if len(rows) > 0:
    for row in rows:
      video_genres.append(row[0])

  for api_genre in api_genres:
    sql_session.rollback()
    is_api_genre_verified = sql_session.query(models.Genre).filter_by(name = api_genre).first()

    if is_api_genre_verified and not (api_genre in video_genres):
      sql_session.rollback()
      new_vids_genres = models.VidsGenres(youtube_id = youtube_id,
                                          genre_id = is_api_genre_verified.id)
      sql_session.add(new_vids_genres)
      sql_session.commit()
  return "success";



#pulls data for library page

def getlibrary(user_id, search_artist):
  sql_session.rollback()
  listens = list()
  saved_vids = sql_session.query(models.SavedVid).filter_by(user_id = user_id).first()
  if saved_vids:
    sql = text("""SELECT videos.youtube_id
   , videos.youtube_title
   , videos.title
   , videos.music
   , videos.release_date
   , artists.artist_name as artist
   , cities.city_or_state
   , albums.name as album
   , videos.track_num
   , artists.id as artist_id
   , albums.id as album_id
   FROM saved_vids
   JOIN videos ON saved_vids.youtube_id = videos.youtube_id
   JOIN albums ON videos.album_id = albums.id
   JOIN artists ON videos.artist_id = artists.id
   JOIN cities ON artists.city_id = cities.id
   WHERE saved_vids.user_id = """+str(user_id)+"""
   AND artists.artist_name LIKE '"""+search_artist+"""'
   ORDER BY artists.artist_name, albums.name ASC;""")

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

def getCities(select = "*", artist_id=None):
  where = ""
  if artist_id:
    where = "WHERE cities.artist_id = "+artist_id
  sql= text("""SELECT """+select+"""
    FROM cities
    """+where+";")
  result = models.engine.execute(sql)
  return result


def getArtists(artist_id=None):
  where = ""
  if artist_id:
    where = "WHERE artist_id = "+artist_id
  sql= text("""SELECT *
    FROM artists
    """+where+";")
  result = models.engine.execute(sql)
  return result

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

def getsimilarartistsbyartist(artist_id):
  sql = text("""SELECT artists.artist_name, artists.id
    FROM similar_artists
    JOIN artists on similar_artists.artist_id2 = artists.id
    WHERE similar_artists.artist_id1 = """+str(artist_id)+";")
  result = models.engine.execute(sql)
  return result

#query not in use yet
def getsimilarartistsbyvideo(youtube_id):
  sql = text("""SELECT 
a1.artist_name
FROM videos
JOIN similar_artists s1 ON videos.artist_id = s1.artist_id1
JOIN artists a1 ON s1.artist_id2 = a1.id
WHERE videos.youtube_id = '"""+str(youtube_id)+"""';""")
  result1 = models.engine.execute(sql)

  #for result in result1:
    #print(result)

  sql = text("""SELECT 
a2.artist_name
FROM videos
JOIN similar_artists s2 ON videos.artist_id = s2.artist_id2
JOIN artists a2 ON s2.artist_id1 = a2.id
WHERE videos.youtube_id = '"""+str(youtube_id)+"""';""")
  result2 = models.engine.execute(sql)

  #for result in result2:
    #print(result)
  #result = result1 + result2
  #result = list(set(result)) #remove redundancies
  return "success"
