#!/usr/bin/python

class ListensData(youtube_id, time_of_listen, title, release_date, music, artist, city_name, album):
    youtube_id = ''
    time_of_listen = ''
    title = ''
    release_date = ''
    music is null
    artist = ''
    city_name = ''
    album = ''

    # The class "constructor" - It's actually an initializer 
    def __init__(self, youtube_id, time_of_listen, title, release_date, music, artist, city_name, album):
        self.youtube_id = youtube_id
        self.time_of_listen = time_of_listen
        self.title = title
        self.release_date = release_date
        self.music = music
        self.artist = artist
        self.city_name = city_name
        self.album = album

