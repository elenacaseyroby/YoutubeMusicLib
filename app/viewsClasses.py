
class display_update_row_object:
    def __init__(self, index, play, library, music, title, artist, album, release_date, youtube_id, artist_id, album_id):
        self.index = index
        self.play = play
        self.library = library
        self.music = music
        self.title = title
        self.artist = artist
        self.album = album
        self.release_date = release_date
        self.youtube_id = youtube_id
        self.artist_id = artist_id
        self.album_id = album_id

    def __getitem__ (self, index, play, library, music, title, artist, album, release_date, youtube_id, artist_id, album_id):
        return self.index 
        return self.play 
        return self.library 
        return self.music 
        return self.title 
        return self.artist 
        return self.album 
        return self.release_date 
        return self.youtube_id 
        return self.artist_id 
        return self.album_id 

class playlist:
    def __init__(self, title, tracks):
        self.title = title
        self.tracks = tracks

    def __getitem__ (self, index, title, tracks):
        return self.index 
        return self.title 
        return self.tracks
        
class playlist_track:
    def __init__(self, youtube_id, title, artist, track_num):
        self.youtube_id = youtube_id
        self.title = title
        self.artist = artist
        self.track_num = track_num

    def __getitem__ (self, index, youtube_id, title, artist, track_num):
        return self.index 
        return self.youtube_id
        return self.title 
        return self.artist
        return self.track_num


