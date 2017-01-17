#!/usr/bin/python
# -*- mode: python -*-

from app import models, sql_session

def genre_in_database(genre_name):
    genre = sql_session.query(models.Genre).filter_by(
        name=genre_name).first()
    if genre:
        return genre