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
                similarartiststring.push(item.name+','+item.match);
            });
            callBack(similarartiststring);
        }
    });
}

