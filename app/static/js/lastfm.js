function lastFMGetSimilar(trackName, artistName, callBack) {
    console.log("trackName: ", trackName);
    console.log("artistName: ", artistName);

    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=track.getsimilar&" +
            "artist=" +
            artistName +
            "&" +
            "track=" +
            trackName +
            "&" +
            "api_key=175f6031e4788e29a9ff3961219ffc06&" +
            "format=json",
        dataType: "jsonp",
        success: function (data) {
            for (var i = 0; i < data.similartracks.track.length; i++) {
                console.log(i + " - " + data.similartracks.track[i]);
            }
        }
    });
    callBack();
}

function lastFMGetSimilarArtists(artistName, callBack) {
    var similarartiststring = [];
    console.log("artistName: ", artistName);
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
                console.log(item);
                
                //appends lastfm "similar artist name,match score"
                /*
                if (index > 0){
                    similarartiststring = similarartiststring+',';

                }*/
                similarartiststring.push(item.name+','+item.match);
            });
            callBack(similarartiststring);
        }
    });
    
    //pull results into a comma deliniated string that will be 
    //passed into callback and within the callback, into the ajax post request
    
}