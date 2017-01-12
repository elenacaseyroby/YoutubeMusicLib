#!/usr/bin/python
# -*- mode: python -*-

from sqlalchemy import text

from app.Album import update_album_name
from app.Artist import update_artist_name
from app.Genre import genre_in_database

from app import models, sql_session

def get_videos(user_id, search_artist=None):
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
        albums.id as album_id,
        CASE WHEN (
            SELECT COUNT(*) 
            FROM saved_vids 
            WHERE saved_vids.user_id = """ +
            str(user_id) +
            """ AND saved_vids.youtube_id = videos.youtube_id 
        ) > 0 THEN 1 ELSE 0 END AS library
        FROM videos
        JOIN albums ON videos.album_id = albums.id
        JOIN artists ON videos.artist_id = artists.id
        JOIN cities ON artists.city_id = cities.id
        WHERE videos.youtube_id is not NULL """ +
        artist +
        """GROUP BY videos.youtube_id
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
            'library': result[9]
        }
        videos.append(video)
    return videos

def post_video(
        youtube_id, 
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

def update_video(youtube_id,
        title=None,
        artist=None,
        album=None,
        release_date=None,
        music=1):
    video = video_in_database(youtube_id)
    if video:
        if artist:
            artist = update_artist_name(artist)
            video.artist_id = artist.id
        if album:
            album = update_album_name(album)
            video.album_id = album.id
        if title:
            video.title = title
        if release_date:
            video.release_date = release_date
        video.music = music
        sql_session.commit()
        return "success"

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

def video_has_genre(youtube_id, genre):
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
        video_genres = []
        if rows:
            for row in rows:
                video_genres.append(row[0])
        if genre.lower() in video_genres:
            return True
    else:
        return False

def video_in_database(youtube_id):
    video = sql_session.query(models.Video).filter_by(
        youtube_id=youtube_id).first()
    if video:
        return video