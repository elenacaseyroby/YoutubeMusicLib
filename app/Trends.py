#!/usr/bin/python
# -*- mode: python -*-

import datetime

from sqlalchemy import text

from app import models, sql_session

def count_listens_by_week(user_id, start_date=None, end_date=None):
    dates = ""
    if start_date and end_date:
        dates = (" AND listens.time_of_listen >= '" + 
            str(start_date) + 
            "' AND listens.time_of_listen <= '" + 
            str(end_date) + 
            "' ")
    sql = ("""
        SELECT *
        FROM listens
        WHERE user_id = """ +
        str(user_id) +
        str(dates) +
        """ AND listened_to_end != 1
        ORDER BY time_of_listen""")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    if rows:
        # Find the Sunday before the selected start_date 
        # and count listens by week from that date.
        sunday = datetime.datetime.strptime('2015-12-06 00:00:00',
                                            "%Y-%m-%d %H:%M:%S")
        first_listen = rows[0][5]
        difference = first_listen - sunday
        difference = difference.days
        days_past_sunday = difference % 7
        first_sunday = (first_listen -
            datetime.timedelta(days=days_past_sunday))
        first_sunday = first_sunday.replace(
            hour=00, minute=00, second=00)
        start_week = first_sunday
        end_week = start_week + datetime.timedelta(days=7)
        weekly_count = 0
        count_by_week = []
        for row in rows:
            found_week = False
            while (not found_week):
                if start_week <= row[5] < end_week:
                    weekly_count = weekly_count + 1
                    found_week = True
                else:
                    count_by_week.append({
                        'Week': str(
                            datetime.datetime.strftime(start_week,
                                                       "%Y-%m-%d %H:%M:%S")),
                        'Listens': weekly_count
                    })
                    start_week = end_week
                    end_week = start_week + datetime.timedelta(days=7)
                    weekly_count = 0
        count_by_week.append({
            'Week':
            str(datetime.datetime.strftime(start_week, "%Y-%m-%d %H:%M:%S")),
            'Listens': weekly_count
        })
    return count_by_week

def get_genre_regression_data(
        user_id,
        start_date,
        end_date):
    sql = text("""
        SELECT genres.id,
        genres.name,
        (SELECT COUNT(*) 
            FROM videos 
            JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id 
            WHERE vids_genres.genre_id = genres.id AND 
            (SELECT COUNT(*) 
                FROM listens 
                WHERE user_id = """ +
                str(user_id) +
                """ AND youtube_id = videos.youtube_id 
                AND listened_to_end = 0 
                AND listens.time_of_listen > '""" +
                start_date +
                "' AND listens.time_of_listen < '" +
                end_date +
                """'
            ) > 0
        ) AS num_vids_listened,
        (SELECT COUNT(*) 
            FROM listens 
            JOIN vids_genres ON vids_genres.youtube_id = listens.youtube_id 
            WHERE listens.listened_to_end = 0 
            AND listens.user_id = """ +
            str(user_id) +
            " AND listens.time_of_listen > '" +
            start_date +
            "' AND listens.time_of_listen < '" +
            end_date +
            """' AND vids_genres.genre_id = genres.id
        ) AS plays_per_genre,
        (SELECT COUNT(*) 
            FROM videos 
            JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id 
            WHERE vids_genres.genre_id = genres.id 
            AND 
            (SELECT COUNT(*) 
                FROM listens 
                WHERE user_id = """ +
                str(user_id) +
                """ AND youtube_id = videos.youtube_id 
                AND listened_to_end = 0 
            ) > 2
        ) AS num_vids_relistened,
        (
            (SELECT COUNT(*) 
                FROM videos 
                JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id 
                WHERE vids_genres.genre_id = genres.id 
                AND 
                (SELECT COUNT(*) 
                    FROM listens 
                    WHERE user_id = """ +
                    str(user_id) +
                    """ AND youtube_id = videos.youtube_id 
                    AND listens.time_of_listen > '""" +
                    start_date +
                    """' AND listens.time_of_listen < '""" +
                    end_date +
                    """' AND listened_to_end = 0
                ) > 1
            )/(SELECT COUNT(*) 
                FROM videos 
                JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id 
                WHERE vids_genres.genre_id = genres.id 
                AND (SELECT COUNT(*) 
                FROM listens WHERE user_id = """ +
                str(user_id) +
                """ AND youtube_id = videos.youtube_id 
                AND listens.time_of_listen > '""" +
                start_date + 
                """' AND listens.time_of_listen < '""" +
                end_date +
                """' AND listened_to_end = 0
                ) > 0
            )
        )*100 AS percentage_vids_relistened
      FROM genres
      ORDER BY num_vids_listened DESC, genres.name ASC;""")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    i = 0
    regression_data = []
    for row in rows:
        track = (row[2], row[4]) # (count played, count liked)
        regression_data.append(track)
        i = i + 1
    return regression_data

def get_genre_top_listened(
        user_id, start_date=None, 
        end_date=None, 
        limit=10):
    if start_date and end_date:
        dates = (" AND listens.time_of_listen >= '" + 
            str(start_date) + 
            "' AND listens.time_of_listen <= '" + 
            str(end_date) + 
            "' ")
    sql = ("""
        SELECT genres.name,
        (SELECT COUNT(*)
            FROM listens
            JOIN vids_genres ON vids_genres.youtube_id = listens.youtube_id
            WHERE listens.listened_to_end = 0 AND
            listens.user_id = """ + str(user_id) +
            """ AND listens.time_of_listen >= '""" +
            start_date +
            """' AND listens.time_of_listen <= '""" +
            end_date +
            """' AND vids_genres.genre_id = genres.id
        ) AS genre_plays
        FROM genres
        WHERE genres.id != 1
        ORDER BY genre_plays DESC
        LIMIT """ +
        str(limit) + ";")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    top_genres = []
    for row in rows:
        genre = {
            'name': row[0],
            'listens': row[1]}
        top_genres.append(genre)
    return top_genres

def get_regression_line(array_of_points): # Fix: divides by 0
    if array_of_points[0][0] == 0 and array_of_points[0][1] == 0:
        regression_line = {'m': 0, 'b': 0}
        return regression_line
    else:
        m = 0 
        b = 0
        n = 0
        sumx = 0
        sumy = 0
        sumxsquared = 0
        sumxy = 0
        for point in array_of_points:
            if point[0] > 0:
                n = n + 1
                sumx = sumx + point[0]
                sumy = sumy + point[1]
                sumxsquared = sumxsquared + point[0] * point[0]
                sumxy = sumxy + point[0] * point[1]
        if n > 0:
            m_top = float(sumxy - (sumy * (sumx / n)))
            m_bottom = float(sumxsquared - (sumx * (sumx / n)))
            if m_bottom != 0 and m_top != 0:
                m = float(m_top / m_bottom)
            b_top = float(sumy - m * sumx)
            b_bottom = float(n)
            if b_bottom != 0 and b_top != 0:
                b = float(b_top / b_bottom)
        # where y = m * x + b
        regression_line = {'m': m, 'b': b}
        return regression_line