#!/usr/bin/python
# -*- mode: python -*-

from datetime import datetime, timedelta
from math import sqrt
from sqlalchemy import text
from app.Listen import get_listens
from app import models


def sunday_before_date(date):
    # Find the Sunday before the input date.
    known_sunday = datetime.strptime(
            '2015-12-06 00:00:00',
            '%Y-%m-%d %H:%M:%S')
    difference = date - known_sunday
    difference = difference.days
    days_past_sunday = difference % 7
    previous_sunday = (date - timedelta(days=days_past_sunday))
    previous_sunday = previous_sunday.replace(
        hour=00, minute=00, second=00)
    return previous_sunday


def count_listens_by_week(user_id, start_date=None, end_date=None):
    listens = get_listens(
        user_id=user_id, start_date=start_date, end_date=end_date)
    count_by_week = []
    if listens:
        # Find the Sunday before the selected start_date
        # and count listens by week from that date.
        date_of_first_listen = listens[0]['time_of_listen']
        start_week = sunday_before_date(date_of_first_listen)
        end_week = start_week + timedelta(days=7)
        listens_counter = 0
        for listen in listens:
            if (listen['time_of_listen'] < end_week):
                    listens_counter += 1
            else:
                count_by_week.append({
                    'Week': str(
                        datetime.strftime(
                            start_week, '%Y-%m-%d %H:%M:%S')),
                    'Listens': listens_counter
                })
                start_week = end_week
                end_week = start_week + timedelta(days=7)
                listens_counter = 0
        count_by_week.append({
            'Week':
            str(datetime.strftime(start_week, '%Y-%m-%d %H:%M:%S')),
            'Listens': listens_counter
        })
    return count_by_week


def get_genre_likes(user_id, start_date, end_date):
    # Count number of videos that user has liked by genre,
    # For now, a video is "liked" if it has 5+ listens ever.
    sql = text("""
        SELECT genres.name,
        (SELECT COUNT(*)
            FROM videos
            JOIN vids_genres ON videos.youtube_id = vids_genres.youtube_id
            WHERE vids_genres.genre_id = genres.id
            AND genres.name != 'music' AND
            (SELECT COUNT(*)
                FROM listens
                WHERE user_id = :user_id
                AND youtube_id = videos.youtube_id
                AND listened_to_end = 0
                AND listens.time_of_listen >= :start_date
                AND listens.time_of_listen <= :end_date
            ) > 0 AND
            (SELECT COUNT(*)
                FROM listens
                WHERE user_id = :user_id
                AND youtube_id = videos.youtube_id
                AND listened_to_end = 0
            ) > 4
        ) AS count_videos_relistened
        FROM genres;""")
    results = models.engine.execute(
        sql, user_id=str(user_id), start_date=start_date, end_date=end_date)
    rows = results.fetchall()
    genre_likes = {}
    for row in rows:
        genre_likes[row[0]] = row[1]
    return genre_likes


def get_genre_listens(user_id, start_date, end_date):
    # Count user listens by genre.
    sql = text("""
        SELECT genres.name,
        (SELECT COUNT(*)
            FROM listens
            JOIN vids_genres ON listens.youtube_id = vids_genres.youtube_id
            WHERE vids_genres.genre_id = genres.id
            AND genres.name != 'music'
            AND listens.user_id = :user_id
            AND listens.listened_to_end = 0
            AND listens.time_of_listen >= :start_date
            AND listens.time_of_listen <= :end_date
        ) AS total_listens_count
        FROM genres;""")
    results = models.engine.execute(
        sql, user_id=str(user_id), start_date=start_date, end_date=end_date)
    rows = results.fetchall()
    genre_listens = {}
    for row in rows:
        genre_listens[row[0]] = row[1]
    return genre_listens


def get_genre_top_listened(user_id, start_date, end_date, limit=10):
    listens_by_genre = get_genre_listens(
        user_id=user_id, start_date=start_date, end_date=end_date)
    # Sort by played video count descending.
    listens_by_genre = sorted(
        ((count, genre) for genre, count in listens_by_genre.items()),
        reverse=True)
    top_genres = []
    for i in range(10):
        if i < len(listens_by_genre):
            name = listens_by_genre[i][1]
            count = listens_by_genre[i][0]
            genre = {
                'name': name,
                'played-videos-count': count
            }
            top_genres.append(genre)
    return top_genres


def get_genre_regression_data(user_id, start_date, end_date):
    # Pair genre likes and genre listens into x, y values by genre.
    listens_by_genre = get_genre_listens(
        user_id=user_id, start_date=start_date, end_date=end_date)
    video_likes_by_genre = get_genre_likes(
        user_id=user_id, start_date=start_date, end_date=end_date)
    regression_data = [(listens_by_genre[genre], video_likes_by_genre[genre])
        for genre in listens_by_genre if listens_by_genre[genre] > 0]
    return regression_data


def get_regression_line(list_of_points):
    if not list_of_points:
        regression_line = {'m': 0, 'b': 0, 'r': 0}
        return regression_line
    else:
        n = 0
        sum_x = 0
        sum_y = 0
        sum_xsquared = 0
        sum_ysquared = 0
        sum_xy = 0
        for point in list_of_points:
            if point[0] > 0:
                n = n + 1
                sum_x = sum_x + point[0]
                sum_y = sum_y + point[1]
                sum_xsquared = sum_xsquared + point[0] ** 2
                sum_ysquared = sum_ysquared + point[1] ** 2
                sum_xy = sum_xy + point[0] * point[1]
        m_top = float((n * sum_xy) - (sum_y * sum_x))
        m_bottom = float((n * sum_xsquared) - (sum_x ** 2))
        m = 0
        if m_bottom != 0:
            m = float(m_top / m_bottom)
        b_top = float(sum_y - m * sum_x)
        b_bottom = float(n)
        b = float(b_top / b_bottom)
        r_top = float((n * sum_xy) - (sum_x * sum_y))
        r_bottom = float(sqrt(
            ((n * sum_xsquared) - (sum_x ** 2)) *
            ((n * sum_ysquared) - (sum_y ** 2))))
        r = 0
        if r_bottom != 0:
            r = float(r_top / r_bottom)
        # Where y = m * x + b is the regression line
        # and r is the correlation coefficient.
        regression_line = {'m': m, 'b': b, 'r': r}
        return regression_line
