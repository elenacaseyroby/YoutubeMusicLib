#!/usr/bin/python
# -*- mode: python -*-

from sqlalchemy import text

from app import models, sql_session

# Change to city_in_database and use like genre_in_database
def get_cities():
    cities = []
    sql = text("""
        SELECT id,
        country_id,
        city_or_state as state
        FROM cities
        ORDER BY state;
        """)
    results = models.engine.execute(sql)
    for result in results:
        city = {
            'id':result[0],
            'country_id':result[1],
            'state':result[2]}
        cities.append(city)
    return cities