#!/usr/bin/python
# -*- mode: python -*-

from sqlalchemy import text

from app.Video import video_in_database

from app import models, sql_session

def get_listens(user_id, start_date=None, end_date=None):
    dates = ""
    if start_date:
        dates = (
            " AND listens.time_of_listen >= '" + 
            str(start_date) + 
            "'")
    if end_date:
        dates = (
            dates +
            " AND listens.time_of_listen <= '" + 
            str(end_date) + 
            "' ")
    sql = ("""
        SELECT
        youtube_id,
        time_of_listen
        FROM listens
        WHERE user_id = """ +
        str(user_id) +
        str(dates) +
        """ AND listened_to_end != 1
        ORDER BY time_of_listen""")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    listens = []
    for row in rows:
        listen = {
            'youtube_id': row[0],
            'time_of_listen': row[1]
        }
        listens.append(listen)
    return listens

def get_listens_videos(
        user_id,
        search_start_date=None,
        search_end_date=None,
        search_artist=None):
    start_date = ""
    if search_start_date:
        start_date = (" AND listens.time_of_listen >= '" +
        str(search_start_date) +
        "' ")
    end_date = ""
    if search_end_date:
        end_date = (" AND listens.time_of_listen <= '" +
        str(search_end_date) +
        "' ")
    artist = ""
    if search_artist:
        artist = (" AND artists.artist_name LIKE '%" +
        search_artist +
        "%' ")
    sql = text("""
        SELECT videos.youtube_title,
        videos.title,
        videos.music,
        videos.release_date,
        artists.artist_name as artist,
        cities.city_or_state,
        albums.name as album,
        videos.track_num,
        artists.id as artist_id,
        albums.id as album_id,
        CASE WHEN (
            SELECT COUNT(*) 
            FROM saved_vids 
            WHERE saved_vids.user_id = """ +
            str(user_id) +
            """ AND saved_vids.youtube_id = videos.youtube_id 
        ) > 0 THEN 1 ELSE 0 END AS library,
        listens.youtube_id,
        listens.id,
        listens.time_of_listen
        FROM listens
        JOIN videos ON listens.youtube_id = videos.youtube_id
        JOIN albums ON videos.album_id = albums.id
        JOIN artists ON videos.artist_id = artists.id
        JOIN cities ON artists.city_id = cities.id
        WHERE listens.listened_to_end != 1 
        AND listens.user_id = """ +
        str(user_id) +
        start_date +
        end_date +
        artist +
        """GROUP BY listens.id
        ORDER BY listens.time_of_listen DESC
        LIMIT 1500;""")
    sql_session.rollback()
    results = models.engine.execute(sql)
    videos = []
    for result in results:
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
            'index': result[13].strftime('%a %I:%M %p')
        }
        videos.append(video)
    return videos

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