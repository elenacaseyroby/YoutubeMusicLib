#!/usr/bin/python
from flask import render_template, flash, session, redirect, request, Flask, url_for, jsonify
from flask_oauthlib.client import OAuth
from app import app, sql_session, login_manager, viewsClasses
from .models import models, viewsModel
from .myfunctions import sortnumbers
from json import loads
from sqlalchemy import update, func
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

@app.route('/listens', methods = ['GET'])
def listens():
  print("made it to listens view after playlist change~~~~~~~~~~~~~~~")
  if 'google_token' in session:
    playlist_titles = viewsModel.getplaylisttitles(session['session_user_id'])
    playlist_tracks = []
    selected_playlist_id=None
    if request.args.get("playlist_title"):
      print("made it to playlist title")
      playlist = sql_session.query(models.Playlist).filter_by(user_id = session['session_user_id'], title = request.args.get("playlist_title")).first()
      selected_playlist_id = playlist.id
      playlist_tracks = viewsModel.getplaylisttracks(user_id = session['session_user_id'], title = request.args.get("playlist_title"))
      for track in playlist_tracks:
        print(track)
    print("finished rendering playlist")
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
    listens = viewsModel.getlistensdata(search_start_date = search_start_date, search_end_date = search_end_date, search_artist = search_artist, playlist_id = selected_playlist_id)
    if search_artist == "%":
        search_artist = ""
    return render_template('displayupdatedata.html', display_update_rows = listens, search_start_date = search_start_date, search_end_date = search_end_date, search_artist = search_artist, islistens = "true", playlist_titles = playlist_titles, playlist_tracks = playlist_tracks)
  return redirect(url_for('login'))


@app.route('/library')
def library():
  if 'google_token' in session:
    playlist_titles = viewsModel.getplaylisttitles(session['session_user_id'])
    playlist_tracks = []
    selected_playlist_id=None
    if request.args.get("playlist_title"):
      print("made it to playlist title")
      playlist = sql_session.query(models.Playlist).filter_by(user_id = session['session_user_id'], title = request.args.get("playlist_title")).first()
      selected_playlist_id = playlist.id
      playlist_tracks = viewsModel.getplaylisttracks(user_id = session['session_user_id'], title = request.args.get("playlist_title"))
      for track in playlist_tracks:
        print(track)
    library = list()
    search_artist = request.args.get("search_artist", "%")
    if search_artist == "":
        search_artist = "%"
    library = viewsModel.getlibrary(session['session_user_id'], search_artist, playlist_id = selected_playlist_id)
    if not library:
      return render_template('nolibrarymessage.html')
    else:
      if search_artist == "%":
        search_artist = ""
      return render_template('displayupdatedata.html', display_update_rows = library, search_artist = search_artist, islistens = "false", playlist_titles = playlist_titles, playlist_tracks = playlist_tracks)
  return redirect(url_for('login'))

@app.route('/login')
def login():
    return google.authorize(callback=url_for('authorized', _external=True))

@app.route('/logout')
def revoke_token():
  if 'google_token' in session: 
    res = google.get('https://accounts.google.com/o/oauth2/revoke', data={'token': session['google_token'][0]})
    session.pop('user_email', None)
    session.pop('google_token', None)
    return redirect('/')
  return redirect(url_for('login'))

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
    album_id = viewsModel.updatealbum(request.form["album"])
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

  artist_id = viewsModel.updatevideoartist(str(request.form["artist"]))
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
  artists_table = viewsModel.getArtists(); 
  artist_table_list = list()
  for artist in artists_table:
    artist_table_list.append(artist[5].lower())
  #similar_artists_list is a full list of artists listed as similar to
  #currently playing artist in our db
  similar_artists = viewsModel.getsimilarartistsbyartist(artist_id)
  if similar_artists:
    for artist in similar_artists:
        similar_artists_list.append(artist[0].lower())
  lastfm_similar_artists_list = loads(request.form["similarartiststring"]) 
  for lastfm_artist in lastfm_similar_artists_list:
    artist = lastfm_artist['name']
    match = lastfm_artist['match']
    #add if similar artist not in artists table
    if artist.lower() not in artist_table_list:
      sql_session.rollback()
      new_artist = models.Artist(artist_name = artist)
      sql_session.add(new_artist)
      sql_session.commit()
    # add if lastfm similar artist isn't listed as similar artist in table
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
  viewsModel.updategenres(youtube_id, genres)

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
              artist = sql_session.query(models.Artist).filter_by(id=artist_in_db.id).one()
              if artist != []:
                  artist.start_year = str(years.low)+'-01-01'
                  #set end date if inactive for 10+ yr
                  
                  if thisyear - int(years.high) > 10:
                    artist.end_year = str(years.high)+'-01-01'
                  sql_session.add(artist)
                  sql_session.commit()

      #if artist doesn't have city, store city
      if artist_in_db.city_id == 2:
        cities_results = viewsModel.getCities(select = " id, city_or_state")
        for city in cities_results:
            if str(city.city_or_state) in bio:
              sql_session.rollback()
              artist = sql_session.query(models.Artist).filter_by(id=artist_in_db.id).one()
              if artist != []:
                  artist.city_id= str(city.id)
                  sql_session.add(artist)
                  sql_session.commit()

    return "success"

#update data from listens and library pages
@app.route('/updatedata', methods = ['POST'])
def updatedata():
  album_id = 2
  artist_id = 1
  sql_session.rollback()
  artist_by_name = sql_session.query(models.Artist).filter_by(artist_name = request.form["artist"]).first()
  album_by_name = sql_session.query(models.Album).filter_by(name = request.form["album"]).first()

  artist_id = viewsModel.updatevideoartist(request.form["artist"])
  
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

#/postplaylist
@app.route('/postplaylist', methods = ['POST'])
def postplaylist():
  print("made it~~~~~~~~~~~~~~~~~~~~~")
  title = request.form['playlist_title']
  tracks = loads(request.form['tracks'])
  print(title)
  print(tracks)
  track_num = 1
  sql_session.rollback()
  playlist_in_db = sql_session.query(models.Playlist).filter_by(user_id = session['session_user_id'], title = title).first()
  print(playlist_in_db )
  if playlist_in_db:
    sql_session.rollback()
    set_temp_track_nums = sql_session.query(models.PlaylistTracks).filter_by(playlist_id = playlist_in_db.id)
    for set_temp_track_num in set_temp_track_nums:
      set_temp_track_num.track_num = -1
      sql_session.commit()

      
    print("playlist is in db")
    for track in tracks:
      sql_session.rollback()
      track_update = sql_session.query(models.PlaylistTracks).filter_by(playlist_id = playlist_in_db.id, youtube_id = track).first()
      if track_update:
        print("track update!")
        track_update.track_num=track_num
        sql_session.commit() 
      else:
        new_track = models.PlaylistTracks(playlist_id = playlist_in_db.id, youtube_id = track, track_num = track_num)#edit so it only adds vid info if it doesn't already exist
        sql_session.add(new_track)
        sql_session.commit()

      #post track.youtube_id & track_num to db
      track_num = track_num +1
    print(track_num)
    track_update = sql_session.query(models.PlaylistTracks).filter_by(playlist_id = playlist_in_db.id).filter(models.PlaylistTracks.track_num == -1)
    print(track_update)
    print("~~before~~")
    track_update.delete()
    sql_session.commit()
    print("~~after~~")
  else:
    print("else~~~~~~~~~~~~~~")
    print (title)
    print (session['session_user_id'])
    sql_session.rollback()
    new_playlist = models.Playlist(user_id = int(session['session_user_id']), title = str(title))#edit so it only adds vid info if it doesn't already exist
    sql_session.add(new_playlist)
    sql_session.commit()
    new_playlist_id = sql_session.query(models.Playlist).filter_by(user_id = session['session_user_id'], title = title).first()
    print("made it here~~~~~~~~~~")
    for track in tracks:
      sql_session.rollback()
      new_track = models.PlaylistTracks(playlist_id = new_playlist_id.id, youtube_id = track, track_num = track_num)#edit so it only adds vid info if it doesn't already exist
      sql_session.add(new_track)
      sql_session.commit()
      track_num = track_num +1
    #make playlist and then insert tracks instead of updating
  return "success"





