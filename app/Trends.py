#!/usr/bin/python
# -*- mode: python -*-

from datetime import datetime, timedelta
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
    # For now, a video is "liked" if it has 3+ listens ever.
    sql = text("""
        SELECT genres.id,
        genres.name,
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
                AND listens.time_of_listen > :start_date 
                AND listens.time_of_listen < :end_date
            ) > 0 AND
            (SELECT COUNT(*)
                FROM listens
                WHERE user_id = :user_id 
                AND youtube_id = videos.youtube_id
                AND listened_to_end = 0
            ) > 2
        ) AS count_videos_relistened
        FROM genres
        ORDER BY count_videos_relistened DESC, genres.name ASC;""")
    results = models.engine.execute(
        sql, user_id=str(user_id), start_date=start_date, end_date=end_date)
    rows = results.fetchall()
    genre_likes = {}
    for row in rows:
        genre_likes[row[1]] = row[2]
    return genre_likes


def get_genre_listens(user_id, start_date, end_date):
    # Count number of videos that user has listened to by genre.
    sql = text("""
        SELECT genres.id,
        genres.name,
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
                AND listens.time_of_listen > :start_date 
                AND listens.time_of_listen < :end_date
            ) > 0
        ) AS count_videos_listened
        FROM genres
        ORDER BY count_videos_listened DESC, genres.name ASC;""")
    results = models.engine.execute(
        sql, user_id=str(user_id), start_date=start_date, end_date=end_date)
    rows = results.fetchall()
    genre_listens = {}
    for row in rows:
        genre_listens[row[1]] = row[2]
    return genre_listens


def get_genre_top_listened(user_id, start_date, end_date, limit=10):
    video_listens_by_genre = get_genre_listens(
        user_id=user_id, start_date=start_date, end_date=end_date)
    # Sort by played video count descending.
    video_listens_by_genre = sorted(
        ((count, genre) for genre, count in video_listens_by_genre.items()),
        reverse=True)
    top_genres = []
    for i in range(10):
        if i < len(video_listens_by_genre):
            name = video_listens_by_genre[i][1]
            count = video_listens_by_genre[i][0]
            genre = {
                'name': name,
                'played-videos-count': count
            }
            top_genres.append(genre)
    return top_genres


def get_genre_regression_data(user_id, start_date, end_date):
    # Pair genre likes and genre listens into x, y values by genre.
    video_listens_by_genre = get_genre_listens(
        user_id=user_id, start_date=start_date, end_date=end_date)
    video_likes_by_genre = get_genre_likes(
        user_id=user_id, start_date=start_date, end_date=end_date)
    regression_data = []
    for genre in video_listens_by_genre:
        if video_listens_by_genre[genre] > 0:
            track = (
                video_listens_by_genre[genre],
                video_likes_by_genre[genre])
            regression_data.append(track)
    return regression_data


def get_regression_line(list_of_points):
    if not list_of_points:
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
        for point in list_of_points:
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
        # Where y = m * x + b
        regression_line = {'m': m, 'b': b}
        return regression_line
