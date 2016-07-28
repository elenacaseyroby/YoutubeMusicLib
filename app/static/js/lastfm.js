// Class to hold Last.fm API track
function albumInfo(album, trackNumber, year) {
    this.album = album;
    this.trackNumber = trackNumber;
    this.year = year;
}

function lastFMGetSimilarArtists(artistName, callBack) {
    var similarartiststring = [];
    //console.log("artistName: ", artistName);
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
            if(data.similarartists != null){
                $.each(data.similarartists.artist, function(index=100, item){
                    item.name.replace(/,/g,' ')
                    similarartiststring.push(item.name+','+item.match);
                });
            }else{
                similarartiststring.push('undefined,0.00');
            }
            callBack(similarartiststring);
            //return similarartiststring;
        }
    });
}

function lastFMGetGenresByTrack(title, artistName, callBack) {
    var tags = [];
    //var track_num is null;
    
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
            console.log(data);
            if(data.track.toptags.tag.length > 0){
                console.log("data not null");
                $.each(data.track.toptags.tag, function(index=100, item){
                    tags.push(item.name);
                });
            }else{
                console.log("music!");
                tags.push('music');
            }
            console.log("js tags");
            console.log(tags);
            callBack(tags);
            
        }
    });
}

function lastFMGetBioByArtist(artistName, callBack) {
    var bio = "";
    //var track_num is null;
    console.log(artistName);
    results = $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=artist.getInfo" +
            "&api_key=175f6031e4788e29a9ff3961219ffc06" +
            "&artist=" +
            artistName +
            "&format=json",
        dataType: "jsonp",
        success: function (data) {
            
            console.log(data);
            if(data.artist.bio.content){
                bio = data.artist.bio.content
            }
            callBack(bio);
            
        }
    });
}






