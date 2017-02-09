#!/usr/bin/python
from app import app, models, sql_session

from app.Artist import update_artist_similar_artists, update_artist_info
from app.Listen import post_listen, get_listens_videos
from app.Playlist import (
    delete_playlist, get_playlist_titles, get_playlist_tracks, update_playlist)
from app.SavedVideo import (
    delete_saved_video, get_saved_videos, post_saved_video)
from app.Trends import (
    count_listens_by_week, get_genre_regression_data, get_genre_top_listened,
    get_regression_line)
from app.Video import (
    get_videos, post_video, update_video_genres, update_video)

from json import loads

from flask import jsonify, redirect, render_template, request, session, url_for
from flask_oauthlib.client import OAuth

from operable_date import OperableDate


@app.route('/')
@app.route('/index')
@app.route('/play')
def play():
    if 'google_token' in session:
        return render_template('play.html')
    return redirect(url_for('login'))


@app.route('/my-saved-videos')
def my_saved_videos():
    if 'google_token' in session:
        search_start_date = OperableDate().subtract_days(7)
        search_end_date = OperableDate().subtract_days(0)
        playlist_titles = get_playlist_titles(session['session_user_id'])
        return render_template(
            'displayupdatedata.html', search_start_date=search_start_date,
            search_end_date=search_end_date, playlist_titles=playlist_titles)
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


@app.route('/listens', methods=['GET', 'POST'])
def listens():
    if request.method == 'GET':
        listens = get_listens_videos(
            user_id=session['session_user_id'],
            search_start_date=request.args.get('search_start_date'),
            search_end_date=request.args.get('search_end_date'),
            search_artist=request.args.get('search_artist'))
        return jsonify(listens)
    elif request.method == 'POST':
        if 'youtube_id' in request.form and 'listened_to_end' in request.form:
            post_listen(
                user_id=session['session_user_id'],
                youtube_id=request.form['youtube_id'],
                listened_to_end=request.form['listened_to_end'])
            return "success"


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


@app.route('/saved-videos', methods=['GET', 'POST', 'DELETE'])
def saved_videos():
    if request.method == 'GET':
        saved_videos = get_saved_videos(
            user_id=session['session_user_id'],
            search_artist=request.args.get('search_artist'))
        return jsonify(saved_videos)
    elif request.method == 'POST':
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
        if (request.args.get('data-type') == 'listens' and
                request.args.get('chart-type') == 'time'):
            data = count_listens_by_week(
                user_id=session['session_user_id'],
                start_date=request.args.get('start-date'),
                end_date=request.args.get('end-date'))
            return jsonify(data)
        elif (request.args.get('data-type') == 'genres' and
                request.args.get('chart-type') == 'linear regression'):
            regression_data = get_genre_regression_data(
                user_id=session['session_user_id'],
                start_date=request.args.get('start-date'),
                end_date=request.args.get('end-date'))
            regression_line = get_regression_line(regression_data)
            data = {
                'regression_data': regression_data,
                'regression_line': regression_line}
            return jsonify(data)
        elif (request.args.get('data-type') == 'genres' and
                request.args.get('chart-type') == 'top list'):
            data = get_genre_top_listened(
                user_id=session['session_user_id'],
                start_date=request.args.get('start-date'),
                end_date=request.args.get('end-date'))
            return jsonify(data)


@app.route('/videos', methods=['GET', 'PUT', 'POST'])
def videos():
    if request.method == 'GET':
        videos = get_videos(
            user_id=session['session_user_id'],
            search_artist=request.args.get('search_artist'))
        return jsonify(videos)
    elif request.method == 'PUT':
        if ('youtube_id' in request.form and
                'title' in request.form and
                'artist' in request.form and
                'album' in request.form and
                'release_date' in request.form and
                'music' in request.form):
            update_video(
                youtube_id=request.form['youtube_id'],
                title=request.form['title'],
                artist=request.form['artist'],
                album=request.form['album'],
                release_date=request.form['release_date'],
                music=request.form['music'])
            return "success"
    elif request.method == 'POST':
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
                    'release_date' in request.form and
                    'music' in request.form):
                post_video(
                    youtube_id=request.form['youtube_id'],
                    youtube_title=request.form['youtube_title'],
                    channel_id=request.form['channel_id'],
                    description=request.form['description'],
                    title=request.form['title'],
                    artist=request.form['artist'],
                    album=request.form['album'],
                    release_date=request.form['release_date'],
                    music=request.form['music'])
        return "success"


# User Auth code below
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
