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
            $.each(data.similarartists.artist, function(index=100, item){
                item.name.replace(/,/g,' ')
                similarartiststring.push(item.name+','+item.match);
            });
            callBack(similarartiststring);
        }
    });
}
function lastFMGetAlbumsByArtist(artistName, callBack) {
    var albums = [];
    results = $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=artist.gettopalbums&" +
            "artist=" +
            artistName +
            "&" +
            "api_key=175f6031e4788e29a9ff3961219ffc06&" +
            "format=json",
        dataType: "jsonp",
        success: function (data) {
            //console.log(data);
            /*
            $.each(data.similarartists.artist, function(index=100, item){
                console.log(item);
                albums.push(item.name);
            });
            callBack(albums);
            */
        }
    });
}
function lastFMGetAlbumByTrack(title, artistName, callBack) {
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
            /*
            $.each(data.similarartists.artist, function(index=100, item){
                console.log(item);
                albums.push(item.name);
            });
            callBack(albums);
            */
        }
    });
}
////2.0/?method=track.getInfo&api_key=YOUR_API_KEY&artist=cher&track=believe&format=json

//takes artist and gets album names

//takes title and artist and gets album name and track numer

