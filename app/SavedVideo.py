#!/usr/bin/python
# -*- mode: python -*-

from sqlalchemy import text

from app.Video import video_in_database

from app import models, sql_session

def delete_saved_video(user_id, youtube_id):
    sql_session.rollback()
    saved_video = sql_session.query(models.SavedVid).filter_by(
            user_id=user_id, youtube_id=youtube_id)
    saved_video.delete()
    sql_session.commit()
    return "success"

def get_saved_videos(user_id, search_artist=None):
    artist = ""
    if search_artist:
        artist = (" AND artists.artist_name LIKE '%" +
        search_artist +
        "%' ")
    sql = text("""
        SELECT videos.youtube_id,
        videos.youtube_title,
        videos.title,
        videos.music,
        videos.release_date,
        artists.artist_name as artist,
        albums.name as album,
        artists.id as artist_id,
        albums.id as album_id
        FROM saved_vids
        JOIN videos ON saved_vids.youtube_id = videos.youtube_id
        JOIN albums ON videos.album_id = albums.id
        JOIN artists ON videos.artist_id = artists.id
        JOIN cities ON artists.city_id = cities.id
        WHERE saved_vids.user_id = """ +
        str(user_id) +
        artist +
        """ GROUP BY videos.youtube_id
        ORDER BY artists.artist_name
        LIMIT 1500;""")
    sql_session.rollback()
    results = models.engine.execute(sql)
    videos = []
    for result in results:
        video = {
            'music': result[3],
            'title': result[2],
            'artist': result[5],
            'album': result[6],
            'release_date': result[4],
            'youtube_id': result[0],
            'artist_id': result[7],
            'album_id': result[8],
            'library': 1
        }
        videos.append(video)
    return videos

def is_saved_video(user_id, youtube_id):
    is_saved_video = sql_session.query(models.SavedVid).filter_by(
        user_id=user_id, youtube_id=youtube_id).first()
    if is_saved_video:
        return True
    else:
        return False

def post_saved_video(user_id, youtube_id):
    video_in_db = video_in_database(youtube_id)
    saved_video = is_saved_video(user_id=user_id, youtube_id=youtube_id)
    if video_in_db and not saved_video:
        saved_video = models.SavedVid(
            user_id=user_id,
            youtube_id=youtube_id)
        sql_session.add(saved_video)
        sql_session.commit()
        return "success"