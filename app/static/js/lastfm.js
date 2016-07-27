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
//get album and track number and year
//method=track.getInfo&api_key=YOUR_API_KEY&artist=cher&track=believe&format=json

function lastFMGetGenresByTrack(title, artistName) {
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
            if(data.track.toptags != null){
                $.each(data.track.toptags.tag, function(index=100, item){
                    console.log(item.name);
                    
                    tags.push(item.name);
                });
            }else{
                tags.push('music');
            }
            //callBack(tags);
            return tags;
        }
    });
}
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
            /*
            $.each(data.similarartists.artist, function(index=100, item){
                console.log(item);
                albums.push(item.name);
            });
            callBack(albums);
            */
            //return albums;
        }
    });
}/*
function getLastFMData(artistName,Title,Album, callback){


    callback(albums, similarartiststring, )
}*/
    
//method=track.gettoptags&artist=radiohead&track=paranoid+android&api_key=YOUR... *get track genres
//method=track.getInfo&api_key=YOUR_API_KEY&artist=cher&track=believe&format=json *get track number and maybe year
//method=album.getinfo&api_key=YOUR_API_KEY&artist=Cher&album=Believe&format=json *get album year and genres




