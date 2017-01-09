#!/usr/bin/python
# -*- mode: python -*-

import datetime
import re

from sqlalchemy import text

from app import models, sql_session
from flask import session, jsonify


def get_artists(artist_id=None):
    where = ""
    if artist_id:
        where = "WHERE artist_id = " + artist_id
    sql = text("""SELECT *
    FROM artists
    """ + where + ";")
    result = models.engine.execute(sql)
    return result

#get listens data for listens page
def get_video_data(user_id, video_scope, search_start_date, search_end_date,
                   search_artist):
    sql_session.rollback()
    videos = list()
    start_date = search_start_date
    end_date = search_end_date
    scope = ""
    order = "ORDER BY artist"
    case_when_library = " AND saved_vids.youtube_id = videos.youtube_id ) > 0 THEN 1 ELSE 0 END AS library"
    sql_select = ",videos.youtube_id"

    if search_artist:
        artist = "AND artists.artist_name LIKE '" + search_artist + "'"

    if video_scope == "listens":
        sql_select = """,listens.youtube_id
   , listens.id
   , listens.time_of_listen"""
        sql_from = """FROM listens
   JOIN videos ON listens.youtube_id = videos.youtube_id"""
        scope = """WHERE listens.user_id = """ + str(user_id) + """
   AND listens.time_of_listen > '""" + str(start_date) + """'
   AND listens.time_of_listen < '""" + str(end_date) + """'
   AND listens.listened_to_end != 1 """
        order = """GROUP BY listens.id
   ORDER BY listens.time_of_listen DESC"""
        case_when_library = " AND saved_vids.youtube_id = listens.youtube_id ) > 0 THEN 1 ELSE 0 END AS library"
    elif video_scope == "library":
        sql_from = """FROM saved_vids
   JOIN videos ON saved_vids.youtube_id = videos.youtube_id"""
        scope = "WHERE saved_vids.user_id = " + str(user_id)
    elif video_scope == "all":
        sql_from = "FROM videos"
        scope = "WHERE videos.youtube_id is not null"

    sql = text("""SELECT videos.youtube_title
   , videos.title
   , videos.music
   , videos.release_date
   , artists.artist_name as artist
   , cities.city_or_state
   , albums.name as album
   , videos.track_num
   , artists.id as artist_id
   , albums.id as album_id
   , CASE WHEN (SELECT COUNT(*) FROM saved_vids WHERE saved_vids.user_id = """ +
   str(user_id) + case_when_library + """
   """ + sql_select + """
   """ + sql_from + """
   JOIN albums ON videos.album_id = albums.id
   JOIN artists ON videos.artist_id = artists.id
   JOIN cities ON artists.city_id = cities.id
   """ + scope + """
   """ + artist + """
   """ + order + """
   LIMIT 1500;""")

    results = models.engine.execute(sql)

    for result in results:
        if video_scope == "listens":
            index = result[13].strftime('%a %I:%M %p')
        else:
            index = None
        video = {
            'music': result[2],
            'title': result[1],
            'artist': result[4],
            'album': result[6],
            'release_date': result[3],
            'youtube_id': result[11],
            'artist_id': result[8],
            'album_id': result[9],
            'library': result[10],
            'index': index
        }

        videos.append(video)

    return videos

def get_playlist_titles(user_id):
    playlisttitles = []
    sql = text("""SELECT playlists.title, playlists.id
                FROM playlists
                WHERE user_id = '""" + str(user_id) + "';")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    if len(rows) > 0:
        for row in rows:
            playlist_title = row[0]
            playlisttitles.append(playlist_title)
    return playlisttitles

def get_playlist_tracks(playlist_id):
    playlist_tracks = []
    sql = text("""SELECT playlist_tracks.*
    , videos.title
    , artists.artist_name
            FROM playlist_tracks
            JOIN playlists ON playlist_tracks.playlist_id = playlists.id
            JOIN videos ON playlist_tracks.youtube_id = videos.youtube_id
            JOIN artists ON videos.artist_id = artists.id
            WHERE playlists.id = '""" + str(playlist_id) + """"'
            ORDER BY playlist_tracks.track_num;""")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    for row in rows:
        track = {
            'youtube_id': row[2],
            'title': row[5],
            'artist': row[6],
            'track_num': row[3]
        }
        playlist_tracks.append(track)

    return playlist_tracks

# Trends
def get_regression_line(array_of_points): # Fix: divides by 0
    if array_of_points[0][0] == 0 and array_of_points[0][1] == 0:
        regression_line = {'m': 0, 'b': 0}
        return regression_line
    else:
        n = 0
        sumx = 0
        sumy = 0
        sumxsquared = 0
        sumxy = 0
        for point in array_of_points:
            if point[0] > 0:
                n = n + 1
                sumx = sumx + point[0]
                sumy = sumy + point[1]
                sumxsquared = sumxsquared + point[0] * point[0]
                sumxy = sumxy + point[0] * point[1]
        m_top = float(sumxy - (sumy * (sumx / n)))
        m_bottom = float(sumxsquared - (sumx * (sumx / n)))
        if m_bottom == 0 and m_top == 0:
            m = 0
        else:
            m = float(m_top / m_bottom)
        b_top = float(sumy - m * sumx)
        b_bottom = float(n)
        if b_bottom == 0 and b_top == 0:
            b = 0
        else:
            b = float(b_top / b_bottom)
        # where y = m * x + b
        regression_line = {'m': m, 'b': b}
        return regression_line

def get_genre_regression_data(user_id,
        start_date,
        end_date):
    regression_data = []
    data = []
    top_genres = []
    sql = text("""
        SELECT genres.id,
        genres.name,
        (SELECT COUNT(*) 
            FROM videos 
            JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id 
            WHERE vids_genres.genre_id = genres.id AND 
            (SELECT COUNT(*) 
                FROM listens 
                WHERE user_id = """ +
                str(user_id) +
                """ AND youtube_id = videos.youtube_id 
                AND listened_to_end = 0 
                AND listens.time_of_listen > '""" +
                start_date +
                "' AND listens.time_of_listen < '" +
                end_date +
                """'
            ) > 0
        ) AS num_vids_listened,
        (SELECT COUNT(*) 
            FROM listens 
            JOIN vids_genres ON vids_genres.youtube_id = listens.youtube_id 
            WHERE listens.listened_to_end = 0 
            AND listens.user_id = """ +
            str(user_id) +
            " AND listens.time_of_listen > '" +
            start_date +
            "' AND listens.time_of_listen < '" +
            end_date +
            """' AND vids_genres.genre_id = genres.id
        ) AS plays_per_genre,
        (SELECT COUNT(*) 
            FROM videos 
            JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id 
            WHERE vids_genres.genre_id = genres.id 
            AND 
            (SELECT COUNT(*) 
                FROM listens 
                WHERE user_id = """ +
                str(user_id) +
                """ AND youtube_id = videos.youtube_id 
                AND listened_to_end = 0 
                AND listens.time_of_listen > '""" +
                start_date +
                """' AND listens.time_of_listen < '""" +
                end_date +
                """'
            ) > 2
        ) AS num_vids_relistened,
        (
            (SELECT COUNT(*) 
                FROM videos 
                JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id 
                WHERE vids_genres.genre_id = genres.id 
                AND 
                (SELECT COUNT(*) 
                    FROM listens 
                    WHERE user_id = """ +
                    str(user_id) +
                    """ AND youtube_id = videos.youtube_id 
                    AND listens.time_of_listen > '""" +
                    start_date +
                    """' AND listens.time_of_listen < '""" +
                    end_date +
                    """' AND listened_to_end = 0
                ) > 1
            )/(SELECT COUNT(*) 
                FROM videos 
                JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id 
                WHERE vids_genres.genre_id = genres.id 
                AND (SELECT COUNT(*) 
                FROM listens WHERE user_id = """ +
                str(user_id) +
                """ AND youtube_id = videos.youtube_id 
                AND listens.time_of_listen > '""" +
                start_date + 
                """' AND listens.time_of_listen < '""" +
                end_date +
                """' AND listened_to_end = 0
                ) > 0
            )
        )*100 AS percentage_vids_relistened
      FROM genres
      ORDER BY num_vids_listened DESC, genres.name ASC;""")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    i = 0
    for row in rows:
        track = (row[2], row[4]) # (count played, count liked)
        regression_data.append(track)
        i = i + 1
    return regression_data

def get_top_listened_genres(
        user_id, start_date=None, 
        end_date=None, 
        limit=10):
    top_genres = []
    if start_date and end_date:
        dates = (" AND listens.time_of_listen >= '" + 
            str(start_date) + 
            "' AND listens.time_of_listen <= '" + 
            str(end_date) + 
            "' ")
    sql = ("""
        SELECT genres.name,
        (SELECT COUNT(*)
            FROM listens
            JOIN vids_genres ON vids_genres.youtube_id = listens.youtube_id
            WHERE listens.listened_to_end = 0 AND
            listens.user_id = """ + str(user_id) +
            """ AND listens.time_of_listen >= '""" +
            start_date +
            """' AND listens.time_of_listen <= '""" +
            end_date +
            """' AND vids_genres.genre_id = genres.id
        ) AS genre_plays
        FROM genres
        ORDER BY genre_plays DESC
        LIMIT """ +
        str(limit) + ";")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    for row in rows:
        genre = {
            'name': row[0],
            'listens': row[1]}
        top_genres.append(genre)
    return top_genres
    return None

def count_listens_by_week(user_id, start_date=None, end_date=None):
    dates = ""
    count_by_week = []
    if start_date and end_date:
        dates = (" AND listens.time_of_listen >= '" + 
            str(start_date) + 
            "' AND listens.time_of_listen <= '" + 
            str(end_date) + 
            "' ")
    sql = ("""SELECT *
    FROM listens
    WHERE user_id = """ + str(user_id) + str(dates) + """
    AND listened_to_end != 1
    ORDER BY time_of_listen""")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    if rows:
        sunday = datetime.datetime.strptime('2015-12-06 00:00:00',
                                            "%Y-%m-%d %H:%M:%S")
        first_listen = rows[0][5]
        difference = first_listen - sunday
        difference = difference.days
        days_past_sunday = difference % 7
        first_sunday = first_listen - datetime.timedelta(days=days_past_sunday)
        first_sunday = first_sunday.replace(hour=00, minute=00, second=00)
        start_week = first_sunday
        end_week = start_week + datetime.timedelta(days=7)
        weekly_count = 0
        for row in rows:
            found_week = False
            while (not found_week):
                if start_week <= row[5] < end_week:
                    weekly_count = weekly_count + 1
                    found_week = True
                else:
                    count_by_week.append({
                        'Week': str(
                            datetime.datetime.strftime(start_week,
                                                       "%Y-%m-%d %H:%M:%S")),
                        'Listens': weekly_count
                    })
                    start_week = end_week
                    end_week = start_week + datetime.timedelta(days=7)
                    weekly_count = 0
        count_by_week.append({
            'Week':
            str(datetime.datetime.strftime(start_week, "%Y-%m-%d %H:%M:%S")),
            'Listens': weekly_count
        })

    return count_by_week

# NEW FUNCTIONS
# Albums
def album_in_database(album_name):
    album = sql_session.query(models.Album).filter_by(
        name=album_name).first()
    if album:
        return album
    else:
        return None

def update_album_name(album_name):
    album = album_in_database(album_name)
    if not album:
        sql_session.rollback()
        new_album = models.Album(name=album_name)
        sql_session.add(new_album)
        sql_session.commit()
        album = sql_session.query(models.Album).filter_by(
            name=album_name).first()
    return album

# Artists
def artist_has_similar_artist(artist1_name, artist2_name):
    artist1 = update_artist_name(artist1_name)
    artist2 = update_artist_name(artist2_name)
    similar_artist = sql_session.query(models.SimilarArtists).filter_by(
        artist_id1=artist1.id, artist_id2=artist2.id).first()
    if similar_artist:
        return similar_artist
    else:
        return None

def artist_in_database(artist_name):
    artist = sql_session.query(models.Artist).filter_by(
        artist_name=artist_name).first()
    if artist:
        return artist
    else:
        return None

def update_artist_name(artist_name):
    artist = artist_in_database(artist_name)
    if not artist:
        sql_session.rollback()
        new_artist = models.Artist(artist_name=artist_name)
        sql_session.add(new_artist)
        sql_session.commit()
        artist = sql_session.query(models.Artist).filter_by(
            artist_name=artist_name).first()
    return artist

def update_artist_similar_artists(artist, similar_artists):
    artist1 = update_artist_name(artist)
    for artist in similar_artists:
        artist2 = update_artist_name(artist['name'])
        lastfm_match_score = artist['match']
        if not artist_has_similar_artist(
                artist1_name=artist1.artist_name, 
                artist2_name=artist2.artist_name):
            sql_session.rollback()
            updated_artist = models.SimilarArtists(
                artist_id1=artist1.id, artist_id2=artist2.id, 
                lastfm_match_score=lastfm_match_score)
            sql_session.add(updated_artist)
            sql_session.commit()
    return "success"

def update_artist_info(artist, bio):
    artist = update_artist_name(artist)
    now = datetime.datetime.now()
    this_year = int(now.year)
    possible_years = re.findall('\d{4}', bio)
    confirmed_years = [year for year in possible_years 
        if int(year) > 1100 and int(year) <= this_year]
    if confirmed_years:
        confirmed_years = sorted(confirmed_years)
        first_year = confirmed_years[0]
        final_year = confirmed_years[len(confirmed_years)-1]
        if not artist.start_year:
            artist.start_year = str(first_year) + '-01-01'
        # Set end date if inactive for 5+ years
        if this_year - int(final_year) >= 5:
            artist.end_year = str(
                final_year) + '-01-01'
        else:
            artist.end_year = None
    undefined_city = 2
    if artist.city_id == undefined_city:
        cities = get_cities()
        for city in cities:
            if city['state'] in bio:
                artist.city_id = city['id']
    if (artist.start_year or
            artist.end_year or
            artist.city_id != undefined_city):
        sql_session.commit()
    return "success"

# Cities
# city_in_database
def get_cities():
    cities = []
    sql = text("""
        SELECT id,
        country_id,
        city_or_state as state
        FROM cities
        ORDER BY state;
        """)
    results = models.engine.execute(sql)
    for result in results:
        city = {
            'id':result[0],
            'country_id':result[1],
            'state':result[2]}
        cities.append(city)
    return cities

# Genres
def genre_in_database(genre_name):
    genre = sql_session.query(models.Genre).filter_by(
        name=genre_name).first()
    if genre:
        return genre
    else:
        return None

# Listens
def post_listen(user_id, youtube_id, listened_to_end):
    video = video_in_database(youtube_id)
    if video:
        listen = models.Listen(
            user_id=user_id,
            youtube_id=youtube_id,
            listened_to_end=listened_to_end)
        sql_session.add(listen)
        sql_session.commit()
        return "success"

# Videos
def video_in_database(youtube_id):
    video = sql_session.query(models.Video).filter_by(
        youtube_id=youtube_id).first()
    if video:
        return video
    else:
        return None

def video_has_genre(youtube_id, genre):
    video_genres = []
    video = video_in_database(youtube_id)
    if video_in_database:
        sql = text(
            """SELECT genres.name
            , genres.id
            FROM genres
            JOIN vids_genres ON genres.id = vids_genres.genre_id
            WHERE vids_genres.youtube_id = '""" + youtube_id + """'
            ORDER BY genres.name;""")
        results = models.engine.execute(sql)
        rows = results.fetchall()
        if rows:
            for row in rows:
                video_genres.append(row[0])
        if genre.lower() in video_genres:
            return True
    else:
        return False

def update_video_genres(youtube_id, genres):
    video = video_in_database(youtube_id)
    if video:
        for genre in genres:
            genre = genre_in_database(genre)
            if genre and not video_has_genre(youtube_id, genre.name):
                sql_session.rollback()
                new_video_genre = models.VidsGenres(
                    youtube_id=youtube_id, genre_id=genre.id)
                sql_session.add(new_video_genre)
                sql_session.commit()
        return "success"

def post_video(youtube_id, 
        youtube_title,  
        channel_id, 
        description,
        title=None, 
        artist=None, 
        album=None, 
        release_date=None, 
        music=1):
    video = video_in_database(youtube_id)
    if not video:
        if artist:
            artist = update_artist_name(artist)
            artist_id = artist.id
        else:
            artist_id = 1
        if album:
            album = update_album_name(album)
            album_id = album.id
        else:
            album_id = 2
        new_video = models.Video(
            youtube_id=youtube_id,
            youtube_title=youtube_title,
            title=title,
            artist_id=artist_id,
            album_id=album_id,
            channel_id=channel_id,
            description=description,
            release_date=release_date,
            music=music)
        sql_session.add(new_video)
        sql_session.commit()
        return "success"

"""
def update_video(youtube_id,
        artist=None, 
        album=None, 
        release_date=None, 
        music=1):
    video = video_in_database(youtube_id)
    if video:
"""










