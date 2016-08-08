#class displayupdate_page_row_object:
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