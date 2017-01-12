#!/usr/bin/python
# -*- mode: python -*-

from sqlalchemy import text

from app import models, sql_session

def delete_all_playlist_tracks(user_id, playlist_title):
    playlist = playlist_in_database(
        user_id=user_id, playlist_title=playlist_title)
    if playlist:
        sql_session.rollback()
        deleted_tracks = sql_session.query(models.PlaylistTracks).filter_by(
                playlist_id=playlist.id)
        deleted_tracks.delete()
        sql_session.commit()
        return "success"

def delete_playlist(user_id, playlist_title):
    playlist = playlist_in_database(
        user_id=user_id, playlist_title=playlist_title)
    if playlist:
        delete_all_playlist_tracks(
            user_id=user_id, playlist_title=playlist_title)
        if playlist_empty(user_id=user_id, playlist_title=playlist_title):
            sql_session.rollback()
            playlist = sql_session.query(models.Playlist).filter_by(
                id=playlist.id)
            playlist.delete()
            sql_session.commit()
            return "success"

def get_playlist_titles(user_id):
    sql = text("""
        SELECT playlists.title, playlists.id
        FROM playlists
        WHERE user_id = '""" +
        str(user_id) +
        "' ORDER BY playlists.title;")
    results = models.engine.execute(sql)
    rows = results.fetchall()
    playlist_titles = []
    if rows:
        for row in rows:
            playlist_titles.append(row[0])
    return playlist_titles

def get_playlist_tracks(user_id, playlist_title):
    playlist = playlist_in_database(
        user_id=user_id, playlist_title=playlist_title)
    if playlist:
        sql = text("""
            SELECT playlist_tracks.*,
            videos.title,
            artists.artist_name
            FROM playlist_tracks
            JOIN playlists ON playlist_tracks.playlist_id = playlists.id
            JOIN videos ON playlist_tracks.youtube_id = videos.youtube_id
            JOIN artists ON videos.artist_id = artists.id
            WHERE playlists.id = '""" +
            str(playlist.id) +
            "' AND playlists.user_id = " +
            str(user_id) +
            " ORDER BY playlist_tracks.track_num;")
        results = models.engine.execute(sql)
        rows = results.fetchall()
        playlist_tracks = []
        for row in rows:
            track = {
                'youtube_id': row[2],
                'title': row[5],
                'artist': row[6],
                'track_num': row[3]
            }
            playlist_tracks.append(track)
        return playlist_tracks

def playlist_empty(user_id, playlist_title):
    playlist = playlist_in_database(
        user_id=user_id, playlist_title=playlist_title)
    if playlist:
        first_track = sql_session.query(models.PlaylistTracks).filter_by(
                id=playlist.id).first()
        if first_track:
            return False
        else:
            return True

def playlist_in_database(user_id, playlist_title):
    playlist = sql_session.query(models.Playlist).filter_by(
        title=playlist_title, user_id=user_id).first()
    if playlist:
        return playlist

def post_new_playlist(user_id, playlist_title, playlist_tracks):
    playlist = playlist_in_database(
        user_id=user_id, playlist_title=playlist_title)
    if not playlist:
        # Add new playlist
        sql_session.rollback()
        new_playlist = models.Playlist(
            user_id=user_id, title=playlist_title
        ) 
        sql_session.add(new_playlist)
        sql_session.commit()
        if playlist_tracks:
            # Add new tracks
            track_num = 1
            playlist = playlist_in_database(
                user_id=user_id, playlist_title=playlist_title)
            for track in playlist_tracks:
                sql_session.rollback()
                new_track = models.PlaylistTracks(
                    playlist_id=playlist.id,
                    youtube_id=track,
                    track_num=track_num) 
                sql_session.add(new_track)
                sql_session.commit() 
                track_num += 1
    else:
        update_playlist(
            user_id=user_id,
            playlist_title=playlist_title,
            playlist_tracks=playlist_tracks)
    return "success"

def update_playlist(user_id, playlist_title, playlist_tracks):
    playlist = playlist_in_database(
        user_id=user_id, playlist_title=playlist_title)
    if playlist:
        # Set track_num = -1 for all existing playlist tracks
        sql_session.rollback()
        old_tracks = sql_session.query(
            models.PlaylistTracks).filter_by(playlist_id=playlist.id)
        for track in old_tracks:
            track.track_num = -1
            sql_session.commit()
        new_track_num = 1
        # Set assigned track_num to each track in playlist_tracks
        for track in playlist_tracks:
            sql_session.rollback()
            instances_of_track_in_playlist = sql_session.query(
                    models.PlaylistTracks).filter_by(
                        playlist_id=playlist.id,
                        youtube_id=track)
            # If multiple instances of a video, make sure not to 
            # reassign track_num of an updated instance.
            can_update_track = None
            if instances_of_track_in_playlist:
                for instance in instances_of_track_in_playlist:
                    if instance.track_num >= new_track_num:
                        can_update_track = instance
                        break
            if can_update_track:
                can_update_track.track_num = new_track_num
                sql_session.commit()
            else:
                new_track = models.PlaylistTracks(
                    playlist_id=playlist.id,
                    youtube_id=track,
                    track_num=new_track_num)  
                sql_session.add(new_track)
                sql_session.commit()
            new_track_num += 1
        # Delete tracks still assigned track_num = -1
        sql_session.rollback()
        deleted_tracks = sql_session.query(models.PlaylistTracks).filter_by(
                playlist_id=playlist.id).filter(
                    models.PlaylistTracks.track_num == -1)
        deleted_tracks.delete()
        sql_session.commit()  
    else:
        post_new_playlist(
            user_id=user_id,
            playlist_title=playlist_title,
            playlist_tracks=playlist_tracks)
    return "success"