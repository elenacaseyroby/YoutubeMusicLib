#!/usr/bin/python
import datetime
import re
from json import loads

from app import app, models, sql_session
from app.views_model import get_playlist_titles as model_get_playlist_titles
from app.views_model import get_playlist_tracks as model_get_playlist_tracks
from app.views_model import (count_listens_by_week, get_artists, get_cities,
                             get_genre_data_linear_regression,
                             get_similar_artists_by_artist, get_video_data,
                             update_album, update_genres, update_video_artist)
from flask import jsonify, redirect, render_template, request, session, url_for
from flask_oauthlib.client import OAuth
from sqlalchemy import func

from .my_functions import get_regression_line

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


@app.route('/saved-videos', methods=['GET'])
def saved_videos():
    if 'google_token' in session:
        playlist_titles = model_get_playlist_titles(session['session_user_id'])
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
        return render_template(
            'displayupdatedata.html',
            display_update_rows=videos,
            search_start_date=search_start_date,
            search_end_date=search_end_date,
            search_artist=search_artist,
            playlist_titles=playlist_titles)
    return redirect(url_for('login'))


@app.route('/trends')
def trends():
    if 'google_token' in session:
        return render_template('trends.html')
    return redirect(url_for('login'))


@app.route('/getgenredata')
def get_get_genre_data():

    data_by_likes = get_genre_data_linear_regression(
        user_id=session['session_user_id'],
        start_date=request.args.get('start_date'),
        end_date=request.args.get('end_date'))
    if len(data_by_likes['regression_data']) > 0:
        regression_line_by_likes = get_regression_line(data_by_likes[
            'regression_data'])
        least_squares_regression_data = {
            'regression_data': data_by_likes['regression_data'],
            'top_genres': data_by_likes['top_genres'],
            'line_best_fit': {
                'm': regression_line_by_likes['m'],
                'b': regression_line_by_likes['b']
            }
        }
    else:
        least_squares_regression_data = {
            'regression_data': data_by_likes['regression_data'],
            'top_genres': data_by_likes['top_genres']
        }

    return jsonify(least_squares_regression_data)


@app.route('/getlistensbydate')
def get_listens_by_date():
    data = count_listens_by_week(
        user_id=session['session_user_id'],
        start_date=request.args.get('start_date'),
        end_date=request.args.get('end_date'))
    return jsonify(data)


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
                id=last_id[0] + 1,
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

@app.route('/postlistens', methods=['POST'])
def post_listens():
    if (request.form["channel_id"] == "" and
            request.form["description"] == "" and
            request.form["similarartiststring"] == "" and
            request.form["album"] == "" and request.form["title"] == "" and
            request.form["artist"] == "" and request.form["year"] == ""):
        new_listen = models.Listen(
            user_id=session['session_user_id'],
            youtube_id=str(request.form["youtube_id"]),
            listened_to_end=request.form["listened_to_end"])
        sql_session.add(new_listen)
        sql_session.commit()
    else:
        # Post Video
        if request.form["album"] != "undefined":
            album_id = update_album(request.form["album"])
        else:
            album_id = 2
        if request.form["year"] == "1900-01-01":
            year = None
        else:
            year = request.form["year"]
        if request.form["album"] != "undefined":
            track_num = 0
        else:
            track_num = None
        artist_id = update_video_artist(str(request.form["artist"]))
        sql_session.rollback()
        video_in_db = sql_session.query(models.Video).filter_by(
            youtube_id=request.form["youtube_id"]).first()
        if not video_in_db:
            new_video = models.Video(
                youtube_id=str(request.form["youtube_id"]),
                youtube_title=str(request.form["youtube_title"]),
                title=str(request.form["title"]),
                artist_id=artist_id,
                album_id=album_id,
                channel_id=str(request.form["channel_id"]),
                description=str(request.form["description"]),
                track_num=track_num,
                release_date=year,
                music=1)
            sql_session.add(new_video)
            sql_session.commit()
        # Post Listen
        new_listen = models.Listen(
            user_id=session['session_user_id'],
            youtube_id=str(request.form["youtube_id"]),
            listened_to_end=request.form["listened_to_end"])
        sql_session.add(new_listen)
        sql_session.commit()
        # Post lastfm similar artists and match scores
        lastfm_similar_artists_list = []
        similar_artists_list = []
        artists_table = get_artists()
        artist_table_list = []
        for artist in artists_table:
            artist_table_list.append(artist[5].lower())
        similar_artists = get_similar_artists_by_artist(artist_id)
        if similar_artists:
            for artist in similar_artists:
                similar_artists_list.append(artist[0].lower())
        lastfm_similar_artists_list = loads(request.form[
            "similarartiststring"])
        for lastfm_artist in lastfm_similar_artists_list:
            artist = lastfm_artist['name']
            match = lastfm_artist['match']
            # Post similar artist to artists table 
            if artist.lower() not in artist_table_list:
                sql_session.rollback()
                new_artist = models.Artist(artist_name=artist)
                sql_session.add(new_artist)
                sql_session.commit()
            # Post if lastfm similar artist to similar_artists table
            if artist.lower() not in similar_artists_list:
                lastfm_artist_in_db = sql_session.query(
                    models.Artist).filter_by(artist_name=artist).first()
                sql_session.rollback()
                new_similar_artist = models.SimilarArtists(
                    artist_id1=artist_id,
                    artist_id2=lastfm_artist_in_db.id,
                    lastfm_match_score=match)
                sql_session.add(new_similar_artist)
                sql_session.commit()
    return "success"


@app.route('/postgenres', methods=['POST'])
def post_genres():
    genres = loads(request.form['genres'])
    youtube_id = request.form['youtube_id']
    update_genres(youtube_id, genres)
    return "success"


@app.route('/postartistinfo', methods=['POST'])
def post_artist_info():
    undefined = 2
    sql_session.rollback()
    artist_in_db = sql_session.query(models.Artist).filter_by(
        artist_name=request.form["artist"]).first()
    if artist_in_db:
        if request.form["bio"]:
            if not artist_in_db.start_year:
                now = datetime.datetime.now()
                this_year = int(str(now.year))
                possible_years = re.findall('\d{4}', request.form["bio"])
                confirmed_years = [year for year in possible_years 
                    if int(year) > 1100 and int(year) <= this_year]
                if confirmed_years:
                    confirmed_years = sorted(confirmed_years)
                    first_year = confirmed_years[0]
                    final_year = confirmed_years[len(confirmed_years)-1]
                    artist_in_db.start_year = str(first_year) + '-01-01'
                    # Set end date if inactive for 10+ years
                    if this_year - int(final_year) >= 10:
                        artist_in_db.end_year = str(
                            final_year) + '-01-01'
            if artist_in_db.city_id == undefined:
                cities_results = get_cities(select=" id, city_or_state")
                for city in cities_results:
                    if city.city_or_state in request.form["bio"]:
                        artist_in_db.city_id = city.id
    if (artist_in_db.start_year or 
            artist_in_db.end_year or 
            (artist_in_db.city_id != undefined)):
        sql_session.commit()
    return "success"

@app.route('/updatevideodata', methods=['POST'])
def update_video_data():
    album_id = 2 # Undefined
    artist_id = 1 # Undefined
    sql_session.rollback()
    album_by_name = sql_session.query(models.Album).filter_by(
        name=request.form["album"]).first()
    # Update artist
    artist_id = update_video_artist(request.form["artist"])
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
    video_update.artist_id = int(artist_id)
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


@app.route('/get-playlist-titles', methods=['GET'])
def get_playlist_titles():
    user_id = session['session_user_id']
    playlist_titles = model_get_playlist_titles(user_id)
    return jsonify(playlist_titles)


@app.route('/get-playlist-tracks', methods=['GET'])
def get_playlist_tracks():
    user_id = session['session_user_id']
    playlist_title = request.args.get('playlist_title')
    playlist_tracks = []
    if playlist_title:
        playlist = sql_session.query(models.Playlist).filter_by(
            user_id=user_id, title=playlist_title).first()
        if playlist:
            selected_playlist_id = playlist.id
            playlist_tracks = model_get_playlist_tracks(
                playlist_id=selected_playlist_id)
    return jsonify(playlist_tracks)


@app.route('/postplaylist', methods=['POST'])
def postplay():
    user_id = session['session_user_id']
    title = request.form['playlist_title']
    tracks = loads(request.form['tracks'])
    track_num = 1
    sql_session.rollback()
    playlist_in_db = sql_session.query(models.Playlist).filter_by(
        user_id=user_id, title=title).first()
    if len(tracks) == 0:
        if playlist_in_db:
            sql_session.rollback()
            delete_playlist_tracks = sql_session.query(
                models.PlaylistTracks).filter_by(playlist_id=playlist_in_db.id)
            delete_playlist_tracks.delete()
            sql_session.commit()
            delete_playlist = sql_session.query(models.Playlist).filter_by(
                id=playlist_in_db.id)
            delete_playlist.delete()
            sql_session.commit()
    else:
        if playlist_in_db:
            sql_session.rollback()
            set_temp_track_nums = sql_session.query(
                models.PlaylistTracks).filter_by(playlist_id=playlist_in_db.id)
            for set_temp_track_num in set_temp_track_nums:
                set_temp_track_num.track_num = -1
                sql_session.commit()
            for track in tracks:
                sql_session.rollback()
                track_update = sql_session.query(
                    models.PlaylistTracks).filter_by(
                        playlist_id=playlist_in_db.id,
                        youtube_id=track).first()
                if track_update:
                    track_update.track_num = track_num
                    sql_session.commit()
                else:
                    new_track = models.PlaylistTracks(
                        playlist_id=playlist_in_db.id,
                        youtube_id=track,
                        track_num=track_num
                    )  
                    sql_session.add(new_track)
                    sql_session.commit()
                track_num = track_num + 1
            track_update = sql_session.query(models.PlaylistTracks).filter_by(
                playlist_id=playlist_in_db.id).filter(
                    models.PlaylistTracks.track_num == -1)
            track_update.delete()
            sql_session.commit()
        else:
            sql_session.rollback()
            new_playlist = models.Playlist(
                user_id=user_id, title=str(title)
            ) 
            sql_session.add(new_playlist)
            sql_session.commit()
            new_playlist_id = sql_session.query(models.Playlist).filter_by(
                user_id=user_id, title=title).first()
            for track in tracks:
                sql_session.rollback()
                new_track = models.PlaylistTracks(
                    playlist_id=new_playlist_id.id,
                    youtube_id=track,
                    track_num=track_num
                )  
                sql_session.add(new_track)
                sql_session.commit()
                track_num = track_num + 1
    return "success"


def subtract_days_from_today(x=7):
    now = datetime.datetime.now()
    today = now.strftime("%Y-%m-%d %H:%M:%S")
    if x > 0:
        return_date = datetime.date.today() - datetime.timedelta(days=x)
        return_date = return_date.strftime("%Y-%m-%d %H:%M:%S")
        return return_date
    else:
        return today
