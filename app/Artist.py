#!/usr/bin/python
# -*- mode: python -*-

import datetime
import re

from sqlalchemy import text

from app.City import get_cities

from app import models, sql_session

def artist_has_similar_artist(artist1_name, artist2_name):
    artist1 = update_artist_name(artist1_name)
    artist2 = update_artist_name(artist2_name)
    similar_artist = sql_session.query(models.SimilarArtists).filter_by(
        artist_id1=artist1.id, artist_id2=artist2.id).first()
    if similar_artist:
        return similar_artist

def artist_in_database(artist_name):
    artist = sql_session.query(models.Artist).filter_by(
        artist_name=artist_name).first()
    if artist:
        return artist

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