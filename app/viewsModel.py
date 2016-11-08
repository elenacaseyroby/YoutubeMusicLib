#!/usr/bin/python
# -*- mode: python -*-

from app import models, sql_session
from app import viewsClasses
from sqlalchemy import text, update, func
from flask import session, request


def getartists(artist_id=None):
  where = ""
  if artist_id:
    where = "WHERE artist_id = "+artist_id
  sql= text("""SELECT *
    FROM artists
    """+where+";")
  result = models.engine.execute(sql)
  return result

def getcities(select = "*", artist_id=None):
  where = ""
  if artist_id:
    where = "WHERE cities.artist_id = "+artist_id
  sql= text("""SELECT """+select+"""
    FROM cities
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


#get listens data for listens page
def getvideodata(user_id, video_scope, search_start_date, search_end_date, search_artist):

  sql_session.rollback()
  videos = list()
  start_date = search_start_date
  end_date = search_end_date
  scope = ""
  groupby = ""
  case_when_library = " AND saved_vids.youtube_id = videos.youtube_id ) > 0 THEN 1 ELSE 0 END AS library"
  sql_select = ",videos.youtube_id"

  if search_artist:
    artist = "AND artists.artist_name LIKE '"+search_artist+"'"

  if video_scope == "listens":
    sql_select = """,listens.youtube_id
   , listens.id
   , listens.time_of_listen"""
    sql_from = """FROM listens
   JOIN videos ON listens.youtube_id = videos.youtube_id"""
    scope = """WHERE listens.user_id = """+str(user_id)+"""
   AND listens.time_of_listen > '"""+str(start_date)+"""'
   AND listens.time_of_listen < '"""+str(end_date)+"""'
   AND listens.listened_to_end != 1 """
    groupby = """GROUP BY listens.id 
   ORDER BY listens.time_of_listen DESC;"""
    case_when_library = " AND saved_vids.youtube_id = listens.youtube_id ) > 0 THEN 1 ELSE 0 END AS library"
  elif video_scope == "library":
    sql_from = """FROM saved_vids
   JOIN videos ON saved_vids.youtube_id = videos.youtube_id"""
    scope = "WHERE saved_vids.user_id = "+str(user_id)
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
   , CASE WHEN (SELECT COUNT(*) FROM saved_vids WHERE saved_vids.user_id = """+str(session['session_user_id'])+case_when_library+"""
   """+sql_select+"""
   """+sql_from+"""
   JOIN albums ON videos.album_id = albums.id
   JOIN artists ON videos.artist_id = artists.id
   JOIN cities ON artists.city_id = cities.id
   """+scope+"""
   """+artist+"""
   """+groupby)

  results = models.engine.execute(sql)
  
  for result in results:
      if (video_scope == "listens"):
        index = result[13].strftime('%a %I:%M %p')
      else:
        index = None
      video = { 'music': result[2]
              , 'title': result[1]
              , 'artist': result[4]
              , 'album': result[6]
              , 'release_date': result[3]
              , 'youtube_id': result[11]
              , 'artist_id': result[8]
              , 'album_id': result[9]
              , 'library': result[10]
              , 'index': index
              }

      videos.append(video)

  return videos 

def getsimilarartistsbyartist(artist_id):
  sql = text("""SELECT artists.artist_name, artists.id
    FROM similar_artists
    JOIN artists on similar_artists.artist_id2 = artists.id
    WHERE similar_artists.artist_id1 = """+str(artist_id)+";")
  result = models.engine.execute(sql)
  return result

#function not used in code yet
def getsimilarartistsbyvideo(youtube_id):
  sql = text("""SELECT 
a1.artist_name
FROM videos
JOIN similar_artists s1 ON videos.artist_id = s1.artist_id1
JOIN artists a1 ON s1.artist_id2 = a1.id
WHERE videos.youtube_id = '"""+str(youtube_id)+"""';""")
  result1 = models.engine.execute(sql)

  sql = text("""SELECT 
a2.artist_name
FROM videos
JOIN similar_artists s2 ON videos.artist_id = s2.artist_id2
JOIN artists a2 ON s2.artist_id1 = a2.id
WHERE videos.youtube_id = '"""+str(youtube_id)+"""';""")
  result2 = models.engine.execute(sql)

  return "success"

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

def getplaylisttitles(user_id):
  playlisttitles = []
  sql = text("""SELECT playlists.title, playlists.id
                FROM playlists
                WHERE user_id = '"""+str(user_id)+"';");
  results = models.engine.execute(sql)
  rows = results.fetchall()
  if len(rows) > 0:
    for row in rows: 
      playlist_title = row[0]
      playlisttitles.append(playlist_title)
      
  return playlisttitles

def getplaylisttracks(playlist_id):
  playlist_tracks = []
  sql = text("""SELECT playlist_tracks.*
    , videos.title
    , artists.artist_name
            FROM playlist_tracks
            JOIN playlists ON playlist_tracks.playlist_id = playlists.id
            JOIN videos ON playlist_tracks.youtube_id = videos.youtube_id
            JOIN artists ON videos.artist_id = artists.id
            WHERE playlists.id = '"""+str(playlist_id)+""""'
            ORDER BY playlist_tracks.track_num;""");
  results = models.engine.execute(sql)
  rows = results.fetchall()
  for row in rows:
      track = {'youtube_id': row[2]
      , 'title': row[5]
      , 'artist': row[6]
      , 'track_num': row[3]
      }
      playlist_tracks.append(track)

  return playlist_tracks









