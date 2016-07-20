#!/usr/bin/python
# -*- mode: python -*-

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref 
import os

""" DO NOT COMMIT CHANGES TO THIS FILE!! """
db_url = os.environ['CLEARDB_DATABASE_URL']
if db_url is "":
    db_url = os.environ['MYSQL_DATABASE_URL']
if db_url is "":
    db_url = 'mysql+pymysql://root:@127.0.0.1:3306/youtubelib'
engine = create_engine(db_url, convert_unicode=True, echo=False)
Base = declarative_base()
Base.metadata.reflect(engine)

class Album(Base):
	__table__ = Base.metadata.tables['albums']

class Artist(Base):
	__table__ = Base.metadata.tables['artists']

class City(Base):
	__table__ = Base.metadata.tables['cities']

class Country(Base):
	__table__ = Base.metadata.tables['countries']

class Genre(Base):
	__table__ = Base.metadata.tables['genres']

class Listen(Base):
	__table__ = Base.metadata.tables['listens']

class Rating(Base):
	__table__ = Base.metadata.tables['ratings']

class SavedVid(Base):
	__table__ = Base.metadata.tables['saved_vids']

class SimilarArtists(Base):
	__table__ = Base.metadata.tables['similar_artists']

class User(Base):
    __table__ = Base.metadata.tables['users']

class Video(Base):
	__table__ = Base.metadata.tables['videos']

class VidsGenres(Base):
	__table__ = Base.metadata.tables['vids_genres']



