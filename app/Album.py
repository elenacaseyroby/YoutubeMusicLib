#!/usr/bin/python
# -*- mode: python -*-

from app import models, sql_session

def album_in_database(album_name):
    album = sql_session.query(models.Album).filter_by(
        name=album_name).first()
    if album:
        return album

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