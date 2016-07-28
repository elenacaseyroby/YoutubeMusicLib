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
//method=artist.getinfo&artist=Cher&api_key=YOUR_API_KEY&format=json
function lastFMGetCities(artistName) {
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
            /*
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
            console.log(tags);*/
            //callBack(tags);
            
        }
    });
}

/*
function lastFMGetTrackNum(artistName, albumName, trackName) {
    
    //var track_num is null;
    
    results = $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=album.getInfo" +
            "&api_key=175f6031e4788e29a9ff3961219ffc06" +
            "&artist=" +
            artistName +
            "&album=" +
            albumName +
            "&format=json",
        dataType: "jsonp",
        success: function (data) {
            var trackNum = null;
            console.log(data);
            if(data.track.toptags != null){
                $.each(data.album.tracks.track, function(index=100, item){
                    if (item.name == trackName) {
                        trackNum = index + 1;
                    }
                
                });
            }
            //callBack(tags);
            return trackNum;
        }
    });
}*/


//get album and track number and year
//method=track.getInfo&api_key=YOUR_API_KEY&artist=cher&track=believe&format=json


//change to get album by track
/*
function lastFMGetGenresByTrack(artistName) {
    var tags = [];
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
                $.each(data.track.toptags, function(index=100, item){
                    item.tag
                    tags.push(item.tag);
                });
            }else{
                tags.push('music');
            }
            callBack(tags);
            return tags;
        }
    });
}*/

//if we don't already have it
/*
function lastFMGetAlbumYear(title, artistName, callBack) {

    var track_name ="";
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
            //console.log(data);
            
            $.each(data.similarartists.artist, function(index=100, item){
                console.log(item);
                albums.push(item.name);
            });
            callBack(albums);
            
            //return albums;
        }
    });
}*//*
function getLastFMData(artistName,Title,Album, callback){


    callback(albums, similarartiststring, )
}*/
    
//method=track.gettoptags&artist=radiohead&track=paranoid+android&api_key=YOUR... *get track genres
//method=track.getInfo&api_key=YOUR_API_KEY&artist=cher&track=believe&format=json *get track number and maybe year
//method=album.getinfo&api_key=YOUR_API_KEY&artist=Cher&album=Believe&format=json *get album year and genres




