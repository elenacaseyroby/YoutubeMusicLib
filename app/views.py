#!/usr/bin/python
import datetime
from json import loads

from app import app, models, sql_session
from app.views_model import get_playlist_titles, get_playlist_tracks
from app.views_model import (count_listens_by_week, get_genre_top_listened,
                             get_video_data, get_regression_line,
                             get_genre_regression_data, post_saved_video,
                             delete_saved_video, get_listens,
                             post_listen, post_video, delete_playlist,
                             update_playlist, update_artist_info,
                             update_artist_similar_artists, update_video_genres,
                             update_artist_name)

from flask import jsonify, redirect, render_template, request, session, url_for
from flask_oauthlib.client import OAuth
from sqlalchemy import func


GOOGLE_CLIENT_ID = '273956341734-jhk5ekhmrbeebqfef7d6f3vfeqf0aprg.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = 'ORbZWAUlZRk9Ixi5OjU-izDZ'

oauth = OAuth(app)

google = oauth.remote_app(
    'google',
    base_url='https://www.googleapis.com/oauth2/v1/',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    request_token_url=None,
    request_token_params={'scope': 'email'},
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_method='POST',
    consumer_key=GOOGLE_CLIENT_ID,
    consumer_secret=GOOGLE_CLIENT_SECRET)

@app.route('/login')
def login():
    return google.authorize(callback=url_for('authorized', _external=True))

@app.route('/logout')
def revoke_token():
    if 'google_token' in session:
        google.get('https://accounts.google.com/o/oauth2/revoke',
                   data={'token': session['google_token'][0]})
        session.pop('user_email', None)
        session.pop('google_token', None)
        return redirect('/')
    return redirect(url_for('login'))

@app.route('/oauth2callback')
@google.authorized_handler
def authorized(resp):
    if resp is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error'], request.args['error_description'])
    session['google_token'] = (resp['access_token'], resp['id_token'])
    res = google.get('https://www.googleapis.com/plus/v1/people/me')
    google_object = res.data
    if len(google_object['emails']) > 0:
        session['user_email'] = (google_object['emails'][0]['value'])
        sql_session.rollback()
        email_in_db = sql_session.query(models.User).filter_by(
            email=session['user_email']).first()
        last_id_query = sql_session.query(func.max(models.User.id))
        last_id = last_id_query.one()

        if not email_in_db:
            new_user = models.User(
                verification_level=100,
                email=session['user_email'])
            sql_session.add(new_user)
            sql_session.commit()
            new_user = sql_session.query(models.User).filter_by(
                 email=session['user_email']).first()
            session['session_user_id'] = new_user.id
        else:
            session['session_user_id'] = email_in_db.id
    return redirect('/play')

@google.tokengetter
def get_access_token(token=None):
    return session.get('google_token')

@app.route('/')
@app.route('/index')
def index():
    if 'google_token' in session:
        return redirect(url_for('play'))
    return redirect(url_for('login'))

@app.route('/play')
def play():
    if 'google_token' in session:
        return render_template('play.html')

def subtract_days_from_today(x=7):
    now = datetime.datetime.now()
    today = now.strftime("%Y-%m-%d %H:%M:%S")
    if x > 0:
        return_date = datetime.date.today() - datetime.timedelta(days=x)
        return_date = return_date.strftime("%Y-%m-%d %H:%M:%S")
        return return_date
    else:
        return today

@app.route('/my-saved-videos')
def my_saved_videos():
    if 'google_token' in session:
        if request.args.get("search_start_date"):
            search_start_date = request.args.get("search_start_date")
        else:
            search_start_date = subtract_days_from_today(7)
        if request.args.get("search_end_date"):
            search_end_date = request.args.get("search_end_date")
        else:
            search_end_date = subtract_days_from_today(0)
        search_artist = request.args.get("search_artist", "%")
        if search_artist == "":
            search_artist = "%"
        videos = get_video_data(
            user_id=session['session_user_id'],
            video_scope="listens",
            search_start_date=search_start_date,
            search_end_date=search_end_date,
            search_artist=search_artist)
        if search_artist == "%":
            search_artist = ""
        playlist_titles = get_playlist_titles(session['session_user_id'])
        return render_template(
            'displayupdatedata.html',
            display_update_rows=videos,
            search_start_date=search_start_date,
            search_end_date=search_end_date,
            search_artist=search_artist,
            playlist_titles=playlist_titles)
    return redirect(url_for('login'))

@app.route('/my-trends')
def my_trends():
    if 'google_token' in session:
        return render_template('trends.html')
    return redirect(url_for('login'))

@app.route('/artists', methods=['PUT'])
def artists():
    if request.method == 'PUT':
        if 'artist' in request.form and 'bio' in request.form:
            update_artist_info(
                artist=request.form['artist'], bio=request.form['bio'])
        if 'artist' in request.form and 'similar_artists' in request.form:
            similar_artists = loads(request.form['similar_artists']) 
            update_artist_similar_artists(
                artist=request.form['artist'], similar_artists=similar_artists)
    return "success"

@app.route('/listens', methods=['POST', 'GET'])
def listens():
    if request.method == 'POST':
        if 'youtube_id' in request.form and 'listened_to_end' in request.form:
            post_listen(
                user_id=session['session_user_id'],
                youtube_id=request.form['youtube_id'], 
                listened_to_end=request.form['listened_to_end'])
            return "success"
    if request.method == 'GET':
        listens = get_listens(
            user_id=session['session_user_id'],
            search_start_date=request.args.get('search_start_date'),
            search_end_date=request.args.get('search_end_date'),
            search_artist=request.args.get('search_artist'))
        return jsonify(listens)
    
@app.route('/playlists', methods=['GET', 'POST', 'DELETE'])
def playlists():
    if request.method == 'GET':
        if request.args.get('playlist_title'):
            playlist_tracks = get_playlist_tracks(
                user_id=session['session_user_id'],
                playlist_title=request.args.get('playlist_title'))
            return jsonify(playlist_tracks)
        else:
            playlist_titles = get_playlist_titles(session['session_user_id'])
            return jsonify(playlist_titles)
    elif request.method == 'POST':
        if ('playlist_title' in request.form and
                'playlist_tracks' in request.form):
            playlist_tracks = loads(request.form['playlist_tracks'])
            update_playlist(
                user_id=session['session_user_id'],
                playlist_title=request.form['playlist_title'],
                playlist_tracks=playlist_tracks)
            return "success"
    elif request.method == 'DELETE':
        if 'playlist_title' in request.form:
            delete_playlist(
                user_id=session['session_user_id'],
                playlist_title=request.form['playlist_title'])
            return "success"

@app.route('/saved-videos', methods=['POST', 'DELETE'])
def saved_videos():
    if request.method == 'POST':
        if 'youtube_id' in request.form:
            post_saved_video(
                user_id=session['session_user_id'],
                youtube_id=request.form['youtube_id'])
            return "success"
    elif request.method == 'DELETE':
        if 'youtube_id' in request.form:
            delete_saved_video(
                user_id=session['session_user_id'],
                youtube_id=request.form['youtube_id'])
            return "success"

@app.route('/trends', methods=['GET']) 
def trends():
    if request.method == 'GET':
        if (request.args.get('data_type') == 'listens' and 
                request.args.get('chart_type') == 'time'):
            data = count_listens_by_week(
                user_id=session['session_user_id'],
                start_date=request.args.get('start_date'),
                end_date=request.args.get('end_date'))
            return jsonify(data)
        elif (request.args.get('data_type') == 'genres' and 
                request.args.get('chart_type') == 'linear regression'):
            regression_data = get_genre_regression_data(
                user_id=session['session_user_id'],
                start_date=request.args.get('start_date'),
                end_date=request.args.get('end_date'))
            regression_line = get_regression_line(regression_data)
            data ={
                'regression_data':regression_data, 
                'regression_line':regression_line}
            return jsonify(data)
        elif (request.args.get('data_type') == 'genres' and 
                request.args.get('chart_type') == 'top list'):
            data = get_genre_top_listened(
                user_id=session['session_user_id'],
                start_date=request.args.get('start_date'),
                end_date=request.args.get('end_date'))
            return jsonify(data)

@app.route('/videos', methods=['POST']) 
def videos():
    if request.method == 'POST': 
        if 'youtube_id' in request.form:
            if 'genres' in request.form:
                genres = loads(request.form['genres']) 
                youtube_id = request.form['youtube_id']
                update_video_genres(
                    youtube_id=youtube_id, 
                    genres=genres)
            elif ('youtube_id' in request.form and
                    'youtube_title' in request.form and
                    'channel_id' in request.form and
                    'description' in request.form and
                    'title' in request.form and
                    'artist' in request.form and
                    'album' in request.form and
                    'release_date' in request.form):
                post_video(youtube_id=request.form['youtube_id'],
                    youtube_title=request.form['youtube_title'], 
                    channel_id=request.form['channel_id'],
                    description=request.form['description'],
                    title=request.form['title'],
                    artist=request.form['artist'],
                    album=request.form['album'],
                    release_date=request.form['release_date'])
        return "success"

# OLD
@app.route('/search-saved-videos', methods=['GET'])
def search_saved_videos():
    if 'google_token' in session:
        if request.args.get("video_scope") == "listens":
            search_start_date = request.args.get("search_start_date")
            search_end_date = request.args.get("search_end_date")
        else:
            search_start_date = "1969-01-01"
            search_end_date = "3000-01-01"
        search_artist = request.args.get("search_artist", "%")
        if search_artist == "":
            search_artist = "%"
        video_scope = request.args.get("video_scope")
        data = get_video_data(
            user_id=session['session_user_id'],
            video_scope=video_scope,
            search_start_date=search_start_date,
            search_end_date=search_end_date,
            search_artist=search_artist)
        if search_artist == "%":
            search_artist = ""
        return jsonify(data)
    else:
        return redirect(url_for('login'))
    return "success"

@app.route('/updatevideodata', methods=['POST'])
def update_video_data():
    album_id = 2 # Undefined
    artist_id = 1 # Undefined
    sql_session.rollback()
    album_by_name = sql_session.query(models.Album).filter_by(
        name=request.form["album"]).first()
    # Update artist
    artist = update_artist_name(request.form["artist"])
    # Update album
    sql_session.rollback()
    if album_by_name:
        album_id = album_by_name.id
    else:
        new_album = models.Album(
            name=request.form["album"]
        )  
        sql_session.add(new_album)
        sql_session.commit()
        new_album_id = sql_session.query(models.Album).filter_by(
            name=request.form["album"]).first()
        album_id = int(new_album_id.id)
    # Update video's album and artist values
    sql_session.rollback()
    video_update = sql_session.query(models.Video).filter_by(
        youtube_id=request.form["youtube_id"]).first()
    video_update.title = request.form["title"]
    video_update.music = request.form["music"]
    video_update.artist_id = int(artist.id)
    video_update.album_id = int(album_id)
    sql_session.commit()
    # Update user library
    sql_session.rollback()
    saved_vids = sql_session.query(models.SavedVid).filter_by(
        youtube_id=request.form["youtube_id"],
        user_id=session['session_user_id']).first()
    if request.form['library'] == "1":
        if not saved_vids:
            new_saved_vid = models.SavedVid(
                youtube_id=request.form["youtube_id"],
                user_id=session['session_user_id'])
            sql_session.add(new_saved_vid)
            sql_session.commit()
    else:
        if saved_vids:
            delete_vid = sql_session.query(models.SavedVid).filter_by(
                youtube_id=request.form["youtube_id"],
                user_id=session['session_user_id'])
            delete_vid.delete()
            sql_session.commit()
    return "success"








