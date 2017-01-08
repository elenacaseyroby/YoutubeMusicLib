#!/usr/bin/python
# -*- mode: python -*-

import datetime

from sqlalchemy import text

from app import models, sql_session
from flask import session


def get_artists(artist_id=None):
    where = ""
    if artist_id:
        where = "WHERE artist_id = " + artist_id
    sql = text("""SELECT *
    FROM artists
    """ + where + ";")
    result = models.engine.execute(sql)
    return result


def get_cities(select="*", artist_id=None):
    where = ""
    if artist_id:
        where = "WHERE cities.artist_id = " + artist_id
    sql = text("""SELECT """ + select + """
    FROM cities
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
   str(session['session_user_id']) + case_when_library + """
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


def get_similar_artists_by_artist(artist_id):
    sql = text("""SELECT artists.artist_name, artists.id
    FROM similar_artists
    JOIN artists on similar_artists.artist_id2 = artists.id
    WHERE similar_artists.artist_id1 = """ + str(artist_id) + ";")
    result = models.engine.execute(sql)
    return result

def update_album(album_name):
    #if artist name exists in db but it is not already tied to video, update videos table row with new artist_id
    sql_session.rollback()
    album_by_name = sql_session.query(models.Album).filter_by(
        name=album_name).first()
    if album_by_name:
        album_id = album_by_name.id
    #if artist name doesn't exist in db, add new row to artists table
    else:
        sql_session.rollback()
        new_album = models.Album(name=album_name)
        sql_session.add(new_album)
        sql_session.commit()
        new_album_id = sql_session.query(models.Album).filter_by(
            name=album_name).first()
        album_id = int(new_album_id.id)

    return album_id



def update_video_artist(artist_artist_name):
    #if artist name exists in db but it is not already tied to video, update videos table row with new artist_id
    sql_session.rollback()
    artist_by_name = sql_session.query(models.Artist).filter_by(
        artist_name=artist_artist_name).first()
    if artist_by_name:
        artist_id = artist_by_name.id
    #if artist name doesn't exist in db, add new row to artists table
    else:
        sql_session.rollback()
        new_artist = models.Artist(artist_name=artist_artist_name)
        sql_session.add(new_artist)
        sql_session.commit()
        new_artist_id = sql_session.query(models.Artist).filter_by(
            artist_name=artist_artist_name).first()
        artist_id = int(new_artist_id.id)

    return artist_id


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


def get_genre_data_linear_regression(user_id,
                                      start_date,
                                      end_date,
                                      return_top_n_genres=10):
    regression_data = []
    data = []
    top_genres = []
    sql = text(
        """SELECT genres.id
  , genres.name
  , (SELECT COUNT(*) FROM videos JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id WHERE vids_genres.genre_id = genres.id AND (SELECT COUNT(*) FROM listens WHERE user_id = """
        + str(user_id) +
        """ AND youtube_id = videos.youtube_id AND listened_to_end = 0 AND listens.time_of_listen > '"""
        + start_date + """' AND listens.time_of_listen < '""" + end_date +
        """') > 0) AS num_vids_listened
  , (SELECT COUNT(*) FROM listens JOIN vids_genres ON vids_genres.youtube_id = listens.youtube_id WHERE listens.listened_to_end = 0 AND listens.user_id = """
        + str(user_id) + """ AND listens.time_of_listen > '""" + start_date +
        """' AND listens.time_of_listen < '""" + end_date +
        """' AND vids_genres.genre_id = genres.id) AS plays_per_genre
  , (SELECT COUNT(*) FROM videos JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id WHERE vids_genres.genre_id = genres.id AND (SELECT COUNT(*) FROM listens WHERE user_id = """
        + str(user_id) +
        """ AND youtube_id = videos.youtube_id AND listened_to_end = 0 AND listens.time_of_listen > '"""
        + start_date + """' AND listens.time_of_listen < '""" + end_date +
        """') > 2) AS num_vids_relistened
  ,((SELECT COUNT(*) FROM videos JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id WHERE vids_genres.genre_id = genres.id AND (SELECT COUNT(*) FROM listens WHERE user_id = """
        + str(user_id) +
        """ AND youtube_id = videos.youtube_id AND listens.time_of_listen > '"""
        + start_date + """' AND listens.time_of_listen < '""" + end_date +
        """' AND listened_to_end = 0) > 1)/(SELECT COUNT(*) FROM videos JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id WHERE vids_genres.genre_id = genres.id AND (SELECT COUNT(*) FROM listens WHERE user_id = """
        + str(user_id) +
        """ AND youtube_id = videos.youtube_id AND listens.time_of_listen > '"""
        + start_date + """' AND listens.time_of_listen < '""" + end_date +
        """' AND listened_to_end = 0) > 0))*100 AS percentage_vids_relistened
  FROM genres
  ORDER BY num_vids_listened DESC, genres.name ASC;""")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    i = 0
    for row in rows:
        if i < return_top_n_genres and row[2] != 0:
            top_genres.append(row[1])
        track = (row[2], row[4])
        regression_data.append(track)
        i = i + 1
    data = {'top_genres': top_genres, 'regression_data': regression_data}

    return data


def count_listens_by_week(user_id, start_date=None, end_date=None):
    dates = ""
    count_by_week = []
    if start_date and end_date:
        dates = " AND listens.time_of_listen >= '" + str(
            start_date) + "' AND listens.time_of_listen <= '" + str(
                end_date) + "' "
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

# Genres
def genre_in_database(genre):
    genre = sql_session.query(models.Genre).filter_by(
        name=genre).first()
    if genre:
        return genre
    else:
        return None

# Videos
def video_has_genre(youtube_id, genre):
    video_genres = []
    if youtube_id:
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

def update_video_genres(youtube_id, new_genres):
    for genre in new_genres:
        genre = genre_in_database(genre)
        if genre and not video_has_genre(youtube_id, genre.name):
            sql_session.rollback()
            new_video_genre = models.VidsGenres(
                youtube_id=youtube_id, genre_id=genre.id)
            sql_session.add(new_video_genre)
            sql_session.commit()
    return "success"
