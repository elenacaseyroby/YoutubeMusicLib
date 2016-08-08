#!/usr/bin/python
# -*- mode: python -*-

from app import models, sql_session, viewsClasses
from sqlalchemy import text, update, func
from flask import session, request

def getlibrary(user_id, search_artist):
  sql_session.rollback()
  listens = list()
  saved_vids = sql_session.query(models.SavedVid).filter_by(user_id = user_id).first()
  if saved_vids:
    sql = text("""SELECT videos.youtube_id
   , videos.youtube_title
   , videos.title
   , videos.music
   , videos.release_date
   , artists.artist_name as artist
   , cities.city_or_state
   , albums.name as album
   , videos.track_num
   , artists.id as artist_id
   , albums.id as album_id
   FROM saved_vids
   JOIN videos ON saved_vids.youtube_id = videos.youtube_id
   JOIN albums ON videos.album_id = albums.id
   JOIN artists ON videos.artist_id = artists.id
   JOIN cities ON artists.city_id = cities.id
   WHERE saved_vids.user_id = """+str(user_id)+"""
   AND artists.artist_name LIKE '"""+search_artist+"""'
   ORDER BY artists.artist_name, albums.name ASC;""")

    results = models.engine.execute(sql)
    for result in results:

      listen = viewsClasses.display_update_row_object( index = ""
                                , play = 0
                                , library = 1
                                , music= result[3]
                                , title= result[2]
                                , artist = result[5]
                                , album = result[7]
                                , release_date = result[4]
                                , youtube_id = result[0]
                                , artist_id = result[9]
                                , album_id = result[10]
                                )
      listens.append(listen)

  return listens 

#get listens data for listens page

def getlistensdata(search_start_date, search_end_date, search_artist):
  sql_session.rollback()
  limit = 30
  listens = list()
  start_date = search_start_date
  end_date = search_end_date

  sql = text("""SELECT listens.id
   , listens.youtube_id
   , listens.time_of_listen
   , videos.youtube_title
   , videos.title
   , videos.music
   , videos.release_date
   , artists.artist_name as artist
   , cities.city_or_state
   , albums.name as album
   , videos.track_num
   , artists.id as artist_id
   , albums.id as album_id
   , CASE WHEN (SELECT COUNT(*) FROM saved_vids WHERE saved_vids.user_id = """+str(session['session_user_id'])+""" AND saved_vids.youtube_id = listens.youtube_id ) > 0 THEN 1 ELSE 0 END AS library
   FROM listens
   JOIN videos ON listens.youtube_id = videos.youtube_id
   JOIN albums ON videos.album_id = albums.id
   JOIN artists ON videos.artist_id = artists.id
   JOIN cities ON artists.city_id = cities.id
   WHERE listens.user_id = """+str(session['session_user_id'])+"""
   AND listens.time_of_listen > '"""+str(start_date)+"""'
   AND listens.time_of_listen < '"""+str(end_date)+"""'
   AND listens.listened_to_end != 1 
   AND artists.artist_name LIKE '"""+search_artist+"""'
   GROUP BY listens.id 
   ORDER BY listens.time_of_listen DESC
   LIMIT """+str(limit)+";""")

  results = models.engine.execute(sql)
  for result in results:
    #if result[1] (youtube_id) is in list of user's saved vids, then 
    # var library = 1, else = 0 
    listen = viewsClasses.display_update_row_object(index = result[2].strftime('%a %I:%M %p') #time_of_listen
                            , play = 0
                            , music= result[5]
                            , title= result[4]
                            , artist = result[7]
                            , album = result[9]
                            , release_date = result[6]
                            , youtube_id = result[1]
                            , artist_id = result[11]
                            , album_id = result[12]
                            , library = result[13]
                            )
    listens.append(listen)

  return listens 

def getCities(select = "*", artist_id=None):
  where = ""
  if artist_id:
    where = "WHERE cities.artist_id = "+artist_id
  sql= text("""SELECT """+select+"""
    FROM cities
    """+where+";")
  result = models.engine.execute(sql)
  return result


def getArtists(artist_id=None):
  where = ""
  if artist_id:
    where = "WHERE artist_id = "+artist_id
  sql= text("""SELECT *
    FROM artists
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

def getsimilarartistsbyartist(artist_id):
  sql = text("""SELECT artists.artist_name, artists.id
    FROM similar_artists
    JOIN artists on similar_artists.artist_id2 = artists.id
    WHERE similar_artists.artist_id1 = """+str(artist_id)+";")
  result = models.engine.execute(sql)
  return result

#query not in use yet
def getsimilarartistsbyvideo(youtube_id):
  sql = text("""SELECT 
a1.artist_name
FROM videos
JOIN similar_artists s1 ON videos.artist_id = s1.artist_id1
JOIN artists a1 ON s1.artist_id2 = a1.id
WHERE videos.youtube_id = '"""+str(youtube_id)+"""';""")
  result1 = models.engine.execute(sql)

  #for result in result1:
    #print(result)

  sql = text("""SELECT 
a2.artist_name
FROM videos
JOIN similar_artists s2 ON videos.artist_id = s2.artist_id2
JOIN artists a2 ON s2.artist_id1 = a2.id
WHERE videos.youtube_id = '"""+str(youtube_id)+"""';""")
  result2 = models.engine.execute(sql)

  #for result in result2:
    #print(result)
  #result = result1 + result2
  #result = list(set(result)) #remove redundancies
  return "success"


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
