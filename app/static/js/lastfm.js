function albumInfo(album, trackNumber, year) {
    this.album = album;
    this.trackNumber = trackNumber;
    this.year = year;
}

function lastFMGetSimilarArtists(artistName, callBack) {
    var similarartiststring = [];
    results = $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=artist.getsimilar&" +
            "artist=" +
            artistName +
            "&" +
            "api_key=175f6031e4788e29a9ff3961219ffc06&" +
            "format=json",
        dataType: "jsonp",
        success: function (data) {
            if (data.error) {
                console.log("Last.fm API Error: ");
                console.log(data.error);
                console.log(data.message);
            }
            else if (data.similarartists != null){
                $.each(data.similarartists.artist, function(index=100, item){
                    item.name.replace(/,/g,' ')
                    var artist = {
                        name: item.name,
                        match: item.match
                    };
                    similarartiststring.push(artist);
                });
            }else{
                var artist = {
                    name: "undefined",
                    match: "0.00"
                };
                similarartiststring.push(artist);
            }
            callBack(similarartiststring);
        }
    });
}

function lastFMGetGenresByTrack(title, artistName, callBack) {
    var tags = [];
    results = $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=track.getInfo" +
            "&api_key=175f6031e4788e29a9ff3961219ffc06" +
            "&artist=" +
            artistName +
            "&track=" +
            title +
            "&format=json",
        dataType: "jsonp",
        success: function (data) {
            if (data.error) {
                console.log("Last.fm API Error: ");
                console.log(data.error);
                console.log(data.message);
            }
            else if(data.track.toptags.tag.length > 0){
                $.each(data.track.toptags.tag, function(index=100, item){
                    tags.push(item.name);
                });
            }
            callBack(tags);
            
        }
    });
}

function lastFMGetGenresByAlbum(album, artistName, callBack) {
    var tags = []; 
    results = $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=album.getinfo" +
            "&artist=" +
            artistName +
            "&album=" +
            album +
            "&api_key=175f6031e4788e29a9ff3961219ffc06" +
            "&format=json",
        dataType: "jsonp",
        success: function (data) {
            if (data.error) {
                console.log("Last.fm API Error: ");
                console.log(data.error);
                console.log(data.message);
            }
            else if (data.album.tags.tag.length > 0){
                $.each(data.album.tags.tag, function(index=100, item){
                    tags.push(item.name);
                });
            }
            else {
                tags.push('music');
            }
            callBack(tags); 
        }
    });
}
function lastFMGetGenresByArtist(artistName, callBack) {
    var tags = []; 
    results = $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=artist.getinfo" +
            "&artist=" +
            artistName +
            "&api_key=175f6031e4788e29a9ff3961219ffc06" +
            "&format=json",
        dataType: "jsonp",
        success: function (data) {
            if (data.error) {
                console.log("Last.fm API Error: ");
                console.log(data.error);
                console.log(data.message);
            }
            else if (data.artist.tags.tag.length > 0){
                $.each(data.artist.tags.tag, function(index=100, item){
                    tags.push(item.name);
                });
            }
            else {
                tags.push('music');
            }
            callBack(tags); 
        }
    });
}
function lastFMGetBioByArtist(artistName, callBack) {
    var bio = "";
    results = $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=artist.getInfo" +
            "&api_key=175f6031e4788e29a9ff3961219ffc06" +
            "&artist=" +
            artistName +
            "&format=json",
        dataType: "jsonp",
        success: function (data) {
            if (data.error) {
                console.log("Last.fm API Error: ");
                console.log(data.error);
                console.log(data.message);
            }
            else if (data.artist.bio.content){
                bio = data.artist.bio.content
            }
            callBack(bio);
        }
    });
}